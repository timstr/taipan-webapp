import { JoinPhaseAction } from "./joinphase";
import { PassPhaseAction } from "./passphase";
import { PlayPhaseAction } from "./playphase";
import { ScorePhaseAction } from "./scorephase";
import { PlayerIndex } from "../player/player";
import { DealPhaseAction } from "./dealphase";

export type Action =
    | JoinPhaseAction
    | DealPhaseAction
    | PassPhaseAction
    | PlayPhaseAction
    | ScorePhaseAction;

export type PlayerAction = Action & { readonly player: PlayerIndex };
