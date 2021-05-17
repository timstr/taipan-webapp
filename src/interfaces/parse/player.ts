import { AllPlayerIndices, PlayerProfile } from "../game/player/player";
import { expectObject, expectString, getProperty } from "./helpers";
import { validatePosition } from "./position";

export function validatePlayerIndex(x: any) {
    if (typeof x === "number") {
        const i = AllPlayerIndices.findIndex((idx) => idx === x);
        if (i >= 0) {
            return AllPlayerIndices[i];
        }
    }
    throw new Error(`Invalid player index: ${JSON.stringify(x)}`);
}

export function validatePlayerProfile(x: any): PlayerProfile {
    const pp = expectObject(x) as PlayerProfile;
    return {
        name: getProperty(pp, "name", expectString),
        position: validatePosition(pp.position),
    };
}
