import { createAction } from "./createaction";
import { DealPhaseTag } from "../state/state";

export const TAKE_SECOND_DEAL = "TAKE_SECOND_DEAL";
export const takeSecondDealAction = () =>
    createAction(DealPhaseTag, TAKE_SECOND_DEAL);
export type TakeSecondDealAction = ReturnType<typeof takeSecondDealAction>;

export type DealPhaseAction = TakeSecondDealAction;
