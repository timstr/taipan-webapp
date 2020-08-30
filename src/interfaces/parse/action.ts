import {
    JoinPhaseAction,
    PLAYER_JOINED,
    playerJoinedAction,
    PLAYER_CHOSE_NAME,
    playerChoseNameAction,
    PlayerChoseNameAction,
    PLAYER_CHOSE_POSITION,
    PlayerChosePositionAction,
    playerChosePositionAction,
    PLAYER_IS_READY,
    playerIsReadyAction,
    playerDisconnectedAction,
    PLAYER_DISCONNECTED,
} from "../game/actions/joinphase";
import { getProperty, expectObject, getPropertyOr } from "./helpers";
import { PayloadType } from "../game/actions/createaction";
import { validateNullablePosition, validateRelativePosition } from "./position";
import {
    PassPhaseAction,
    CHOOSE_CARD_TO_PASS,
    ChooseCardToPassAction,
    chooseCardToPass,
    READY_TO_PASS,
    readyToPassAction,
} from "../game/actions/passphase";
import { validateCard, validateNullableCard } from "./cards";
import {
    PlayPhaseAction,
    STAGE_CARD,
    stageCardAction,
    UNSTAGE_CARD,
    unstageCardAction,
    CLEAR_STAGED_CARDS,
    clearStagedCardsAction,
    PLAY_SINGLE_CARD,
    playSingleCardAction,
    PLAY_STAGED_CARDS,
    playStagedCardsAction,
    RECLAIM_LAST_PLAY,
    reclaimLastPlayAction,
    TAKE_TRICK,
    takeTrickAction,
    PUT_TRICK_BACK,
    putTrickBackAction,
} from "../game/actions/playphase";
import {
    ScorePhaseAction,
    READY_TO_PLAY_AGAIN,
    readyToPlayAgainAction,
} from "../game/actions/scorephase";
import { Action } from "../game/actions/actions";
import {
    GamePhase,
    JoinPhaseTag,
    PassPhaseTag,
    PlayPhaseTag,
    ScorePhaseTag,
    DealPhaseTag,
} from "../game/state/state";
import {
    DealPhaseAction,
    TAKE_SECOND_DEAL,
    takeSecondDealAction,
} from "../game/actions/dealphase";

export function validateJoinPhaseAction(
    type: string,
    payload?: object
): JoinPhaseAction {
    const a = ((): JoinPhaseAction => {
        switch (type as JoinPhaseAction["type"]) {
            case PLAYER_JOINED:
                return playerJoinedAction();
            case PLAYER_DISCONNECTED:
                return playerDisconnectedAction();
            case PLAYER_CHOSE_NAME:
                return playerChoseNameAction(
                    getProperty(
                        payload as PayloadType<PlayerChoseNameAction>,
                        "name",
                        "string"
                    )
                );
            case PLAYER_CHOSE_POSITION: {
                const o = expectObject(
                    payload
                ) as PlayerChosePositionAction["payload"];
                return playerChosePositionAction(
                    validateNullablePosition(o.position)
                );
            }
            case PLAYER_IS_READY:
                return playerIsReadyAction();
        }
    })();
    if (a === undefined) {
        throw new Error("Unrecognized join phase action");
    }
    return a;
}

export function validateDealPhaseAction(
    type: string,
    _?: object
): DealPhaseAction {
    const a = ((): DealPhaseAction => {
        switch (type as DealPhaseAction["type"]) {
            case TAKE_SECOND_DEAL:
                return takeSecondDealAction();
        }
    })();
    if (a === undefined) {
        throw new Error("Invalid action");
    }
    return a;
}

export function validatePassPhaseAction(
    type: string,
    payload?: object
): PassPhaseAction {
    const a = ((): PassPhaseAction => {
        switch (type as PassPhaseAction["type"]) {
            case CHOOSE_CARD_TO_PASS: {
                const o = expectObject(
                    payload
                ) as ChooseCardToPassAction["payload"];
                return chooseCardToPass(
                    validateNullableCard(o.card),
                    validateRelativePosition(o.position)
                );
            }
            case READY_TO_PASS:
                return readyToPassAction();
        }
    })();
    if (a === undefined) {
        throw new Error("Invalid action");
    }
    return a;
}

export function validatePlayPhaseAction(
    type: string,
    payload?: object
): PlayPhaseAction {
    const getTheCard = () => validateCard((expectObject(payload) as any).card);
    const a = ((): PlayPhaseAction => {
        switch (type as PlayPhaseAction["type"]) {
            case STAGE_CARD:
                return stageCardAction(getTheCard());
            case UNSTAGE_CARD:
                return unstageCardAction(getTheCard());
            case CLEAR_STAGED_CARDS:
                return clearStagedCardsAction();
            case PLAY_SINGLE_CARD:
                return playSingleCardAction(getTheCard());
            case PLAY_STAGED_CARDS:
                return playStagedCardsAction();
            case RECLAIM_LAST_PLAY:
                return reclaimLastPlayAction();
            case TAKE_TRICK:
                return takeTrickAction();
            case PUT_TRICK_BACK:
                return putTrickBackAction();
        }
    })();
    if (a === undefined) {
        throw new Error("Invalid action");
    }
    return a;
}

export function validateScorePhaseAction(
    type: string,
    _?: object
): ScorePhaseAction {
    const a = ((): ScorePhaseAction => {
        switch (type as ScorePhaseAction["type"]) {
            case READY_TO_PLAY_AGAIN:
                return readyToPlayAgainAction();
        }
    })();
    if (a === undefined) {
        throw new Error("Unrecognized score phase action");
    }
    return a;
}

function validateActionFromParts(
    type: string,
    phase: string,
    payload?: object
): Action {
    const a = ((): Action => {
        switch (phase as GamePhase) {
            case JoinPhaseTag:
                return validateJoinPhaseAction(type, payload);
            case DealPhaseTag:
                return validateDealPhaseAction(type, payload);
            case PassPhaseTag:
                return validatePassPhaseAction(type, payload);
            case PlayPhaseTag:
                return validatePlayPhaseAction(type, payload);
            case ScorePhaseTag:
                return validateScorePhaseAction(type, payload);
        }
    })();
    if (a === undefined) {
        throw new Error(`Unrecognized action phase: ${phase}`);
    }
    return a;
}

export function validateAction(obj: any): Action {
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

        return validateActionFromParts(type, phase, payload);
    } catch (e) {
        throw new Error(`Invalid action: ${e}`);
    }
}
