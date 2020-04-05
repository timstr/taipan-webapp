import * as WebSocket from "ws";
import * as http from "http";
import * as https from "https";
import { PlayerIndex } from "./interfaces/game/state";
import { Emitter } from "./interfaces/Emitter";
import {
    ServerMessage,
    serializeServerMessage,
    ClientMessage,
    parseClientMessage,
} from "./messages";

interface Connection {
    socket: WebSocket;
    isAlive: boolean;
}

type PossibleConnection = Connection | null;

type OnPlayerJoinedHandler = (idx: PlayerIndex) => void;
type OnPlayerLeftHandler = (idx: PlayerIndex) => void;
type onPlayerSentMessageHandler = (
    idx: PlayerIndex,
    msg: ClientMessage
) => void;

const WEBSOCKET_ERR_TRY_AGAIN_LATER = 1013;

export class SocketServer {
    constructor(httpServer: https.Server) {
        this.wss = new WebSocket.Server({ server: httpServer });
        this.wss.on("connection", this.onConnectionHandler);
        this.wss.on("error", this.onServerError);
        this.wss.on("close", this.onCloseServerHandler);

        this.connections = [null, null, null, null];

        this.heartbeatInterval = setInterval(() => {
            for (let conn of this.connections) {
                if (conn === null) {
                    continue;
                }
                if (conn.isAlive === false) {
                    conn.socket.terminate();
                    continue;
                }
                conn.isAlive = false; // Let's hope for the best
                conn.socket.ping(this.noop);
            }
        }, 5000);

        this.playerJoined = new Emitter();
        this.playerLeft = new Emitter();
        this.playerSentMessage = new Emitter();
    }

    close() {
        this.wss.close();
    }

    onPlayerJoined(handler: OnPlayerJoinedHandler) {
        this.playerJoined.addListener(handler);
    }
    onPlayerLeft(handler: OnPlayerLeftHandler) {
        this.playerLeft.addListener(handler);
    }
    onPlayerSentMessage(handler: onPlayerSentMessageHandler) {
        this.playerSentMessage.addListener(handler);
    }
    offPlayerJoined(handler: OnPlayerJoinedHandler) {
        this.playerJoined.removeListener(handler);
    }
    offPlayerLeft(handler: OnPlayerLeftHandler) {
        this.playerLeft.removeListener(handler);
    }
    offPlayerSentMessage(handler: onPlayerSentMessageHandler) {
        this.playerSentMessage.removeListener(handler);
    }

    isPlayerConnected(idx: PlayerIndex): boolean {
        return this.connections[idx] !== null;
    }

    sendPlayerMessage(idx: PlayerIndex, message: ServerMessage) {
        let conn = this.connections[idx];
        if (conn) {
            conn.socket.send(serializeServerMessage(message));
        } else {
            console.error(
                `Connection ${idx} was unexpectedly null while sending message`
            );
        }
    }

    broadcastMessage(message: ServerMessage) {
        const s = serializeServerMessage(message);
        for (let conn of this.connections) {
            if (conn) {
                conn.socket.send(s);
            }
        }
    }

    private wss: WebSocket.Server;

    private connections: [
        PossibleConnection,
        PossibleConnection,
        PossibleConnection,
        PossibleConnection
    ];

    private heartbeatInterval: NodeJS.Timeout;

    private playerJoined: Emitter<Parameters<OnPlayerJoinedHandler>>;
    private playerLeft: Emitter<Parameters<OnPlayerLeftHandler>>;
    private playerSentMessage: Emitter<Parameters<onPlayerSentMessageHandler>>;

    private onConnectionHandler = (
        ws: WebSocket,
        request: http.IncomingMessage
    ) => {
        console.log(
            "New WebSocket connection from:",
            request.connection.remoteAddress
        );

        for (let i = 0; i < 4; ++i) {
            if (this.connections[i] !== null) {
                continue;
            }
            this.connections[i] = {
                socket: ws,
                isAlive: true,
            };
            this.initializeSocket(ws, i as PlayerIndex);
            this.playerJoined.emit(i as PlayerIndex);
            console.log(`Established new connection as player ${i}`);
            return;
        }
        console.log(
            `All player positions are already occupied, terminating connection`
        );
        // TODO: send useful message before closing
        ws.close(
            WEBSOCKET_ERR_TRY_AGAIN_LATER,
            "All player positions are already occupied"
        );
    };

    private onServerError = (_: WebSocket.Server, error: Error) => {
        console.error("Server error:", error);
    };

    private onCloseServerHandler = () => {
        clearInterval(this.heartbeatInterval);
    };

    private initializeSocket(ws: WebSocket, idx: PlayerIndex) {
        ws.on("close", (c, r) => this.onSocketCloseHandler(idx, c, r));
        ws.on("error", (e) => this.onSocketErrorHandler(idx, e));
        ws.on("message", (d) => this.onSocketMessageHandler(idx, d));
        ws.on("pong", (d) => this.onSocketPongHandler(idx, d));
    }

    private onSocketCloseHandler = (
        idx: PlayerIndex,
        code: number,
        reason: string
    ) => {
        this.playerLeft.emit(idx);
        this.connections[idx] = null;
        console.log(`Player ${idx}'s socket closed: (${code}) "${reason}"`);
    };

    private onSocketErrorHandler = (idx: PlayerIndex, error: Error) => {
        console.log(`Error with player ${idx}'s socket: ${error.message}`);
    };

    private onSocketMessageHandler = (
        player: PlayerIndex,
        message: WebSocket.Data
    ) => {
        if (typeof message === "string") {
            const m = parseClientMessage(message);
            if (m !== null) {
                this.playerSentMessage.emit(player, m);
            } else {
                console.error(
                    `Received an ill-formed message from player ${player}: ${message}`
                );
            }
        } else {
            console.error(
                `Received a socket message from player ${player} that is not a string`
            );
        }
    };

    private noop = () => {};

    private onSocketPongHandler = (idx: PlayerIndex, _: Buffer) => {
        let conn = this.connections[idx];
        if (conn !== null) {
            conn.isAlive = true;
        } else {
            console.error(
                `Connection ${idx} was unexpectedly null during pong event`
            );
        }
    };
}
