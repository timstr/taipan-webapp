import { isBomb, stacksAreEqual } from "../../cards";
import { PlayPhaseTag } from "../state/state";
import { GameStateSpectatorView } from "./spectatorview";
import { GameStateView } from "./stateview";

export type ViewOfGame = GameStateView | GameStateSpectatorView;

export function aBombWasJustPlayed(
    oldState: ViewOfGame,
    newState: ViewOfGame
): boolean {
    if (newState.phase !== PlayPhaseTag) {
        return false;
    }
    const newTrick = newState.currentTrick;
    if (newTrick.stacks.length < 1) {
        return false;
    }
    const newTopTrick = newTrick.stacks[newTrick.stacks.length - 1];
    if (!isBomb(newTopTrick)) {
        return false;
    }
    if (oldState.phase !== PlayPhaseTag) {
        return false;
    }
    const oldTrick = oldState.currentTrick;
    if (oldTrick.stacks.length + 1 !== newTrick.stacks.length) {
        return false;
    }
    for (let i = 0; i < oldTrick.stacks.length; ++i) {
        if (!stacksAreEqual(oldTrick.stacks[i], newTrick.stacks[i])) {
            return false;
        }
    }
    return true;
}
