import * as React from "react";
import { DealPhasePlayerView } from "../interfaces/game/view/stateview";
import { PileOfCards } from "./CardUI";

interface Props {
    readonly player: DealPhasePlayerView;
    readonly positionTitle: string;
    readonly facing: "Up" | "Down";
}

export const OtherPlayerDealUI = (props: Props) => {
    const p = props.player;
    const elems = [
        <>
            <h3>{props.player.profile.name}</h3>
            <h4>
                <em>{props.positionTitle}</em>
            </h4>
        </>,
        <hr />,
        <>
            <h4>Hand</h4>
            <PileOfCards
                cards={p.cardsInHand}
                type="Overlapping"
                size="small"
            />
            {p.cardsNotTaken > 0 ? (
                <>
                    <br />
                    <PileOfCards
                        cards={p.cardsNotTaken}
                        type="Heap"
                        size="small"
                    />
                </>
            ) : null}
        </>,
    ];
    return (
        <div className="other-player-play-phase">
            {props.facing === "Down" ? elems : elems.reverse()}
        </div>
    );
};
