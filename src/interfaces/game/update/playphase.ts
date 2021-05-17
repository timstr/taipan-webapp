import { PlayPhasePlayer } from "../playerstate";
import {
    countStack,
    cardBelongsTo,
    pushStack,
    filterCards,
    cardsAreEqual,
    EmptyStack,
    pushDoubleStack,
    allCardsBelongsTo,
    Card,
    countDoubleStack,
    popDoubleStack,
    sortCards,
    concatStacks,
    EmptyDoubleStack,
    pushTripleStack,
    popTripleStack,
} from "../../cards";
import { PlayPhaseState, GameState } from "../state/state";
import { findPlayerWithPosition } from "../player/position";
import { PlayerIndex } from "../player/player";
import {
    PlayPhaseAction,
    STAGE_CARD,
    UNSTAGE_CARD,
    CLEAR_STAGED_CARDS,
    PLAY_SINGLE_CARD,
    PLAY_STAGED_CARDS,
    RECLAIM_LAST_PLAY,
    TAKE_TRICK,
    PUT_TRICK_BACK,
} from "../actions/playphase";
import { mapGamePlayersFunction, replacePlayerKeyFunction } from "./helpers";
import { upgradeToScorePhase } from "./phasetransition";

const wentOut = (player: PlayPhasePlayer): boolean => {
    return countStack(player.inHand) === 0;
};

const gameOver = (players: PlayPhaseState["players"]): boolean => {
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
    oldState: PlayPhaseState,
    player: PlayerIndex,
    action: PlayPhaseAction
): GameState {
    const mapPlayers = mapGamePlayersFunction(oldState);
    const replaceKey = replacePlayerKeyFunction(oldState);

    const you = oldState.players[player];

    const thisGuy = () => `Player ${player}, "${you.profile.name}",`;

    switch (action.type) {
        case STAGE_CARD: {
            if (!cardBelongsTo(action.payload.card, you.inHand)) {
                console.error(
                    `${thisGuy()}" tried to stage a card they don't have: ${JSON.stringify(
                        action.payload.card
                    )}`
                );
                return oldState;
            }
            if (cardBelongsTo(action.payload.card, you.staged)) {
                console.error(
                    `${thisGuy()}" tried to stage a card they already staged: ${JSON.stringify(
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
                        pushStack(you.staged, action.payload.card)
                    )
                ),
            };
        }
        case UNSTAGE_CARD: {
            if (!cardBelongsTo(action.payload.card, you.staged)) {
                console.error(
                    `${thisGuy()}" tried to unstage a card that is not staged: ${JSON.stringify(
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
                            you.staged,
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
            if (!cardBelongsTo(action.payload.card, you.inHand)) {
                throw new Error(
                    `${thisGuy()} tried to play a single card that they don't own: ${JSON.stringify(
                        action.payload.card
                    )}`
                );
            }
            return {
                ...oldState,
                currentTrick: pushDoubleStack(oldState.currentTrick, {
                    cards: [action.payload.card],
                    player,
                }),
                players: mapPlayers(
                    replaceKey(
                        player,
                        "inHand",
                        filterCards(
                            you.inHand,
                            (c) => !cardsAreEqual(c, action.payload.card)
                        )
                    )
                ),
            };
        }
        case PLAY_STAGED_CARDS: {
            if (!allCardsBelongsTo(you.staged, you.inHand)) {
                throw new Error(
                    `${thisGuy()} tried to play staged cards that they don't own: ${JSON.stringify(
                        you.staged
                    )}`
                );
            }

            const cardIsStaged = (card: Card): boolean =>
                cardBelongsTo(card, you.staged);
            return {
                ...oldState,
                currentTrick: pushDoubleStack(oldState.currentTrick, {
                    cards: you.staged.cards,
                    player,
                }),
                players: mapPlayers(
                    replaceKey(
                        player,
                        "inHand",
                        filterCards(you.inHand, (c) => !cardIsStaged(c))
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
            const newHand = sortCards(concatStacks(you.inHand, backToHand));
            return {
                ...oldState,
                currentTrick: newTrick,
                players: mapPlayers(replaceKey(player, "inHand", newHand)),
            };
        }
        case TAKE_TRICK: {
            const newState: PlayPhaseState = {
                ...oldState,
                currentTrick: EmptyDoubleStack,
                players: mapPlayers(
                    replaceKey(
                        player,
                        "tricksWon",
                        pushTripleStack(you.tricksWon, oldState.currentTrick)
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
                    `Player ${player}, "${you.profile.name}", attempted to put trick back when current trick was not empty`
                );
            }
            const [newTricksWon, newCurrentTrick] = popTripleStack(
                you.tricksWon
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
