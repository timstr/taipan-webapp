import * as React from "react";
import { PlayPhasePlayerView } from "./interfaces/game/view/stateview";
import { PileOfCards } from "./components/CardUI";

interface Props {
    readonly positionTitle: string;
    readonly player: PlayPhasePlayerView;
    readonly facing: "Up" | "Down";
}

export const OtherPlayerPlayingUI = (props: Props) => {
    const inHand = props.player.cardsInHand - props.player.cardsStaged;
    const staged = props.player.cardsStaged;
    const elems = [
        <>
            <h3>{props.player.profile.name}</h3>
            <h4>
                <em>{props.positionTitle}</em>
            </h4>
        </>,
        <hr />,
        <>
            <h5>Tricks Won</h5>
            <PileOfCards
                cards={props.player.cardsWon}
                type="Heap"
                size="small"
            />
        </>,
        <>
            <h4>Hand</h4>
            <PileOfCards cards={inHand} type="Overlapping" size="small" />
        </>,
        <>
            <h4>Staged</h4>
            <PileOfCards cards={staged} type="SideBySide" size="small" />
        </>,
    ];
    return (
        <div className="other-player-play-phase">
            {props.facing === "Down" ? elems : elems.reverse()}
        </div>
    );
};
