import { GameState, PlayerType, AllPlayersType } from "../state/state";
import { PlayerIndex } from "../player/player";
import { NotUnion } from "../../../typeutils";

type PlayerOf<S extends GameState> = PlayerType<NotUnion<S>>;

type NonNullPlayerOf<S extends GameState> = Exclude<PlayerOf<S>, null>;

type PlayerTransform<S extends GameState> = (
    player: PlayerOf<S>,
    idx: PlayerIndex
) => PlayerOf<S>;

export function mapGamePlayersFunction<S extends GameState>(
    state: NotUnion<S>
): (...transforms: PlayerTransform<S>[]) => AllPlayersType<S> {
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
}

export function replacePlayerFunction<S extends GameState>(_: S) {
    return (playerToReplace: PlayerIndex, newPlayer: PlayerOf<S>) => (
        previousPlayer: PlayerOf<S>,
        currentPlayer: PlayerIndex
    ): PlayerOf<S> =>
        currentPlayer === playerToReplace ? newPlayer : previousPlayer;
}

export function replacePlayerKeyFunction<S extends GameState>(_: NotUnion<S>) {
    return <K extends keyof NonNullPlayerOf<S>>(
        playerToUpdate: PlayerIndex,
        key: K,
        newValue: NonNullPlayerOf<S>[K]
    ) => (
        previousPlayer: PlayerOf<S>,
        currentPlayer: PlayerIndex
    ): PlayerOf<S> =>
        previousPlayer
            ? currentPlayer === playerToUpdate
                ? { ...previousPlayer, [key]: newValue }
                : previousPlayer
            : previousPlayer;
}
