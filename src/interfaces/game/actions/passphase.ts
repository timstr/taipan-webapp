import { Card } from "../../cards";
import { createAction } from "./createaction";
import { PassPhaseTag } from "../state/state";
import { RelativePlayerPosition } from "../player/position";

// sets ready to false, removes card from other choices
export const CHOOSE_CARD_TO_PASS = "CHOOSE_CARD_TO_PASS";
export const chooseCardToPass = (
    card: Card | null,
    position: RelativePlayerPosition
) => createAction(PassPhaseTag, CHOOSE_CARD_TO_PASS, { card, position });
export type ChooseCardToPassAction = ReturnType<typeof chooseCardToPass>;

// Passes cards and advances game to play phase if all other players are ready
export const READY_TO_PASS = "READY_TO_PASS";
export const readyToPassAction = () =>
    createAction(PassPhaseTag, READY_TO_PASS);
export type ReadyToPassAction = ReturnType<typeof readyToPassAction>;

export type PassPhaseAction = ChooseCardToPassAction | ReadyToPassAction;
