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
export type takeTrickAction = ReturnType<typeof takeTrickAction>;

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
    | takeTrickAction;

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
        }
    })();
    if (a === undefined) {
        throw new Error("Invalid action");
    }
    return a;
}

type PlayerMapFn = (
    pp: PlayerHandPlayPhase,
    i: PlayerIndex
) => PlayerHandPlayPhase;

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
    const mapPlayers = (
        ...fns: PlayerMapFn[]
    ): GameStatePlayPhase["players"] => {
        const f: PlayerMapFn = (pp, i) => {
            for (let fn of fns) {
                pp = fn(pp, i);
            }
            return pp;
        };
        const ps = oldState.players;
        return [f(ps[0], 0), f(ps[1], 1), f(ps[2], 2), f(ps[3], 3)];
    };

    const replace = <K extends keyof PlayerHandPlayPhase>(
        idx: PlayerIndex,
        key: K,
        newValue: PlayerHandPlayPhase[K]
    ): PlayerMapFn => {
        return (
            pp: PlayerHandPlayPhase,
            i: PlayerIndex
        ): PlayerHandPlayPhase => {
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
                    replace(
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
                    replace(
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
                players: mapPlayers(replace(player, "staged", EmptyStack)),
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
                    replace(
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
                    replace(
                        player,
                        "inHand",
                        filterCards(hand.inHand, (c) => !cardIsStaged(c))
                    ),
                    replace(player, "staged", EmptyStack)
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
            //const newTrick = trick.slice(0, trick.length - 1);
            // const newHand = hand.inHand.concat(trick[trick.length - 1]).sort(compareCards);
            return {
                ...oldState,
                currentTrick: newTrick,
                players: mapPlayers(replace(player, "inHand", newHand)),
            };
        }
        case TAKE_TRICK: {
            const newState: GameStatePlayPhase = {
                ...oldState,
                currentTrick: EmptyDoubleStack,
                players: mapPlayers(
                    replace(
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
    }
}
