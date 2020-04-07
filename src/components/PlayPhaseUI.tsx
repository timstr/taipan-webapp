import * as React from "react";
import {
    GameStatePlayPhaseView,
    PlayerHandPlayPhaseView,
} from "../interfaces/game/stateview";
import { CardUI, PileOfCards, RowsOfCards } from "./CardUI";
import { RelativePlayerPosition } from "../interfaces/game/position";
import {
    Card,
    cardBelongsTo,
    countTripleStack,
    countDoubleStack,
    countStack,
} from "../interfaces/cards";
import { ActionProvider } from "./MessageContext";
import {
    stageCardAction,
    playStagedCardsAction,
    unstageCardAction,
    reclaimLastPlayAction,
    takeTrickAction,
    putTrickBackAction,
} from "../interfaces/game/actions/playphase";
import { Header } from "./Header";
import { MainContent } from "./MainContent";

interface OtherPlayerProps {
    readonly position: RelativePlayerPosition;
    readonly player: PlayerHandPlayPhaseView;
}

const OtherPlayerUI = (props: OtherPlayerProps) => {
    const playerTitle =
        props.position === "Opposite"
            ? "Partner"
            : props.position + " Opponent";
    const inHand = props.player.cardsInHand - props.player.cardsStaged;
    const staged = props.player.cardsStaged;
    return (
        <div className="other-player-play-phase">
            <h3>{props.player.profile.name}</h3>
            <h4>
                <em>{playerTitle}</em>
            </h4>
            <hr />
            <h5>Tricks Won</h5>
            <PileOfCards
                cards={props.player.cardsWon}
                type="Heap"
                size="small"
            />
            <h4>Hand</h4>
            <PileOfCards cards={inHand} type="Overlapping" size="small" />
            <h4>Staged</h4>
            <PileOfCards cards={staged} type="SideBySide" size="small" />
        </div>
    );
};

interface CardProps {
    readonly card: Card;
}

const StagedCard = (props: CardProps) => (
    <ActionProvider>
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
    </ActionProvider>
);

interface CardInHandProps {
    readonly card: Card;
    readonly isStaged: boolean;
}

const CardInHand = (props: CardInHandProps) => (
    <ActionProvider>
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
    </ActionProvider>
);

const TakeTrickButton = () => (
    <ActionProvider>
        {(doAction) => (
            <button onClick={() => doAction(takeTrickAction())}>
                Take Trick
            </button>
        )}
    </ActionProvider>
);

const ReclaimLastPlayButton = () => (
    <ActionProvider>
        {(doAction) => (
            <button onClick={() => doAction(reclaimLastPlayAction())}>
                Reclaim Last Play
            </button>
        )}
    </ActionProvider>
);

const PlayStagedButton = () => (
    <ActionProvider>
        {(doAction) => (
            <button onClick={() => doAction(playStagedCardsAction())}>
                Play Staged Cards
            </button>
        )}
    </ActionProvider>
);

const PutTrickBackButton = () => (
    <ActionProvider>
        {(doAction) => (
            <button onClick={() => doAction(putTrickBackAction())}>
                Put Trick Back
            </button>
        )}
    </ActionProvider>
);

interface Props {
    readonly gameState: GameStatePlayPhaseView;
}

export const PlayPhaseUI = (props: Props) => {
    const s = props.gameState;
    const numCardsWon = countTripleStack(s.yourHand.tricksWon);
    return (
        <MainContent backdrop="floor">
            <Header
                name={s.yourHand.profile.name}
                phase={s.phase}
                position={s.yourHand.profile.position}
            />
            <div className="other-hands-play-phase">
                <OtherPlayerUI position="Left" player={s.leftOpponent} />
                <OtherPlayerUI position="Opposite" player={s.partner} />
                <OtherPlayerUI position="Right" player={s.rightOpponent} />
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
                    {s.yourHand.staged.cards.map((c, i) => (
                        <StagedCard key={i} card={c} />
                    ))}
                </div>
                {countStack(s.yourHand.staged) > 0 ? (
                    <PlayStagedButton />
                ) : null}
            </div>
            <div className="your-hand-play-phase">
                <h3>Your Hand</h3>
                <div className="your-cards-play-phase">
                    {s.yourHand.inHand.cards.map((c, i) => (
                        <div key={i} className="card-in-hand-play-phase-inner">
                            <CardInHand
                                card={c}
                                isStaged={cardBelongsTo(c, s.yourHand.staged)}
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
