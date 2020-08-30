import * as https from "https";
import { SocketServer } from "./socketserver";
import { Game } from "./interfaces/game/game";
import {
    playerJoinedAction,
    playerDisconnectedAction,
} from "./interfaces/game/actions/joinphase";
import { playerAction } from "./interfaces/game/actions/createaction";
import {
    ClientMessage,
    PLAYER_DID_ACTION,
} from "./interfaces/messages/clientmessages";
import { PlayerIndex } from "./interfaces/game/player/player";

export class GameServer {
    constructor(httpServer: https.Server) {
        this.socketServer = new SocketServer(httpServer, () =>
            this.getGame().getGameState()
        );
        this.game = new Game();

        this.socketServer.playerJoined.addListener(this.onPlayerJoined);

        this.socketServer.playerDisconnected.addListener(
            this.onPlayerDisconnected
        );

        this.socketServer.playerSentMessage.addListener(
            this.onPlayerSentMessage
        );

        this.game.onUpdate((st) => this.socketServer.broadcastUpdatedState(st));
    }

    getGame(): Game {
        return this.game;
    }

    close() {
        this.socketServer.close();
    }

    private socketServer: SocketServer;
    private game: Game;

    private onPlayerJoined = (idx: PlayerIndex) => {
        this.game.update(playerAction(idx, playerJoinedAction()));
    };

    private onPlayerDisconnected = (idx: PlayerIndex) => {
        this.game.update(playerAction(idx, playerDisconnectedAction()));
    };

    private onPlayerSentMessage = (
        idx: PlayerIndex,
        message: ClientMessage
    ) => {
        if (message.type === PLAYER_DID_ACTION) {
            this.game.update(playerAction(idx, message.payload.action));
        }
    };
}
