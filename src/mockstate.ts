import {
    dealCards,
    AllCards,
    EmptyTripleStack,
    EmptyStack,
    sortCards,
    EmptyDoubleStack,
} from "./interfaces/cards";
import {
    PlayerIndex,
    PlayerHandPlayPhase,
    GameStatePlayPhase,
    PlayPhase,
    PlayerProfile,
    GameStateJoinPhase,
    GameStatePassPhase,
    GameStateScorePhase,
    JoinPhase,
    PendingPlayer,
    PassPhase,
    PlayerHandPassPhase,
    PlayerHandScorePhase,
    ScorePhase,
} from "./interfaces/game/state";
import { PlayerPosition } from "./interfaces/game/position";

const cardsDealt = dealCards(AllCards);

const makePlayerProfile = (i: PlayerIndex): PlayerProfile => ({
    name: ["Alphonzo", "Braden", "Charlie", "Dennis"][i],
    position: (["North", "South", "East", "West"] as PlayerPosition[])[i],
});

const makePlayerJoinPhase = (i: PlayerIndex): PendingPlayer => ({
    ...makePlayerProfile(i),
    ready: false,
});

const makePlayerPassPhase = (i: PlayerIndex): PlayerHandPassPhase => ({
    profile: makePlayerProfile(i),
    inHand: cardsDealt[i],
    give: {
        leftOpponent: cardsDealt[i].cards[0],
        partner: null,
        rightOpponent: cardsDealt[i].cards[1],
    },
    ready: false,
});

const makePlayerPlayPhase = (i: PlayerIndex): PlayerHandPlayPhase => ({
    profile: makePlayerProfile(i),
    inHand: sortCards(cardsDealt[i]),
    tricksWon: EmptyTripleStack,
    staged: EmptyStack,
});
const makePlayerScorePhase = (i: PlayerIndex): PlayerHandScorePhase => ({
    profile: makePlayerProfile(i),
    cards: cardsDealt[i],
    readyToPlayAgain: false,
});

export const mockJoinPhaseState: GameStateJoinPhase = {
    phase: JoinPhase,
    players: [
        makePlayerJoinPhase(0),
        makePlayerJoinPhase(1),
        makePlayerJoinPhase(2),
        makePlayerJoinPhase(3),
    ],
};

export const mockPassPhaseState: GameStatePassPhase = {
    phase: PassPhase,
    players: [
        makePlayerPassPhase(0),
        makePlayerPassPhase(1),
        makePlayerPassPhase(2),
        makePlayerPassPhase(3),
    ],
};

export const mockPlayState: GameStatePlayPhase = {
    phase: PlayPhase,
    currentTrick: EmptyDoubleStack,
    players: [
        makePlayerPlayPhase(0),
        makePlayerPlayPhase(1),
        makePlayerPlayPhase(2),
        makePlayerPlayPhase(3),
    ],
};

export const mockScorePhaseState: GameStateScorePhase = {
    phase: ScorePhase,
    players: [
        makePlayerScorePhase(0),
        makePlayerScorePhase(1),
        makePlayerScorePhase(2),
        makePlayerScorePhase(3),
    ],
};
