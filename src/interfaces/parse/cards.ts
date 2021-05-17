import {
    CardSuite,
    AllCardSuites,
    CardValue,
    AllCardValues,
    AllSpecialCards,
    Card,
    CardStack,
    anyDuplicateCards,
    CardDoubleStack,
    flattenDoubleStack,
    CardTripleStack,
    flattenTripleStack,
    PlayerCardStack,
} from "../cards";
import { expectArray, expectObject, getProperty } from "./helpers";
import { KeyMustBe } from "../../typeutils";
import { validatePlayerIndex } from "./player";

export function validateCardSuite(v: any): CardSuite {
    if (typeof v === "string") {
        const s = AllCardSuites.find((x) => x === v);
        if (s !== undefined) {
            return s;
        }
    }
    throw new Error(`Invalid card suite: ${JSON.stringify(v)}`);
}

export function validateCardValue(v: any): CardValue {
    if (typeof v === "string") {
        const val = AllCardValues.find((x) => x === v);
        if (val !== undefined) {
            return val;
        }
    }
    throw new Error(`Invalid card value: ${JSON.stringify(v)}`);
}

export function validateCard(x: any): Card {
    if (typeof x == "string") {
        const c = AllSpecialCards.find((sc) => sc === x);
        if (c === undefined) {
            throw new Error(`Invalid card: ${JSON.stringify(x)}`);
        }
        return c;
    } else if (x !== null && typeof x == "object") {
        return {
            suite: validateCardSuite(x["suite"]),
            value: validateCardValue(x["value"]),
        };
    } else {
        throw new Error(`Invalid card: ${JSON.stringify(x)}`);
    }
}

export function validateNullableCard(x: any): Card | null {
    if (x === null) {
        return null;
    }
    return validateCard(x);
}

export function getCard<O extends object, K extends keyof O>(
    obj: O,
    key: KeyMustBe<O, K, Card>
): Card {
    return validateCard(obj[key]);
}
export function getNullableCard<O extends object, K extends keyof O>(
    obj: O,
    key: KeyMustBe<O, K, Card | null>
): Card | null {
    return validateNullableCard(obj[key]);
}

export const validateCardStack = (o: any): CardStack => {
    const arr = expectArray((expectObject(o) as CardStack).cards);
    const cards = arr.map(validateCard);
    const stack: CardStack = { cards };
    if (anyDuplicateCards(stack)) {
        throw new Error(
            `CardStack contains duplicates: ${JSON.stringify(cards)}`
        );
    }
    return stack;
};

export const validatePlayerCardStack = (o: any): PlayerCardStack => {
    const stack = validateCardStack(o);
    const player = validatePlayerIndex(
        (expectObject(o) as PlayerCardStack).player
    );
    return { ...stack, player };
};

export const validateCardDoubleStack = (o: any): CardDoubleStack => {
    const arr = expectArray((expectObject(o) as CardDoubleStack).stacks);
    const stacks = arr.map(validatePlayerCardStack);
    const stackStack: CardDoubleStack = { stacks };
    if (anyDuplicateCards(flattenDoubleStack(stackStack))) {
        throw new Error(
            `CardDoubleStack contains duplicates: ${JSON.stringify(stackStack)}`
        );
    }
    return stackStack;
};

export const validateCardTripleStack = (o: any): CardTripleStack => {
    const arr = expectArray((expectObject(o) as CardTripleStack).stackStacks);
    const stackStacks = arr.map(validateCardDoubleStack);
    const stackStackStacks: CardTripleStack = { stackStacks };
    if (anyDuplicateCards(flattenTripleStack(stackStackStacks))) {
        throw new Error(
            `CardTripleStack contains duplicates: ${JSON.stringify(
                stackStackStacks
            )}`
        );
    }
    return stackStackStacks;
};

export function getCardStack<O extends object, K extends keyof O>(
    obj: O,
    key: KeyMustBe<O, K, CardStack>
): CardStack {
    return validateCardStack((obj as any)[key]);
}
export function getPlayerCardStack<O extends object, K extends keyof O>(
    obj: O,
    key: KeyMustBe<O, K, CardStack>
): PlayerCardStack {
    const s = (obj as any)[key];
    return {
        ...validateCardStack(s),
        player: getProperty(
            s as PlayerCardStack,
            "player",
            validatePlayerIndex
        ),
    };
}
export function getCardDoubleStack<O extends object, K extends keyof O>(
    obj: O,
    key: KeyMustBe<O, K, CardDoubleStack>
): CardDoubleStack {
    return validateCardDoubleStack((obj as any)[key]);
}
export function getCardTripleStack<O extends object, K extends keyof O>(
    obj: O,
    key: KeyMustBe<O, K, CardTripleStack>
): CardTripleStack {
    return validateCardTripleStack((obj as any)[key]);
}
