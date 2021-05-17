import { GameStateView } from "../game/view/stateview";
import { createMessage } from "./createmessage";
import { GameStateSpectatorView } from "../game/view/spectatorview";

export const CLIENT_WILL_BE_KICKED_SOON = "Server:ClientWillBeKickedSoon";
export const clientWillBeKickedSoonMessage = () =>
    createMessage(CLIENT_WILL_BE_KICKED_SOON);
export type ClientWillBeKickedSoonMessage = ReturnType<
    typeof clientWillBeKickedSoonMessage
>;

export const CLIENT_WAS_KICKED = "Server:ClientWasKicked";
export const clientWasKickedMessage = () => createMessage(CLIENT_WAS_KICKED);
export type ClientWasKickedMessage = ReturnType<typeof clientWasKickedMessage>;

export const CLIENT_JOINED_GAME = "Server:ClientJoinedGame";
export const clientJoinedGameMessage = (
    gameState: GameStateView,
    sessionToken: string | null
) => createMessage(CLIENT_JOINED_GAME, { gameState, sessionToken });
export type ClientJoinedGameMessage = ReturnType<
    typeof clientJoinedGameMessage
>;

export const JoinFailedBecauseFull = "GameFull";
export type JoinFailedBecauseFull = typeof JoinFailedBecauseFull;

export const JoinFailedBecauseWrongPassword = "WrongPassword";
export type JoinFailedBecauseWrongPassword =
    typeof JoinFailedBecauseWrongPassword;

export const JoinFailedBecauseBanned = "Banned";
export type JoinFailedBecauseBanned = typeof JoinFailedBecauseBanned;

export type JoinFailureReason =
    | JoinFailedBecauseFull
    | JoinFailedBecauseWrongPassword
    | JoinFailedBecauseBanned;
export const AllJoinFailureReasons: JoinFailureReason[] = [
    JoinFailedBecauseFull,
    JoinFailedBecauseWrongPassword,
    JoinFailedBecauseBanned,
];

export const CLIENT_FAILED_TO_JOIN_GAME = "Server:ClientFailedToJoinGame";
export const clientFailedToJoinGameMessage = (reason: JoinFailureReason) =>
    createMessage(CLIENT_FAILED_TO_JOIN_GAME, { reason });
export type ClientFailedToJoinGameMessage = ReturnType<
    typeof clientFailedToJoinGameMessage
>;

export const UPDATED_PLAYER_STATE = "Server:UpdatedPlayerState";
export const updatedPlayerStateMessage = (newState: GameStateView) =>
    createMessage(UPDATED_PLAYER_STATE, { newState });
export type UpdatedPlayerStateMessage = ReturnType<
    typeof updatedPlayerStateMessage
>;

export const UPDATED_SPECTATOR_STATE = "Server:UpdatedSpectatorState";
export const updatedSpectatorStateMessage = (
    newState: GameStateSpectatorView
) => createMessage(UPDATED_SPECTATOR_STATE, { newState });
export type UpdatedSpectatorStateMessage = ReturnType<
    typeof updatedSpectatorStateMessage
>;

export type ServerMessage =
    | ClientWillBeKickedSoonMessage
    | ClientWasKickedMessage
    | ClientJoinedGameMessage
    | ClientFailedToJoinGameMessage
    | UpdatedPlayerStateMessage
    | UpdatedSpectatorStateMessage;

export function serializeServerMessage(msg: ServerMessage): string {
    return JSON.stringify(msg);
}
