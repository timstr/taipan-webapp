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
import { PendingPlayer } from "../playerstate";
import { PlayerProfile } from "../player/player";

export const PLAYER_JOINED = "PLAYER_JOINED";
export const playerJoinedAction = () =>
    createAction(JoinPhaseTag, PLAYER_JOINED);
export type PlayerJoinedAction = ReturnType<typeof playerJoinedAction>;

export const PLAYER_LEFT = "PLAYER_LEFT";
export const playerLeftAction = () => createAction(JoinPhaseTag, PLAYER_LEFT);
export type PlayerLeftAction = ReturnType<typeof playerLeftAction>;

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
    | PlayerLeftAction
    | PlayerChoseNameAction
    | PlayerChosePositionAction
    | PlayerIsReadyAction;

export function backToJoinPhase(state: GameState): JoinPhaseState {
    const makePlayer = (p: PlayerProfile): PendingPlayer => {
        return {
            name: p.name,
            position: p.position,
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
                    makePlayer(state.players[0].profile),
                    makePlayer(state.players[1].profile),
                    makePlayer(state.players[2].profile),
                    makePlayer(state.players[3].profile),
                ],
            };
    }
}
