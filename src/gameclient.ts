import { SocketClient } from "./socketclient";
import {
    GameStateView,
    DefaultGameStateView,
} from "./interfaces/game/stateview";
import { Emitter } from "./interfaces/Emitter";
import {
    parseServerMessage,
    UpdatedState,
    ClientMessage,
    serializeClientMessage,
    ServerMessage,
} from "./messages";

export type GameStateViewChangedHandler = (newState: GameStateView) => void;

export class GameClient {
    constructor(host: string) {
        this.socket = new SocketClient(host);

        this.gameStateViewChanged = new Emitter();
        this.onConnect = new Emitter();
        this.onDisconnect = new Emitter();

        this.socket.open.addListener(this.socketOpenedHandler);
        this.socket.closed.addListener(this.socketClosedHandler);
        this.socket.error.addListener(this.socketErrorHandler);
        this.socket.message.addListener(this.socketMessageHandler);

        this.state = DefaultGameStateView;
    }

    gameStateViewChanged: Emitter<Parameters<GameStateViewChangedHandler>>;
    onConnect: Emitter;
    onDisconnect: Emitter;

    getState(): GameStateView {
        return this.state;
    }

    sendMessage(msg: ClientMessage) {
        this.socket.sendMessage(serializeClientMessage(msg));
    }

    private socket: SocketClient;

    private state: GameStateView;

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
            const success = ((): boolean => {
                switch (msg.type as ServerMessage["type"]) {
                    case UpdatedState: {
                        this.state = msg.payload;
                        this.gameStateViewChanged.emit(this.state);
                        return true;
                    }
                }
            })();
            if (success === undefined) {
                console.error("Unrecognized server message type:", msg.type);
            }
        }
    };
}
