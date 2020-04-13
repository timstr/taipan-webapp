import { createAction } from "./createaction";
import { ScorePhaseTag } from "../state/state";

export const READY_TO_PLAY_AGAIN = "READY_TO_PLAY_AGAIN";
export const readyToPlayAgainAction = () =>
    createAction(ScorePhaseTag, READY_TO_PLAY_AGAIN);

export type ReadyToPlayAgainAction = ReturnType<typeof readyToPlayAgainAction>;

export type ScorePhaseAction = ReadyToPlayAgainAction;
