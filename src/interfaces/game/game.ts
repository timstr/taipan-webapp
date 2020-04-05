import { GameState, DefaultGameState } from "./state";
import { updateGameState } from "./update";
import { Emitter } from "../Emitter";
import { PlayerAction } from "./actions";

export type GameStateHandler = (state: GameState) => void;

export class Game {
    constructor() {
        this.state = DefaultGameState;
        this.updateEmitter = new Emitter();
    }

    getGameState(): GameState {
        // TODO: hmmm
        // return clone(this.state);
        return this.state;
    }

    replaceGameState(newState: GameState) {
        this.state = newState;
        this.updateEmitter.emit(this.state);
    }

    update(action: PlayerAction) {
        this.state = updateGameState(this.state, action);
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
