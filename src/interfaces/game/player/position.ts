import { PlayerProfile, PlayerIndex, AllPlayerIndices } from "./player";
import { validatePlayerIndex } from "../../parse/player";

export type PlayerPosition = "North" | "South" | "East" | "West";
export const AllPlayerPositions: PlayerPosition[] = [
    "North",
    "South",
    "East",
    "West",
];

export type RelativePlayerPosition = "Left" | "Opposite" | "Right";
export const AllRelativePlayerPositions: RelativePlayerPosition[] = [
    "Left",
    "Opposite",
    "Right",
];

export type PlayerPositionMapping = Record<PlayerPosition, PlayerPosition>;

// Helpful guide:
//
//   N
// W   E
//   S

export const LeftPosition: PlayerPositionMapping = {
    North: "East",
    South: "West",
    East: "South",
    West: "North",
};

export const OppositePosition: PlayerPositionMapping = {
    North: "South",
    South: "North",
    East: "West",
    West: "East",
};

export const RightPosition: PlayerPositionMapping = {
    North: "West",
    South: "East",
    East: "North",
    West: "South",
};

export const relativeToAbsolutePosition = (
    to: RelativePlayerPosition,
    from: PlayerPosition
): PlayerPosition => {
    return {
        Left: LeftPosition,
        Opposite: OppositePosition,
        Right: RightPosition,
    }[to][from];
};

const mapPosition = (
    player: PlayerIndex,
    allPlayers: PlayerProfile[],
    mapping: PlayerPositionMapping
): PlayerIndex => {
    const x = mapping[allPlayers[player].position];
    const pi = allPlayers.findIndex((p) => p.position == x);
    return validatePlayerIndex(pi);
};

export const leftOpponentOf = (
    player: PlayerIndex,
    allPlayers: PlayerProfile[]
) => mapPosition(player, allPlayers, LeftPosition);

export const partnerOf = (player: PlayerIndex, allPlayers: PlayerProfile[]) =>
    mapPosition(player, allPlayers, OppositePosition);

export const rightOpponentOf = (
    player: PlayerIndex,
    allPlayers: PlayerProfile[]
) => mapPosition(player, allPlayers, RightPosition);

export function findPlayerWithPosition(
    pos: PlayerPosition,
    players: PlayerProfile[]
): PlayerIndex {
    for (let i of AllPlayerIndices) {
        const p = players[i];
        if (p.position === pos) {
            return i;
        }
    }
    throw new Error("Failed to find player position");
}

export const nameOfPosition = (pos: RelativePlayerPosition) => {
    switch (pos) {
        case "Left":
            return "left";
        case "Opposite":
            return "partner";
        case "Right":
            return "right";
    }
};
