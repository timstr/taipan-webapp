import {
    ClientMessage,
    PLAYER_DID_ACTION,
    PlayerDidActionMessage,
    DONT_KICK_ME,
    CLIENT_WANTS_TO_PLAY,
    ClientWantsToPlayMessage,
} from "../messages/clientmessages";
import { getProperty, getPropertyOr, expectObject } from "./helpers";
import { validateAction } from "./action";
import {
    ServerMessage,
    UPDATED_PLAYER_STATE,
    UpdatedPlayerStateMessage,
    CLIENT_WILL_BE_KICKED_SOON,
    CLIENT_WAS_KICKED,
    CLIENT_FAILED_TO_JOIN_GAME,
    CLIENT_JOINED_GAME,
    UPDATED_SPECTATOR_STATE,
    clientWillBeKickedSoonMessage,
    updatedPlayerStateMessage,
    clientWasKickedMessage,
    clientJoinedGameMessage,
    ClientJoinedGameMessage,
    UpdatedSpectatorStateMessage,
    updatedSpectatorStateMessage,
    JoinFailureReason,
    AllJoinFailureReasons,
    ClientFailedToJoinGameMessage,
    clientFailedToJoinGameMessage,
} from "../messages/servermessages";
import { validateGameStateView } from "./view/stateview";
import { PayloadType } from "../game/actions/createaction";
import { validateHashResult } from "./hash";
import { validateGameStateSpectatorView } from "./view/spectatorview";

export function parseClientMessage(msg: string): ClientMessage | null {
    try {
        const obj = JSON.parse(msg);

        if (typeof obj !== "object") {
            return null;
        }

        const type = getProperty(obj as ClientMessage, "type", "string");
        const payload = getPropertyOr(
            obj as ClientMessage,
            "payload",
            "object",
            undefined
        );
        const m = ((): ClientMessage => {
            switch (type as ClientMessage["type"]) {
                case DONT_KICK_ME: {
                    return {
                        type: DONT_KICK_ME,
                        payload: undefined,
                    };
                }
                case CLIENT_WANTS_TO_PLAY: {
                    const p = expectObject(payload) as PayloadType<
                        ClientWantsToPlayMessage
                    >;
                    const pwd = getProperty(p, "passwordHash", "object");
                    return {
                        type: CLIENT_WANTS_TO_PLAY,
                        payload: { passwordHash: validateHashResult(pwd) },
                    };
                }
                case PLAYER_DID_ACTION: {
                    const p = expectObject(payload) as PayloadType<
                        PlayerDidActionMessage
                    >;
                    const action = validateAction(p.action);
                    return {
                        type: PLAYER_DID_ACTION,
                        payload: { action },
                    };
                }
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

const validateJoinFailureReason = (x: any): JoinFailureReason => {
    if (typeof x === "string") {
        const i = AllJoinFailureReasons.findIndex((r) => r === x);
        if (i >= 0) {
            return AllJoinFailureReasons[i];
        }
    }
    throw new Error(`Invalid player index: ${JSON.stringify(x)}`);
};

export function parseServerMessage(msg: string): ServerMessage | null {
    try {
        const obj = JSON.parse(msg);

        if (typeof obj !== "object") {
            return null;
        }

        const type = getProperty(obj as ServerMessage, "type", "string");
        const payload = getPropertyOr(
            obj as ClientMessage,
            "payload",
            "object",
            undefined
        );
        const m = ((): ServerMessage => {
            switch (type as ServerMessage["type"]) {
                case CLIENT_WILL_BE_KICKED_SOON: {
                    return clientWillBeKickedSoonMessage();
                }
                case CLIENT_WAS_KICKED: {
                    return clientWasKickedMessage();
                }
                case CLIENT_JOINED_GAME: {
                    const p = expectObject(payload) as PayloadType<
                        ClientJoinedGameMessage
                    >;
                    const newState = validateGameStateView(p.gameState);
                    return clientJoinedGameMessage(newState);
                }
                case CLIENT_FAILED_TO_JOIN_GAME: {
                    const p = expectObject(payload) as PayloadType<
                        ClientFailedToJoinGameMessage
                    >;
                    const r = validateJoinFailureReason(p.reason);
                    return clientFailedToJoinGameMessage(r);
                }
                case UPDATED_PLAYER_STATE: {
                    const p = expectObject(payload) as PayloadType<
                        UpdatedPlayerStateMessage
                    >;
                    const newState = validateGameStateView(p.newState);
                    return updatedPlayerStateMessage(newState);
                }
                case UPDATED_SPECTATOR_STATE: {
                    const p = expectObject(payload) as PayloadType<
                        UpdatedSpectatorStateMessage
                    >;
                    const newState = validateGameStateSpectatorView(p.newState);
                    return updatedSpectatorStateMessage(newState);
                }
            }
        })();
        if (m === undefined) {
            throw new Error(`Server message was improperly handled: ${msg}`);
        }
        return m;
    } catch (e) {
        console.error("Failed to parse server message: ", e);
        return null;
    }
}
