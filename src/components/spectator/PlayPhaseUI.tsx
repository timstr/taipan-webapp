import * as React from "react";
import { PlayPhaseSpectatorView } from "../../interfaces/game/view/spectatorview";
import { MainContent } from "../MainContent";
import { Header } from "../Header";
import { PlayPhaseTag } from "../../interfaces/game/state/state";
import { RowsOfCards } from "../CardUI";
import { OtherPlayerPlayingUI } from "../OtherPlayerPlayingUI";

interface Props {
    readonly gameState: PlayPhaseSpectatorView;
    readonly offsetX: number;
    readonly offsetY: number;
}

export const PlayPhaseUI = (props: Props) => {
    const s = props.gameState;
    return (
        <MainContent
            backdrop="floor"
            offsetX={props.offsetX}
            offsetY={props.offsetY}
        >
            <Header phase={PlayPhaseTag} />
            <div className="other-hands-play-phase">
                <OtherPlayerPlayingUI
                    positionTitle="North"
                    player={s.players.north}
                    facing="Down"
                />
                <OtherPlayerPlayingUI
                    positionTitle="East"
                    player={s.players.east}
                    facing="Down"
                />
            </div>
            <div className="current-trick">
                <h3>Current Trick</h3>
                <RowsOfCards
                    stacks={s.currentTrick}
                    size="medium"
                    rowStyle="Overlapping"
                    namesToShow={s.playerMapping}
                />
            </div>
            <div className="other-hands-play-phase">
                <OtherPlayerPlayingUI
                    positionTitle="West"
                    player={s.players.west}
                    facing="Up"
                />
                <OtherPlayerPlayingUI
                    positionTitle="South"
                    player={s.players.south}
                    facing="Up"
                />
            </div>
        </MainContent>
    );
};
