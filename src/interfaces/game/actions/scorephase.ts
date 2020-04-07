import { createAction } from "./createaction";
import {
    ScorePhase,
    GameStateScorePhase,
    PlayerIndex,
    GameState,
    goBackToPassPhase,
} from "../state";
import {
    mapGamePlayersFunction,
    replacePlayerKeyFunction,
} from "../updatehelpers";

export const READY_TO_PLAY_AGAIN = "READY_TO_PLAY_AGAIN";
export const readyToPlayAgainAction = () =>
    createAction(ScorePhase, READY_TO_PLAY_AGAIN);

export type ReadyToPlayAgainAction = ReturnType<typeof readyToPlayAgainAction>;

export type ScorePhaseAction = ReadyToPlayAgainAction;

export function validateScorePhaseAction(
    type: string,
    _?: object
): ScorePhaseAction {
    const a = ((): ScorePhaseAction => {
        switch (type as ScorePhaseAction["type"]) {
            case READY_TO_PLAY_AGAIN:
                return readyToPlayAgainAction();
        }
    })();
    if (a === undefined) {
        throw new Error("Unrecognized score phase action");
    }
    return a;
}

export function updateScorePhase(
    oldState: GameStateScorePhase,
    player: PlayerIndex,
    action: ScorePhaseAction
): GameState {
    const mapPlayers = mapGamePlayersFunction(oldState);
    const replaceKey = replacePlayerKeyFunction(oldState);

    switch (action.type) {
        case READY_TO_PLAY_AGAIN: {
            const newState: GameStateScorePhase = {
                ...oldState,
                // players: mapPlayers(replace(player, "readyToPlayAgain", true)),
                players: mapPlayers(
                    replaceKey(player, "readyToPlayAgain", true)
                ),
            };
            if (newState.players.every((p) => p.readyToPlayAgain)) {
                return goBackToPassPhase(newState);
            }
            return newState;
        }
    }
}
