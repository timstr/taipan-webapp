import * as React from "react";
import { GameStateJoinPhaseView } from "../interfaces/game/stateview";
import { PendingPlayer } from "../interfaces/game/state";
import { PlayerPosition } from "../interfaces/game/position";
import { ActionProvider } from "./MessageContext";
import {
    playerChosePositionAction,
    playerChoseNameAction,
    playerIsReadyAction,
} from "../interfaces/game/actions/joinphase";
import { TextField } from "./TextField";
import { Header } from "./Header";
import { MainContent } from "./MainContent";

interface ClaimedPositionProps {
    readonly name?: string;
    readonly isYou: boolean;
    readonly ready: boolean;
}

const ClaimedPositionUI = (props: ClaimedPositionProps) => {
    return (
        <ActionProvider>
            {(doAction) => (
                <div className="claimed-position">
                    <p>
                        Chosen by: {props.name || <em>Unnamed Player</em>}
                        {props.isYou ? " (You)" : ""}
                        {props.ready ? " (✔ Ready)" : ""}
                    </p>
                    {props.isYou ? (
                        <button
                            onClick={() =>
                                doAction(playerChosePositionAction(null))
                            }
                        >
                            Give Up
                        </button>
                    ) : null}
                </div>
            )}
        </ActionProvider>
    );
};

interface UnclaimedPositionProps {
    readonly position: PlayerPosition;
}

const UnclaimedPositionUI = (props: UnclaimedPositionProps) => (
    <ActionProvider>
        {(doAction) => (
            <div className="unclaimed-position">
                <p>Unclaimed</p>
                <button
                    onClick={() =>
                        doAction(playerChosePositionAction(props.position))
                    }
                >
                    Claim
                </button>
            </div>
        )}
    </ActionProvider>
);

interface PendingPlayerProps {
    readonly player: PendingPlayer;
    readonly position: PlayerPosition;
    readonly you: PlayerPosition | null;
}

const PendingPlayerUI = (props: PendingPlayerProps) => (
    <div className="pending-player">
        <h3>{props.position}</h3>
        {props.player ? (
            <ClaimedPositionUI
                name={props.player.name}
                isYou={props.position === props.you}
                ready={props.player.ready}
            />
        ) : (
            <UnclaimedPositionUI position={props.position} />
        )}
    </div>
);

const ChooseNameUI = () => (
    <ActionProvider>
        {(doAction) => (
            <TextField
                submitButton
                placeHolder="Enter your name"
                onSubmit={(s) => doAction(playerChoseNameAction(s))}
            />
        )}
    </ActionProvider>
);

interface ReadyButtonProps {
    readonly enabled: boolean;
    readonly ready: boolean;
}

const ReadyButton = (props: ReadyButtonProps) => {
    return (
        <ActionProvider>
            {(doAction) => (
                <div className="button-and-check-mark">
                    <button
                        onClick={() => doAction(playerIsReadyAction())}
                        disabled={!props.enabled}
                    >
                        I'm Ready
                    </button>
                    {props.ready ? "✔" : null}
                </div>
            )}
        </ActionProvider>
    );
};

interface Props {
    readonly gameState: GameStateJoinPhaseView;
}

export const JoinPhaseUI = (props: Props) => {
    const s = props.gameState;
    const enableReady =
        props.gameState.yourName !== null &&
        props.gameState.yourPosition !== null;
    return (
        <MainContent backdrop="tin_and_decks">
            <Header
                name={s.yourName || undefined}
                phase={s.phase}
                position={s.yourPosition || undefined}
            />
            <div className="join-phase-form">
                <h3>Your position</h3>
                <p>{s.yourPosition || <em>Not yet chosen</em>}</p>
                <h3>Your name</h3>
                <div>
                    <p>{s.yourName || <em>Not yet chosen</em>}</p>
                    <ChooseNameUI />
                </div>
                <ReadyButton enabled={enableReady} ready={s.youAreReady} />
            </div>
            <div className="all-pending-players">
                <PendingPlayerUI
                    player={s.north}
                    position="North"
                    you={s.yourPosition}
                />
                <PendingPlayerUI
                    player={s.south}
                    position="South"
                    you={s.yourPosition}
                />
                <PendingPlayerUI
                    player={s.east}
                    position="East"
                    you={s.yourPosition}
                />
                <PendingPlayerUI
                    player={s.west}
                    position="West"
                    you={s.yourPosition}
                />
            </div>
        </MainContent>
    );
};
