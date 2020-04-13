import * as React from "react";
import { JoinPhaseView } from "../../interfaces/game/view/stateview";
import { WithAction } from "../MessageContext";
import {
    playerChoseNameAction,
    playerIsReadyAction,
} from "../../interfaces/game/actions/joinphase";
import { TextField } from "../TextField";
import { Header } from "../Header";
import { MainContent } from "../MainContent";
import { AllPendingPlayersUI } from "../PendingPlayersUI";

const ChooseNameUI = () => (
    <WithAction>
        {(doAction) => (
            <TextField
                submitButton
                placeHolder="Enter your name"
                onSubmit={(s) => doAction(playerChoseNameAction(s))}
            />
        )}
    </WithAction>
);

interface ReadyButtonProps {
    readonly enabled: boolean;
    readonly ready: boolean;
}

const ReadyButton = (props: ReadyButtonProps) => {
    return (
        <WithAction>
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
        </WithAction>
    );
};

interface Props {
    readonly gameState: JoinPhaseView;
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
            <AllPendingPlayersUI
                players={s.players}
                yourPosition={s.yourPosition}
                spectating={false}
            />
        </MainContent>
    );
};
