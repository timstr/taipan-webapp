import * as React from "react";
import {
    GamePhase,
    JoinPhaseTag,
    PassPhaseTag,
    PlayPhaseTag,
    ScorePhaseTag,
    DealPhaseTag,
} from "../interfaces/game/state/state";
import { PlayerPosition } from "../interfaces/game/player/position";

interface HeaderProps {
    readonly phase: GamePhase;
    readonly name?: string;
    readonly position?: PlayerPosition;
}

const prettyPhaseName = (phase: GamePhase): string => {
    switch (phase) {
        case JoinPhaseTag:
            return "Join The Game";
        case DealPhaseTag:
            return "Take Your Cards";
        case PassPhaseTag:
            return "Pass Cards";
        case PlayPhaseTag:
            return "Play";
        case ScorePhaseTag:
            return "The Tai Pan gods have spoken.";
    }
};

export const Header = (props: HeaderProps) => (
    <div className="game-header">
        <h2 className="game-header-phase">{prettyPhaseName(props.phase)}</h2>
        {props.name ? (
            <h3 className="game-header-name">
                <em>
                    Playing as <strong>{props.name}</strong>
                    {props.position ? (
                        <>
                            , located <strong>{props.position}</strong>
                        </>
                    ) : null}
                </em>
            </h3>
        ) : null}
        <hr />
    </div>
);
