import * as React from "react";
import { ScorePhaseSpectatorView } from "../../interfaces/game/view/spectatorview";
import { MainContent } from "../MainContent";
import { Header } from "../Header";
import { ScorePhaseTag } from "../../interfaces/game/state/state";
import { OtherPlayerScoreUI } from "../PlayerScoreUI";

interface Props {
    readonly gameState: ScorePhaseSpectatorView;
}

export const ScorePhaseUI = (props: Props) => {
    const s = props.gameState;
    return (
        <MainContent backdrop="floor_and_scylla">
            <Header phase={ScorePhaseTag} />

            <div className="other-hands-score-phase">
                <OtherPlayerScoreUI
                    player={s.players.north}
                    positionTitle="North"
                />
                <OtherPlayerScoreUI
                    player={s.players.south}
                    positionTitle="South"
                />
                <OtherPlayerScoreUI
                    player={s.players.east}
                    positionTitle="East"
                />
                <OtherPlayerScoreUI
                    player={s.players.west}
                    positionTitle="West"
                />
            </div>
        </MainContent>
    );
};
