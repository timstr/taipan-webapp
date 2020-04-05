import * as React from "react";
import { GameStateScorePhaseView } from "../interfaces/game/stateview";
import { ActionProvider } from "./MessageContext";
import { PlayerHandScorePhase } from "../interfaces/game/state";
import { CardUI } from "./CardUI";
import { RelativePlayerPosition } from "../interfaces/game/position";
import { readyToPlayAgainAction } from "../interfaces/game/actions/scorephase";
import { Header } from "./Header";
import { MainContent } from "./MainContent";

interface PlayerHandProps {
    readonly player: PlayerHandScorePhase;
    readonly position: RelativePlayerPosition | "You";
}

const PlayerHandUI = (props: PlayerHandProps) => (
    <div className="player-hand-score-phase">
        <h3>
            {props.player.profile.name}{" "}
            <em>
                ({props.position === "Opposite" ? "Partner" : props.position})
            </em>
        </h3>
        <div className="player-hand-score-phase-cards">
            {props.player.cards.cards.map((c, j) => (
                <div className="player-card-score-phase">
                    <CardUI
                        key={j}
                        card={c}
                        size={props.position === "You" ? "large" : "medium"}
                    />
                </div>
            ))}
        </div>
    </div>
);

interface ScorePhaseProps {
    readonly gameState: GameStateScorePhaseView;
}

export const ScorePhaseUI = (props: ScorePhaseProps) => {
    const s = props.gameState;
    const playAgain = s.yourHand.readyToPlayAgain;
    return (
        <ActionProvider>
            {(doAction) => (
                <MainContent backdrop="floor_and_scylla">
                    <Header
                        name={s.yourHand.profile.name}
                        phase={s.phase}
                        position={s.yourHand.profile.position}
                    />
                    <div className="other-hands-score-phase">
                        <PlayerHandUI player={s.leftOpponent} position="Left" />
                        <PlayerHandUI player={s.partner} position="Opposite" />
                        <PlayerHandUI
                            player={s.rightOpponent}
                            position="Right"
                        />
                    </div>
                    <PlayerHandUI player={s.yourHand} position="You" />
                    <div className="button-and-check-mark">
                        <button
                            onClick={() => doAction(readyToPlayAgainAction())}
                        >
                            I want to play again
                        </button>
                        {playAgain ? "✔" : null}
                    </div>
                </MainContent>
            )}
        </ActionProvider>
    );
};
