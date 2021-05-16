import { Emitter } from "./interfaces/emitter";

export type SocketOpenHandler = () => void;
export type SocketClosedHandler = () => void;
export type SocketErrorHandler = () => void;
export type SocketMessageHandler = (message: string) => void;

export class SocketClient {
    constructor(hostname: string) {
        this.hostname = hostname;
        this.secure = true;
        this.ws = this.makeWebsocket(`wss://${this.hostname}`);

        this.open = new Emitter();
        this.closed = new Emitter();
        this.error = new Emitter();
        this.message = new Emitter();
    }

    open: Emitter<Parameters<SocketOpenHandler>>;
    closed: Emitter<Parameters<SocketClosedHandler>>;
    error: Emitter<Parameters<SocketErrorHandler>>;
    message: Emitter<Parameters<SocketMessageHandler>>;

    sendMessage(msg: string) {
        this.ws.send(msg);
    }

    private ws: WebSocket;
    private hostname: string;
    private secure: boolean;

    private onOpenHandler = (_: Event) => {
        this.open.emit();
    };

    private onCloseHandler = (_: CloseEvent) => {
        this.closed.emit();
    };

    private onErrorHandler = (_: Event) => {
        if (this.secure) {
            console.log(
                `NOTE: secure websocket server not found, falling back to non-secure websocket server.`
            );
            this.secure = false;
            this.ws.close();
            this.ws = this.makeWebsocket(`ws://${this.hostname}`);
        } else {
            this.error.emit();
        }
    };

    private onMessageHandler = (e: MessageEvent) => {
        this.message.emit(e.data.toString());
    };

    private makeWebsocket(url: string): WebSocket {
        let ws = new WebSocket(url);

        ws.addEventListener("open", this.onOpenHandler);
        ws.addEventListener("close", this.onCloseHandler);
        ws.addEventListener("error", this.onErrorHandler);
        ws.addEventListener("message", this.onMessageHandler);

        return ws;
    }
}
