import { DealPhaseState, GameState } from "../state/state";
import { PlayerIndex } from "../player/player";
import { DealPhaseAction, TAKE_SECOND_DEAL } from "../actions/dealphase";
import { mapGamePlayersFunction, replacePlayerKeyFunction } from "./helpers";
import { upgradeToPassPhase } from "./phasetransition";

export function updateDealPhase(
    oldState: DealPhaseState,
    whichPlayer: PlayerIndex,
    action: DealPhaseAction
): GameState {
    const mapPlayers = mapGamePlayersFunction(oldState);
    const replaceKey = replacePlayerKeyFunction(oldState);

    switch (action.type) {
        case TAKE_SECOND_DEAL:
            const newState = {
                ...oldState,
                players: mapPlayers(
                    replaceKey(whichPlayer, "tookSecondDeal", true)
                ),
            };
            if (newState.players.every((p) => p.tookSecondDeal)) {
                return upgradeToPassPhase(newState);
            }
            return newState;
    }
}
