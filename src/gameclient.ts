import { SocketClient } from "./socketclient";
import {
    GameStateView,
    DefaultGameStateView,
} from "./interfaces/game/view/stateview";
import { Emitter } from "./interfaces/emitter";
import {
    ClientMessage,
    serializeClientMessage,
} from "./interfaces/messages/clientmessages";
import {
    ServerMessage,
    UPDATED_PLAYER_STATE,
    CLIENT_WILL_BE_KICKED_SOON,
    CLIENT_WAS_KICKED,
    CLIENT_JOINED_GAME,
    CLIENT_FAILED_TO_JOIN_GAME,
    UPDATED_SPECTATOR_STATE,
    JoinFailureReason,
} from "./interfaces/messages/servermessages";
import { parseServerMessage } from "./interfaces/parse/messages";
import { GameStateSpectatorView } from "./interfaces/game/view/spectatorview";
import { SESSION_TOKEN_COOKIE_NAME } from "./sessiontoken";

export type ViewOfGame = GameStateView | GameStateSpectatorView;

export type ViewOfGameChangedHandler = (newState: ViewOfGame) => void;

export type JoinedGameHandler = (gameState: GameStateView) => void;

export type CouldntJoinGameHandler = (reason: JoinFailureReason) => void;

export class GameClient {
    constructor(host: string) {
        this.socket = new SocketClient(host);

        this.gameStateViewChanged = new Emitter();
        this.onConnect = new Emitter();
        this.onDisconnect = new Emitter();
        this.onKickWarning = new Emitter();
        this.onKick = new Emitter();
        this.onJoinedGame = new Emitter();
        this.onCouldntJoinGame = new Emitter();

        this.socket.open.addListener(this.socketOpenedHandler);
        this.socket.closed.addListener(this.socketClosedHandler);
        this.socket.error.addListener(this.socketErrorHandler);
        this.socket.message.addListener(this.socketMessageHandler);

        this.state = DefaultGameStateView;
    }

    gameStateViewChanged: Emitter<Parameters<ViewOfGameChangedHandler>>;
    onConnect: Emitter;
    onDisconnect: Emitter;
    onKickWarning: Emitter;
    onKick: Emitter;
    onJoinedGame: Emitter<Parameters<JoinedGameHandler>>;
    onCouldntJoinGame: Emitter<Parameters<CouldntJoinGameHandler>>;

    getState(): ViewOfGame {
        return this.state;
    }

    sendMessage(msg: ClientMessage) {
        this.socket.sendMessage(serializeClientMessage(msg));
    }

    private socket: SocketClient;

    private state: ViewOfGame;

    private socketOpenedHandler = () => {
        this.onConnect.emit();
    };

    private socketClosedHandler = () => {
        this.onDisconnect.emit();
    };

    private socketErrorHandler = () => {
        console.error("Socket error");
    };

    private socketMessageHandler = (x: string) => {
        const msg = parseServerMessage(x);
        if (msg === null) {
            console.error("Ill-formed message from server:", x);
            return;
        } else {
            const success = this.handleServerMessage(msg);
            if (success !== true) {
                console.error("Improperly handled server message type:", msg);
            }
        }
    };

    private handleServerMessage(msg: ServerMessage): boolean {
        switch (msg.type) {
            case CLIENT_WILL_BE_KICKED_SOON:
                this.onKickWarning.emit();
                return true;
            case CLIENT_WAS_KICKED:
                this.onKick.emit();
                return true;
            case CLIENT_JOINED_GAME:
                if (msg.payload.sessionToken !== null) {
                    document.cookie = `${SESSION_TOKEN_COOKIE_NAME}=${msg.payload.sessionToken}`;
                }
                this.onJoinedGame.emit(msg.payload.gameState);
                return true;
            case CLIENT_FAILED_TO_JOIN_GAME:
                this.onCouldntJoinGame.emit(msg.payload.reason);
                return true;
            case UPDATED_PLAYER_STATE: {
                this.state = msg.payload.newState;
                this.gameStateViewChanged.emit(this.state);
                return true;
            }
            case UPDATED_SPECTATOR_STATE: {
                this.state = msg.payload.newState;
                this.gameStateViewChanged.emit(this.state);
                return true;
            }
        }
    }
}
