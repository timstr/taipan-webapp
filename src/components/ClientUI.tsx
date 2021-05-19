import * as React from "react";
import {
    DefaultGameStateView,
    PlayerViewTag,
} from "../interfaces/game/view/stateview";
import { GameClient } from "../gameclient";
import { MessageContext } from "./MessageContext";
import { MainContent } from "./MainContent";
import { ClientMessage } from "../interfaces/messages/clientmessages";
import { SpectatorViewTag } from "../interfaces/game/view/spectatorview";
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
import {
    ViewOfGame,
    aBombWasJustPlayed,
} from "../interfaces/game/view/viewofgame";
import { Explosion } from "./explosion";

const HOSTNAME = window.location.host;
const IS_SECURE = window.location.protocol === "https:";

interface Props {}

type ModalUIState =
    | "EnterPassword"
    | "WrongPassword"
    | "KickWarning"
    | "YouWereKicked"
    | "YouAreBanned"
    | "GameIsFull";

type ConnectionStatus = "Loading" | "Connected" | "Disconnected";

interface State {
    readonly gameState: ViewOfGame;
    readonly connection: ConnectionStatus;
    readonly modalState: ModalUIState | null;
    readonly explosionProgress: number | null;
    readonly explosionSeed: number;
    readonly explosionCenterX: number;
    readonly explosionCenterY: number;
}

export class ClientUI extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            gameState: DefaultGameStateView,
            connection: "Loading",
            modalState: null,
            explosionProgress: null,
            explosionSeed: 0.0,
            explosionCenterX: 0.0,
            explosionCenterY: 0.0,
        };

        this.client = new GameClient(HOSTNAME, IS_SECURE);

        this.client.onConnect.addListener(this.onConnectHandler);
        this.client.onDisconnect.addListener(this.onDisconnectHandler);
        this.client.onJoinedGame.addListener(this.onJoinedGameHandler);
        this.client.onCouldntJoinGame.addListener(this.onJoinFailedHandler);
        this.client.onKickWarning.addListener(this.onKickWarningHandler);
        this.client.onKick.addListener(this.onKickHandler);

        this.trickRef = React.createRef();
    }

    trickRef: React.RefObject<HTMLDivElement>;

    componentDidMount() {
        this.client.gameStateViewChanged.addListener(this.onUpdateState);
    }

    componentWillUnmount() {
        this.client.gameStateViewChanged.removeListener(this.onUpdateState);
    }

    private client: GameClient;

    private onUpdateState = (newState: ViewOfGame) => {
        if (aBombWasJustPlayed(this.state.gameState, newState)) {
            this.startExplosion();
        }
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

    private startExplosion = () => {
        this.setState({
            explosionProgress: null,
            explosionSeed: Math.random(),
        });
        this.updateExplosionCenter();
        requestAnimationFrame(this.updateExplosion);
    };

    private updateExplosion = () => {
        const p = this.state.explosionProgress;
        const newP = p === null ? 0.0 : p + 0.02;
        if (newP < 1.0) {
            this.setState({ explosionProgress: newP });
            this.updateExplosionCenter();
            requestAnimationFrame(this.updateExplosion);
        } else {
            this.setState({ explosionProgress: null });
        }
    };

    private updateExplosionCenter = () => {
        const [x, y] = (() => {
            if (this.trickRef.current) {
                const e = this.trickRef.current;
                const vpo = e.getBoundingClientRect();
                return [vpo.left + 0.5 * vpo.width, vpo.top + 0.5 * vpo.height];
            }
            return [0.0, 0.0];
        })();

        this.setState({
            explosionCenterX: x,
            explosionCenterY: y,
        });
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

    private randomShakeOffset(progress: number | null): number {
        if (progress === null) {
            return 0.0;
        }
        const mag = 50.0 * Math.exp(-3.0 * progress);
        return mag * (-1.0 + 2.0 * Math.random());
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
        const dx = this.randomShakeOffset(this.state.explosionProgress);
        const dy = this.randomShakeOffset(this.state.explosionProgress);
        const maybeExplosion = () => {
            const t = this.state.explosionProgress;
            if (t !== null) {
                return (
                    <Explosion
                        offsetX={dx}
                        offsetY={dy}
                        progress={t}
                        centerX={this.state.explosionCenterX} // TODO: center on trick
                        centerY={this.state.explosionCenterY} // TODO: center on trick
                        seed={this.state.explosionSeed}
                        numParticles={15}
                    />
                );
            }
            return null;
        };
        switch (s.view) {
            case PlayerViewTag:
                return (
                    <>
                        {maybeExplosion()}
                        <PlayerUI
                            state={s}
                            offsetX={dx}
                            offsetY={dy}
                            ref={this.trickRef}
                        />
                    </>
                );
            case SpectatorViewTag:
                return (
                    <>
                        {maybeExplosion()}
                        <SpectatorUI
                            state={s}
                            requestJoin={this.showEnterPassword}
                            offsetX={dx}
                            offsetY={dy}
                        />
                    </>
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
