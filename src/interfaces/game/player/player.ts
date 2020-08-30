import {
    PlayerPosition,
    leftOpponentOf,
    partnerOf,
    rightOpponentOf,
    findPlayerWithPosition,
} from "./position";

export interface PlayerProfile {
    readonly name: string;
    readonly position: PlayerPosition;
}

export type AllPlayers<T> = readonly [T, T, T, T];

export type PlayerIndex = 0 | 1 | 2 | 3;
export const AllPlayerIndices: PlayerIndex[] = [0, 1, 2, 3];

export interface SeatedPlayers<T> {
    readonly north: T;
    readonly south: T;
    readonly east: T;
    readonly west: T;
}

export type Disconnected = "Disconnected";

export interface OtherPlayers<T> {
    readonly leftOpponent: T;
    readonly partner: T;
    readonly rightOpponent: T;
}

export const mapAllPlayers = <T, S>(
    allPlayers: AllPlayers<T>,
    fn: (player: T, index: PlayerIndex) => S
): AllPlayers<S> => {
    return [
        fn(allPlayers[0], 0),
        fn(allPlayers[1], 1),
        fn(allPlayers[2], 2),
        fn(allPlayers[3], 3),
    ];
};

export function mapSeatedPlayers<S, T>(
    seatedPlayers: SeatedPlayers<S>,
    fn: (player: S, position: PlayerPosition) => T
): SeatedPlayers<T> {
    return {
        north: fn(seatedPlayers.north, "North"),
        south: fn(seatedPlayers.south, "South"),
        east: fn(seatedPlayers.east, "East"),
        west: fn(seatedPlayers.west, "West"),
    };
}
export function mapOtherPlayers<S, T>(
    otherPlayers: OtherPlayers<S>,
    fn: (s: S) => T
): OtherPlayers<T> {
    return {
        leftOpponent: fn(otherPlayers.leftOpponent),
        partner: fn(otherPlayers.partner),
        rightOpponent: fn(otherPlayers.rightOpponent),
    };
}

interface WithProfile {
    profile: PlayerProfile;
}

export function allPlayersToOtherPlayers<S extends WithProfile, V>(
    players: AllPlayers<S>,
    you: PlayerIndex,
    viewFn: (player: S) => V
): OtherPlayers<V> {
    const profiles = players.map((p) => p.profile);
    const lpos = leftOpponentOf(you, profiles);
    const ppos = partnerOf(you, profiles);
    const rpos = rightOpponentOf(you, profiles);
    return {
        leftOpponent: viewFn(players[lpos]),
        partner: viewFn(players[ppos]),
        rightOpponent: viewFn(players[rpos]),
    };
}

export function allPlayersToSeatedPlayers<S extends WithProfile, V>(
    players: AllPlayers<S>,
    viewFn: (player: S) => V
): SeatedPlayers<V> {
    const profiles = players.map((p) => p.profile);
    const npos = findPlayerWithPosition("North", profiles);
    const spos = findPlayerWithPosition("South", profiles);
    const epos = findPlayerWithPosition("East", profiles);
    const wpos = findPlayerWithPosition("West", profiles);
    return {
        north: viewFn(players[npos]),
        south: viewFn(players[spos]),
        east: viewFn(players[epos]),
        west: viewFn(players[wpos]),
    };
}
