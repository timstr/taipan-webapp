import { PlayerIndex, GamePhase } from "../state";

type OptionalSpread<T = undefined> = T extends undefined ? [] : [T];

export const createAction = <
    Type extends string,
    Phase extends GamePhase,
    Payload = undefined
>(
    phase: Phase,
    type: Type,
    ...payload: OptionalSpread<Payload>
) => ({ phase, type, payload: payload[0] as Payload });

export const playerAction = <
    Type extends string,
    Phase extends GamePhase,
    Payload,
    A extends { type: Type; phase: Phase; payload: Payload }
>(
    player: PlayerIndex,
    a: A
) => ({
    ...a,
    player,
});

export type PayloadType<A extends { payload: any }> = A["payload"];
