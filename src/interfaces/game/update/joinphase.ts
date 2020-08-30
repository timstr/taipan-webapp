import { JoinPhaseState, GameState } from "../state/state";
import { PlayerIndex } from "../player/player";
import {
    JoinPhaseAction,
    PLAYER_JOINED,
    PLAYER_CHOSE_NAME,
    PLAYER_CHOSE_POSITION,
    PLAYER_IS_READY,
    PLAYER_DISCONNECTED,
} from "../actions/joinphase";
import {
    mapGamePlayersFunction,
    replacePlayerFunction,
    replacePlayerKeyFunction,
} from "./helpers";
import { upgradeToDealPhase } from "./phasetransition";

export function updateJoinPhase(
    oldState: JoinPhaseState,
    whichPlayer: PlayerIndex,
    action: JoinPhaseAction
): GameState {
    const mapPlayers = mapGamePlayersFunction(oldState);
    const replace = replacePlayerFunction(oldState);
    const replaceKey = replacePlayerKeyFunction(oldState);

    switch (action.type) {
        case PLAYER_JOINED: {
            return {
                ...oldState,
                players: mapPlayers(replace(whichPlayer, { ready: false })),
            };
        }
        case PLAYER_DISCONNECTED: {
            return {
                ...oldState,
                players: mapPlayers(replace(whichPlayer, null)),
            };
        }
        case PLAYER_CHOSE_NAME: {
            return {
                ...oldState,
                players: mapPlayers(
                    replaceKey(whichPlayer, "name", action.payload.name),
                    replaceKey(whichPlayer, "ready", false)
                ),
            };
        }
        case PLAYER_CHOSE_POSITION: {
            return {
                ...oldState,
                players: mapPlayers(
                    replaceKey(
                        whichPlayer,
                        "position",
                        action.payload.position || undefined
                    ),
                    replaceKey(whichPlayer, "ready", false)
                ),
            };
        }
        case PLAYER_IS_READY: {
            const newState = {
                ...oldState,
                players: mapPlayers(replaceKey(whichPlayer, "ready", true)),
            };
            if (newState.players.every((p) => p?.ready === true)) {
                return upgradeToDealPhase(newState);
            }
            return newState;
        }
    }
}
