import {
    Card,
    dealCards,
    randomShuffle,
    AllCards,
    cardsAreEqual,
    validateDeck,
    CardTripleStack,
    CardDoubleStack,
    CardStack,
    sortCards,
    filterCards,
    pushStack,
    flattenDoubleStack,
    EmptyTripleStack,
    EmptyStack,
    EmptyDoubleStack,
    flattenTripleStack,
    concatStacks,
} from "../cards";
import { PlayerPosition, AllPlayerPositions } from "./position";
import { leftOpponentOf, partnerOf, rightOpponentOf } from "./stateview";

export type PlayerIndex = 0 | 1 | 2 | 3;
export const AllPlayerIndices: PlayerIndex[] = [0, 1, 2, 3];

export function validatePlayerIndex(idx: any) {
    if (typeof idx === "number") {
        const x = AllPlayerIndices.findIndex((i) => i === idx);
        if (x >= 0) {
            return AllPlayerIndices[x];
        }
    }
    throw new Error("Invalid player index");
}
export function validatePlayerPosition(pos: any) {
    if (typeof pos === "string") {
        const x = AllPlayerPositions.findIndex((p) => p === pos);
        if (x >= 0) {
            return AllPlayerPositions[x];
        }
    }
    throw new Error("Invalid player index");
}

export interface PlayerProfile {
    readonly name: string;
    readonly position: PlayerPosition;
}

export interface PlayerHandPassPhase {
    readonly profile: PlayerProfile;
    readonly inHand: CardStack;
    readonly give: {
        leftOpponent: Card | null;
        partner: Card | null;
        rightOpponent: Card | null;
    };
    readonly ready: boolean;
}

export interface PlayerHandPlayPhase {
    readonly profile: PlayerProfile;
    readonly inHand: CardStack;
    readonly staged: CardStack;
    readonly tricksWon: CardTripleStack;
}

export interface PlayerHandScorePhase {
    readonly profile: PlayerProfile;
    readonly cards: CardStack;
    readonly readyToPlayAgain: boolean;
}

export type UndecidedPlayer = Partial<PlayerProfile> & {
    readonly ready: boolean;
};

export type PendingPlayer = UndecidedPlayer | null;

export const JoinPhase = "Join";
export type JoinPhase = typeof JoinPhase;

export interface GameStateJoinPhase {
    readonly phase: JoinPhase;
    readonly players: [
        PendingPlayer,
        PendingPlayer,
        PendingPlayer,
        PendingPlayer
    ];
}

export const PassPhase = "Pass";
export type PassPhase = typeof PassPhase;

export interface GameStatePassPhase {
    readonly phase: PassPhase;
    readonly players: [
        PlayerHandPassPhase,
        PlayerHandPassPhase,
        PlayerHandPassPhase,
        PlayerHandPassPhase
    ];
}

export const PlayPhase = "Play";
export type PlayPhase = typeof PlayPhase;

export interface GameStatePlayPhase {
    readonly phase: PlayPhase;
    readonly currentTrick: CardDoubleStack;
    readonly players: [
        PlayerHandPlayPhase,
        PlayerHandPlayPhase,
        PlayerHandPlayPhase,
        PlayerHandPlayPhase
    ];
}

export const ScorePhase = "Score";
export type ScorePhase = typeof ScorePhase;

export interface GameStateScorePhase {
    readonly phase: ScorePhase;
    readonly players: [
        PlayerHandScorePhase,
        PlayerHandScorePhase,
        PlayerHandScorePhase,
        PlayerHandScorePhase
    ];
}

export type GameState =
    | GameStateJoinPhase
    | GameStatePassPhase
    | GameStatePlayPhase
    | GameStateScorePhase;

export type GamePhase = GameState["phase"];
export const AllGamePhases: GamePhase[] = [JoinPhase, PassPhase, PlayPhase];

export const DefaultGameState: GameStateJoinPhase = {
    phase: "Join",
    players: [null, null, null, null],
};

export function upgradeToPassPhase(
    state: GameStateJoinPhase
): GameStatePassPhase {
    const cards = dealCards(randomShuffle(AllCards));

    const upgradePlayer = (
        p: PendingPlayer,
        i: PlayerIndex
    ): PlayerHandPassPhase => {
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
        return {
            profile: {
                name: p.name,
                position: p.position,
            },
            inHand: sortCards(cards[i]),
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
        phase: PassPhase,
        players: [
            upgradePlayer(pp[0], 0),
            upgradePlayer(pp[1], 1),
            upgradePlayer(pp[2], 2),
            upgradePlayer(pp[3], 3),
        ],
    };
}

export function upgradeToPlayPhase(
    state: GameStatePassPhase
): GameStatePlayPhase {
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

    if (!validateDeck(flattenDoubleStack({ stacks: playerHands }))) {
        throw new Error("Something went wrong while passing cards.");
    }

    const upgradePlayer = (i: PlayerIndex): PlayerHandPlayPhase => {
        const player = state.players[i];
        const newHand = sortCards(playerHands[i]);
        return {
            profile: player.profile,
            inHand: newHand,
            tricksWon: EmptyTripleStack,
            staged: EmptyStack,
        };
    };

    return {
        phase: PlayPhase,
        currentTrick: EmptyDoubleStack,
        players: [
            upgradePlayer(0),
            upgradePlayer(1),
            upgradePlayer(2),
            upgradePlayer(3),
        ],
    };
}

export function upgradeToScorePhase(
    state: GameStatePlayPhase
): GameStateScorePhase {
    const upgradePlayer = (i: PlayerIndex): PlayerHandScorePhase => {
        const player = state.players[i];
        return {
            profile: player.profile,
            cards: concatStacks(
                flattenTripleStack(player.tricksWon),
                player.inHand
            ),
            readyToPlayAgain: false,
        };
    };

    return {
        phase: ScorePhase,
        players: [
            upgradePlayer(0),
            upgradePlayer(1),
            upgradePlayer(2),
            upgradePlayer(3),
        ],
    };
}

export function goBackToPassPhase(
    state: GameStateScorePhase
): GameStatePassPhase {
    const makePlayer = (i: PlayerIndex): PendingPlayer => {
        const p = state.players[i];
        return {
            name: p.profile.name,
            position: p.profile.position,
            ready: true,
        };
    };
    const joinState: GameStateJoinPhase = {
        phase: JoinPhase,
        players: [makePlayer(0), makePlayer(1), makePlayer(2), makePlayer(3)],
    };
    return upgradeToPassPhase(joinState);
}
