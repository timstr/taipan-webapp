import { CardStack, Card, CardTripleStack } from "../cards";
import { PlayerProfile, OtherPlayers } from "./player/player";

export type UndecidedPlayer = Partial<PlayerProfile> & {
    readonly ready: boolean;
};

export type PendingPlayer = UndecidedPlayer | null;

export interface Player {
    readonly profile: PlayerProfile;
    readonly connected: boolean;
}

export interface DealPhasePlayer extends Player {
    readonly firstDeal: CardStack;
    readonly secondDeal: CardStack;
    readonly tookSecondDeal: boolean;
}

export interface PassPhasePlayer extends Player {
    readonly inHand: CardStack;
    readonly give: OtherPlayers<Card | null>;
    readonly ready: boolean;
}

export interface PlayPhasePlayer extends Player {
    readonly inHand: CardStack;
    readonly staged: CardStack;
    readonly tricksWon: CardTripleStack;
}

export interface ScorePhasePlayer extends Player {
    readonly profile: PlayerProfile;
    readonly cards: CardStack;
    readonly readyToPlayAgain: boolean;
}
