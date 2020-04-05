import * as React from "react";
import {
    GameStatePassPhaseView,
    PlayerHandPassPhaseView,
} from "../interfaces/game/stateview";
import { CardUI, PileOfCards } from "./CardUI";
import { PlayerProfile } from "../interfaces/game/state";
import { Card, cardsAreEqual } from "../interfaces/cards";
import { ActionProvider } from "./MessageContext";
import { RelativePlayerPosition } from "../interfaces/game/position";
import {
    chooseCardToPass,
    readyToPassAction,
} from "../interfaces/game/actions/passphase";
import { Header } from "./Header";
import { MainContent } from "./MainContent";

const nameOfPosition = (pos: RelativePlayerPosition) => {
    switch (pos) {
        case "Left":
            return "left";
        case "Opposite":
            return "partner";
        case "Right":
            return "right";
    }
};

interface OtherPlayerPassingProps {
    readonly player: PlayerHandPassPhaseView;
    readonly position: RelativePlayerPosition;
}

// TODO: name, position, 0-3 cards, ready check mark
const OtherPlayerPassing = (props: OtherPlayerPassingProps) => {
    const g = props.player.give;
    const n =
        (g.leftOpponent ? 1 : 0) +
        (g.partner ? 1 : 0) +
        (g.rightOpponent ? 1 : 0);
    return (
        <div className="other-player-passing">
            <h3>
                {props.player.profile.name}{" "}
                <em>({nameOfPosition(props.position)})</em>
            </h3>
            <PileOfCards cards={n} size="small" type="SideBySide" />
            {props.player.ready ? <p>✔ Ready</p> : null}
        </div>
    );
};

interface PassingCardProps {
    readonly forWhom: PlayerProfile;
    readonly card: Card | null;
    readonly position: RelativePlayerPosition;
}

const PassingCardUI = (props: PassingCardProps) => (
    <ActionProvider>
        {(doAction) => (
            <div className="card-being-passed">
                <div className="card-being-passed-inner">
                    <h3>
                        For: {props.forWhom.name}{" "}
                        <em>({nameOfPosition(props.position)})</em>
                    </h3>
                    {props.card ? (
                        <>
                            <CardUI card={props.card} size="small" />
                            <br />
                            <button
                                onClick={() =>
                                    doAction(
                                        chooseCardToPass(null, props.position)
                                    )
                                }
                            >
                                Put Back
                            </button>
                        </>
                    ) : (
                        <em>No card chosen</em>
                    )}
                </div>
            </div>
        )}
    </ActionProvider>
);

interface CardInHandProps {
    readonly card: Card;
    readonly passingTo: RelativePlayerPosition | null;
}

const CardInHandUI = (props: CardInHandProps) => (
    <ActionProvider>
        {(doAction) => (
            <div className="card-in-hand-during-pass">
                <div className="card-in-hand-during-pass-inner">
                    <CardUI card={props.card} size="large" />
                    {props.passingTo ? (
                        <p className="passing-to">
                            <em>
                                Passing to {nameOfPosition(props.passingTo)}
                            </em>
                        </p>
                    ) : (
                        <>
                            <button
                                className="pass-btn"
                                onClick={() =>
                                    doAction(
                                        chooseCardToPass(props.card, "Left")
                                    )
                                }
                            >
                                Pass left
                            </button>
                            <button
                                className="pass-btn"
                                onClick={() =>
                                    doAction(
                                        chooseCardToPass(props.card, "Opposite")
                                    )
                                }
                            >
                                Pass to partner
                            </button>
                            <button
                                className="pass-btn"
                                onClick={() =>
                                    doAction(
                                        chooseCardToPass(props.card, "Right")
                                    )
                                }
                            >
                                Pass right
                            </button>
                        </>
                    )}
                </div>
            </div>
        )}
    </ActionProvider>
);

interface Props {
    readonly gameState: GameStatePassPhaseView;
}

export const PhassPhaseUI = (props: Props) => {
    const s = props.gameState;
    const give = s.yourHand.give;
    const cardPassPosition = (card: Card): RelativePlayerPosition | null => {
        const sameAs = (c: Card | null) => c && cardsAreEqual(card, c);
        if (sameAs(give.leftOpponent)) {
            return "Left";
        } else if (sameAs(give.partner)) {
            return "Opposite";
        } else if (sameAs(give.rightOpponent)) {
            return "Right";
        }
        return null;
    };
    const canBeReady =
        give.leftOpponent !== null &&
        give.partner !== null &&
        give.rightOpponent !== null;
    return (
        <ActionProvider>
            {(doAction) => (
                <MainContent backdrop="floor">
                    <Header
                        name={s.yourHand.profile.name}
                        phase={s.phase}
                        position={s.yourHand.profile.position}
                    />
                    <div className="other-players-pass-phase">
                        <OtherPlayerPassing
                            player={s.leftOpponent}
                            position="Left"
                        />
                        <OtherPlayerPassing
                            player={s.partner}
                            position="Opposite"
                        />
                        <OtherPlayerPassing
                            player={s.rightOpponent}
                            position="Right"
                        />
                    </div>
                    <h3>Cards you're passing</h3>
                    <div className="other-hands-pass-phase">
                        <PassingCardUI
                            forWhom={s.leftOpponent.profile}
                            card={s.yourHand.give.leftOpponent}
                            position={"Left"}
                        />
                        <PassingCardUI
                            forWhom={s.partner.profile}
                            card={s.yourHand.give.partner}
                            position="Opposite"
                        />
                        <PassingCardUI
                            forWhom={s.rightOpponent.profile}
                            card={s.yourHand.give.rightOpponent}
                            position="Right"
                        />
                    </div>
                    <h3>Your Hand</h3>
                    <div className="button-and-check-mark">
                        <button
                            onClick={() => doAction(readyToPassAction())}
                            disabled={!canBeReady}
                        >
                            Ready to pass
                        </button>
                        {s.yourHand.ready ? "✔" : null}
                    </div>
                    <div className="your-hand-pass-phase">
                        {s.yourHand.inHand.cards.map((c, i) => (
                            <CardInHandUI
                                key={i}
                                card={c}
                                passingTo={cardPassPosition(c)}
                            />
                        ))}
                    </div>
                </MainContent>
            )}
        </ActionProvider>
    );
};
