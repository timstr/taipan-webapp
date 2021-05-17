import {
    JoinPhaseSpectatorView,
    PassPhaseSpectatorView,
    PlayPhaseSpectatorView,
    ScorePhaseSpectatorView,
    GameStateSpectatorView,
    SpectatorViewTag,
    DealPhaseSpectatorView,
} from "../../game/view/spectatorview";
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
    getProperty,
    expectObject,
    expectNumber,
    expectString,
} from "../helpers";
import {
    mapAllPlayers,
    mapSeatedPlayers,
    PlayerProfile,
} from "../../game/player/player";
import { validatePendingPlayer } from "../playerstate";
import { getCardDoubleStack } from "../cards";
import {
    validatePassPhasePlayerView,
    validatePlayPhasePlayerView,
    validateScorePhasePlayer,
    validateDealPhasePlayerView,
} from "./playerview";
import { DefinitelyConnected } from "../../game/view/stateview";
import { validatePosition } from "../position";

const assertSpectatorViewTag = (obj: object) => {
    const sv = obj as GameStateSpectatorView;
    if (sv.view !== SpectatorViewTag) {
        throw new Error("Invalid spectator view tag");
    }
};

export function validateJoinPhaseSpectatorView(x: any): JoinPhaseSpectatorView {
    const sv = expectObject(x) as JoinPhaseSpectatorView;
    assertSpectatorViewTag(sv);
    assertPhaseTag(sv, JoinPhaseTag);
    const pp = expectQuadruple(sv.players);
    return {
        view: SpectatorViewTag,
        phase: JoinPhaseTag,
        numPlayers: getProperty(sv, "numPlayers", expectNumber),
        players: mapAllPlayers(pp, validatePendingPlayer),
    };
}

export function validateDealPhaseSpectatorView(x: any): DealPhaseSpectatorView {
    const sv = expectObject(x) as DealPhaseSpectatorView;
    assertSpectatorViewTag(sv);
    assertPhaseTag(sv, DealPhaseTag);
    const pp = getProperty(
        sv,
        "players",
        expectObject
    ) as DealPhaseSpectatorView["players"];
    return {
        view: SpectatorViewTag,
        phase: DealPhaseTag,
        players: mapSeatedPlayers(pp, validateDealPhasePlayerView),
    };
}

export function validatePassPhaseSpectatorView(x: any): PassPhaseSpectatorView {
    const sv = expectObject(x) as PassPhaseSpectatorView;
    assertSpectatorViewTag(sv);
    assertPhaseTag(sv, PassPhaseTag);
    const pp = getProperty(
        sv,
        "players",
        expectObject
    ) as PassPhaseSpectatorView["players"];
    return {
        view: SpectatorViewTag,
        phase: PassPhaseTag,
        players: mapSeatedPlayers(pp, validatePassPhasePlayerView),
    };
}

export function validatePlayPhaseSpectatorView(x: any): PlayPhaseSpectatorView {
    const sv = expectObject(x) as PlayPhaseSpectatorView;
    assertSpectatorViewTag(sv);
    assertPhaseTag(sv, PlayPhaseTag);
    const pp = getProperty(
        sv,
        "players",
        expectObject
    ) as PlayPhaseSpectatorView["players"];
    const pm = getProperty(sv, "playerMapping", expectQuadruple);
    return {
        view: SpectatorViewTag,
        phase: PlayPhaseTag,
        currentTrick: getCardDoubleStack(sv, "currentTrick"),
        players: mapSeatedPlayers(pp, validatePlayPhasePlayerView),
        playerMapping: mapAllPlayers(pm, (x) => {
            const xx = expectObject(x) as DefinitelyConnected<PlayerProfile>;
            return {
                name: getProperty(xx, "name", expectString),
                position: getProperty(xx, "position", validatePosition),
            };
        }),
    };
}

export function validateScorePhaseSpectatorView(
    x: any
): ScorePhaseSpectatorView {
    const sv = expectObject(x) as ScorePhaseSpectatorView;
    assertSpectatorViewTag(sv);
    assertPhaseTag(sv, ScorePhaseTag);
    const pp = getProperty(
        sv,
        "players",
        expectObject
    ) as ScorePhaseSpectatorView["players"];
    return {
        view: SpectatorViewTag,
        phase: ScorePhaseTag,
        players: mapSeatedPlayers(pp, validateScorePhasePlayer),
    };
}

export function validateGameStateSpectatorView(x: any): GameStateSpectatorView {
    const sv = ((): GameStateSpectatorView => {
        const obj = expectObject(x) as GameStateSpectatorView;
        const phase = getProperty(obj, "phase", expectString);
        switch (phase as GamePhase) {
            case JoinPhaseTag:
                return validateJoinPhaseSpectatorView(obj);
            case DealPhaseTag:
                return validateDealPhaseSpectatorView(obj);
            case PassPhaseTag:
                return validatePassPhaseSpectatorView(obj);
            case PlayPhaseTag:
                return validatePlayPhaseSpectatorView(obj);
            case ScorePhaseTag:
                return validateScorePhaseSpectatorView(obj);
        }
    })();
    if (sv === undefined) {
        throw new Error("Invalid state view");
    }
    return sv;
}
