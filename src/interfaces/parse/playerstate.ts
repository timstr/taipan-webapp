import { PendingPlayer } from "../game/playerstate";
import { getPropertyOr, getProperty } from "./helpers";
import { validatePosition } from "./position";

export function validatePendingPlayer(p: any): PendingPlayer {
    if (p === null) {
        return null;
    } else if (typeof p === "object") {
        const pp = p as Exclude<PendingPlayer, null>;
        const pos = getPropertyOr(pp, "position", "string", undefined);
        return {
            name: getPropertyOr(pp, "name", "string", undefined),
            ready: getProperty(pp, "ready", "boolean"),
            position: pos === undefined ? pos : validatePosition(pos),
        };
    } else {
        throw new Error("Invalid pending player");
    }
}
