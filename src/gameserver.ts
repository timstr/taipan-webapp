import * as https from "https";
import { SocketServer } from "./socketserver";
import { Game } from "./interfaces/game/game";
import {
    playerJoinedAction,
    playerLeftAction,
} from "./interfaces/game/actions/joinphase";
import {
    PlayerIndex,
    GameState,
    AllPlayerIndices,
} from "./interfaces/game/state";
import { viewGameState } from "./interfaces/game/stateview";
import {
    ServerMessage,
    updatedStateMessage,
    ClientMessage,
    PlayerAction,
} from "./messages";
import { playerAction } from "./interfaces/game/actions/createaction";

export class GameServer {
    constructor(httpServer: https.Server) {
        this.socketServer = new SocketServer(httpServer);
        this.game = new Game();

        this.socketServer.onPlayerJoined(this.handlePlayerJoined);

        this.socketServer.onPlayerLeft(this.handlePlayerLeft);

        this.socketServer.onPlayerSentMessage(this.handlePlayerSentMessage);

        this.game.onUpdate(this.handleGameUpdate);
    }

    getGame(): Game {
        return this.game;
    }

    close() {
        this.socketServer.close();
    }

    private socketServer: SocketServer;
    private game: Game;

    private handlePlayerJoined = (idx: PlayerIndex) => {
        this.game.update(playerAction(idx, playerJoinedAction()));
    };

    private handlePlayerLeft = (idx: PlayerIndex) => {
        this.game.update(playerAction(idx, playerLeftAction()));
    };

    private handlePlayerSentMessage = (
        idx: PlayerIndex,
        message: ClientMessage
    ) => {
        try {
            const success = ((): boolean => {
                switch (message.type as ClientMessage["type"]) {
                    case PlayerAction: {
                        this.game.update(playerAction(idx, message.payload));
                        return true;
                    }
                }
            })();
            if (success === undefined) {
                console.error(
                    `Unknown message type from player ${idx}: "${
                        message.type
                    }", encountered in message "${JSON.stringify(message)}"`
                );
            }
        } catch (e) {
            console.error(`Error while handling client message: ${e}`);
        }
    };

    private handleGameUpdate = (newstate: GameState) => {
        for (let i of AllPlayerIndices) {
            if (!this.socketServer.isPlayerConnected(i)) {
                continue;
            }
            this.sendMessageTo(
                i,
                updatedStateMessage(viewGameState(newstate, i))
            );
        }
    };

    private sendMessageTo(player: PlayerIndex, message: ServerMessage) {
        this.socketServer.sendPlayerMessage(player, message);
    }
}
