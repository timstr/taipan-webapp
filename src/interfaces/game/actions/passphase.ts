import { Card, cardBelongsTo, cardsAreEqual } from "../../cards";
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
    upgradeToPlayPhase,
} from "../state";
import { RelativePlayerPosition } from "../position";
import {
    mapGamePlayersFunction,
    replacePlayerKeyFunction,
} from "../updatehelpers";

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

export function updatePassPhase(
    oldState: GameStatePassPhase,
    player: PlayerIndex,
    action: PassPhaseAction
): GameState {
    const mapPlayers = mapGamePlayersFunction(oldState);
    const replaceKey = replacePlayerKeyFunction(oldState);

    const yourHand = oldState.players[player];
    const prevGive = yourHand.give;

    const posToPassMapping = <const>{
        Left: "leftOpponent",
        Opposite: "partner",
        Right: "rightOpponent",
    };

    const alreadyPassing = (
        card: Card,
        where: RelativePlayerPosition
    ): boolean => {
        const passCard = prevGive[posToPassMapping[where]];
        return passCard ? cardsAreEqual(card, passCard) : false;
    };
    switch (action.type) {
        case CHOOSE_CARD_TO_PASS: {
            const theCard = action.payload.card;
            if (theCard && !cardBelongsTo(theCard, yourHand.inHand)) {
                throw new Error(
                    `Player ${player}, "${
                        yourHand.profile.name
                    }", tried to pass the card ${JSON.stringify(
                        theCard
                    )}, which they do not have`
                );
            }

            const whichKey = posToPassMapping[action.payload.position];
            let newGive = { ...prevGive };
            if (theCard) {
                if (alreadyPassing(theCard, "Left")) {
                    newGive.leftOpponent = null;
                }
                if (alreadyPassing(theCard, "Opposite")) {
                    newGive.partner = null;
                }
                if (alreadyPassing(theCard, "Right")) {
                    newGive.rightOpponent = null;
                }
            }
            newGive[whichKey] = action.payload.card;
            return {
                ...oldState,
                players: mapPlayers(
                    replaceKey(player, "give", newGive),
                    replaceKey(player, "ready", false)
                ),
            };
        }
        case READY_TO_PASS: {
            if (
                !(
                    prevGive.leftOpponent &&
                    prevGive.partner &&
                    prevGive.rightOpponent
                )
            ) {
                throw new Error(
                    `Player ${player}, "${yourHand.profile.name}", claims to be ready to pass but doesn't have all cards ready`
                );
            }

            const newState = {
                ...oldState,
                players: mapPlayers(replaceKey(player, "ready", true)),
            };
            if (newState.players.every((p) => p.ready)) {
                return upgradeToPlayPhase(newState);
            }
            return newState;
        }
    }
}
