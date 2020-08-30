import {
    JoinPhaseState,
    PassPhaseState,
    PassPhaseTag,
    PlayPhaseState,
    PlayPhaseTag,
    ScorePhaseState,
    ScorePhaseTag,
    JoinPhaseTag,
    DealPhaseState,
    DealPhaseTag,
} from "../state/state";
import {
    dealCards,
    sortCards,
    Card,
    cardsAreEqual,
    filterCards,
    pushStack,
    deckIsValid,
    flattenDoubleStack,
    EmptyTripleStack,
    EmptyStack,
    EmptyDoubleStack,
    concatStacks,
    flattenTripleStack,
    countStack,
} from "../../cards";
import {
    PendingPlayer,
    PassPhasePlayer,
    PlayPhasePlayer,
    ScorePhasePlayer,
    DealPhasePlayer,
} from "../playerstate";
import { PlayerIndex, mapAllPlayers } from "../player/player";
import { leftOpponentOf, partnerOf, rightOpponentOf } from "../player/position";

export function upgradeToDealPhase(state: JoinPhaseState): DealPhaseState {
    const cards = dealCards();

    const upgradePlayer = (
        p: PendingPlayer,
        i: PlayerIndex
    ): DealPhasePlayer => {
        if (p === null) {
            throw new Error("Player was unexpectedly null");
        }
        if (
            p.name === undefined ||
            p.position === undefined ||
            p.ready === false
        ) {
            throw new Error(`Player was not ready: ${JSON.stringify(p)}`);
        }
        const deal = cards[i];
        if (countStack(deal) != 14) {
            throw new Error("Incorrect number of cards dealt");
        }
        const firstDeal = sortCards({
            cards: deal.cards.slice(0, 8),
        });
        const secondDeal = sortCards({ cards: deal.cards.slice(8, 14) });
        return {
            profile: {
                name: p.name,
                position: p.position,
            },
            connected: true,
            firstDeal,
            secondDeal,
            tookSecondDeal: false,
        };
    };

    const pp = state.players;

    return {
        phase: DealPhaseTag,
        players: mapAllPlayers(pp, upgradePlayer),
    };
}

export function upgradeToPassPhase(state: DealPhaseState): PassPhaseState {
    const upgradePlayer = (
        p: DealPhasePlayer,
        i: PlayerIndex
    ): PassPhasePlayer => {
        if (!p.tookSecondDeal) {
            throw new Error(
                `Player ${i}, "${p.profile.name}", has not taken their second deal`
            );
        }
        return {
            profile: p.profile,
            connected: p.connected,
            inHand: sortCards(concatStacks(p.firstDeal, p.secondDeal)),
            give: {
                leftOpponent: null,
                partner: null,
                rightOpponent: null,
            },
            ready: false,
        };
    };

    const pp = state.players;

    return {
        phase: PassPhaseTag,
        players: mapAllPlayers(pp, upgradePlayer),
    };
}

export function upgradeToPlayPhase(state: PassPhaseState): PlayPhaseState {
    const p = state.players;

    if (
        !p.every((pp) => {
            const g = pp.give;
            return (
                g.leftOpponent !== null &&
                g.partner !== null &&
                g.rightOpponent !== null
            );
        })
    ) {
        throw new Error(
            "Attempted to pass cards, but not every player has chosen their cards"
        );
    }
    const removeOwnCardsBeingPassed = (i: PlayerIndex) => {
        const g = p[i].give;
        const notBeingPassed = (c: Card) =>
            !cardsAreEqual(c, g.leftOpponent!) &&
            !cardsAreEqual(c, g.partner!) &&
            !cardsAreEqual(c, g.rightOpponent!);
        return filterCards(p[i].inHand, notBeingPassed);
    };

    let playerHands = [
        removeOwnCardsBeingPassed(0),
        removeOwnCardsBeingPassed(1),
        removeOwnCardsBeingPassed(2),
        removeOwnCardsBeingPassed(3),
    ];

    const profiles = state.players.map((p) => p.profile);

    const passCardsAwayFor = (i: PlayerIndex) => {
        const lpos = leftOpponentOf(i, profiles);
        const ppos = partnerOf(i, profiles);
        const rpos = rightOpponentOf(i, profiles);
        const give = p[i].give;
        playerHands[lpos] = pushStack(playerHands[lpos], give.leftOpponent!);
        playerHands[ppos] = pushStack(playerHands[ppos], give.partner!);
        playerHands[rpos] = pushStack(playerHands[rpos], give.rightOpponent!);
    };

    passCardsAwayFor(0);
    passCardsAwayFor(1);
    passCardsAwayFor(2);
    passCardsAwayFor(3);

    if (!deckIsValid(flattenDoubleStack({ stacks: playerHands }))) {
        throw new Error("Something went wrong while passing cards.");
    }

    const upgradePlayer = (i: PlayerIndex): PlayPhasePlayer => {
        const player = state.players[i];
        const newHand = sortCards(playerHands[i]);
        return {
            profile: player.profile,
            connected: player.connected,
            inHand: newHand,
            tricksWon: EmptyTripleStack,
            staged: EmptyStack,
        };
    };

    return {
        phase: PlayPhaseTag,
        currentTrick: EmptyDoubleStack,
        players: [
            upgradePlayer(0),
            upgradePlayer(1),
            upgradePlayer(2),
            upgradePlayer(3),
        ],
    };
}

export function upgradeToScorePhase(state: PlayPhaseState): ScorePhaseState {
    const upgradePlayer = (i: PlayerIndex): ScorePhasePlayer => {
        const player = state.players[i];
        return {
            profile: player.profile,
            connected: player.connected,
            cards: concatStacks(
                flattenTripleStack(player.tricksWon),
                player.inHand
            ),
            readyToPlayAgain: false,
        };
    };

    return {
        phase: ScorePhaseTag,
        players: [
            upgradePlayer(0),
            upgradePlayer(1),
            upgradePlayer(2),
            upgradePlayer(3),
        ],
    };
}

export function goBackToDealPhase(state: ScorePhaseState): DealPhaseState {
    const makePlayer = (i: PlayerIndex): PendingPlayer => {
        const p = state.players[i];
        return {
            name: p.profile.name,
            position: p.profile.position,
            ready: true,
        };
    };
    const joinState: JoinPhaseState = {
        phase: JoinPhaseTag,
        players: [makePlayer(0), makePlayer(1), makePlayer(2), makePlayer(3)],
    };
    return upgradeToDealPhase(joinState);
}
