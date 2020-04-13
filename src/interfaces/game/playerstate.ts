import { CardStack, Card, CardTripleStack } from "../cards";
import { PlayerProfile, OtherPlayers } from "./player/player";

export type UndecidedPlayer = Partial<PlayerProfile> & {
    readonly ready: boolean;
};

export type PendingPlayer = UndecidedPlayer | null;

export interface DealPhasePlayer {
    readonly profile: PlayerProfile;
    readonly firstDeal: CardStack;
    readonly secondDeal: CardStack;
    readonly tookSecondDeal: boolean;
}

export interface PassPhasePlayer {
    readonly profile: PlayerProfile;
    readonly inHand: CardStack;
    readonly give: OtherPlayers<Card | null>;
    readonly ready: boolean;
}

export interface PlayPhasePlayer {
    readonly profile: PlayerProfile;
    readonly inHand: CardStack;
    readonly staged: CardStack;
    readonly tricksWon: CardTripleStack;
}

export interface ScorePhasePlayer {
    readonly profile: PlayerProfile;
    readonly cards: CardStack;
    readonly readyToPlayAgain: boolean;
}
