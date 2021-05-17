import * as React from "react";
import {
    Card,
    CardSuite,
    CardStack,
    CardDoubleStack,
} from "../interfaces/cards";
import { AllPlayers, PlayerProfile } from "../interfaces/game/player/player";
import { DefinitelyConnected } from "../interfaces/game/view/stateview";

export type FlippableCard = Card | "Backside";

function getCardFileName(card: FlippableCard): string {
    const root = "static/img/";
    const suiteName = (suite: CardSuite): string => {
        switch (suite) {
            case "Black":
                return "sword";
            case "Blue":
                return "pagoda";
            case "Green":
                return "pickle";
            case "Red":
                return "star";
        }
    };

    if (card === "Backside") {
        return root + "back.png";
    } else if (card === "Mah Jong") {
        return root + "mahjong.png";
    } else if (typeof card === "string") {
        return root + card.toLowerCase() + ".png";
    } else {
        return (
            root +
            suiteName(card.suite) +
            "_" +
            card.value.toLowerCase() +
            ".png"
        );
    }
}

type CardSize = "large" | "medium" | "small";

type CardPileType = "Heap" | "Overlapping" | "SideBySide";

const CARD_BASE_MEASUREMENTS = {
    WIDTH: 40,
    HEIGHT: 60,
    VERTICAL_OVERLAP: 55,
    HORIZONTAL_OVERLAP: 20,
    BORDER_RADIUS: 3,
};

const cardScaleFactor = (size: CardSize) =>
    (["small", "medium", "large"] as CardSize[]).indexOf(size) + 1;

const horizontalOverlapFactor = (type: CardPileType) =>
    (["SideBySide", "Overlapping", "Heap"] as CardPileType[]).indexOf(type);

export interface CardProps {
    readonly card: FlippableCard;
    readonly size: CardSize;
    readonly onClick?: (() => void) | undefined;
}

interface CardInPileProps extends CardProps {
    readonly angle: number;
    readonly pileType: CardPileType;
    readonly shiftLeft: boolean;
}

export const CardInPileUI = (props: CardInPileProps) => {
    const angle = props.angle || 0;
    const sizeClass = ((): string => {
        switch (props.size) {
            case "large":
                return "card-large";
            case "medium":
                return "card-medium";
            case "small":
                return "card-small";
        }
    })();
    const pileTypeClass = ((): string => {
        switch (props.pileType) {
            case "Heap":
                return "single-card-heap";
            case "Overlapping":
                return "single-card-overlapping";
            case "SideBySide":
            default:
                return "single-card-side-by-side";
        }
    })();
    const cssClasses = sizeClass + " " + pileTypeClass;
    const scaleFactor = cardScaleFactor(props.size);
    const lShiftFactor = horizontalOverlapFactor(props.pileType);
    const width = `${CARD_BASE_MEASUREMENTS.WIDTH * scaleFactor}px`;
    const height = `${CARD_BASE_MEASUREMENTS.HEIGHT * scaleFactor}px`;
    const borderRadius = `${
        CARD_BASE_MEASUREMENTS.BORDER_RADIUS * scaleFactor
    }px`;
    const lShift =
        -CARD_BASE_MEASUREMENTS.HORIZONTAL_OVERLAP * scaleFactor * lShiftFactor;
    const marginLeft = `${props.shiftLeft ? lShift : 0}px`;
    const transform = `rotate(${angle}deg)`;
    return (
        <div
            className={cssClasses}
            style={{
                backgroundImage: `url("${getCardFileName(props.card)}")`,
                transform,
                width,
                height,
                borderRadius,
                marginLeft,
            }}
            onClick={props.onClick}
        ></div>
    );
};

export const CardUI = (props: CardProps) => (
    <CardInPileUI
        {...props}
        angle={0}
        pileType="SideBySide"
        shiftLeft={false}
    />
);

export interface PileOfCardsProps {
    readonly cards: number | CardStack;
    readonly type: CardPileType;
    readonly size: CardSize;
    readonly jitter?: number;
}

export const PileOfCards = (props: PileOfCardsProps) => {
    const cards: readonly FlippableCard[] =
        typeof props.cards === "number"
            ? [...Array(props.cards).keys()].map((_) => "Backside")
            : props.cards.cards;

    const jitter = props.jitter || 0;
    const pseudoRandomAngle = (i: number, scale: number) =>
        scale * Math.sin((i + jitter * Math.SQRT2) * 1.61803398874989484820459);

    switch (props.type) {
        case "Heap":
            return (
                <div className="cards-heap">
                    {cards.map((c, i) => (
                        <CardInPileUI
                            key={i}
                            card={c}
                            size={props.size}
                            pileType="Heap"
                            angle={pseudoRandomAngle(i, 80.0)}
                            shiftLeft={i > 0}
                        />
                    ))}
                </div>
            );
        case "Overlapping":
            return (
                <div className="cards-overlapping">
                    {cards.map((c, i) => (
                        <CardInPileUI
                            key={i}
                            card={c}
                            size={props.size}
                            pileType="Overlapping"
                            angle={pseudoRandomAngle(i, 10.0)}
                            shiftLeft={i > 0}
                        />
                    ))}
                </div>
            );
        case "SideBySide":
            return (
                <div className="cards-side-by-side">
                    {cards.map((c, i) => (
                        <CardUI key={i} card={c} size={props.size} />
                    ))}
                </div>
            );
    }
};

interface RowsOfCardsProps {
    readonly stacks: CardDoubleStack;
    readonly size: CardSize;
    readonly rowStyle: CardPileType;
    readonly namesToShow: AllPlayers<DefinitelyConnected<PlayerProfile>>;
}

export const RowsOfCards = (props: RowsOfCardsProps) => {
    const vShift =
        -CARD_BASE_MEASUREMENTS.VERTICAL_OVERLAP * cardScaleFactor(props.size);
    return (
        <div className="rows-of-cards">
            {props.stacks.stacks.map((cc, i) => (
                <div
                    className="row-in-rows-of-cards"
                    style={{
                        marginBottom: i === 0 ? 0 : vShift,
                        zIndex: i,
                    }}
                >
                    <PileOfCards
                        cards={cc}
                        size={props.size}
                        type={props.rowStyle}
                        jitter={i}
                    />
                    {props.namesToShow !== undefined ? (
                        <span className="trick-player-name">
                            {props.namesToShow[cc.player].name}
                        </span>
                    ) : null}
                </div>
            ))}
        </div>
    );
};
