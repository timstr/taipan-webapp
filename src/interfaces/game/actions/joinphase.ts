import { createAction } from "./createaction";
import { PlayerPosition } from "../player/position";
import {
    JoinPhaseTag,
    JoinPhaseState,
    GameState,
    PassPhaseTag,
    PlayPhaseTag,
    ScorePhaseTag,
    DealPhaseTag,
} from "../state/state";
import { PendingPlayer, Player } from "../playerstate";

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

export function backToJoinPhase(state: GameState): JoinPhaseState {
    const makePlayer = (p: Player): PendingPlayer => {
        if (!p.connected) {
            return null;
        }
        return {
            name: p.profile.name,
            position: p.profile.position,
            ready: false,
        };
    };
    switch (state.phase) {
        case JoinPhaseTag:
            return state;
        case DealPhaseTag:
        case PassPhaseTag:
        case PlayPhaseTag:
        case ScorePhaseTag:
            return {
                phase: JoinPhaseTag,
                players: [
                    makePlayer(state.players[0]),
                    makePlayer(state.players[1]),
                    makePlayer(state.players[2]),
                    makePlayer(state.players[3]),
                ],
            };
    }
}
