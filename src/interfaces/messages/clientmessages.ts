import { Action } from "../game/actions/actions";
import { createMessage } from "./createmessage";
import { HashResult } from "../../hash/hash";

export const DONT_KICK_ME = "Client:DontKickMe";
export const dontKickMeMessage = () => createMessage(DONT_KICK_ME);
export type DontKickMeMessage = ReturnType<typeof dontKickMeMessage>;

export const CLIENT_WANTS_TO_PLAY = "Client:PlayGame";
export const clientWantsToPlayMessage = (passwordHash: HashResult) =>
    createMessage(CLIENT_WANTS_TO_PLAY, { passwordHash });
export type ClientWantsToPlayMessage = ReturnType<
    typeof clientWantsToPlayMessage
>;

export const PLAYER_DID_ACTION = "Client:PlayerDidAction";
export const playerDidActionMessage = (action: Action) =>
    createMessage(PLAYER_DID_ACTION, { action });
export type PlayerDidActionMessage = ReturnType<typeof playerDidActionMessage>;

export type ClientMessage =
    | DontKickMeMessage
    | ClientWantsToPlayMessage
    | PlayerDidActionMessage;

export function serializeClientMessage(msg: ClientMessage): string {
    return JSON.stringify(msg);
}
