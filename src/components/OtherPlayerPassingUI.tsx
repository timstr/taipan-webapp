import * as React from "react";
import { PassPhasePlayerView } from "../interfaces/game/view/stateview";
import { PileOfCards } from "./CardUI";

interface OtherPlayerPassingProps {
    readonly player: PassPhasePlayerView;
    readonly positionTitle: string;
}

export const OtherPlayerPassing = (props: OtherPlayerPassingProps) => {
    const g = props.player.give;
    const n =
        (g.leftOpponent ? 1 : 0) +
        (g.partner ? 1 : 0) +
        (g.rightOpponent ? 1 : 0);
    return (
        <div className="other-player-passing">
            <h3>
                {props.player.profile.name} <em>({props.positionTitle})</em>
            </h3>
            <PileOfCards
                cards={props.player.cardsInHand}
                size="small"
                type="Overlapping"
            />
            <br />
            <PileOfCards cards={n} size="small" type="SideBySide" />
            {props.player.ready ? <p>✔ Ready</p> : null}
        </div>
    );
};
