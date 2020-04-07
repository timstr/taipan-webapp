import { GameState, PlayerIndex, PlayerType, AllPlayersType } from "./state";

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
    k: infer I
) => void
    ? I
    : never;

type IsUnion<T> = [T] extends [UnionToIntersection<T>] ? false : true;

type NotUnion<T> = IsUnion<T> extends false ? T : never;

type PlayerOf<S extends GameState> = PlayerType<NotUnion<S>>;

type NonNullPlayerOf<S extends GameState> = Exclude<PlayerOf<S>, null>;

type PlayerTransform<S extends GameState> = (
    player: PlayerOf<S>,
    idx: PlayerIndex
) => PlayerOf<S>;

export const mapGamePlayersFunction = <S extends GameState>(
    state: NotUnion<S>
): ((...transforms: PlayerTransform<S>[]) => AllPlayersType<S>) => {
    return (...allTransforms: PlayerTransform<S>[]) => {
        const aggregateTransform: PlayerTransform<S> = (player, idx) => {
            for (let tranform of allTransforms) {
                player = tranform(player, idx);
            }
            return player;
        };
        const players = state.players;
        const newPlayers = [
            aggregateTransform(players[0], 0),
            aggregateTransform(players[1], 1),
            aggregateTransform(players[2], 2),
            aggregateTransform(players[3], 3),
        ] as AllPlayersType<NotUnion<S>>;

        return newPlayers;
    };
};

export const replacePlayerFunction = <S extends GameState>(_: S) => (
    playerToReplace: PlayerIndex,
    newPlayer: PlayerOf<S>
) => (previousPlayer: PlayerOf<S>, currentPlayer: PlayerIndex): PlayerOf<S> =>
    currentPlayer === playerToReplace ? newPlayer : previousPlayer;

export const replacePlayerKeyFunction = <S extends GameState>(
    _: NotUnion<S>
) => <K extends keyof NonNullPlayerOf<S>>(
    playerToUpdate: PlayerIndex,
    key: K,
    newValue: NonNullPlayerOf<S>[K]
) => (previousPlayer: PlayerOf<S>, currentPlayer: PlayerIndex): PlayerOf<S> =>
    previousPlayer
        ? currentPlayer === playerToUpdate
            ? { ...previousPlayer, [key]: newValue }
            : previousPlayer
        : previousPlayer;
