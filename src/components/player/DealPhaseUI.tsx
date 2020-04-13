import * as React from "react";
import { DealPhaseView } from "../../interfaces/game/view/stateview";
import { MainContent } from "../MainContent";
import { Header } from "../Header";
import { DealPhaseTag } from "../../interfaces/game/state/state";
import { OtherPlayerDealUI } from "../OtherPlayerDealUI";
import { PileOfCards } from "../CardUI";
import { WithAction } from "../MessageContext";
import { takeSecondDealAction } from "../../interfaces/game/actions/dealphase";

const TakeSecondDealButton = () => (
    <WithAction>
        {(doAction) => (
            <button onClick={() => doAction(takeSecondDealAction())}>
                Take Second Deal
            </button>
        )}
    </WithAction>
);

interface Props {
    readonly gameState: DealPhaseView;
}

export const DealPhaseUI = (props: Props) => {
    const s = props.gameState;
    return (
        <MainContent backdrop="floor">
            <Header
                phase={DealPhaseTag}
                name={s.you.name}
                position={s.you.position}
            />
            <div className="other-players-deal-phase">
                <OtherPlayerDealUI
                    player={s.others.leftOpponent}
                    positionTitle="Left Opponent"
                    facing="Down"
                />
                <OtherPlayerDealUI
                    player={s.others.partner}
                    positionTitle="Partner"
                    facing="Down"
                />
                <OtherPlayerDealUI
                    player={s.others.rightOpponent}
                    positionTitle="Right Opponent"
                    facing="Down"
                />
            </div>
            <div className="your-hand-deal-phase">
                <div className="your-hand-deal-phase-cards">
                    <h3>Your Hand</h3>
                    <PileOfCards
                        cards={s.yourHand}
                        type="SideBySide"
                        size="large"
                    />
                </div>
                {s.cardsRemaining > 0 ? (
                    <div className="your-hand-deal-phase-remaining">
                        <PileOfCards
                            cards={s.cardsRemaining}
                            type="Overlapping"
                            size="large"
                        />
                        <br />
                        <TakeSecondDealButton />
                    </div>
                ) : null}
            </div>
        </MainContent>
    );
};
