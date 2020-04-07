import {
    JoinPhase,
    PendingPlayer,
    PassPhase,
    PlayerHandPassPhase,
    PlayPhase,
    PlayerHandPlayPhase,
    GameStateJoinPhase,
    PlayerIndex,
    PlayerProfile,
    GameStatePassPhase,
    GameStatePlayPhase,
    GameState,
    GamePhase,
    AllPlayerIndices,
    ScorePhase,
    GameStateScorePhase,
    PlayerHandScorePhase,
} from "./state";
import { CardDoubleStack, countStack, countTripleStack } from "../cards";
import {
    LeftPosition,
    OppositePosition,
    RightPosition,
    PlayerPosition,
    PlayerPositionMapping,
} from "./position";
import {
    getProperty,
    getPropertyOr,
    validatePlayerProfile,
    getCardStack,
    getNullableCard,
    getCardDoubleStack,
    getCardTripleStack,
    validatePlayerIndex,
    validatePlayerPosition,
} from "../parsehelpers";

export interface GameStateJoinPhaseView {
    readonly phase: JoinPhase;
    readonly yourName: string | null;
    readonly yourPosition: PlayerPosition | null;
    readonly youAreReady: boolean;
    readonly north: PendingPlayer;
    readonly south: PendingPlayer;
    readonly east: PendingPlayer;
    readonly west: PendingPlayer;
}

export interface PlayerHandPassPhaseView {
    readonly profile: PlayerProfile;
    readonly give: {
        readonly leftOpponent: boolean;
        readonly partner: boolean;
        readonly rightOpponent: boolean;
    };
    readonly ready: boolean;
}

export interface GameStatePassPhaseView {
    readonly phase: PassPhase;
    readonly yourHand: PlayerHandPassPhase;
    readonly leftOpponent: PlayerHandPassPhaseView;
    readonly partner: PlayerHandPassPhaseView;
    readonly rightOpponent: PlayerHandPassPhaseView;
}

export interface PlayerHandPlayPhaseView {
    readonly profile: PlayerProfile;
    readonly cardsInHand: number;
    readonly cardsStaged: number;
    readonly cardsWon: number;
}

export interface GameStatePlayPhaseView {
    readonly phase: PlayPhase;
    readonly currentTrick: CardDoubleStack;
    readonly yourHand: PlayerHandPlayPhase;
    readonly leftOpponent: PlayerHandPlayPhaseView;
    readonly partner: PlayerHandPlayPhaseView;
    readonly rightOpponent: PlayerHandPlayPhaseView;
}

export interface GameStateScorePhaseView {
    readonly phase: ScorePhase;
    readonly yourHand: PlayerHandScorePhase;
    readonly leftOpponent: PlayerHandScorePhase;
    readonly partner: PlayerHandScorePhase;
    readonly rightOpponent: PlayerHandScorePhase;
}

export type GameStateView =
    | GameStateJoinPhaseView
    | GameStatePassPhaseView
    | GameStatePlayPhaseView
    | GameStateScorePhaseView;

export const DefaultGameStateView: GameStateJoinPhaseView = {
    phase: JoinPhase,
    yourName: null,
    yourPosition: null,
    youAreReady: false,
    north: null,
    south: null,
    east: null,
    west: null,
};

const mapPosition = (
    player: PlayerIndex,
    allPlayers: PlayerProfile[],
    mapping: PlayerPositionMapping
): PlayerIndex => {
    const x = mapping[allPlayers[player].position];
    const pi = allPlayers.findIndex((p) => p.position == x);
    return validatePlayerIndex(pi);
};

export const leftOpponentOf = (
    player: PlayerIndex,
    allPlayers: PlayerProfile[]
) => mapPosition(player, allPlayers, LeftPosition);

export const partnerOf = (player: PlayerIndex, allPlayers: PlayerProfile[]) =>
    mapPosition(player, allPlayers, OppositePosition);

export const rightOpponentOf = (
    player: PlayerIndex,
    allPlayers: PlayerProfile[]
) => mapPosition(player, allPlayers, RightPosition);

function findJoinPlayer(
    pos: PlayerPosition,
    players: GameStateJoinPhase["players"]
): PendingPlayer {
    for (const p of players) {
        if (p && p.position === pos) {
            return p;
        }
    }
    return null;
}
export function findPlayerWithPosition(
    pos: PlayerPosition,
    players: PlayerProfile[]
): PlayerIndex {
    for (let i of AllPlayerIndices) {
        const p = players[i];
        if (p.position === pos) {
            return i;
        }
    }
    throw new Error("Failed to find player position");
}

export function viewJoinPhase(
    state: GameStateJoinPhase,
    you: PlayerIndex
): GameStateJoinPhaseView {
    const players = state.players;
    return {
        phase: JoinPhase,
        yourName: players[you]?.name || null,
        yourPosition: players[you]?.position || null,
        youAreReady: players[you]?.ready || false,
        north: findJoinPlayer("North", players),
        south: findJoinPlayer("South", players),
        east: findJoinPlayer("East", players),
        west: findJoinPlayer("West", players),
    };
}

export function viewPassPhase(
    state: GameStatePassPhase,
    you: PlayerIndex
): GameStatePassPhaseView {
    const hands = state.players;
    const profiles = state.players.map((p) => p.profile);

    const viewHandOf = (whom: PlayerIndex): PlayerHandPassPhaseView => {
        const hand = hands[whom];
        return {
            profile: validatePlayerProfile(hand.profile),
            give: {
                leftOpponent: hand.give.leftOpponent !== null,
                partner: hand.give.partner !== null,
                rightOpponent: hand.give.rightOpponent !== null,
            },
            ready: hand.ready,
        };
    };

    return {
        phase: PassPhase,
        yourHand: hands[you],
        leftOpponent: viewHandOf(leftOpponentOf(you, profiles)),
        partner: viewHandOf(partnerOf(you, profiles)),
        rightOpponent: viewHandOf(rightOpponentOf(you, profiles)),
    };
}

export function viewPlayPhase(
    state: GameStatePlayPhase,
    you: PlayerIndex
): GameStatePlayPhaseView {
    const hands = state.players;
    const profiles = hands.map((h) => h.profile);

    const viewHandOf = (whom: PlayerIndex): PlayerHandPlayPhaseView => {
        const hand = hands[whom];
        return {
            profile: hand.profile,
            cardsInHand: countStack(hand.inHand),
            cardsStaged: countStack(hand.staged),
            cardsWon: countTripleStack(hand.tricksWon),
        };
    };

    return {
        phase: PlayPhase,
        currentTrick: state.currentTrick,
        yourHand: hands[you],
        leftOpponent: viewHandOf(leftOpponentOf(you, profiles)),
        partner: viewHandOf(partnerOf(you, profiles)),
        rightOpponent: viewHandOf(rightOpponentOf(you, profiles)),
    };
}

export function viewScorePhase(
    state: GameStateScorePhase,
    you: PlayerIndex
): GameStateScorePhaseView {
    const hands = state.players;
    const profiles = hands.map((h) => h.profile);

    return {
        phase: ScorePhase,
        yourHand: hands[you],
        leftOpponent: hands[leftOpponentOf(you, profiles)],
        partner: hands[partnerOf(you, profiles)],
        rightOpponent: hands[rightOpponentOf(you, profiles)],
    };
}

export function viewGameState(
    state: GameState,
    you: PlayerIndex
): GameStateView {
    switch (state.phase) {
        case JoinPhase:
            return viewJoinPhase(state, you);
        case PassPhase:
            return viewPassPhase(state, you);
        case PlayPhase:
            return viewPlayPhase(state, you);
        case ScorePhase:
            return viewScorePhase(state, you);
    }
}

export function parseJoinPhaseStateView(obj: object): GameStateJoinPhaseView {
    const parsePlayer = (p: any): PendingPlayer => {
        if (p === null) {
            return null;
        } else if (typeof p === "object") {
            const pp = p as Exclude<PendingPlayer, null>;
            const pos = getPropertyOr(pp, "position", "string", undefined);
            return {
                name: getPropertyOr(pp, "name", "string", undefined),
                ready: getProperty(pp, "ready", "boolean"),
                position: pos === undefined ? pos : validatePlayerPosition(pos),
            };
        } else {
            throw new Error("Invalid pending player");
        }
    };

    const o = obj as GameStateJoinPhaseView;
    if (getProperty(o, "phase", "string") !== JoinPhase) {
        throw new Error("Incorrect state view phase");
    }

    return {
        phase: JoinPhase,
        yourName:
            o.yourName === null ? null : getProperty(o, "yourName", "string"),
        yourPosition:
            o.yourPosition === null
                ? null
                : validatePlayerPosition(o.yourPosition),
        youAreReady: getProperty(o, "youAreReady", "boolean"),
        north: parsePlayer(o.north),
        south: parsePlayer(o.south),
        east: parsePlayer(o.east),
        west: parsePlayer(o.west),
    };
}

export function parsePassPhaseStateView(obj: object): GameStatePassPhaseView {
    const parseHandView = (h: object): PlayerHandPassPhaseView => {
        const hh = h as PlayerHandPassPhaseView;
        const g = getProperty(
            hh,
            "give",
            "object"
        ) as PlayerHandPassPhaseView["give"];
        return {
            profile: validatePlayerProfile(hh.profile),
            give: {
                leftOpponent: getProperty(g, "leftOpponent", "boolean"),
                partner: getProperty(g, "partner", "boolean"),
                rightOpponent: getProperty(g, "rightOpponent", "boolean"),
            },
            ready: getProperty(hh, "ready", "boolean"),
        };
    };

    const sv = obj as GameStatePassPhaseView;
    if (getProperty(sv, "phase", "string") !== PassPhase) {
        throw new Error("Incorrect state view phase");
    }

    const yh = getProperty(sv, "yourHand", "object") as PlayerHandPassPhase;

    const yhg = getProperty(
        yh,
        "give",
        "object"
    ) as PlayerHandPassPhase["give"];

    return {
        phase: PassPhase,
        yourHand: {
            profile: validatePlayerProfile(yh.profile),
            inHand: getCardStack(yh, "inHand"),
            give: {
                leftOpponent: getNullableCard(yhg, "leftOpponent"),
                partner: getNullableCard(yhg, "partner"),
                rightOpponent: getNullableCard(yhg, "rightOpponent"),
            },
            ready: getProperty(yh, "ready", "boolean"),
        },
        leftOpponent: parseHandView(getProperty(sv, "leftOpponent", "object")),
        partner: parseHandView(getProperty(sv, "partner", "object")),
        rightOpponent: parseHandView(
            getProperty(sv, "rightOpponent", "object")
        ),
    };
}

export function parsePlayPhaseStateView(obj: object): GameStatePlayPhaseView {
    const parseHandView = (h: object): PlayerHandPlayPhaseView => {
        const hh = h as PlayerHandPlayPhaseView;
        return {
            profile: validatePlayerProfile(hh.profile),
            cardsInHand: getProperty(hh, "cardsInHand", "number"),
            cardsStaged: getProperty(hh, "cardsStaged", "number"),
            cardsWon: getProperty(hh, "cardsWon", "number"),
        };
    };

    const sv = obj as GameStatePlayPhaseView;
    if (getProperty(sv, "phase", "string") !== PlayPhase) {
        throw new Error("Incorrect state view phase");
    }
    const yh = getProperty(sv, "yourHand", "object") as PlayerHandPlayPhase;

    return {
        phase: PlayPhase,
        currentTrick: getCardDoubleStack(sv, "currentTrick"),
        yourHand: {
            profile: validatePlayerProfile(yh.profile),
            inHand: getCardStack(yh, "inHand"),
            staged: getCardStack(yh, "staged"),
            tricksWon: getCardTripleStack(yh, "tricksWon"),
        },
        leftOpponent: parseHandView(getProperty(sv, "leftOpponent", "object")),
        partner: parseHandView(getProperty(sv, "partner", "object")),
        rightOpponent: parseHandView(
            getProperty(sv, "rightOpponent", "object")
        ),
    };
}

export function parseScorePhaseStateView(obj: object): GameStateScorePhaseView {
    const parseHandView = (h: object): PlayerHandScorePhase => {
        const hh = h as PlayerHandScorePhase;
        return {
            profile: validatePlayerProfile(hh.profile),
            cards: getCardStack(hh, "cards"),
            readyToPlayAgain: getProperty(hh, "readyToPlayAgain", "boolean"),
        };
    };

    const sv = obj as GameStateScorePhaseView;
    if (getProperty(sv, "phase", "string") !== ScorePhase) {
        throw new Error("Incorrect state view phase");
    }

    return {
        phase: ScorePhase,
        yourHand: parseHandView(getProperty(sv, "yourHand", "object")),
        leftOpponent: parseHandView(getProperty(sv, "leftOpponent", "object")),
        partner: parseHandView(getProperty(sv, "partner", "object")),
        rightOpponent: parseHandView(
            getProperty(sv, "rightOpponent", "object")
        ),
    };
}

export function parseStateView(obj: object): GameStateView {
    const sv = ((): GameStateView => {
        const phase = getProperty(obj as GameStateView, "phase", "string");
        switch (phase as GamePhase) {
            case JoinPhase:
                return parseJoinPhaseStateView(obj);
            case PassPhase:
                return parsePassPhaseStateView(obj);
            case PlayPhase:
                return parsePlayPhaseStateView(obj);
            case ScorePhase:
                return parseScorePhaseStateView(obj);
        }
    })();
    if (sv === undefined) {
        throw new Error("Invalid state view");
    }
    return sv;
}
