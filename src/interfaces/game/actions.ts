import { JoinPhaseAction, validateJoinPhaseAction } from "./actions/joinphase";
//import { DealPhaseAction, validateDealPhaseAction } from "./actions/dealphase";
import { PassPhaseAction, validatePassPhaseAction } from "./actions/passphase";
import { PlayPhaseAction, validatePlayPhaseAction } from "./actions/playphase";
import {
    PlayerIndex,
    JoinPhase,
    PassPhase,
    PlayPhase,
    GamePhase,
    ScorePhase,
} from "./state";
import { getProperty, getPropertyOr } from "../parsehelpers";
import {
    validateScorePhaseAction,
    ScorePhaseAction,
} from "./actions/scorephase";

export type Action =
    | JoinPhaseAction
    //| DealPhaseAction
    | PassPhaseAction
    | PlayPhaseAction
    | ScorePhaseAction;

export type PlayerAction = Action & { readonly player: PlayerIndex };

function validateAction(type: string, phase: string, payload?: object): Action {
    const a = ((): Action => {
        switch (phase as GamePhase) {
            case JoinPhase:
                return validateJoinPhaseAction(type, payload);
            case PassPhase:
                return validatePassPhaseAction(type, payload);
            case PlayPhase:
                return validatePlayPhaseAction(type, payload);
            case ScorePhase:
                return validateScorePhaseAction(type, payload);
        }
    })();
    if (a === undefined) {
        throw new Error(`Unrecognized action phase: ${phase}`);
    }
    return a;
}

export function parseAction(obj: any): Action {
    if (typeof obj !== "object") {
        throw new Error("Action is not an object");
    }

    try {
        const type = getProperty(obj as Action, "type", "string");

        const phase = getProperty(obj as Action, "phase", "string");

        const payload = getPropertyOr(
            obj as Action,
            "payload",
            "object",
            undefined
        );

        return validateAction(type, phase, payload);
    } catch (e) {
        throw new Error(`Invalid action: ${e}`);
    }
}
