import { ScorePhaseState, GameState } from "../state/state";
import { PlayerIndex } from "../player/player";
import { ScorePhaseAction, READY_TO_PLAY_AGAIN } from "../actions/scorephase";
import { mapGamePlayersFunction, replacePlayerKeyFunction } from "./helpers";
import { goBackToDealPhase } from "./phasetransition";

export function updateScorePhase(
    oldState: ScorePhaseState,
    player: PlayerIndex,
    action: ScorePhaseAction
): GameState {
    const mapPlayers = mapGamePlayersFunction(oldState);
    const replaceKey = replacePlayerKeyFunction(oldState);

    switch (action.type) {
        case READY_TO_PLAY_AGAIN: {
            const newState: ScorePhaseState = {
                ...oldState,
                players: mapPlayers(
                    replaceKey(player, "readyToPlayAgain", true)
                ),
            };
            if (newState.players.every((p) => p.readyToPlayAgain)) {
                return goBackToDealPhase(newState);
            }
            return newState;
        }
    }
}
