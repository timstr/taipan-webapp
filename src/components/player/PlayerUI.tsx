import * as React from "react";
import { GameStateView } from "../../interfaces/game/view/stateview";
import { JoinPhaseUI } from "./JoinPhaseUI";
import { PassPhaseUI } from "./PassPhaseUI";
import { PlayPhaseUI } from "./PlayPhaseUI";
import { ScorePhaseUI } from "./ScorePhaseUI";
import {
    DealPhaseTag,
    JoinPhaseTag,
    PassPhaseTag,
    PlayPhaseTag,
    ScorePhaseTag,
} from "../../interfaces/game/state/state";
import { DealPhaseUI } from "./DealPhaseUI";

interface Props {
    readonly state: GameStateView;
    readonly offsetX: number;
    readonly offsetY: number;
}

export const PlayerUI = React.forwardRef<HTMLDivElement, Props>(
    (props, ref) => {
        const s = props.state;
        switch (s.phase) {
            case JoinPhaseTag:
                return <JoinPhaseUI gameState={s} />;
            case DealPhaseTag:
                return <DealPhaseUI gameState={s} />;
            case PassPhaseTag:
                return <PassPhaseUI gameState={s} />;
            case PlayPhaseTag:
                return (
                    <PlayPhaseUI
                        gameState={s}
                        offsetX={props.offsetX}
                        offsetY={props.offsetY}
                        ref={ref}
                    />
                );
            case ScorePhaseTag:
                return <ScorePhaseUI gameState={s} />;
        }
    }
);
