import {
    AllPlayerPositions,
    PlayerPosition,
    RelativePlayerPosition,
    AllRelativePlayerPositions,
} from "../game/player/position";

export function validatePosition(x: any) {
    if (typeof x === "string") {
        const i = AllPlayerPositions.findIndex((p) => p === x);
        if (i >= 0) {
            return AllPlayerPositions[i];
        }
    }
    throw new Error(`Invalid player index: ${JSON.stringify(x)}`);
}

export function validateNullablePosition(x: any): PlayerPosition | null {
    if (x === null) {
        return null;
    }
    return validatePosition(x);
}

export function validateRelativePosition(x: any): RelativePlayerPosition {
    if (typeof x === "string") {
        const i = AllRelativePlayerPositions.findIndex((p) => p === x);
        if (i >= 0) {
            return AllRelativePlayerPositions[i];
        }
    }
    throw new Error(`Invalid relative palyer position: ${JSON.stringify(x)}`);
}
