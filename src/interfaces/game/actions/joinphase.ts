import { createAction } from "./createaction";
import { PlayerPosition } from "../player/position";
import { JoinPhaseTag } from "../state/state";

export const PLAYER_JOINED = "PLAYER_JOINED";
export const playerJoinedAction = () =>
    createAction(JoinPhaseTag, PLAYER_JOINED);
export type PlayerJoinedAction = ReturnType<typeof playerJoinedAction>;

export const PLAYER_DISCONNECTED = "PLAYER_DISCONNECTED";
export const playerDisconnectedAction = () =>
    createAction(JoinPhaseTag, PLAYER_DISCONNECTED);
export type PlayerDisconnectedAction = ReturnType<
    typeof playerDisconnectedAction
>;

export const PLAYER_CHOSE_NAME = "PLAYER_CHOSE_NAME";
export const playerChoseNameAction = (name: string) =>
    createAction(JoinPhaseTag, PLAYER_CHOSE_NAME, { name });
export type PlayerChoseNameAction = ReturnType<typeof playerChoseNameAction>;

export const PLAYER_CHOSE_POSITION = "PLAYER_CHOSE_POSITION";
export const playerChosePositionAction = (position: PlayerPosition | null) =>
    createAction(JoinPhaseTag, PLAYER_CHOSE_POSITION, { position });
export type PlayerChosePositionAction = ReturnType<
    typeof playerChosePositionAction
>;

export const PLAYER_IS_READY = "PLAYER_IS_READY";
export const playerIsReadyAction = () =>
    createAction(JoinPhaseTag, PLAYER_IS_READY);
export type PlayerIsReadyAction = ReturnType<typeof playerIsReadyAction>;

export type JoinPhaseAction =
    | PlayerJoinedAction
    | PlayerDisconnectedAction
    | PlayerChoseNameAction
    | PlayerChosePositionAction
    | PlayerIsReadyAction;
