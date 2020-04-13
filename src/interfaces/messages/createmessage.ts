import { OptionalSpread } from "../../typeutils";

export const createMessage = <Type extends string, Payload = undefined>(
    type: Type,
    ...payload: OptionalSpread<Payload>
) => ({
    type,
    payload: payload[0] as Payload,
});
