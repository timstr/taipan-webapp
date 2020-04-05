import { Emitter } from "./interfaces/Emitter";

export type SocketOpenHandler = () => void;
export type SocketClosedHandler = () => void;
export type SocketErrorHandler = () => void;
export type SocketMessageHandler = (message: string) => void;

export class SocketClient {
    constructor(host: string) {
        this.ws = new WebSocket(host);

        this.ws.addEventListener("open", this.onOpenHandler);
        this.ws.addEventListener("close", this.onCloseHandler);
        this.ws.addEventListener("error", this.onErrorHandler);
        this.ws.addEventListener("message", this.onMessageHandler);

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

    private onOpenHandler = (_: Event) => {
        this.open.emit();
    };

    private onCloseHandler = (_: CloseEvent) => {
        this.closed.emit();
    };

    private onErrorHandler = (_: Event) => {
        this.error.emit();
    };

    private onMessageHandler = (e: MessageEvent) => {
        this.message.emit(e.data.toString());
    };
}
