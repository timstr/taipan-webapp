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
