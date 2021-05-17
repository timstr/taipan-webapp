import { PendingPlayer } from "../game/playerstate";
import {
    expectBoolean,
    expectString,
    getProperty,
    withOptionalProperty,
} from "./helpers";
import { validatePosition } from "./position";

export function validatePendingPlayer(p: any): PendingPlayer {
    if (p === null) {
        return null;
    } else if (typeof p === "object") {
        const pp = p as Exclude<PendingPlayer, null>;

        return {
            ...withOptionalProperty(pp, "name", expectString),
            ...withOptionalProperty(pp, "position", validatePosition),
            ready: getProperty(pp, "ready", expectBoolean),
        };
    } else {
        throw new Error("Invalid pending player");
    }
}
