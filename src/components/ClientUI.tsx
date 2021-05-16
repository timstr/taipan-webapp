import * as React from "react";
import {
    GameStateView,
    DefaultGameStateView,
    PlayerViewTag,
} from "../interfaces/game/view/stateview";
import { GameClient } from "../gameclient";
import { MessageContext } from "./MessageContext";
import { MainContent } from "./MainContent";
import { ClientMessage } from "../interfaces/messages/clientmessages";
import {
    GameStateSpectatorView,
    SpectatorViewTag,
} from "../interfaces/game/view/spectatorview";
import { PlayerUI } from "./player/PlayerUI";
import { SpectatorUI } from "./spectator/SpectatorUI";
import {
    JoinFailureReason,
    JoinFailedBecauseFull,
    JoinFailedBecauseWrongPassword,
    JoinFailedBecauseBanned,
} from "../interfaces/messages/servermessages";
import { EnterPasswordUI } from "./modal/EnterPasswordUI";
import { WrongPasswordUI } from "./modal/WrongPasswordUI";
import { GameIsFullUI } from "./modal/GameIsFullUI";
import { KickWarningUI } from "./modal/KickWarningUI";
import { YouWereKickedUI } from "./modal/YouWereKickedUI";
import { YouAreBannedUI } from "./modal/YouAreBannedUI";

const HOSTNAME = `${window.location.host}`;

interface Props {}

type ModalUIState =
    | "EnterPassword"
    | "WrongPassword"
    | "KickWarning"
    | "YouWereKicked"
    | "YouAreBanned"
    | "GameIsFull";

type ConnectionStatus = "Loading" | "Connected" | "Disconnected";

type ViewOfGame = GameStateView | GameStateSpectatorView;

interface State {
    readonly gameState: ViewOfGame;
    readonly connection: ConnectionStatus;
    readonly modalState: ModalUIState | null;
}

export class ClientUI extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            gameState: DefaultGameStateView,
            connection: "Loading",
            modalState: null,
        };

        this.client = new GameClient(HOSTNAME);

        this.client.onConnect.addListener(this.onConnectHandler);
        this.client.onDisconnect.addListener(this.onDisconnectHandler);
        this.client.onJoinedGame.addListener(this.onJoinedGameHandler);
        this.client.onCouldntJoinGame.addListener(this.onJoinFailedHandler);
        this.client.onKickWarning.addListener(this.onKickWarningHandler);
        this.client.onKick.addListener(this.onKickHandler);
    }

    componentDidMount() {
        this.client.gameStateViewChanged.addListener(this.onUpdateState);
    }

    componentWillUnmount() {
        this.client.gameStateViewChanged.removeListener(this.onUpdateState);
    }

    private client: GameClient;

    private onUpdateState = (newState: ViewOfGame) => {
        this.setState({ gameState: newState });
    };

    private sendMessageHandler = (message: ClientMessage) => {
        this.client.sendMessage(message);
    };

    private onJoinedGameHandler = (newState: ViewOfGame) => {
        this.hideModalUI();
        this.onUpdateState(newState);
    };

    private onJoinFailedHandler = (reason: JoinFailureReason) => {
        switch (reason) {
            case JoinFailedBecauseFull:
                this.setState({ modalState: "GameIsFull" });
                return;
            case JoinFailedBecauseWrongPassword:
                this.setState({ modalState: "WrongPassword" });
                return;
            case JoinFailedBecauseBanned:
                this.setState({ modalState: "YouAreBanned" });
                return;
        }
    };

    private onConnectHandler = () => {
        this.setState({ connection: "Connected" });
    };

    private onDisconnectHandler = () => {
        if (this.state.modalState !== "YouWereKicked") {
            this.setState({ connection: "Disconnected", modalState: null });
        }
    };

    private showEnterPassword = () => {
        this.setState({ modalState: "EnterPassword" });
    };
    private onKickWarningHandler = () => {
        this.setState({ modalState: "KickWarning" });
    };

    private onKickHandler = () => {
        this.setState({ modalState: "YouWereKicked" });
    };

    private hideModalUI = () => {
        this.setState({ modalState: null });
    };

    private renderModalUI() {
        switch (this.state.modalState) {
            case "EnterPassword":
                return <EnterPasswordUI onCancel={this.hideModalUI} />;
            case "WrongPassword":
                return <WrongPasswordUI onAccept={this.hideModalUI} />;
            case "GameIsFull":
                return <GameIsFullUI onAccept={this.hideModalUI} />;
            case "KickWarning":
                return <KickWarningUI onAccept={this.hideModalUI} />;
            case "YouWereKicked":
                return <YouWereKickedUI />;
            case "YouAreBanned":
                return <YouAreBannedUI onAccept={this.hideModalUI} />;
        }
    }

    private renderUIPhase() {
        const s = this.state.gameState;
        if (this.state.connection === "Loading") {
            return (
                <MainContent backdrop="tin_and_decks">
                    <p>Loading...</p>
                </MainContent>
            );
        }
        if (this.state.connection === "Disconnected") {
            return (
                <MainContent backdrop="scattered_cards">
                    <h1>Disconnected</h1>
                    <hr />
                    <div className="disconnected-main">
                        <p>
                            Please reload the page or ask Tim to restart the
                            server.
                        </p>
                    </div>
                </MainContent>
            );
        }
        switch (s.view) {
            case PlayerViewTag:
                return <PlayerUI state={s} />;
            case SpectatorViewTag:
                return (
                    <SpectatorUI
                        state={s}
                        requestJoin={this.showEnterPassword}
                    />
                );
        }
    }

    render() {
        return (
            <MessageContext.Provider value={this.sendMessageHandler}>
                {this.renderUIPhase()}
                {this.renderModalUI()}
            </MessageContext.Provider>
        );
    }
}
