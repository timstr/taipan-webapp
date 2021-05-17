import { clone } from "./clone";
import { PlayerIndex } from "./game/player/player";
import { hasOwnProperty } from "../typeutils";

export type CardSuite = "Red" | "Green" | "Blue" | "Black";
export const AllCardSuites: CardSuite[] = ["Red", "Green", "Blue", "Black"];

export type FaceCard = "Jack" | "Queen" | "King" | "Ace";
export const AllFaceCards: FaceCard[] = ["Jack", "Queen", "King", "Ace"];
export type NumberCard = "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10";
export const AllNumberCards: NumberCard[] = [
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
];

export type CardValue = FaceCard | NumberCard;
export const AllCardValues: CardValue[] = (
    AllNumberCards as CardValue[]
).concat(AllFaceCards);

export interface NormalCard {
    readonly suite: CardSuite;
    readonly value: CardValue;
}
export const AllNormalCards: ReadonlyArray<NormalCard> = AllCardSuites.reduce(
    (acc, suite) =>
        acc.concat(AllCardValues.map((value) => ({ suite, value }))),
    [] as ReadonlyArray<NormalCard>
);

export const MahJongCard = "Mah Jong";
export const DogCard = "Dog";
export const PhoenixCard = "Phoenix";
export const DragonCard = "Dragon";

export type MahJongCard = typeof MahJongCard;
export type DogCard = typeof DogCard;
export type PhoenixCard = typeof PhoenixCard;
export type DragonCard = typeof DragonCard;

export type SpecialCard = MahJongCard | DogCard | PhoenixCard | DragonCard;
export const AllSpecialCards: ReadonlyArray<SpecialCard> = [
    MahJongCard,
    DogCard,
    PhoenixCard,
    DragonCard,
];

export type Card = NormalCard | SpecialCard;
export const AllCards: CardStack = {
    cards: (AllNormalCards as ReadonlyArray<Card>).concat(AllSpecialCards),
};
export const DeckSize = 56;

export const isNormalCard = (c: Card): c is NormalCard => {
    return typeof c === "object";
};

export const isSpecialCard = (c: Card): c is SpecialCard => {
    return typeof c === "string";
};

// NOTE: yes, the following interfaces seem unnecessary, but there appear
// to be corner cases where TypeScript can't detect that a Card[][] is being
// passed where a Card[] is expected. These interfaces are safer workaround.

// Stack of cards
// To be used instead of Card[]
export interface CardStack {
    readonly cards: ReadonlyArray<Card>;
}

export interface PlayerCardStack {
    readonly cards: ReadonlyArray<Card>;
    readonly player: PlayerIndex;
}

// Stack of stacks of cards
// To be used instead of Card[][]
export interface CardDoubleStack {
    readonly stacks: ReadonlyArray<PlayerCardStack>;
}

// Stack of stacks of stacks of cards
// To be used instead of Card[][][]
export interface CardTripleStack {
    readonly stackStacks: ReadonlyArray<CardDoubleStack>;
}

export const EmptyStack: CardStack = { cards: [] };
export const EmptyDoubleStack: CardDoubleStack = { stacks: [] };
export const EmptyTripleStack: CardTripleStack = { stackStacks: [] };

export const cardsAreEqual = (a: Card, b: Card): boolean => {
    if (typeof a === "string" && typeof b === "string") {
        return a === b;
    } else if (typeof a === "object" && typeof b === "object") {
        return a.suite === b.suite && a.value === b.value;
    }
    return false;
};

export const compareCards = (a: Card, b: Card): number => {
    const cmp = <T>(t1: T, t2: T): number => (t1 < t2 ? 1 : t1 > t2 ? -1 : 0);
    if (typeof a === "string") {
        if (typeof b === "string") {
            const lut: SpecialCard[] = [
                MahJongCard,
                DogCard,
                PhoenixCard,
                DragonCard,
            ];
            return lut.indexOf(a) - lut.indexOf(b);
        } else {
            return a === DogCard || a === MahJongCard ? -1 : 1;
        }
    } else {
        if (typeof b === "object") {
            const cs =
                AllCardValues.indexOf(a.value) - AllCardValues.indexOf(b.value);
            if (cs !== 0) {
                return cs;
            }
            return cmp(a.suite, b.suite);
        } else {
            return b === DogCard || b === MahJongCard ? 1 : -1;
        }
    }
};

export const sortCards = <S extends CardStack>(stack: S): S => {
    const cloned = clone(stack.cards);
    return { ...stack, cards: cloned.sort(compareCards) };
};

export const pushStack = <S extends CardStack>(stack: S, newCard: Card): S => ({
    ...stack,
    cards: stack.cards.concat([newCard]),
});

export const pushDoubleStack = (
    stackStack: CardDoubleStack,
    newStack: PlayerCardStack
): CardDoubleStack => ({
    stacks: stackStack.stacks.concat([newStack]),
});

export const pushTripleStack = (
    stackStackStack: CardTripleStack,
    newStackStack: CardDoubleStack
): CardTripleStack => ({
    stackStacks: stackStackStack.stackStacks.concat([newStackStack]),
});

export const popStack = <S extends CardStack>(stack: S): [S, Card] => {
    const n = stack.cards.length;
    if (n === 0) {
        throw new Error("Attempted to pop empty stack");
    }
    return [
        { ...stack, cards: stack.cards.slice(0, n - 1) },
        stack.cards[n - 1],
    ];
};

export const popDoubleStack = (
    stackStack: CardDoubleStack
): [CardDoubleStack, CardStack] => {
    const n = stackStack.stacks.length;
    if (n === 0) {
        throw new Error("Attempted to pop empty stack");
    }
    return [
        { stacks: stackStack.stacks.slice(0, n - 1) },
        stackStack.stacks[n - 1],
    ];
};

export const popTripleStack = (
    stackStackStack: CardTripleStack
): [CardTripleStack, CardDoubleStack] => {
    const n = stackStackStack.stackStacks.length;
    if (n === 0) {
        throw new Error("Attempted to pop empty stack");
    }
    return [
        { stackStacks: stackStackStack.stackStacks.slice(0, n - 1) },
        stackStackStack.stackStacks[n - 1],
    ];
};

export function concatStacks(a: CardStack, b: CardStack): CardStack;
export function concatStacks(
    a: PlayerCardStack,
    b: PlayerCardStack
): PlayerCardStack;
export function concatStacks(
    a: CardStack | PlayerCardStack,
    b: CardStack | PlayerCardStack
): CardStack | PlayerCardStack {
    if (hasOwnProperty(a, "player")) {
        let pcs: PlayerCardStack = {
            cards: a.cards.concat(b.cards),
            player: a.player,
        };
        return pcs;
    }
    return {
        cards: a.cards.concat(b.cards),
    };
}

export const filterCards = <S extends CardStack>(
    stack: S,
    predicate: (c: Card) => boolean
): S => ({
    ...stack,
    cards: stack.cards.filter(predicate),
});

export const randomShuffle = (stack: CardStack): CardStack => {
    let array = clone(stack.cards);
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    let shuffledStack: CardStack = {
        cards: array,
    };
    if (
        !(
            allCardsBelongsTo(shuffledStack, stack) &&
            allCardsBelongsTo(stack, shuffledStack)
        )
    ) {
        throw new Error("Invalid shuffle");
    }
    return shuffledStack;
};

export const cardBelongsTo = (card: Card, stack: CardStack): boolean => {
    for (let c of stack.cards) {
        if (cardsAreEqual(c, card)) {
            return true;
        }
    }
    return false;
};

export const allCardsBelongsTo = (
    cards: CardStack,
    set: CardStack
): boolean => {
    for (let c of cards.cards) {
        if (!cardBelongsTo(c, set)) {
            return false;
        }
    }
    return true;
};

export const flattenDoubleStack = (stack: CardDoubleStack): CardStack => ({
    cards: stack.stacks.reduce((acc, v) => acc.concat(v.cards), [] as Card[]),
});

export const flattenTripleStack = (stack: CardTripleStack): CardStack => ({
    cards: stack.stackStacks.reduce(
        (acc, v) => acc.concat(flattenDoubleStack(v).cards),
        [] as Card[]
    ),
});

export const countStack = (stack: CardStack): number => stack.cards.length;

export const countDoubleStack = (stack: CardDoubleStack): number =>
    stack.stacks.reduce((acc, v) => acc + v.cards.length, 0);

export const countTripleStack = (stack: CardTripleStack): number =>
    stack.stackStacks.reduce((acc, v) => acc + countDoubleStack(v), 0);

export const stacksAreEqual = (
    stackA: CardStack,
    stackB: CardStack
): boolean => {
    if (stackA.cards.length !== stackB.cards.length) {
        return false;
    }
    let mask = stackB.cards.map((_) => false);
    for (let i = 0; i < stackA.cards.length; ++i) {
        for (let j = 0; j < stackB.cards.length; ++j) {
            if (mask[j]) {
                continue;
            }
            if (cardsAreEqual(stackA.cards[i], stackB.cards[j])) {
                mask[j] = true;
                break;
            }
        }
    }
    return mask.reduce((a, b) => a && b, true);
};

export const anyDuplicateCards = (stack: CardStack) => {
    const n = countStack(stack);
    for (let i = 0; i < n; ++i) {
        for (let j = i + 1; j < n; ++j) {
            if (cardsAreEqual(stack.cards[i], stack.cards[j])) {
                return true;
            }
        }
    }
    return false;
};

export const deckIsValid = (stack: CardStack): boolean => {
    if (countStack(stack) !== DeckSize) {
        console.warn(
            `Deck with wrong number of cards encountered. Expected ${DeckSize}, got ${countStack(
                stack
            )}`
        );
        return false;
    }

    if (anyDuplicateCards(stack)) {
        console.warn(
            `Deck with duplicate cards encountered: ${JSON.stringify(stack)}`
        );
        return false;
    }

    return true;
};

export const dealCards = (): [CardStack, CardStack, CardStack, CardStack] => {
    const shuffled = randomShuffle(AllCards);
    if (!deckIsValid(shuffled)) {
        throw new Error("Deck was invalidated during shuffle");
    }
    const cards = shuffled.cards;
    return [
        { cards: cards.slice(0, 14) },
        { cards: cards.slice(14, 28) },
        { cards: cards.slice(28, 42) },
        { cards: cards.slice(42, 56) },
    ];
};

export const isBomb = (stack: CardStack): boolean => {
    if (anyDuplicateCards(stack)) {
        return false;
    }
    const num = countStack(stack);
    if (num === 4) {
        let [c0, c1, c2, c3] = stack.cards;
        if (
            !(
                isNormalCard(c0) &&
                isNormalCard(c1) &&
                isNormalCard(c2) &&
                isNormalCard(c3)
            )
        ) {
            return false;
        }
        const v = c0.value;
        if (!(c1.value === v && c2.value === v && c3.value === v)) {
            return false;
        }
        return true;
    } else if (num >= 5) {
        let s = undefined;
        let mask = AllCardValues.map((_) => false);
        for (let c of stack.cards) {
            if (!isNormalCard(c)) {
                return false;
            }
            if (s === undefined) {
                s = c.suite;
            } else if (c.suite !== s) {
                return false;
            }
            const i = AllCardValues.indexOf(c.value);
            mask[i] = true;
        }

        const i0 = mask.indexOf(true);
        for (let i = i0; i < num; ++i) {
            if (!mask[i]) {
                return false;
            }
        }
        return true;
    }
    return false;
};
