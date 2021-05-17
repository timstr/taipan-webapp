import {
    PassPhasePlayerView,
    PlayPhasePlayerView,
    DealPhasePlayerView,
} from "../../game/view/stateview";
import {
    expectObject,
    getProperty,
    expectBoolean,
    expectNumber,
} from "../helpers";
import { validatePlayerProfile } from "../player";
import { mapOtherPlayers } from "../../game/player/player";
import { ScorePhasePlayer } from "../../game/playerstate";
import { getCardStack } from "../cards";

export function validatePassPhasePlayerView(x: any): PassPhasePlayerView {
    const p = expectObject(x) as PassPhasePlayerView;
    const give = getProperty(
        p,
        "give",
        expectObject
    ) as PassPhasePlayerView["give"];
    return {
        profile: validatePlayerProfile(p.profile),
        connected: getProperty(p, "connected", expectBoolean),
        give: mapOtherPlayers(give, expectBoolean),
        cardsInHand: getProperty(p, "cardsInHand", expectNumber),
        ready: getProperty(p, "ready", expectBoolean),
    };
}

export function validateDealPhasePlayerView(x: any): DealPhasePlayerView {
    const p = expectObject(x) as DealPhasePlayerView;
    return {
        profile: validatePlayerProfile(p.profile),
        connected: getProperty(p, "connected", expectBoolean),
        cardsInHand: getProperty(p, "cardsInHand", expectNumber),
        cardsNotTaken: getProperty(p, "cardsNotTaken", expectNumber),
    };
}

export function validatePlayPhasePlayerView(x: any): PlayPhasePlayerView {
    const p = expectObject(x) as PlayPhasePlayerView;
    return {
        profile: validatePlayerProfile(p.profile),
        connected: getProperty(p, "connected", expectBoolean),
        cardsInHand: getProperty(p, "cardsInHand", expectNumber),
        cardsStaged: getProperty(p, "cardsStaged", expectNumber),
        cardsWon: getProperty(p, "cardsWon", expectNumber),
    };
}

export function validateScorePhasePlayer(x: any): ScorePhasePlayer {
    const p = expectObject(x) as ScorePhasePlayer;
    return {
        profile: validatePlayerProfile(p.profile),
        connected: getProperty(p, "connected", expectBoolean),
        cards: getCardStack(p, "cards"),
        readyToPlayAgain: getProperty(p, "readyToPlayAgain", expectBoolean),
    };
}
