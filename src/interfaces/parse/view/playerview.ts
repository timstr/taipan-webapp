import {
    PassPhasePlayerView,
    PlayPhasePlayerView,
    DealPhasePlayerView,
} from "../../game/view/stateview";
import { expectObject, getProperty, expectBoolean } from "../helpers";
import { validatePlayerProfile } from "../player";
import { mapOtherPlayers } from "../../game/player/player";
import { ScorePhasePlayer } from "../../game/playerstate";
import { getCardStack } from "../cards";

export function validatePassPhasePlayerView(x: any): PassPhasePlayerView {
    const p = expectObject(x) as PassPhasePlayerView;
    const give = getProperty(
        p,
        "give",
        "object"
    ) as PassPhasePlayerView["give"];
    return {
        profile: validatePlayerProfile(p.profile),
        give: mapOtherPlayers(give, expectBoolean),
        cardsInHand: getProperty(p, "cardsInHand", "number"),
        ready: getProperty(p, "ready", "boolean"),
    };
}

export function validateDealPhasePlayerView(x: any): DealPhasePlayerView {
    const p = expectObject(x) as DealPhasePlayerView;
    return {
        profile: validatePlayerProfile(p.profile),
        cardsInHand: getProperty(p, "cardsInHand", "number"),
        cardsNotTaken: getProperty(p, "cardsNotTaken", "number"),
    };
}

export function validatePlayPhasePlayerView(x: any): PlayPhasePlayerView {
    const p = expectObject(x) as PlayPhasePlayerView;
    return {
        profile: validatePlayerProfile(p.profile),
        cardsInHand: getProperty(p, "cardsInHand", "number"),
        cardsStaged: getProperty(p, "cardsStaged", "number"),
        cardsWon: getProperty(p, "cardsWon", "number"),
    };
}

export function validateScorePhasePlayer(x: any): ScorePhasePlayer {
    const p = expectObject(x) as ScorePhasePlayer;
    return {
        profile: validatePlayerProfile(p.profile),
        cards: getCardStack(p, "cards"),
        readyToPlayAgain: getProperty(p, "readyToPlayAgain", "boolean"),
    };
}
