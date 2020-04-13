import { GameState, DefaultGameState } from "./state/state";
import { updateGameState } from "./update/update";
import { Emitter } from "../emitter";
import { PlayerAction } from "./actions/actions";

export type GameStateHandler = (state: GameState) => void;

export class Game {
    constructor() {
        this.state = DefaultGameState;
        this.updateEmitter = new Emitter();
    }

    getGameState(): GameState {
        return this.state;
    }

    replaceGameState(newState: GameState) {
        this.state = newState;
        this.updateEmitter.emit(this.state);
    }

    update(action: PlayerAction) {
        try {
            this.state = updateGameState(this.state, action);
        } catch (e) {
            console.error(
                "An error occurred while updating the game state:",
                e
            );
        }
        this.updateEmitter.emit(this.state);
    }

    onUpdate(handler: GameStateHandler) {
        this.updateEmitter.addListener(handler);
    }

    offUpdate(handler: GameStateHandler) {
        this.updateEmitter.removeListener(handler);
    }

    private state: GameState;
    private updateEmitter: Emitter<Parameters<GameStateHandler>>;
}
