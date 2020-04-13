import * as React from "react";
import { GameStateSpectatorView } from "../../interfaces/game/view/spectatorview";
import {
    JoinPhaseTag,
    PassPhaseTag,
    PlayPhaseTag,
    ScorePhaseTag,
    DealPhaseTag,
} from "../../interfaces/game/state/state";
import { JoinPhaseUI } from "./JoinPhaseUI";
import { PassPhaseUI } from "./PassPhaseUI";
import { PlayPhaseUI } from "./PlayPhaseUI";
import { ScorePhaseUI } from "./ScorePhaseUI";
import { DealPhaseUI } from "./DealPhaseUI";

interface Props {
    readonly state: GameStateSpectatorView;
    readonly requestJoin: () => void;
}

export const SpectatorUI = (props: Props) => {
    const s = props.state;
    switch (s.phase) {
        case JoinPhaseTag:
            return (
                <JoinPhaseUI gameState={s} requestJoin={props.requestJoin} />
            );
        case DealPhaseTag:
            return <DealPhaseUI gameState={s} />;
        case PassPhaseTag:
            return <PassPhaseUI gameState={s} />;
        case PlayPhaseTag:
            return <PlayPhaseUI gameState={s} />;
        case ScorePhaseTag:
            return <ScorePhaseUI gameState={s} />;
    }
};
