import {
    Card,
    cardsAreEqual,
    cardBelongsTo,
    countStack,
    pushStack,
    filterCards,
    pushDoubleStack,
    EmptyStack,
    countDoubleStack,
    popDoubleStack,
    concatStacks,
    sortCards,
    EmptyDoubleStack,
    pushTripleStack,
    popTripleStack,
} from "../../cards";
import { createAction } from "./createaction";
import { expectObject, validateCard } from "../../parsehelpers";
import {
    PlayPhase,
    PlayerHandPlayPhase,
    PlayerIndex,
    GameStatePlayPhase,
    GameState,
    upgradeToScorePhase,
} from "../state";
import { findPlayerWithPosition } from "../stateview";
import {
    mapGamePlayersFunction,
    replacePlayerKeyFunction,
} from "../updatehelpers";

export const STAGE_CARD = "STAGE_CARD";
export const stageCardAction = (card: Card) =>
    createAction(PlayPhase, STAGE_CARD, { card });
export type StageCardAction = ReturnType<typeof stageCardAction>;

export const UNSTAGE_CARD = "UNSTAGE_CARD";
export const unstageCardAction = (card: Card) =>
    createAction(PlayPhase, UNSTAGE_CARD, { card });
export type UnstageCardAction = ReturnType<typeof unstageCardAction>;

export const CLEAR_STAGED_CARDS = "CLEAR_STAGED_CARDS";
export const clearStagedCardsAction = () =>
    createAction(PlayPhase, CLEAR_STAGED_CARDS);
export type ClearStagedCardsAction = ReturnType<typeof clearStagedCardsAction>;

export const PLAY_SINGLE_CARD = "PLAY_SINGLE_CARD";
export const playSingleCardAction = (card: Card) =>
    createAction(PlayPhase, PLAY_SINGLE_CARD, {
        card,
    });
export type PlaySingleCardAction = ReturnType<typeof playSingleCardAction>;

export const PLAY_STAGED_CARDS = "PLAY_STAGED_CARDS";
export const playStagedCardsAction = () =>
    createAction(PlayPhase, PLAY_STAGED_CARDS);
export type PlayStagedCardsAction = ReturnType<typeof playStagedCardsAction>;

export const RECLAIM_LAST_PLAY = "UNDO_LAST_PLAY";
export const reclaimLastPlayAction = () =>
    createAction(PlayPhase, RECLAIM_LAST_PLAY);
export type ReclaimLastPlayAction = ReturnType<typeof reclaimLastPlayAction>;

export const TAKE_TRICK = "TAKE_TRICK";
export const takeTrickAction = () => createAction(PlayPhase, TAKE_TRICK);
export type TakeTrickAction = ReturnType<typeof takeTrickAction>;

export const PUT_TRICK_BACK = "PUT_TRICK_BACK";
export const putTrickBackAction = () => createAction(PlayPhase, PUT_TRICK_BACK);
export type PutTrickBackAction = ReturnType<typeof putTrickBackAction>;

// TODO:
// - pass
// - bomb
// - undo last move (in case of mistake, will require slight redesign of game state)
// ?

export type PlayPhaseAction =
    | StageCardAction
    | UnstageCardAction
    | ClearStagedCardsAction
    | PlaySingleCardAction
    | PlayStagedCardsAction
    | ReclaimLastPlayAction
    | TakeTrickAction
    | PutTrickBackAction;

export function validatePlayPhaseAction(
    type: string,
    payload?: object
): PlayPhaseAction {
    const getTheCard = () => validateCard((expectObject(payload) as any).card);
    const a = ((): PlayPhaseAction => {
        switch (type as PlayPhaseAction["type"]) {
            case STAGE_CARD:
                return stageCardAction(getTheCard());
            case UNSTAGE_CARD:
                return unstageCardAction(getTheCard());
            case CLEAR_STAGED_CARDS:
                return clearStagedCardsAction();
            case PLAY_SINGLE_CARD:
                return playSingleCardAction(getTheCard());
            case PLAY_STAGED_CARDS:
                return playStagedCardsAction();
            case RECLAIM_LAST_PLAY:
                return reclaimLastPlayAction();
            case TAKE_TRICK:
                return takeTrickAction();
            case PUT_TRICK_BACK:
                return putTrickBackAction();
        }
    })();
    if (a === undefined) {
        throw new Error("Invalid action");
    }
    return a;
}

const wentOut = (player: PlayerHandPlayPhase): boolean => {
    return countStack(player.inHand) === 0;
};

const gameOver = (players: GameStatePlayPhase["players"]): boolean => {
    const playersLeft = players
        .map((p) => !wentOut(p))
        .reduce((acc, b) => (b ? acc + 1 : acc), 0);
    if (playersLeft <= 1) {
        return true;
    }
    const profiles = players.map((p) => p.profile);
    const npos = findPlayerWithPosition("North", profiles);
    const spos = findPlayerWithPosition("South", profiles);
    const epos = findPlayerWithPosition("East", profiles);
    const wpos = findPlayerWithPosition("West", profiles);
    if (wentOut(players[npos]) && wentOut(players[spos])) {
        return true;
    }
    if (wentOut(players[epos]) && wentOut(players[wpos])) {
        return true;
    }
    return false;
};

export function updatePlayPhase(
    oldState: GameStatePlayPhase,
    player: PlayerIndex,
    action: PlayPhaseAction
): GameState {
    const mapPlayers = mapGamePlayersFunction(oldState);
    const replaceKey = replacePlayerKeyFunction(oldState);

    const hand = oldState.players[player];

    switch (action.type) {
        case STAGE_CARD: {
            if (!cardBelongsTo(action.payload.card, hand.inHand)) {
                console.error(
                    `Player ${player}, "${
                        hand.profile.name
                    }" tried to stage a card they don't have: ${JSON.stringify(
                        action.payload.card
                    )}`
                );
                return oldState;
            }
            if (cardBelongsTo(action.payload.card, hand.staged)) {
                console.error(
                    `Player ${player}, "${
                        hand.profile.name
                    }" tried to stage a card they already staged: ${JSON.stringify(
                        action.payload.card
                    )}`
                );
                return oldState;
            }
            return {
                ...oldState,
                players: mapPlayers(
                    replaceKey(
                        player,
                        "staged",
                        pushStack(hand.staged, action.payload.card)
                    )
                ),
            };
        }
        case UNSTAGE_CARD: {
            if (!cardBelongsTo(action.payload.card, hand.staged)) {
                console.error(
                    `Player ${player}, "${
                        hand.profile.name
                    }" tried to unstage a card that is not staged: ${JSON.stringify(
                        action.payload.card
                    )}`
                );
                return oldState;
            }
            return {
                ...oldState,
                players: mapPlayers(
                    replaceKey(
                        player,
                        "staged",
                        filterCards(
                            hand.staged,
                            (c) => !cardsAreEqual(c, action.payload.card)
                        )
                    )
                ),
            };
        }
        case CLEAR_STAGED_CARDS: {
            return {
                ...oldState,
                players: mapPlayers(replaceKey(player, "staged", EmptyStack)),
            };
        }
        case PLAY_SINGLE_CARD: {
            // TODO: safety checks
            return {
                ...oldState,
                currentTrick: pushDoubleStack(oldState.currentTrick, {
                    cards: [action.payload.card],
                }),
                players: mapPlayers(
                    replaceKey(
                        player,
                        "inHand",
                        filterCards(
                            hand.inHand,
                            (c) => !cardsAreEqual(c, action.payload.card)
                        )
                    )
                ),
            };
        }
        case PLAY_STAGED_CARDS: {
            // TODO: safety checks

            const cardIsStaged = (card: Card): boolean =>
                cardBelongsTo(card, hand.staged);
            return {
                ...oldState,
                currentTrick: pushDoubleStack(
                    oldState.currentTrick,
                    hand.staged
                ),
                players: mapPlayers(
                    replaceKey(
                        player,
                        "inHand",
                        filterCards(hand.inHand, (c) => !cardIsStaged(c))
                    ),
                    replaceKey(player, "staged", EmptyStack)
                ),
            };
        }
        case RECLAIM_LAST_PLAY: {
            const trick = oldState.currentTrick;
            if (countDoubleStack(trick) === 0) {
                throw new Error("Attempted to reclaim a nonexistent play");
            }
            const [newTrick, backToHand] = popDoubleStack(trick);
            const newHand = sortCards(concatStacks(hand.inHand, backToHand));
            return {
                ...oldState,
                currentTrick: newTrick,
                players: mapPlayers(replaceKey(player, "inHand", newHand)),
            };
        }
        case TAKE_TRICK: {
            const newState: GameStatePlayPhase = {
                ...oldState,
                currentTrick: EmptyDoubleStack,
                players: mapPlayers(
                    replaceKey(
                        player,
                        "tricksWon",
                        pushTripleStack(hand.tricksWon, oldState.currentTrick)
                    )
                ),
            };
            if (gameOver(newState.players)) {
                return upgradeToScorePhase(newState);
            }
            return newState;
        }
        case PUT_TRICK_BACK: {
            if (countDoubleStack(oldState.currentTrick) > 0) {
                throw new Error(
                    `Player ${player}, "${hand.profile.name}", attempted to put trick back when current was not empty`
                );
            }
            const [newTricksWon, newCurrentTrick] = popTripleStack(
                hand.tricksWon
            );
            return {
                ...oldState,
                currentTrick: newCurrentTrick,
                players: mapPlayers(
                    replaceKey(player, "tricksWon", newTricksWon)
                ),
            };
        }
    }
}
