import { createAction } from "./createaction";
import {
    ScorePhase,
    GameStateScorePhase,
    PlayerIndex,
    GameState,
    PlayerHandScorePhase,
    goBackToPassPhase,
} from "../state";

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

type PlayerMapFn = (
    pp: PlayerHandScorePhase,
    i: PlayerIndex
) => PlayerHandScorePhase;

export function updateScorePhase(
    oldState: GameStateScorePhase,
    player: PlayerIndex,
    action: ScorePhaseAction
): GameState {
    // TODO: put this in a helper file and share code with other update function
    const mapPlayers = (
        ...fns: PlayerMapFn[]
    ): GameStateScorePhase["players"] => {
        const f: PlayerMapFn = (pp, i) => {
            for (let fn of fns) {
                pp = fn(pp, i);
            }
            return pp;
        };
        const ps = oldState.players;
        return [f(ps[0], 0), f(ps[1], 1), f(ps[2], 2), f(ps[3], 3)];
    };

    const replace = <K extends keyof PlayerHandScorePhase>(
        idx: PlayerIndex,
        key: K,
        newValue: PlayerHandScorePhase[K]
    ): PlayerMapFn => {
        return (
            pp: PlayerHandScorePhase,
            i: PlayerIndex
        ): PlayerHandScorePhase => {
            if (i === idx) {
                if (pp !== null) {
                    let ret = {
                        ...pp,
                    };
                    ret[key] = newValue;
                    return ret;
                }
                console.error("Player was unexpectedly null");
            }
            return pp;
        };
    };

    switch (action.type) {
        case READY_TO_PLAY_AGAIN: {
            const newState: GameStateScorePhase = {
                ...oldState,
                players: mapPlayers(replace(player, "readyToPlayAgain", true)),
            };
            if (newState.players.every(p => p.readyToPlayAgain)) {
                return goBackToPassPhase(newState);
            }
            return newState;
        }
    }
}
