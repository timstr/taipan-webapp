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
                console.log(
                    `Player ${whichPlayer} has taken their second deal. All players have taken their cards and the game is advancing to pass phase.`
                );
                return upgradeToPassPhase(newState);
            }
            console.log(
                `Player ${whichPlayer} has taken their second deal. Other players must still take their cards.`
            );
            return newState;
    }
}
