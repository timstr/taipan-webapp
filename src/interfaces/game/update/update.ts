import {
    GameState,
    JoinPhaseTag,
    PassPhaseTag,
    PlayPhaseTag,
    ScorePhaseTag,
    allCardsInPlay,
    DealPhaseTag,
    JoinPhaseState,
    DefaultGameState,
} from "../state/state";
import { PlayerAction } from "../actions/actions";
import { PLAYER_DISCONNECTED, PLAYER_JOINED } from "../actions/joinphase";
import { deckIsValid } from "../../cards";
import { mapAllPlayers, PlayerIndex } from "../player/player";
import { updateJoinPhase } from "./joinphase";
import { updatePassPhase } from "./passphase";
import { updatePlayPhase } from "./playphase";
import { updateScorePhase } from "./scorephase";
import { updateDealPhase } from "./dealphase";

// Holy shit TypeScript! This function should only be three lines long but no,
// you can't tell that a generic function mapped to a union of arrays should
// produce a union of arrays, not an array of unions. Grumble grumble grumble
const reconnectPlayers = (
    state: Exclude<GameState, JoinPhaseState>,
    idx: PlayerIndex,
    newConnectionState: boolean
): Exclude<GameState, JoinPhaseState> => {
    const f = <T extends Object>(t: T, i: PlayerIndex) => {
        return i === idx ? { ...t, connected: newConnectionState } : t;
    };
    switch (state.phase) {
        case DealPhaseTag:
            // Screw this (1/4)
            return {
                ...state,
                players: mapAllPlayers(state.players, f),
            };
        case PassPhaseTag:
            // Screw this (2/4)
            return {
                ...state,
                players: mapAllPlayers(state.players, f),
            };
        case PlayPhaseTag:
            // Screw this (3/4)
            return {
                ...state,
                players: mapAllPlayers(state.players, f),
            };
        case ScorePhaseTag:
            // Screw this (4/4)
            return {
                ...state,
                players: mapAllPlayers(state.players, f),
            };
    }
};

const updateGameStateImpl = (
    oldState: GameState,
    action: PlayerAction
): GameState => {
    if (action.type === PLAYER_DISCONNECTED) {
        if (oldState.phase === JoinPhaseTag) {
            // If a player disconnects during join phase, they are simply
            // removed and their position opens up immediately for others.
            const newPlayers = mapAllPlayers(oldState.players, (p, i) =>
                i == action.player ? null : p
            );
            return {
                ...oldState,
                players: newPlayers,
            };
        } else {
            // If a player disconnects during any other phase of play,
            // they are not removed, and their information is retained.
            // Only if all players disconnect does the game get reset to
            // the join phase.
            const newState = reconnectPlayers(oldState, action.player, false);

            let numStillConnected = 0;
            for (const p of newState.players) {
                if (p.connected) {
                    numStillConnected += 1;
                }
            }

            if (numStillConnected === 0) {
                return DefaultGameState;
            }

            return newState;
        }
    }
    if (action.type === PLAYER_JOINED && oldState.phase !== JoinPhaseTag) {
        const newState = reconnectPlayers(oldState, action.player, true);
        return newState;
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
