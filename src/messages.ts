import { Action, parseAction } from "./interfaces/game/actions";
import { getProperty } from "./interfaces/parsehelpers";
import {
    GameStateView,
    parseStateView as parseGameStateView,
} from "./interfaces/game/stateview";

export const createMessage = <T extends string, P>(type: T, payload: P) => ({
    type,
    payload,
});

export const UpdatedState = "Server:UpdatedState";
export const updatedStateMessage = (newState: GameStateView) =>
    createMessage(UpdatedState, newState);
export type UpdatedStateMessage = ReturnType<typeof updatedStateMessage>;

export type ServerMessage = UpdatedStateMessage;

export function parseServerMessage(msg: string): ServerMessage | null {
    try {
        const obj = JSON.parse(msg);

        if (typeof obj !== "object") {
            return null;
        }

        const type = getProperty(obj as ServerMessage, "type", "string");
        const m = ((): ServerMessage => {
            switch (type as ServerMessage["type"]) {
                case UpdatedState:
                    return {
                        type: UpdatedState,
                        payload: parseGameStateView(
                            getProperty(
                                obj as ServerMessage,
                                "payload",
                                "object"
                            )
                        ),
                    };
            }
        })();
        if (msg === undefined) {
            throw new Error(`Server message was improperly handled: ${msg}`);
        }
        return m;
    } catch (e) {
        console.error("Failed to parse server message: ", e);
        return null;
    }
}

export function serializeServerMessage(msg: ServerMessage): string {
    return JSON.stringify(msg);
}

export const PlayerAction = "Client:Action";
export const playerActionMessage = (action: Action) =>
    createMessage(PlayerAction, action);
export type PlayerActionMessage = ReturnType<typeof playerActionMessage>;

export type ClientMessage = PlayerActionMessage;

export function parseClientMessage(msg: string): ClientMessage | null {
    try {
        const obj = JSON.parse(msg);

        if (typeof obj !== "object") {
            return null;
        }

        const type = getProperty(obj as ClientMessage, "type", "string");
        const m = ((): ClientMessage => {
            switch (type as ClientMessage["type"]) {
                case PlayerAction:
                    return {
                        type: PlayerAction,
                        payload: parseAction(
                            getProperty(
                                obj as ClientMessage,
                                "payload",
                                "object"
                            )
                        ),
                    };
            }
        })();
        if (msg === undefined) {
            throw new Error(`Client message was improperly handled: ${msg}`);
        }
        return m;
    } catch (e) {
        console.error("Failed to parse client message: ", e);
        return null;
    }
}

export function serializeClientMessage(msg: ClientMessage): string {
    return JSON.stringify(msg);
}
