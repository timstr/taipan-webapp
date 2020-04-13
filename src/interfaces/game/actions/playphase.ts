import { Card } from "../../cards";
import { createAction } from "./createaction";
import { PlayPhaseTag } from "../state/state";

export const STAGE_CARD = "STAGE_CARD";
export const stageCardAction = (card: Card) =>
    createAction(PlayPhaseTag, STAGE_CARD, { card });
export type StageCardAction = ReturnType<typeof stageCardAction>;

export const UNSTAGE_CARD = "UNSTAGE_CARD";
export const unstageCardAction = (card: Card) =>
    createAction(PlayPhaseTag, UNSTAGE_CARD, { card });
export type UnstageCardAction = ReturnType<typeof unstageCardAction>;

export const CLEAR_STAGED_CARDS = "CLEAR_STAGED_CARDS";
export const clearStagedCardsAction = () =>
    createAction(PlayPhaseTag, CLEAR_STAGED_CARDS);
export type ClearStagedCardsAction = ReturnType<typeof clearStagedCardsAction>;

export const PLAY_SINGLE_CARD = "PLAY_SINGLE_CARD";
export const playSingleCardAction = (card: Card) =>
    createAction(PlayPhaseTag, PLAY_SINGLE_CARD, {
        card,
    });
export type PlaySingleCardAction = ReturnType<typeof playSingleCardAction>;

export const PLAY_STAGED_CARDS = "PLAY_STAGED_CARDS";
export const playStagedCardsAction = () =>
    createAction(PlayPhaseTag, PLAY_STAGED_CARDS);
export type PlayStagedCardsAction = ReturnType<typeof playStagedCardsAction>;

export const RECLAIM_LAST_PLAY = "UNDO_LAST_PLAY";
export const reclaimLastPlayAction = () =>
    createAction(PlayPhaseTag, RECLAIM_LAST_PLAY);
export type ReclaimLastPlayAction = ReturnType<typeof reclaimLastPlayAction>;

export const TAKE_TRICK = "TAKE_TRICK";
export const takeTrickAction = () => createAction(PlayPhaseTag, TAKE_TRICK);
export type TakeTrickAction = ReturnType<typeof takeTrickAction>;

export const PUT_TRICK_BACK = "PUT_TRICK_BACK";
export const putTrickBackAction = () =>
    createAction(PlayPhaseTag, PUT_TRICK_BACK);
export type PutTrickBackAction = ReturnType<typeof putTrickBackAction>;

export type PlayPhaseAction =
    | StageCardAction
    | UnstageCardAction
    | ClearStagedCardsAction
    | PlaySingleCardAction
    | PlayStagedCardsAction
    | ReclaimLastPlayAction
    | TakeTrickAction
    | PutTrickBackAction;
