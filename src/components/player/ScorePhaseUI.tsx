import * as React from "react";
import { ScorePhaseView } from "../../interfaces/game/view/stateview";
import { WithAction } from "../MessageContext";
import { readyToPlayAgainAction } from "../../interfaces/game/actions/scorephase";
import { Header } from "../Header";
import { MainContent } from "../MainContent";
import { OtherPlayerScoreUI as PlayerScoreUI } from "../PlayerScoreUI";
import { ScorePhasePlayer } from "../../interfaces/game/playerstate";

interface ScorePhaseProps {
    readonly gameState: ScorePhaseView;
}

export const ScorePhaseUI = (props: ScorePhaseProps) => {
    const s = props.gameState;
    const playAgain = s.you.readyToPlayAgain;
    let readyPlayers: string[] = [];
    const countPlayer = (p: ScorePhasePlayer) => {
        if (p.readyToPlayAgain) {
            readyPlayers.push(p.profile.name);
        }
    };
    countPlayer(s.others.leftOpponent);
    countPlayer(s.others.partner);
    countPlayer(s.others.rightOpponent);
    const readyPlayersMessage = (() => {
        switch (readyPlayers.length) {
            case 0:
                return "No others are ready to play again.";
            case 1:
                return `${readyPlayers[0]} is ready to play again`;
            case 2:
                return `${readyPlayers[0]} and ${readyPlayers[1]} are ready to play again`;
            default: {
                const lastIdx = readyPlayers.length - 1;
                const allButLast = readyPlayers.slice(0, lastIdx).join(", ");
                const last = readyPlayers[lastIdx];
                return `${allButLast}, and ${last} are ready to play again`;
            }
        }
    })();
    return (
        <WithAction>
            {(doAction) => (
                <MainContent backdrop="floor_and_scylla">
                    <Header
                        name={s.you.profile.name}
                        phase={s.phase}
                        position={s.you.profile.position}
                    />
                    <div className="other-hands-score-phase">
                        <PlayerScoreUI
                            player={s.others.leftOpponent}
                            positionTitle="Left Opponenet"
                        />
                        <PlayerScoreUI
                            player={s.others.partner}
                            positionTitle="Partner"
                        />
                        <PlayerScoreUI
                            player={s.others.rightOpponent}
                            positionTitle="Right Opponent"
                        />
                    </div>
                    <PlayerScoreUI player={s.you} positionTitle="You" isYou />
                    <div className="button-and-check-mark">
                        <p>{readyPlayersMessage}</p>
                        <button
                            onClick={() => doAction(readyToPlayAgainAction())}
                        >
                            I want to play again
                        </button>
                        {playAgain ? "✔" : null}
                    </div>
                </MainContent>
            )}
        </WithAction>
    );
};
