import * as React from "react";
import {
    GameStateView,
    DefaultGameStateView,
} from "../interfaces/game/stateview";
import { GameClient } from "../gameclient";
import { JoinPhaseUI } from "./JoinPhaseUI";
import { PhassPhaseUI as PassPhaseUI } from "./PassPhaseUI";
import { PlayPhaseUI } from "./PlayPhaseUI";
import { MessageContext } from "./MessageContext";
import { ClientMessage } from "../messages";
import { ScorePhaseUI } from "./ScorePhaseUI";
import { MainContent } from "./MainContent";

const HOSTNAME = `wss://${window.location.host}`;

interface Props {}

type ConnectionStatus = "Loading" | "Connected" | "Disconnected";

interface State {
    readonly gameState: GameStateView;
    readonly connection: ConnectionStatus;
}

export class ClientUI extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            gameState: DefaultGameStateView,
            connection: "Loading",
        };

        this.client = new GameClient(HOSTNAME);

        this.client.onConnect.addListener(this.onConnectHandler);
        this.client.onDisconnect.addListener(this.onDisconnectHandler);
    }

    componentDidMount() {
        this.client.gameStateViewChanged.addListener(this.onUpdateState);
    }

    componentWillUnmount() {
        this.client.gameStateViewChanged.removeListener(this.onUpdateState);
    }

    private client: GameClient;

    private onUpdateState = (newState: GameStateView) => {
        this.setState({ gameState: newState });
    };

    private sendMessageHandler = (message: ClientMessage) => {
        this.client.sendMessage(message);
    };

    private onConnectHandler = () => {
        this.setState({ connection: "Connected" });
    };

    private onDisconnectHandler = () => {
        this.setState({ connection: "Disconnected" });
    };

    renderUIPhase() {
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
                    <p>
                        Please reload the page or ask Tim to restart the server.
                    </p>
                </MainContent>
            );
        }
        switch (s.phase) {
            case "Join":
                return <JoinPhaseUI gameState={s} />;
            case "Pass":
                return <PassPhaseUI gameState={s} />;
            case "Play":
                return <PlayPhaseUI gameState={s} />;
            case "Score":
                return <ScorePhaseUI gameState={s} />;
        }
    }

    render() {
        return (
            <MessageContext.Provider value={this.sendMessageHandler}>
                {this.renderUIPhase()}
            </MessageContext.Provider>
        );
    }
}
