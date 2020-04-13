import {
    Card,
    CardDoubleStack,
    CardStack,
    EmptyStack,
    flattenTripleStack,
    concatStacks,
    flattenDoubleStack,
} from "../../cards";
import {
    PendingPlayer,
    PassPhasePlayer,
    PlayPhasePlayer,
    ScorePhasePlayer,
    DealPhasePlayer,
} from "../playerstate";
import { AllPlayers } from "../player/player";

export const JoinPhaseTag = "Join";
export type JoinPhaseTag = typeof JoinPhaseTag;

export interface JoinPhaseState {
    readonly phase: JoinPhaseTag;
    readonly players: AllPlayers<PendingPlayer>;
}

export const DealPhaseTag = "Deal";
export type DealPhaseTag = typeof DealPhaseTag;

export interface DealPhaseState {
    readonly phase: DealPhaseTag;
    readonly players: AllPlayers<DealPhasePlayer>;
}

export const PassPhaseTag = "Pass";
export type PassPhaseTag = typeof PassPhaseTag;

export interface PassPhaseState {
    readonly phase: PassPhaseTag;
    readonly players: AllPlayers<PassPhasePlayer>;
}

export const PlayPhaseTag = "Play";
export type PlayPhaseTag = typeof PlayPhaseTag;

export interface PlayPhaseState {
    readonly phase: PlayPhaseTag;
    readonly currentTrick: CardDoubleStack;
    readonly players: AllPlayers<PlayPhasePlayer>;
}

export const ScorePhaseTag = "Score";
export type ScorePhaseTag = typeof ScorePhaseTag;

export interface ScorePhaseState {
    readonly phase: ScorePhaseTag;
    readonly players: AllPlayers<ScorePhasePlayer>;
}

export type GameState =
    | JoinPhaseState
    | DealPhaseState
    | PassPhaseState
    | PlayPhaseState
    | ScorePhaseState;

export type GamePhase = GameState["phase"];
export const AllGamePhases: GamePhase[] = [
    JoinPhaseTag,
    DealPhaseTag,
    PassPhaseTag,
    PlayPhaseTag,
    ScorePhaseTag,
];

export type AllPlayersType<S extends GameState> = S["players"];

export type PlayerType<S extends GameState> = AllPlayersType<S>[0];

export const DefaultGameState: JoinPhaseState = {
    phase: JoinPhaseTag,
    players: [null, null, null, null],
};

export function allCardsDealPhase(state: DealPhaseState): CardStack {
    return {
        cards: state.players.reduce(
            (arr, p) =>
                arr.concat(p.firstDeal.cards).concat(p.secondDeal.cards),
            [] as Card[]
        ),
    };
}

export function allCardsPassPhase(state: PassPhaseState): CardStack {
    return {
        cards: state.players.reduce(
            (arr, p) => arr.concat(p.inHand.cards),
            [] as Card[]
        ),
    };
}

export function allCardsPlayPhase(state: PlayPhaseState): CardStack {
    const getPlayerCards = (p: PlayPhasePlayer): CardStack =>
        concatStacks(p.inHand, flattenTripleStack(p.tricksWon));
    return state.players.reduce(
        (acc, p) => concatStacks(acc, getPlayerCards(p)),
        flattenDoubleStack(state.currentTrick)
    );
}

export function allCardsScorePhase(state: ScorePhaseState): CardStack {
    return state.players.reduce(
        (acc, p) => concatStacks(acc, p.cards),
        EmptyStack
    );
}

type GameStateWithCards = Exclude<GameState, JoinPhaseState>;

export function allCardsInPlay(state: GameStateWithCards): CardStack {
    switch (state.phase) {
        case DealPhaseTag:
            return allCardsDealPhase(state);
        case PassPhaseTag:
            return allCardsPassPhase(state);
        case PlayPhaseTag:
            return allCardsPlayPhase(state);
        case ScorePhaseTag:
            return allCardsScorePhase(state);
    }
}
