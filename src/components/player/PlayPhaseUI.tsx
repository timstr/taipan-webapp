import * as React from "react";
import { PlayPhaseView } from "../../interfaces/game/view/stateview";
import { CardUI, PileOfCards, RowsOfCards } from "../CardUI";
import {
    Card,
    cardBelongsTo,
    countTripleStack,
    countDoubleStack,
    countStack,
} from "../../interfaces/cards";
import { WithAction } from "../MessageContext";
import {
    stageCardAction,
    playStagedCardsAction,
    unstageCardAction,
    reclaimLastPlayAction,
    takeTrickAction,
    putTrickBackAction,
} from "../../interfaces/game/actions/playphase";
import { Header } from "../Header";
import { MainContent } from "../MainContent";
import { OtherPlayerPlayingUI } from "../../OtherPlayerPlayingUI";

interface CardProps {
    readonly card: Card;
}

const StagedCard = (props: CardProps) => (
    <WithAction>
        {(doAction) => (
            <div className="staged-card-play-phase">
                <CardUI
                    card={props.card}
                    size="medium"
                    onClick={() => doAction(unstageCardAction(props.card))}
                />
                <br />
            </div>
        )}
    </WithAction>
);

interface CardInHandProps {
    readonly card: Card;
    readonly isStaged: boolean;
}

const CardInHand = (props: CardInHandProps) => (
    <WithAction>
        {(doAction) => (
            <div
                className="card-in-your-hand-play-phase"
                style={{ opacity: props.isStaged ? 0.33 : 1.0 }}
            >
                <CardUI
                    card={props.card}
                    size="large"
                    onClick={() =>
                        doAction(
                            props.isStaged
                                ? unstageCardAction(props.card)
                                : stageCardAction(props.card)
                        )
                    }
                />
                <br />
            </div>
        )}
    </WithAction>
);

const TakeTrickButton = () => (
    <WithAction>
        {(doAction) => (
            <button onClick={() => doAction(takeTrickAction())}>
                Take Trick
            </button>
        )}
    </WithAction>
);

const ReclaimLastPlayButton = () => (
    <WithAction>
        {(doAction) => (
            <button onClick={() => doAction(reclaimLastPlayAction())}>
                Reclaim Last Play
            </button>
        )}
    </WithAction>
);

const PlayStagedButton = () => (
    <WithAction>
        {(doAction) => (
            <button onClick={() => doAction(playStagedCardsAction())}>
                Play Staged Cards
            </button>
        )}
    </WithAction>
);

const PutTrickBackButton = () => (
    <WithAction>
        {(doAction) => (
            <button onClick={() => doAction(putTrickBackAction())}>
                Put Trick Back
            </button>
        )}
    </WithAction>
);

interface Props {
    readonly gameState: PlayPhaseView;
}

export const PlayPhaseUI = (props: Props) => {
    const s = props.gameState;
    const numCardsWon = countTripleStack(s.you.tricksWon);
    return (
        <MainContent backdrop="floor">
            <Header
                name={s.you.profile.name}
                phase={s.phase}
                position={s.you.profile.position}
            />
            <div className="other-hands-play-phase">
                <OtherPlayerPlayingUI
                    positionTitle="Left Opponent"
                    player={s.others.leftOpponent}
                    facing="Down"
                />
                <OtherPlayerPlayingUI
                    positionTitle="Partner"
                    player={s.others.partner}
                    facing="Down"
                />
                <OtherPlayerPlayingUI
                    positionTitle="Right Opponent"
                    player={s.others.rightOpponent}
                    facing="Down"
                />
            </div>
            <div className="current-trick">
                <h3>Current Trick</h3>
                <RowsOfCards
                    stacks={s.currentTrick}
                    size="medium"
                    rowStyle="Overlapping"
                />
                {countDoubleStack(s.currentTrick) > 0 ? (
                    <>
                        <br />
                        <TakeTrickButton />
                        <ReclaimLastPlayButton />
                    </>
                ) : null}
            </div>
            <div className="staging-area">
                <h3>Staging Area</h3>
                <div className="staging-area-cards">
                    {s.you.staged.cards.map((c, i) => (
                        <StagedCard key={i} card={c} />
                    ))}
                </div>
                {countStack(s.you.staged) > 0 ? <PlayStagedButton /> : null}
            </div>
            <div className="your-hand-play-phase">
                <h3>Your Hand</h3>
                <div className="your-cards-play-phase">
                    {s.you.inHand.cards.map((c, i) => (
                        <div key={i} className="card-in-hand-play-phase-inner">
                            <CardInHand
                                card={c}
                                isStaged={cardBelongsTo(c, s.you.staged)}
                            />
                        </div>
                    ))}
                </div>
                <div className="tricks-youve-won">
                    <h3>Tricks You've Won</h3>
                    <PileOfCards
                        cards={numCardsWon}
                        type="Heap"
                        size="medium"
                    />
                    {numCardsWon > 0 &&
                    countDoubleStack(s.currentTrick) === 0 ? (
                        <PutTrickBackButton />
                    ) : null}
                </div>
            </div>
        </MainContent>
    );
};
