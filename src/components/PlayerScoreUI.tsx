import * as React from "react";
import { ScorePhasePlayer } from "../interfaces/game/playerstate";
import { CardUI } from "./CardUI";

interface OtherPlayerScoreProps {
    readonly player: ScorePhasePlayer;
    readonly positionTitle: string;
    readonly isYou?: boolean;
}

export const OtherPlayerScoreUI = (props: OtherPlayerScoreProps) => (
    <div className="player-hand-score-phase">
        <h3>
            {props.player.profile.name} <em>({props.positionTitle})</em>
        </h3>
        <div className="player-hand-score-phase-cards">
            {props.player.cards.cards.map((c, j) => (
                <div className="player-card-score-phase">
                    <CardUI
                        key={j}
                        card={c}
                        size={props.isYou ? "large" : "medium"}
                    />
                </div>
            ))}
        </div>
    </div>
);
