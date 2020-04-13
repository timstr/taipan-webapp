import * as WebSocket from "ws";
import * as http from "http";
import * as https from "https";
import * as fs from "fs";
import { TextDecoder } from "util";
import { Emitter } from "./interfaces/emitter";
import {
    ClientMessage,
    CLIENT_WANTS_TO_PLAY,
    DONT_KICK_ME,
    PLAYER_DID_ACTION,
} from "./interfaces/messages/clientmessages";
import {
    ServerMessage,
    serializeServerMessage,
    JoinFailedBecauseWrongPassword,
    clientFailedToJoinGameMessage,
    JoinFailedBecauseFull,
    clientWillBeKickedSoonMessage,
    clientWasKickedMessage,
    clientJoinedGameMessage,
    updatedSpectatorStateMessage,
    updatedPlayerStateMessage,
} from "./interfaces/messages/servermessages";
import { PlayerIndex, AllPlayerIndices } from "./interfaces/game/player/player";
import { parseClientMessage } from "./interfaces/parse/messages";
import { HashResult, validSHA256Digest } from "./hash/hash";
import { getEnvironmentVariable } from "./env";
import { GameState } from "./interfaces/game/state/state";
import { viewGameState } from "./interfaces/game/view/stateview";
import { spectateGameState } from "./interfaces/game/view/spectatorview";

const MAX_SPECTATOR_CONNECTIONS = 256;

const WARN_KICK_SPECTATOR_AFTER_S = 600;
const WARN_KICK_PLAYER_AFTER_S = 600;

const KICK_AFTER_WARNING_AND_ANOTHER_S = 60;

const KICK_INTERVAL_S = 10;

const WEBSOCKET_ERR_TRY_AGAIN_LATER = 1013;

interface ConnectionBase {
    readonly socket: WebSocket;
    handleClose: (code: number, reason: string) => void;
    handleError: (e: Error) => void;
    handlePong: () => void;
    handleMessage: (d: WebSocket.Data) => void;
    isAlive: boolean;
    lastDidAnything: Date;
    hasPendingWarning: boolean;
}
interface PlayerConnection extends ConnectionBase {
    type: "Player";
    readonly index: PlayerIndex;
}

interface SpectatorConnection extends ConnectionBase {
    type: "Spectator";
}

type Connection = PlayerConnection | SpectatorConnection;

type PossiblePlayerConnection = PlayerConnection | null;

const rightNow = () => {
    return new Date();
};

const secondsSinceSocketDidAnything = (conn: Connection) => {
    const now = rightNow();
    const diffMilliseconds = now.getTime() - conn.lastDidAnything.getTime();
    const diffSeconds = diffMilliseconds / 1000;
    return diffSeconds;
};

const noop = () => {};

const pingConnection = (conn: Connection): boolean => {
    if (conn.isAlive === false) {
        console.log(
            `A ${conn.type} socket failed to respond to a ping request and is presumed dead.`
        );
        conn.socket.terminate();
        return false;
    }
    conn.isAlive = false; // Let's hope for the best
    conn.socket.ping(noop);
    return true;
};

type OnPlayerJoinedHandler = (idx: PlayerIndex) => void;
type OnPlayerLeftHandler = (idx: PlayerIndex) => void;
type onPlayerSentMessageHandler = (
    idx: PlayerIndex,
    msg: ClientMessage
) => void;

export class SocketServer {
    constructor(httpServer: https.Server, getCurrentState: () => GameState) {
        this.wss = new WebSocket.Server({ server: httpServer });
        this.wss.on("connection", this.handleNewConnection);
        this.wss.on("error", this.handlerServerError);
        this.wss.on("close", this.handleServerClosed);

        this.pathToPasswordFile = getEnvironmentVariable("GAME_PASSWORD_PATH");

        this.spectatorConnections = [];
        this.playerConnections = [null, null, null, null];

        this.heartbeatInterval = setInterval(() => {
            this.handleHeartBeat();
        }, 5000);

        this.kickInterval = setInterval(() => {
            this.handleKicks();
        }, KICK_INTERVAL_S * 1000);

        this.playerJoined = new Emitter();
        this.playerLeft = new Emitter();
        this.playerSentMessage = new Emitter();

        this.getCurrentState = getCurrentState;
    }

    close() {
        this.wss.close();
    }

    isPlayerConnected(idx: PlayerIndex): boolean {
        return this.playerConnections[idx] !== null;
    }

    sendPlayerMessage(idx: PlayerIndex, message: ServerMessage) {
        let conn = this.playerConnections[idx];
        if (conn) {
            this.sendMessage(conn, message);
        } else {
            console.error(
                `Connection ${idx} was unexpectedly null while sending message`
            );
        }
    }

    broadcastUpdatedState(newState: GameState) {
        const sm = updatedSpectatorStateMessage(spectateGameState(newState));
        for (let sc of this.spectatorConnections) {
            this.sendMessage(sc, sm);
        }

        for (let idx of AllPlayerIndices) {
            const pc = this.playerConnections[idx];
            if (pc === null) {
                continue;
            }
            const pm = updatedPlayerStateMessage(viewGameState(newState, idx));
            this.sendMessage(pc, pm);
        }
    }

    broadcastToPlayers(message: ServerMessage) {
        const s = serializeServerMessage(message);
        for (let conn of this.playerConnections) {
            if (conn) {
                conn.socket.send(s);
            }
        }
    }

    broadcastToSpectators(message: ServerMessage) {
        const s = serializeServerMessage(message);
        for (let conn of this.spectatorConnections) {
            conn.socket.send(s);
        }
    }

    playerJoined: Emitter<Parameters<OnPlayerJoinedHandler>>;
    playerLeft: Emitter<Parameters<OnPlayerLeftHandler>>;
    playerSentMessage: Emitter<Parameters<onPlayerSentMessageHandler>>;

    private getCurrentState: () => GameState;

    private wss: WebSocket.Server;

    // Spectators
    private spectatorConnections: SpectatorConnection[];

    // Players
    private playerConnections: [
        PossiblePlayerConnection,
        PossiblePlayerConnection,
        PossiblePlayerConnection,
        PossiblePlayerConnection
    ];

    private heartbeatInterval: NodeJS.Timeout;

    private kickInterval: NodeJS.Timeout;

    private pathToPasswordFile: string | null;

    private handleHeartBeat = () => {
        this.spectatorConnections = this.spectatorConnections.filter(
            pingConnection
        );

        for (let idx of AllPlayerIndices) {
            let conn = this.playerConnections[idx];
            if (conn === null) {
                continue;
            }
            if (!pingConnection(conn)) {
                this.playerConnections[idx] = null;
            }
        }
    };

    private handleKicks = () => {
        const doKick = (conn: Connection) => {
            const t = secondsSinceSocketDidAnything(conn);
            const timeUntilWarn =
                conn.type === "Player"
                    ? WARN_KICK_PLAYER_AFTER_S
                    : WARN_KICK_SPECTATOR_AFTER_S;
            const timeAfterWarn = KICK_AFTER_WARNING_AND_ANOTHER_S;
            if (t >= timeUntilWarn + timeAfterWarn) {
                const msg = clientWasKickedMessage();
                this.sendMessage(conn, msg);
                conn.socket.close(WEBSOCKET_ERR_TRY_AGAIN_LATER);
                return false;
            } else if (t >= timeUntilWarn && !conn.hasPendingWarning) {
                const msg = clientWillBeKickedSoonMessage();
                this.sendMessage(conn, msg);
                conn.hasPendingWarning = true;
            }
            return true;
        };
        this.spectatorConnections.forEach(doKick);

        for (let idx of AllPlayerIndices) {
            const conn = this.playerConnections[idx];
            if (conn === null) {
                continue;
            }
            doKick(conn);
        }
    };

    private handleNewConnection = (
        ws: WebSocket,
        request: http.IncomingMessage
    ) => {
        console.log(
            "New WebSocket connection from:",
            request.connection.remoteAddress
        );
        if (this.spectatorConnections.length >= MAX_SPECTATOR_CONNECTIONS) {
            ws.close(
                WEBSOCKET_ERR_TRY_AGAIN_LATER,
                "Too many socket connections. Please try again later"
            );
            return;
        }

        this.addSpectatorSocket(ws);
    };

    /**
     * Given an idle connection which is assumed to have sent a message to join
     * the game, if there is an available slot for a player connection, upgrades
     * the connection, removing it from this.idleConnections and adding it to
     * this.playerConnections, in which case a success message is sent. If no
     * player slots are available, the connection is unchanged and a failure
     * message is sent.
     */
    private tryUpgradeToPlayer = async (
        spectatorConn: SpectatorConnection,
        passwordAttemptHash: HashResult
    ) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (!this.validatePassword(passwordAttemptHash)) {
            console.log("An incorrect password was entered");
            const msg = clientFailedToJoinGameMessage(
                JoinFailedBecauseWrongPassword
            );
            this.sendMessage(spectatorConn, msg);
            return;
        }

        let newIdx = (() => {
            for (let idx of AllPlayerIndices) {
                if (this.playerConnections[idx] === null) {
                    return idx;
                }
            }
            return null;
        })();

        if (newIdx === null) {
            console.log("A spectator tried to join, but all spots are taken");
            const msg = clientFailedToJoinGameMessage(JoinFailedBecauseFull);
            this.sendMessage(spectatorConn, msg);
            return;
        }

        this.eraseSpectatorConnection(spectatorConn);

        spectatorConn.socket.off("close", spectatorConn.handleClose);
        spectatorConn.socket.off("error", spectatorConn.handleError);
        spectatorConn.socket.off("pong", spectatorConn.handlePong);
        spectatorConn.socket.off("message", spectatorConn.handleMessage);

        const stub = () => {};

        let playerConn: PlayerConnection = {
            type: "Player",
            socket: spectatorConn.socket,
            isAlive: true,
            index: newIdx,
            lastDidAnything: rightNow(),
            hasPendingWarning: false,
            handleClose: stub,
            handleError: stub,
            handlePong: stub,
            handleMessage: stub,
        };

        playerConn.handleClose = (c, r) =>
            this.handlePlayerSocketClosed(playerConn, c, r);
        playerConn.handleError = (e) => this.onSocketError(playerConn, e);
        playerConn.handlePong = () => this.onSocketPongHandler(playerConn);
        playerConn.handleMessage = (d: WebSocket.Data) =>
            this.onPlayerMessage(playerConn, d);

        playerConn.socket.on("close", playerConn.handleClose);
        playerConn.socket.on("error", playerConn.handleError);
        playerConn.socket.on("pong", playerConn.handlePong);
        playerConn.socket.on("message", playerConn.handleMessage);

        this.playerConnections[newIdx] = playerConn;

        const st = this.getCurrentState();
        const msg = clientJoinedGameMessage(viewGameState(st, newIdx));
        this.sendMessage(playerConn, msg);

        this.playerJoined.emit(newIdx);
    };

    private sendMessage = (conn: Connection, message: ServerMessage) => {
        conn.socket.send(serializeServerMessage(message));
    };

    private handlerServerError = (_: WebSocket.Server, error: Error) => {
        console.error("Server error:", error);
    };

    private handleServerClosed = () => {
        clearInterval(this.heartbeatInterval);
        clearInterval(this.kickInterval);
    };

    private addSpectatorSocket = (ws: WebSocket) => {
        const stub = () => {};

        let conn: SpectatorConnection = {
            type: "Spectator",
            socket: ws,
            isAlive: true,
            lastDidAnything: rightNow(),
            hasPendingWarning: false,
            handleClose: stub,
            handleError: stub,
            handlePong: stub,
            handleMessage: stub,
        };

        conn.handleClose = (c, r) =>
            this.handleSpectatorSocketClosed(conn, c, r);
        conn.handleError = (e) => this.onSocketError(conn, e);
        conn.handlePong = () => this.onSocketPongHandler(conn);
        conn.handleMessage = (d: WebSocket.Data) =>
            this.onSpectatorMessage(conn, d);

        ws.on("close", conn.handleClose);
        ws.on("error", conn.handleError);
        ws.on("pong", conn.handlePong);
        ws.on("message", conn.handleMessage);

        this.spectatorConnections.push(conn);

        const msg = updatedSpectatorStateMessage(
            spectateGameState(this.getCurrentState())
        );
        this.sendMessage(conn, msg);
    };

    private handleSpectatorSocketClosed = (
        conn: SpectatorConnection,
        code: number,
        reason: string
    ) => {
        console.log(`A spectator's socket closed: (${code}), "${reason}"`);
        this.eraseSpectatorConnection(conn);
    };

    private handlePlayerSocketClosed = (
        conn: PlayerConnection,
        code: number,
        reason: string
    ) => {
        const idx = conn.index;
        this.playerLeft.emit(idx);
        this.playerConnections[idx] = null;
        console.log(`Player ${idx}'s socket closed: (${code}) "${reason}"`);
    };

    private onSocketError = (conn: Connection, error: Error) => {
        if (conn.type === "Player") {
            console.log(
                `Error with player ${conn.index}'s socket: ${error.message}`
            );
        } else {
            console.log(`Error with a spectator's socket: ${error.message}`);
        }
    };

    private onPlayerMessage = (
        conn: PlayerConnection,
        message: WebSocket.Data
    ) => {
        if (typeof message !== "string") {
            console.error(
                `Received a socket message from player ${conn.index} that is not a string`
            );
            return;
        }
        const m = parseClientMessage(message);
        if (m === null) {
            console.error(
                `Received an ill-formed message from player ${conn.index}: ${message}`
            );
            return;
        }
        conn.lastDidAnything = rightNow();
        this.playerSentMessage.emit(conn.index, m);
    };

    private onSpectatorMessage = (
        conn: SpectatorConnection,
        message: WebSocket.Data
    ) => {
        if (typeof message !== "string") {
            console.error(
                `Received a socket message from a spectator that is not a string`
            );
            return;
        }
        const m = parseClientMessage(message);
        if (m === null) {
            console.error(
                `Received an ill-formed message from a spectator: ${message}`
            );
            return;
        }
        conn.lastDidAnything = rightNow();
        const success = this.handleSpectatorMessage(conn, m);
        if (success !== true) {
            console.error(
                "A spectator's client message was improperly handled"
            );
        }
    };

    private onSocketPongHandler = (conn: Connection) => {
        conn.isAlive = true;
    };

    private validatePassword = (attempt: HashResult): boolean => {
        if (this.pathToPasswordFile === null) {
            return true;
        }
        try {
            const fileData = fs.readFileSync(this.pathToPasswordFile);
            const decoder = new TextDecoder();
            const dataStr = decoder.decode(fileData);
            if (!validSHA256Digest(dataStr)) {
                console.error(
                    "Password file is not a valid SHA256 hash result"
                );
                return false;
            }
            return attempt.hexHashData === dataStr;
        } catch (e) {
            console.error(
                "An error occurred while trying to read the password file:",
                e
            );
            return false;
        }
    };

    private eraseSpectatorConnection = (conn: SpectatorConnection) => {
        const numMatches = this.spectatorConnections.reduce(
            (acc, c) => (c === conn ? acc + 1 : acc),
            0
        );
        if (numMatches !== 1) {
            console.error("A spectator connection was stored improperly");
            return;
        }

        this.spectatorConnections = this.spectatorConnections.filter(
            (c) => c !== conn
        );
    };

    private handleSpectatorMessage = (
        conn: SpectatorConnection,
        message: ClientMessage
    ): boolean => {
        switch (message.type) {
            case CLIENT_WANTS_TO_PLAY: {
                console.log("A spectator wants to join the game");
                this.tryUpgradeToPlayer(conn, message.payload.passwordHash);
                return true;
            }
            case DONT_KICK_ME: {
                conn.hasPendingWarning = false;
                conn.lastDidAnything = rightNow();
                return true;
            }
            case PLAYER_DID_ACTION: {
                console.error("A spectator tried to perform a player action");
                return true;
            }
        }
    };
}
