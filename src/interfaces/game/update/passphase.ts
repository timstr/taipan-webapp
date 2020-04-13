import { PassPhaseState, GameState } from "../state/state";
import { PlayerIndex } from "../player/player";
import {
    PassPhaseAction,
    CHOOSE_CARD_TO_PASS,
    READY_TO_PASS,
} from "../actions/passphase";
import { mapGamePlayersFunction, replacePlayerKeyFunction } from "./helpers";
import { Card, cardsAreEqual, cardBelongsTo } from "../../cards";
import { RelativePlayerPosition } from "../player/position";
import { upgradeToPlayPhase } from "./phasetransition";

export function updatePassPhase(
    oldState: PassPhaseState,
    player: PlayerIndex,
    action: PassPhaseAction
): GameState {
    const mapPlayers = mapGamePlayersFunction(oldState);
    const replaceKey = replacePlayerKeyFunction(oldState);

    const you = oldState.players[player];
    const prevGive = you.give;

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
            if (theCard && !cardBelongsTo(theCard, you.inHand)) {
                throw new Error(
                    `Player ${player}, "${
                        you.profile.name
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
                    `Player ${player}, "${you.profile.name}", claims to be ready to pass but doesn't have all cards ready`
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
