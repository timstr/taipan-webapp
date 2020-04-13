import {
    JoinPhaseView,
    PassPhaseView,
    PlayPhaseView,
    ScorePhaseView,
    GameStateView,
    PlayerViewTag,
    DealPhaseView,
} from "../../game/view/stateview";
import { assertPhaseTag } from "../state";
import {
    JoinPhaseTag,
    PassPhaseTag,
    PlayPhaseTag,
    ScorePhaseTag,
    GamePhase,
    DealPhaseTag,
} from "../../game/state/state";
import {
    expectQuadruple,
    getNullableProperty,
    getProperty,
    expectObject,
} from "../helpers";
import { validateNullablePosition } from "../position";
import { mapAllPlayers, mapOtherPlayers } from "../../game/player/player";
import { validatePendingPlayer } from "../playerstate";
import { PassPhasePlayer, PlayPhasePlayer } from "../../game/playerstate";
import { validatePlayerProfile } from "../player";
import {
    getCardStack,
    validateNullableCard,
    getCardDoubleStack,
    getCardTripleStack,
    validateCardStack,
} from "../cards";
import {
    validatePassPhasePlayerView,
    validatePlayPhasePlayerView,
    validateScorePhasePlayer,
    validateDealPhasePlayerView,
} from "./playerview";

export const assertStateViewTag = (obj: any) => {
    const sv = obj as GameStateView;
    if (sv.view !== PlayerViewTag) {
        throw new Error("Invalid player view tag");
    }
};

export function validateJoinPhaseView(x: any): JoinPhaseView {
    const sv = expectObject(x) as JoinPhaseView;
    assertStateViewTag(sv);
    assertPhaseTag(sv, JoinPhaseTag);
    const pp = expectQuadruple(sv.players);
    return {
        view: PlayerViewTag,
        phase: JoinPhaseTag,
        yourName: getNullableProperty(sv, "yourName", "string"),
        yourPosition: validateNullablePosition(sv.yourPosition),
        youAreReady: getProperty(sv, "youAreReady", "boolean"),
        playersJoined: getProperty(sv, "playersJoined", "number"),
        players: mapAllPlayers(pp, validatePendingPlayer),
    };
}

export function validateDealPhaseView(x: any): DealPhaseView {
    const sv = expectObject(x) as DealPhaseView;
    assertStateViewTag(sv);
    assertPhaseTag(sv, DealPhaseTag);
    const others = getProperty(
        sv,
        "others",
        "object"
    ) as DealPhaseView["others"];

    return {
        view: PlayerViewTag,
        phase: DealPhaseTag,
        you: validatePlayerProfile(sv.you),
        cardsRemaining: getProperty(sv, "cardsRemaining", "number"),
        yourHand: validateCardStack(sv.yourHand),
        others: mapOtherPlayers(others, validateDealPhasePlayerView),
    };
}

export function validatePassPhaseView(x: any): PassPhaseView {
    const sv = expectObject(x) as PassPhaseView;
    assertStateViewTag(sv);
    assertPhaseTag(sv, PassPhaseTag);
    const yh = getProperty(sv, "you", "object") as PassPhasePlayer;
    const yhg = getProperty(yh, "give", "object") as PassPhasePlayer["give"];
    const others = getProperty(
        sv,
        "others",
        "object"
    ) as PassPhaseView["others"];

    return {
        view: PlayerViewTag,
        phase: PassPhaseTag,
        you: {
            profile: validatePlayerProfile(yh.profile),
            inHand: getCardStack(yh, "inHand"),
            give: mapOtherPlayers(yhg, validateNullableCard),
            ready: getProperty(yh, "ready", "boolean"),
        },
        others: mapOtherPlayers(others, validatePassPhasePlayerView),
    };
}

export function validatePlayPhaseView(x: any): PlayPhaseView {
    const sv = expectObject(x) as PlayPhaseView;
    assertStateViewTag(sv);
    assertPhaseTag(sv, PlayPhaseTag);
    const yh = getProperty(sv, "you", "object") as PlayPhasePlayer;

    const others = getProperty(
        sv,
        "others",
        "object"
    ) as PassPhaseView["others"];

    return {
        view: PlayerViewTag,
        phase: PlayPhaseTag,
        currentTrick: getCardDoubleStack(sv, "currentTrick"),
        you: {
            profile: validatePlayerProfile(yh.profile),
            inHand: getCardStack(yh, "inHand"),
            staged: getCardStack(yh, "staged"),
            tricksWon: getCardTripleStack(yh, "tricksWon"),
        },
        others: mapOtherPlayers(others, validatePlayPhasePlayerView),
    };
}

export function validateScorePhaseView(x: any): ScorePhaseView {
    const sv = expectObject(x) as ScorePhaseView;
    assertStateViewTag(sv);
    assertPhaseTag(sv, ScorePhaseTag);

    const others = getProperty(
        sv,
        "others",
        "object"
    ) as ScorePhaseView["others"];

    return {
        view: PlayerViewTag,
        phase: ScorePhaseTag,
        you: validateScorePhasePlayer(sv.you),
        others: mapOtherPlayers(others, validateScorePhasePlayer),
    };
}

export function validateGameStateView(x: any): GameStateView {
    const sv = ((): GameStateView => {
        const obj = expectObject(x) as GameStateView;
        const phase = getProperty(obj, "phase", "string");
        switch (phase as GamePhase) {
            case JoinPhaseTag:
                return validateJoinPhaseView(obj);
            case DealPhaseTag:
                return validateDealPhaseView(obj);
            case PassPhaseTag:
                return validatePassPhaseView(obj);
            case PlayPhaseTag:
                return validatePlayPhaseView(obj);
            case ScorePhaseTag:
                return validateScorePhaseView(obj);
        }
    })();
    if (sv === undefined) {
        throw new Error("Invalid state view");
    }
    return sv;
}
