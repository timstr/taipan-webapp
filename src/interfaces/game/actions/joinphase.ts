import { createAction, PayloadType } from "./createaction";
import {
    getProperty,
    expectObject,
    validateNullablePosition,
} from "../../parsehelpers";
import { PlayerPosition } from "../position";
import {
    JoinPhase,
    GameStateJoinPhase,
    PlayerIndex,
    PendingPlayer,
    upgradeToPassPhase,
    GameState,
    PassPhase,
    PlayPhase,
    ScorePhase,
    PlayerProfile,
} from "../state";
import {
    mapGamePlayersFunction,
    replacePlayerKeyFunction,
    replacePlayerFunction,
} from "../updatehelpers";

export const PLAYER_JOINED = "PLAYER_JOINED";
export const playerJoinedAction = () => createAction(JoinPhase, PLAYER_JOINED);
export type PlayerJoinedAction = ReturnType<typeof playerJoinedAction>;

export const PLAYER_LEFT = "PLAYER_LEFT";
export const playerLeftAction = () => createAction(JoinPhase, PLAYER_LEFT);
export type PlayerLeftAction = ReturnType<typeof playerLeftAction>;

export const PLAYER_CHOSE_NAME = "PLAYER_CHOSE_NAME";
export const playerChoseNameAction = (name: string) =>
    createAction(JoinPhase, PLAYER_CHOSE_NAME, { name });
export type PlayerChoseNameAction = ReturnType<typeof playerChoseNameAction>;

export const PLAYER_CHOSE_POSITION = "PLAYER_CHOSE_POSITION";
export const playerChosePositionAction = (position: PlayerPosition | null) =>
    createAction(JoinPhase, PLAYER_CHOSE_POSITION, { position });
export type PlayerChosePositionAction = ReturnType<
    typeof playerChosePositionAction
>;

export const PLAYER_IS_READY = "PLAYER_IS_READY";
export const playerIsReadyAction = () =>
    createAction(JoinPhase, PLAYER_IS_READY);
export type PlayerIsReadyAction = ReturnType<typeof playerIsReadyAction>;

export type JoinPhaseAction =
    | PlayerJoinedAction
    | PlayerLeftAction
    | PlayerChoseNameAction
    | PlayerChosePositionAction
    | PlayerIsReadyAction;

export function validateJoinPhaseAction(
    type: string,
    payload?: object
): JoinPhaseAction {
    const a = ((): JoinPhaseAction => {
        switch (type as JoinPhaseAction["type"]) {
            case PLAYER_JOINED:
                return playerJoinedAction();
            case PLAYER_LEFT:
                return playerLeftAction();
            case PLAYER_CHOSE_NAME:
                return playerChoseNameAction(
                    getProperty(
                        payload as PayloadType<PlayerChoseNameAction>,
                        "name",
                        "string"
                    )
                );
            case PLAYER_CHOSE_POSITION: {
                const o = expectObject(
                    payload
                ) as PlayerChosePositionAction["payload"];
                return playerChosePositionAction(
                    validateNullablePosition(o.position)
                );
            }
            case PLAYER_IS_READY:
                return playerIsReadyAction();
        }
    })();
    if (a === undefined) {
        throw new Error("Unrecognized join phase action");
    }
    return a;
}

export function updateJoinPhase(
    oldState: GameStateJoinPhase,
    player: PlayerIndex,
    action: JoinPhaseAction
): GameState {
    const mapPlayers = mapGamePlayersFunction(oldState);
    const replace = replacePlayerFunction(oldState);
    const replaceKey = replacePlayerKeyFunction(oldState);

    switch (action.type) {
        case PLAYER_JOINED: {
            return {
                ...oldState,
                players: mapPlayers(replace(player, { ready: false })),
            };
        }
        case PLAYER_LEFT: {
            return {
                ...oldState,
                players: mapPlayers(replace(player, null)),
            };
        }
        case PLAYER_CHOSE_NAME: {
            return {
                ...oldState,
                players: mapPlayers(
                    replaceKey(player, "name", action.payload.name),
                    replaceKey(player, "ready", false)
                ),
            };
        }
        case PLAYER_CHOSE_POSITION: {
            return {
                ...oldState,
                players: mapPlayers(
                    replaceKey(
                        player,
                        "position",
                        action.payload.position || undefined
                    ),
                    replaceKey(player, "ready", false)
                ),
            };
        }
        case PLAYER_IS_READY: {
            const newState = {
                ...oldState,
                players: mapPlayers(replaceKey(player, "ready", true)),
            };
            if (newState.players.every((p) => p?.ready === true)) {
                return upgradeToPassPhase(newState);
            }
            return newState;
        }
    }
}

export function backToJoinPhase(state: GameState): GameStateJoinPhase {
    const makePlayer = (p: PlayerProfile): PendingPlayer => ({
        name: p.name,
        position: p.position,
        ready: false,
    });
    switch (state.phase) {
        case JoinPhase:
            return state;
        case PassPhase:
        case PlayPhase:
        case ScorePhase:
            return {
                phase: JoinPhase,
                players: [
                    makePlayer(state.players[0].profile),
                    makePlayer(state.players[1].profile),
                    makePlayer(state.players[2].profile),
                    makePlayer(state.players[3].profile),
                ],
            };
    }
}
