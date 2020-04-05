import {
    GameState,
    JoinPhase,
    PassPhase,
    PlayPhase,
    ScorePhase,
} from "./state";
import { PlayerAction } from "./actions";
import {
    updateJoinPhase,
    PLAYER_LEFT,
    backToJoinPhase,
} from "./actions/joinphase";
import { updatePassPhase } from "./actions/passphase";
import { updatePlayPhase } from "./actions/playphase";
import { updateScorePhase } from "./actions/scorephase";

export const updateGameState = (
    oldState: GameState,
    action: PlayerAction
): GameState => {
    if (action.type === PLAYER_LEFT) {
        let newState = backToJoinPhase(oldState);
        newState.players[action.player] = null;
        return newState;
    }
    switch (oldState.phase) {
        case JoinPhase: {
            if (action.phase !== "Join") {
                console.error("Phase mismatch between action and state");
                return oldState;
            }
            return updateJoinPhase(oldState, action.player, action);
        }
        case PassPhase: {
            if (action.phase !== "Pass") {
                console.error("Phase mismatch between action and state");
                return oldState;
            }
            return updatePassPhase(oldState, action.player, action);
        }
        case PlayPhase: {
            if (action.phase !== "Play") {
                console.error("Phase mismatch between action and state");
                return oldState;
            }
            return updatePlayPhase(oldState, action.player, action);
        }
        case ScorePhase: {
            if (action.phase !== "Score") {
                console.error("Phase mismatch between action and state");
                return oldState;
            }
            return updateScorePhase(oldState, action.player, action);
        }
    }
};
