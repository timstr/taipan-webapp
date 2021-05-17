import {
    JoinPhaseTag,
    PassPhaseTag,
    PlayPhaseTag,
    JoinPhaseState,
    PassPhaseState,
    PlayPhaseState,
    GameState,
    ScorePhaseTag,
    ScorePhaseState,
    DealPhaseTag,
    DealPhaseState,
} from "../state/state";
import {
    CardDoubleStack,
    countStack,
    countTripleStack,
    CardStack,
    concatStacks,
    sortCards,
} from "../../cards";
import { PlayerPosition } from "../player/position";
import {
    PendingPlayer,
    PassPhasePlayer,
    PlayPhasePlayer,
    ScorePhasePlayer,
    DealPhasePlayer,
} from "../playerstate";
import {
    AllPlayers,
    PlayerProfile,
    OtherPlayers,
    mapOtherPlayers,
    allPlayersToOtherPlayers,
    PlayerIndex,
} from "../player/player";
import { countNonNull } from "../../../util";

export const PlayerViewTag = "PlayerView";
export type PlayerViewTag = typeof PlayerViewTag;

export interface JoinPhaseView {
    readonly view: PlayerViewTag;
    readonly phase: JoinPhaseTag;
    readonly yourName: string | null;
    readonly yourPosition: PlayerPosition | null;
    readonly youAreReady: boolean;
    readonly playersJoined: number;
    readonly players: AllPlayers<PendingPlayer>;
}

export interface PlayerView {
    readonly profile: PlayerProfile;
    readonly connected: boolean;
}

export interface DealPhasePlayerView extends PlayerView {
    readonly cardsInHand: number;
    readonly cardsNotTaken: number;
}

export interface DealPhaseView {
    readonly view: PlayerViewTag;
    readonly phase: DealPhaseTag;
    readonly you: PlayerProfile;
    readonly cardsRemaining: number;
    readonly yourHand: CardStack;
    readonly others: OtherPlayers<DealPhasePlayerView>;
}

export interface PassPhasePlayerView extends PlayerView {
    readonly give: OtherPlayers<boolean>;
    readonly cardsInHand: number;
    readonly ready: boolean;
}

export type DefinitelyConnected<T> = Omit<T, "connected">;

export interface PassPhaseView {
    readonly view: PlayerViewTag;
    readonly phase: PassPhaseTag;
    readonly you: DefinitelyConnected<PassPhasePlayer>;
    readonly others: OtherPlayers<PassPhasePlayerView>;
}

export interface PlayPhasePlayerView extends PlayerView {
    readonly cardsInHand: number;
    readonly cardsStaged: number;
    readonly cardsWon: number;
}

export interface PlayPhaseView {
    readonly view: PlayerViewTag;
    readonly phase: PlayPhaseTag;
    readonly currentTrick: CardDoubleStack;
    readonly you: DefinitelyConnected<PlayPhasePlayer>;
    readonly others: OtherPlayers<PlayPhasePlayerView>;
}

export interface ScorePhaseView {
    readonly view: PlayerViewTag;
    readonly phase: ScorePhaseTag;
    readonly you: DefinitelyConnected<ScorePhasePlayer>;
    readonly others: OtherPlayers<ScorePhasePlayer>;
}

export type GameStateView =
    | JoinPhaseView
    | DealPhaseView
    | PassPhaseView
    | PlayPhaseView
    | ScorePhaseView;

export const DefaultGameStateView: JoinPhaseView = {
    view: PlayerViewTag,
    phase: JoinPhaseTag,
    yourName: null,
    yourPosition: null,
    youAreReady: false,
    playersJoined: 1,
    players: [null, null, null, null],
};

export function viewPassPhasePlayer(
    player: PassPhasePlayer
): PassPhasePlayerView {
    const g = player.give;
    const nGiving =
        (g.leftOpponent ? 1 : 0) +
        (g.partner ? 1 : 0) +
        (g.rightOpponent ? 1 : 0);
    return {
        profile: player.profile,
        connected: player.connected,
        give: mapOtherPlayers(player.give, (c) => c !== null),
        cardsInHand: countStack(player.inHand) - nGiving,
        ready: player.ready,
    };
}

export function viewDealPhasePlayer(
    player: DealPhasePlayer
): DealPhasePlayerView {
    const n1 = countStack(player.firstDeal);
    const n2 = countStack(player.secondDeal);
    return {
        profile: player.profile,
        connected: player.connected,
        cardsInHand: player.tookSecondDeal ? n1 + n2 : n1,
        cardsNotTaken: player.tookSecondDeal ? 0 : n2,
    };
}

export function viewPlayPhasePlayer(
    player: PlayPhasePlayer
): PlayPhasePlayerView {
    return {
        profile: player.profile,
        connected: player.connected,
        cardsInHand: countStack(player.inHand),
        cardsStaged: countStack(player.staged),
        cardsWon: countTripleStack(player.tricksWon),
    };
}

export function viewJoinPhase(
    state: JoinPhaseState,
    you: PlayerIndex
): JoinPhaseView {
    const players = state.players;
    return {
        view: PlayerViewTag,
        phase: JoinPhaseTag,
        yourName: players[you]?.name || null,
        yourPosition: players[you]?.position || null,
        youAreReady: players[you]?.ready || false,
        playersJoined: countNonNull(players),
        players,
    };
}

export function viewDealPhase(
    state: DealPhaseState,
    you: PlayerIndex
): DealPhaseView {
    const pp = state.players;
    const yourHand = pp[you];
    const cards = yourHand.tookSecondDeal
        ? concatStacks(yourHand.firstDeal, yourHand.secondDeal)
        : yourHand.firstDeal;
    return {
        view: PlayerViewTag,
        phase: DealPhaseTag,
        you: yourHand.profile,
        yourHand: sortCards(cards),
        cardsRemaining: yourHand.tookSecondDeal
            ? 0
            : countStack(yourHand.secondDeal),
        others: allPlayersToOtherPlayers(pp, you, viewDealPhasePlayer),
    };
}

export function viewPassPhase(
    state: PassPhaseState,
    you: PlayerIndex
): PassPhaseView {
    const y = state.players[you];
    return {
        view: PlayerViewTag,
        phase: PassPhaseTag,
        you: {
            profile: y.profile,
            give: y.give,
            inHand: y.inHand,
            ready: y.ready,
        },
        others: allPlayersToOtherPlayers(
            state.players,
            you,
            viewPassPhasePlayer
        ),
    };
}

export function viewPlayPhase(
    state: PlayPhaseState,
    you: PlayerIndex
): PlayPhaseView {
    const y = state.players[you];
    return {
        view: PlayerViewTag,
        phase: PlayPhaseTag,
        currentTrick: state.currentTrick,
        you: {
            profile: y.profile,
            inHand: y.inHand,
            staged: y.staged,
            tricksWon: y.tricksWon,
        },
        others: allPlayersToOtherPlayers(
            state.players,
            you,
            viewPlayPhasePlayer
        ),
    };
}

export function viewScorePhase(
    state: ScorePhaseState,
    you: PlayerIndex
): ScorePhaseView {
    const y = state.players[you];
    return {
        view: PlayerViewTag,
        phase: ScorePhaseTag,
        you: {
            profile: y.profile,
            cards: y.cards,
            readyToPlayAgain: y.readyToPlayAgain,
        },
        others: allPlayersToOtherPlayers(state.players, you, (x) => x),
    };
}

export function viewGameState(
    state: GameState,
    you: PlayerIndex
): GameStateView {
    switch (state.phase) {
        case JoinPhaseTag:
            return viewJoinPhase(state, you);
        case DealPhaseTag:
            return viewDealPhase(state, you);
        case PassPhaseTag:
            return viewPassPhase(state, you);
        case PlayPhaseTag:
            return viewPlayPhase(state, you);
        case ScorePhaseTag:
            return viewScorePhase(state, you);
    }
}
