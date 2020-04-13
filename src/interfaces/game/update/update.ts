import {
    GameState,
    JoinPhaseTag,
    PassPhaseTag,
    PlayPhaseTag,
    ScorePhaseTag,
    allCardsInPlay,
    DealPhaseTag,
} from "../state/state";
import { PlayerAction } from "../actions/actions";
import { PLAYER_LEFT, backToJoinPhase } from "../actions/joinphase";
import { deckIsValid } from "../../cards";
import { mapAllPlayers } from "../player/player";
import { updateJoinPhase } from "./joinphase";
import { updatePassPhase } from "./passphase";
import { updatePlayPhase } from "./playphase";
import { updateScorePhase } from "./scorephase";
import { updateDealPhase } from "./dealphase";

const updateGameStateImpl = (
    oldState: GameState,
    action: PlayerAction
): GameState => {
    if (action.type === PLAYER_LEFT) {
        let newState = backToJoinPhase(oldState);
        const newPlayers = mapAllPlayers(newState.players, (p, i) =>
            i == action.player ? null : p
        );
        return {
            ...newState,
            players: newPlayers,
        };
    }
    switch (oldState.phase) {
        case JoinPhaseTag: {
            if (action.phase !== JoinPhaseTag) {
                throw new Error("Phase mismatch between action and state");
            }
            return updateJoinPhase(oldState, action.player, action);
        }
        case DealPhaseTag:
            if (action.phase !== DealPhaseTag) {
                throw new Error("Phase mismatch between action and state");
            }
            return updateDealPhase(oldState, action.player, action);
        case PassPhaseTag: {
            if (action.phase !== PassPhaseTag) {
                throw new Error("Phase mismatch between action and state");
            }
            return updatePassPhase(oldState, action.player, action);
        }
        case PlayPhaseTag: {
            if (action.phase !== PlayPhaseTag) {
                throw new Error("Phase mismatch between action and state");
            }
            return updatePlayPhase(oldState, action.player, action);
        }
        case ScorePhaseTag: {
            if (action.phase !== ScorePhaseTag) {
                throw new Error("Phase mismatch between action and state");
            }
            return updateScorePhase(oldState, action.player, action);
        }
    }
};

export function updateGameState(
    oldState: GameState,
    action: PlayerAction
): GameState {
    if (oldState.phase !== JoinPhaseTag) {
        if (!deckIsValid(allCardsInPlay(oldState))) {
            throw new Error("Game is being played with an invalid deck");
        }
    }
    const newState = updateGameStateImpl(oldState, action);
    if (newState.phase !== JoinPhaseTag) {
        if (!deckIsValid(allCardsInPlay(newState))) {
            throw new Error(
                `Cards in play were invalidated by action: ${JSON.stringify(
                    action
                )}`
            );
        }
    }
    return newState;
}
