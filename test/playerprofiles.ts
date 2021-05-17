import {
    AllPlayers,
    PlayerProfile,
} from "../src/interfaces/game/player/player";

export function defaultPlayerProfiles(): AllPlayers<PlayerProfile> {
    return [
        {
            name: "a",
            position: "North",
        },
        {
            name: "b",
            position: "South",
        },
        {
            name: "c",
            position: "East",
        },
        {
            name: "d",
            position: "West",
        },
    ];
}
