import {
    dealCards,
    EmptyTripleStack,
    EmptyStack,
    sortCards,
    EmptyDoubleStack,
} from "./interfaces/cards";
import {
    PlayPhaseState,
    PlayPhaseTag,
    JoinPhaseState,
    PassPhaseState,
    ScorePhaseState,
    JoinPhaseTag,
    PassPhaseTag,
    ScorePhaseTag,
    DealPhaseState,
    DealPhaseTag,
} from "./interfaces/game/state/state";
import { PlayerPosition } from "./interfaces/game/player/position";
import {
    PendingPlayer,
    PassPhasePlayer,
    PlayPhasePlayer,
    ScorePhasePlayer,
    DealPhasePlayer,
} from "./interfaces/game/playerstate";
import { PlayerProfile, PlayerIndex } from "./interfaces/game/player/player";

const cardsDealt = dealCards();

const makePlayerProfile = (i: PlayerIndex): PlayerProfile => ({
    name: ["Alphonzo", "Braden", "Charlie", "Dennis"][i],
    position: (["North", "South", "East", "West"] as PlayerPosition[])[i],
});

const makePlayerJoinPhase = (i: PlayerIndex): PendingPlayer => ({
    ...makePlayerProfile(i),
    ready: false,
});

const makePlayerDealPhase = (i: PlayerIndex): DealPhasePlayer => ({
    profile: makePlayerProfile(i),
    firstDeal: { cards: cardsDealt[i].cards.slice(0, 8) },
    secondDeal: { cards: cardsDealt[i].cards.slice(8, 14) },
    tookSecondDeal: false,
});

const makePlayerPassPhase = (i: PlayerIndex): PassPhasePlayer => ({
    profile: makePlayerProfile(i),
    inHand: cardsDealt[i],
    give: {
        leftOpponent: cardsDealt[i].cards[0],
        partner: null,
        rightOpponent: cardsDealt[i].cards[1],
    },
    ready: false,
});

const makePlayerPlayPhase = (i: PlayerIndex): PlayPhasePlayer => ({
    profile: makePlayerProfile(i),
    inHand: sortCards(cardsDealt[i]),
    tricksWon: EmptyTripleStack,
    staged: EmptyStack,
});
const makePlayerScorePhase = (i: PlayerIndex): ScorePhasePlayer => ({
    profile: makePlayerProfile(i),
    cards: cardsDealt[i],
    readyToPlayAgain: false,
});

export const mockJoinPhaseState: JoinPhaseState = {
    phase: JoinPhaseTag,
    players: [
        makePlayerJoinPhase(0),
        makePlayerJoinPhase(1),
        makePlayerJoinPhase(2),
        makePlayerJoinPhase(3),
    ],
};

export const mockDealPhaseState: DealPhaseState = {
    phase: DealPhaseTag,
    players: [
        makePlayerDealPhase(0),
        makePlayerDealPhase(1),
        makePlayerDealPhase(2),
        makePlayerDealPhase(3),
    ],
};

export const mockPassPhaseState: PassPhaseState = {
    phase: PassPhaseTag,
    players: [
        makePlayerPassPhase(0),
        makePlayerPassPhase(1),
        makePlayerPassPhase(2),
        makePlayerPassPhase(3),
    ],
};

export const mockPlayPhaseState: PlayPhaseState = {
    phase: PlayPhaseTag,
    currentTrick: EmptyDoubleStack,
    players: [
        makePlayerPlayPhase(0),
        makePlayerPlayPhase(1),
        makePlayerPlayPhase(2),
        makePlayerPlayPhase(3),
    ],
};

export const mockScorePhaseState: ScorePhaseState = {
    phase: ScorePhaseTag,
    players: [
        makePlayerScorePhase(0),
        makePlayerScorePhase(1),
        makePlayerScorePhase(2),
        makePlayerScorePhase(3),
    ],
};
