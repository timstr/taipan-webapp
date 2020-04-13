import * as React from "react";
import { CardUI } from "../CardUI";
import { Card, cardsAreEqual } from "../../interfaces/cards";
import { WithAction } from "../MessageContext";
import {
    RelativePlayerPosition,
    nameOfPosition,
} from "../../interfaces/game/player/position";
import {
    chooseCardToPass,
    readyToPassAction,
} from "../../interfaces/game/actions/passphase";
import { Header } from "../Header";
import { MainContent } from "../MainContent";
import { PassPhaseView } from "../../interfaces/game/view/stateview";
import { PlayerProfile } from "../../interfaces/game/player/player";
import { OtherPlayerPassing } from "../OtherPlayerPassingUI";
import { Action } from "../../interfaces/game/actions/actions";

interface PassingCardProps {
    readonly forWhom: PlayerProfile;
    readonly card: Card | null;
    readonly position: RelativePlayerPosition;
}

const PassingCardUI = (props: PassingCardProps) => (
    <WithAction>
        {(doAction) => (
            <div className="card-being-passed">
                <div className="card-being-passed-inner">
                    <h3>
                        For: {props.forWhom.name}
                        <br />
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
    </WithAction>
);

interface CardInHandProps {
    readonly card: Card;
    readonly passingTo: RelativePlayerPosition | null;
}

interface CardInHandState {
    readonly showControls: boolean;
}
class CardInHandUI extends React.Component<CardInHandProps, CardInHandState> {
    constructor(props: CardInHandProps) {
        super(props);

        this.state = {
            showControls: false,
        };
    }

    private showControls = () => {
        this.setState({ showControls: true });
    };

    private hideControls = () => {
        this.setState({ showControls: false });
    };

    private renderInner() {
        if (this.props.passingTo !== null) {
            return (
                <div className="card-in-hand-during-pass-inner">
                    <div className="faded-card">
                        <CardUI card={this.props.card} size="large" />
                    </div>
                    <div className="card-in-hand-during-pass-controls">
                        <h3>
                            Passing to {nameOfPosition(this.props.passingTo)}
                        </h3>
                        <WithAction>
                            {(doAction) => (
                                <button
                                    onClick={() =>
                                        doAction(
                                            chooseCardToPass(
                                                null,
                                                this.props.passingTo!
                                            )
                                        )
                                    }
                                >
                                    Take Back
                                </button>
                            )}
                        </WithAction>
                    </div>
                </div>
            );
        } else if (this.state.showControls) {
            const passTheCard = (
                doAction: (a: Action) => void,
                dir: RelativePlayerPosition
            ) => () => {
                doAction(chooseCardToPass(this.props.card, dir));
                this.hideControls();
            };

            return (
                <div className="card-in-hand-during-pass-inner">
                    <div className="faded-card">
                        <CardUI card={this.props.card} size="large" />
                    </div>
                    <div className="card-in-hand-during-pass-controls">
                        <WithAction>
                            {(doAction) => (
                                <>
                                    <button
                                        className="pass-btn"
                                        onClick={passTheCard(doAction, "Left")}
                                    >
                                        Pass Left
                                    </button>
                                    <br />
                                    <button
                                        className="pass-btn"
                                        onClick={passTheCard(
                                            doAction,
                                            "Opposite"
                                        )}
                                    >
                                        Pass to Partner
                                    </button>
                                    <br />
                                    <button
                                        className="pass-btn"
                                        onClick={passTheCard(doAction, "Right")}
                                    >
                                        Pass Right
                                    </button>
                                    <br />
                                    <button
                                        className="pass-btn"
                                        onClick={this.hideControls}
                                    >
                                        Cancel
                                    </button>
                                    <br />
                                </>
                            )}
                        </WithAction>
                    </div>
                </div>
            );
        } else {
            return (
                <div className="card-in-hand-during-pass-inner">
                    <CardUI
                        card={this.props.card}
                        size="large"
                        onClick={this.showControls}
                    />
                </div>
            );
        }
    }

    render() {
        return (
            <div
                className="card-in-hand-during-pass"
                onBlur={this.hideControls}
            >
                {this.renderInner()}
            </div>
        );
    }
}

interface Props {
    readonly gameState: PassPhaseView;
}

export const PassPhaseUI = (props: Props) => {
    const s = props.gameState;
    const give = s.you.give;
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
        <WithAction>
            {(doAction) => (
                <MainContent backdrop="floor">
                    <Header
                        name={s.you.profile.name}
                        phase={s.phase}
                        position={s.you.profile.position}
                    />
                    <div className="other-players-pass-phase">
                        <OtherPlayerPassing
                            player={s.others.leftOpponent}
                            positionTitle="Left Opponent"
                        />
                        <OtherPlayerPassing
                            player={s.others.partner}
                            positionTitle="Partner"
                        />
                        <OtherPlayerPassing
                            player={s.others.rightOpponent}
                            positionTitle="Right Opponent"
                        />
                    </div>
                    <h3>Cards you're passing</h3>
                    <div className="other-hands-pass-phase">
                        <PassingCardUI
                            forWhom={s.others.leftOpponent.profile}
                            card={s.you.give.leftOpponent}
                            position={"Left"}
                        />
                        <PassingCardUI
                            forWhom={s.others.partner.profile}
                            card={s.you.give.partner}
                            position="Opposite"
                        />
                        <PassingCardUI
                            forWhom={s.others.rightOpponent.profile}
                            card={s.you.give.rightOpponent}
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
                        {s.you.ready ? "✔" : null}
                    </div>
                    <div className="your-hand-pass-phase">
                        {s.you.inHand.cards.map((c, i) => (
                            <CardInHandUI
                                key={i}
                                card={c}
                                passingTo={cardPassPosition(c)}
                            />
                        ))}
                    </div>
                </MainContent>
            )}
        </WithAction>
    );
};
