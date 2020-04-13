import { GamePhase } from "../state/state";
import { PlayerIndex } from "../player/player";
import { OptionalSpread } from "../../../typeutils";

export function createAction<
    Type extends string,
    Phase extends GamePhase,
    Payload = undefined
>(phase: Phase, type: Type, ...payload: OptionalSpread<Payload>) {
    return { phase, type, payload: payload[0] as Payload };
}

export function playerAction<
    Type extends string,
    Phase extends GamePhase,
    Payload,
    A extends { type: Type; phase: Phase; payload: Payload }
>(player: PlayerIndex, a: A) {
    return {
        ...a,
        player,
    };
}

export type PayloadType<A extends { payload: any }> = A["payload"];
