import { Card } from "../../cards";
import { createAction } from "./createaction";
import {
    expectObject,
    validateCard,
    validateRelativePosition,
} from "../../parsehelpers";
import {
    PassPhase,
    PlayerIndex,
    GameState,
    GameStatePassPhase,
    PlayerHandPassPhase,
    upgradeToPlayPhase,
} from "../state";
import { RelativePlayerPosition } from "../position";

// sets ready to false, removes card from other choices
export const CHOOSE_CARD_TO_PASS = "CHOOSE_CARD_TO_PASS";
export const chooseCardToPass = (
    card: Card | null,
    position: RelativePlayerPosition
) => createAction(PassPhase, CHOOSE_CARD_TO_PASS, { card, position });
export type ChooseCardToPassAction = ReturnType<typeof chooseCardToPass>;

// Passes cards and advances game to play phase if all other players are ready
export const READY_TO_PASS = "READY_TO_PASS";
export const readyToPassAction = () => createAction(PassPhase, READY_TO_PASS);
export type ReadyToPassAction = ReturnType<typeof readyToPassAction>;

export type PassPhaseAction = ChooseCardToPassAction | ReadyToPassAction;

export function validatePassPhaseAction(
    type: string,
    payload?: object
): PassPhaseAction {
    const a = ((): PassPhaseAction => {
        switch (type as PassPhaseAction["type"]) {
            case CHOOSE_CARD_TO_PASS: {
                const o = expectObject(
                    payload
                ) as ChooseCardToPassAction["payload"];
                return chooseCardToPass(
                    o.card === null ? null : validateCard(o.card),
                    validateRelativePosition(o.position)
                );
            }
            case READY_TO_PASS:
                return readyToPassAction();
        }
    })();
    if (a === undefined) {
        throw new Error("Invalid action");
    }
    return a;
}

type PlayerMapFn = (
    pp: PlayerHandPassPhase,
    i: PlayerIndex
) => PlayerHandPassPhase;

export function updatePassPhase(
    oldState: GameStatePassPhase,
    player: PlayerIndex,
    action: PassPhaseAction
): GameState {
    const mapPlayers = (
        ...fns: PlayerMapFn[]
    ): GameStatePassPhase["players"] => {
        const f: PlayerMapFn = (pp, i) => {
            for (let fn of fns) {
                pp = fn(pp, i);
            }
            return pp;
        };
        const ps = oldState.players;
        return [f(ps[0], 0), f(ps[1], 1), f(ps[2], 2), f(ps[3], 3)];
    };

    const replace = <K extends keyof PlayerHandPassPhase>(
        idx: PlayerIndex,
        key: K,
        newValue: PlayerHandPassPhase[K]
    ): PlayerMapFn => {
        return (
            pp: PlayerHandPassPhase,
            i: PlayerIndex
        ): PlayerHandPassPhase => {
            if (i === idx) {
                let ret = {
                    ...pp,
                };
                ret[key] = newValue;
                return ret;
            }
            return pp;
        };
    };

    const prevGive = oldState.players[player].give;

    // TODO: enforce passing cards that you own and passing them just once

    switch (action.type) {
        case CHOOSE_CARD_TO_PASS: {
            const whichKey = (<const>{
                Left: "leftOpponent",
                Opposite: "partner",
                Right: "rightOpponent",
            })[action.payload.position];
            let newGive = { ...prevGive };
            newGive[whichKey] = action.payload.card;
            return {
                ...oldState,
                players: mapPlayers(
                    replace(player, "give", newGive),
                    replace(player, "ready", false)
                ),
            };
        }
        case READY_TO_PASS:
            // TODO: prevent ready until all cards are chosen
            const newState = {
                ...oldState,
                players: mapPlayers(replace(player, "ready", true)),
            };
            if (newState.players.every(p => p.ready)) {
                return upgradeToPlayPhase(newState);
            }
            return newState;
    }
}
