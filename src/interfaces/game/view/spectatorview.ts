import {
    JoinPhaseTag,
    PassPhaseTag,
    PlayPhaseTag,
    ScorePhaseTag,
    JoinPhaseState,
    PassPhaseState,
    PlayPhaseState,
    ScorePhaseState,
    GameState,
    DealPhaseState,
    DealPhaseTag,
} from "../state/state";
import {
    PlayPhasePlayerView,
    PassPhasePlayerView,
    viewPassPhasePlayer,
    viewPlayPhasePlayer,
    DealPhasePlayerView,
    viewDealPhasePlayer,
    DefinitelyConnected,
} from "./stateview";
import { CardDoubleStack } from "../../cards";
import { PendingPlayer, ScorePhasePlayer } from "../playerstate";
import {
    AllPlayers,
    SeatedPlayers,
    allPlayersToSeatedPlayers,
    PlayerProfile,
    mapAllPlayers,
} from "../player/player";
import { countNonNull } from "../../../util";

export const SpectatorViewTag = "SpectatorView";
export type SpectatorViewTag = typeof SpectatorViewTag;

export interface JoinPhaseSpectatorView {
    readonly view: SpectatorViewTag;
    readonly phase: JoinPhaseTag;
    readonly numPlayers: number;
    readonly players: AllPlayers<PendingPlayer>;
}

export interface DealPhaseSpectatorView {
    readonly view: SpectatorViewTag;
    readonly phase: DealPhaseTag;
    readonly players: SeatedPlayers<DealPhasePlayerView>;
}

export interface PassPhaseSpectatorView {
    readonly view: SpectatorViewTag;
    readonly phase: PassPhaseTag;
    readonly players: SeatedPlayers<PassPhasePlayerView>;
}

export interface PlayPhaseSpectatorView {
    readonly view: SpectatorViewTag;
    readonly phase: PlayPhaseTag;
    readonly currentTrick: CardDoubleStack;
    readonly players: SeatedPlayers<PlayPhasePlayerView>;
    readonly playerMapping: AllPlayers<DefinitelyConnected<PlayerProfile>>;
}

export interface ScorePhaseSpectatorView {
    readonly view: SpectatorViewTag;
    readonly phase: ScorePhaseTag;
    readonly players: SeatedPlayers<ScorePhasePlayer>;
}

export type GameStateSpectatorView =
    | JoinPhaseSpectatorView
    | DealPhaseSpectatorView
    | PassPhaseSpectatorView
    | PlayPhaseSpectatorView
    | ScorePhaseSpectatorView;

export function spectateJoinPhase(
    state: JoinPhaseState
): JoinPhaseSpectatorView {
    return {
        view: SpectatorViewTag,
        phase: JoinPhaseTag,
        numPlayers: countNonNull(state.players),
        players: state.players,
    };
}

export function spectateDealPhase(
    state: DealPhaseState
): DealPhaseSpectatorView {
    return {
        view: SpectatorViewTag,
        phase: DealPhaseTag,
        players: allPlayersToSeatedPlayers(state.players, viewDealPhasePlayer),
    };
}

export function spectatePassPhase(
    state: PassPhaseState
): PassPhaseSpectatorView {
    return {
        view: SpectatorViewTag,
        phase: PassPhaseTag,
        players: allPlayersToSeatedPlayers(state.players, viewPassPhasePlayer),
    };
}

export function spectatePlayPhase(
    state: PlayPhaseState
): PlayPhaseSpectatorView {
    return {
        view: SpectatorViewTag,
        phase: PlayPhaseTag,
        players: allPlayersToSeatedPlayers(state.players, viewPlayPhasePlayer),
        currentTrick: state.currentTrick,
        playerMapping: mapAllPlayers(state.players, (p) => ({
            name: p.profile.name,
            position: p.profile.position,
        })),
    };
}

export function spectateScorePhase(
    state: ScorePhaseState
): ScorePhaseSpectatorView {
    return {
        view: SpectatorViewTag,
        phase: ScorePhaseTag,
        players: allPlayersToSeatedPlayers(state.players, (x) => x),
    };
}

export function spectateGameState(state: GameState): GameStateSpectatorView {
    switch (state.phase) {
        case JoinPhaseTag:
            return spectateJoinPhase(state);
        case DealPhaseTag:
            return spectateDealPhase(state);
        case PassPhaseTag:
            return spectatePassPhase(state);
        case PlayPhaseTag:
            return spectatePlayPhase(state);
        case ScorePhaseTag:
            return spectateScorePhase(state);
    }
}
