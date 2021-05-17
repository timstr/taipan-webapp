import {
    JoinPhaseView,
    PassPhaseView,
    PlayPhaseView,
    ScorePhaseView,
    GameStateView,
    PlayerViewTag,
    DealPhaseView,
    DefinitelyConnected,
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
    expectString,
    expectBoolean,
    expectNumber,
} from "../helpers";
import { validateNullablePosition, validatePosition } from "../position";
import {
    mapAllPlayers,
    mapOtherPlayers,
    PlayerProfile,
} from "../../game/player/player";
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
        yourName: getNullableProperty(sv, "yourName", expectString),
        yourPosition: validateNullablePosition(sv.yourPosition),
        youAreReady: getProperty(sv, "youAreReady", expectBoolean),
        playersJoined: getProperty(sv, "playersJoined", expectNumber),
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
        expectObject
    ) as DealPhaseView["others"];

    return {
        view: PlayerViewTag,
        phase: DealPhaseTag,
        you: validatePlayerProfile(sv.you),
        cardsRemaining: getProperty(sv, "cardsRemaining", expectNumber),
        yourHand: validateCardStack(sv.yourHand),
        others: mapOtherPlayers(others, validateDealPhasePlayerView),
    };
}

export function validatePassPhaseView(x: any): PassPhaseView {
    const sv = expectObject(x) as PassPhaseView;
    assertStateViewTag(sv);
    assertPhaseTag(sv, PassPhaseTag);
    const yh = getProperty(sv, "you", expectObject) as PassPhasePlayer;
    const yhg = getProperty(
        yh,
        "give",
        expectObject
    ) as PassPhasePlayer["give"];
    const others = getProperty(
        sv,
        "others",
        expectObject
    ) as PassPhaseView["others"];

    return {
        view: PlayerViewTag,
        phase: PassPhaseTag,
        you: {
            profile: validatePlayerProfile(yh.profile),
            inHand: getCardStack(yh, "inHand"),
            give: mapOtherPlayers(yhg, validateNullableCard),
            ready: getProperty(yh, "ready", expectBoolean),
        },
        others: mapOtherPlayers(others, validatePassPhasePlayerView),
    };
}

export function validatePlayPhaseView(x: any): PlayPhaseView {
    const sv = expectObject(x) as PlayPhaseView;
    assertStateViewTag(sv);
    assertPhaseTag(sv, PlayPhaseTag);
    const yh = getProperty(sv, "you", expectObject) as PlayPhasePlayer;

    const others = getProperty(
        sv,
        "others",
        expectObject
    ) as PlayPhaseView["others"];

    const playerMapping = getProperty(sv, "playerMapping", expectQuadruple);

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
        playerMapping: mapAllPlayers(playerMapping, (x) => {
            let xx = expectObject(x) as DefinitelyConnected<PlayerProfile>;
            return {
                name: getProperty(xx, "name", expectString),
                position: getProperty(xx, "position", validatePosition),
            };
        }),
    };
}

export function validateScorePhaseView(x: any): ScorePhaseView {
    const sv = expectObject(x) as ScorePhaseView;
    assertStateViewTag(sv);
    assertPhaseTag(sv, ScorePhaseTag);

    const others = getProperty(
        sv,
        "others",
        expectObject
    ) as ScorePhaseView["others"];

    const you = getProperty(sv, "you", expectObject) as ScorePhaseView["you"];

    return {
        view: PlayerViewTag,
        phase: ScorePhaseTag,
        you: {
            profile: getProperty(you, "profile", validatePlayerProfile),
            cards: getProperty(you, "cards", validateCardStack),
            readyToPlayAgain: getProperty(
                you,
                "readyToPlayAgain",
                expectBoolean
            ),
        },
        others: mapOtherPlayers(others, validateScorePhasePlayer),
    };
}

export function validateGameStateView(x: any): GameStateView {
    const sv = ((): GameStateView => {
        const obj = expectObject(x) as GameStateView;
        const phase = getProperty(obj, "phase", expectString);
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
