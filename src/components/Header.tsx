import * as React from "react";
import { GamePhase } from "../interfaces/game/state";
import { PlayerPosition } from "../interfaces/game/position";

interface HeaderProps {
    readonly phase: GamePhase;
    readonly name?: string;
    readonly position?: PlayerPosition;
}

const prettyPhaseName = (phase: GamePhase): string => {
    switch (phase) {
        case "Join":
            return "Join The Game";
        case "Pass":
            return "Pass Cards";
        case "Play":
            return "Play";
        case "Score":
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
