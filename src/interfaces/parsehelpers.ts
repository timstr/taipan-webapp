import { PlayerProfile, validatePlayerPosition } from "./game/state";
import {
    Card,
    AllSpecialCards,
    CardSuite,
    AllCardSuites,
    CardValue,
    AllCardValues,
    anyDuplicateCards,
    CardStack,
    CardDoubleStack,
    flattenDoubleStack,
    CardTripleStack,
    flattenTripleStack,
} from "./cards";
import { PlayerPosition, RelativePlayerPosition } from "./game/position";

/**
 * Gets a value with a specific key and type or throws an exception
 * in case of a missing key or incorrect type.
 * @param obj the object being queried
 * @param key the key into the object being searched
 * @param type the expected type of the key
 */
// export function getProperty(obj: object, key: string, type: "number"): number;
// export function getProperty(obj: object, key: string, type: "boolean"): boolean;
// export function getProperty(obj: object, key: string, type: "string"): string;
// export function getProperty(obj: object, key: string, type: "object"): object;
// export function getProperty(obj: object, key: string, type: string) {
//     if (!obj.hasOwnProperty(key)) {
//         throw Error(`Key "${key}" not found in object ${JSON.stringify(obj)}`);
//     }
//     const val = (obj as any)[key];
//     if (typeof val != type || val === null) {
//         throw Error(
//             `Expected key "${key}" to have type ${type}, but got ${typeof val} instead`
//         );
//     }
//     return val;
// }

type FilterKnownTypes<T> = T extends number
    ? number
    : T extends boolean
    ? boolean
    : T extends string
    ? string
    : T extends object
    ? object
    : never;

type StringifyType<T> = T extends number
    ? "number"
    : T extends boolean
    ? "boolean"
    : T extends string
    ? "string"
    : T extends object
    ? "object"
    : never;

/**
 * For the easiest usage and best type inference, use a type assertion on the first argument as follows:
 * @example getProperty(untrustedObject as MyInterface, "keyIntoMyInterface", "type as returned by typeof")
 * Note that the first argument isn't actually trusted to comform to the given type. The argument is internally
 * treated as an unknown object and the key and its type are carefully checked.
 * While this may feel weird, it beats having to explicitly and very redundantly having to specify
 * all of the generic parameters manually.
 */
export function getProperty<
    O extends object,
    K extends keyof O,
    T extends FilterKnownTypes<O[K]>
>(o: O, key: K, type: StringifyType<T>): T {
    const obj = o as object;
    if (!obj.hasOwnProperty(key)) {
        throw Error(`Key "${key}" not found in object ${JSON.stringify(obj)}`);
    }
    const val = (obj as any)[key];
    if (typeof val != type || val === null) {
        throw Error(
            `Expected key "${key}" to have type ${type}, but got ${typeof val} instead`
        );
    }
    return val;
}

/**
 * Like the above, but returns an optional second value in case the key is missing.
 * An exception is still thrown if the key exists but does not have the expected type.
 * The type of valueOtherwise is not checked for.
 */
export function getPropertyOr<
    O extends object,
    K extends keyof O,
    T extends FilterKnownTypes<O[K]>,
    S
>(o: O, key: K, type: StringifyType<T>, valueOtherwise: S): T | S {
    const obj = o as object;
    if (!obj.hasOwnProperty(key)) {
        return valueOtherwise;
    }
    const val = (obj as any)[key];
    if (typeof val != type || val === null) {
        throw Error(
            `Expected key "${key}" to have type ${type}, but got ${typeof val} instead`
        );
    }
    return val;
}

export function expectObject(x: any): object {
    if (x !== null && typeof x === "object") {
        return x;
    }
    throw new Error("Expected an object");
}

export function expectArray(x: any): any[] {
    if (Array.isArray(x)) {
        return x;
    }
    throw new Error("Expected an array");
}

export function validatePosition(x: any): PlayerPosition {
    if (typeof x !== "string") {
        throw new Error(
            `Expected position to be a string, got ${JSON.stringify(x)} instead`
        );
    }
    const p = ((): PlayerPosition => {
        const xx = x as PlayerPosition;
        switch (xx) {
            case "North":
            case "South":
            case "East":
            case "West":
                return xx;
        }
    })();
    if (p === undefined) {
        throw new Error(`Invalid player position: ${JSON.stringify(x)}`);
    }
    return p;
}

export function validateNullablePosition(x: any): PlayerPosition | null {
    if (x === null) {
        return null;
    }
    return validatePlayerPosition(x);
}

export function validateRelativePosition(x: any): RelativePlayerPosition {
    if (typeof x !== "string") {
        throw new Error(
            `Expected relative position to be a string, got ${JSON.stringify(
                x
            )} instead`
        );
    }
    const xx = x as RelativePlayerPosition;
    switch (xx) {
        case "Left":
        case "Opposite":
        case "Right":
            return xx;
    }
    throw new Error(`Invalid relative player position: ${JSON.stringify(x)}`);
}

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

export function validateCard(obj: any): Card {
    if (typeof obj == "string") {
        const c = AllSpecialCards.find((x) => x === obj);
        if (c === undefined) {
            throw new Error(`Invalid card: ${JSON.stringify(obj)}`);
        }
        return c;
    } else if (obj !== null && typeof obj == "object") {
        return {
            suite: validateCardSuite(obj["suite"]),
            value: validateCardValue(obj["value"]),
        };
    } else {
        throw new Error(`Invalid card: ${JSON.stringify(obj)}`);
    }
}

type KeyMustBe<O extends object, K extends keyof O, T> = O[K] extends T
    ? K
    : never;

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
    const v = (obj as any)[key];
    if (v === null) {
        return null;
    }
    return validateCard(v);
}

const validateCardStack = (o: any): CardStack => {
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

const validateCardDoubleStack = (o: any): CardDoubleStack => {
    const arr = expectArray((expectObject(o) as CardDoubleStack).stacks);
    const stacks = arr.map(validateCardStack);
    const stackStack: CardDoubleStack = { stacks };
    if (anyDuplicateCards(flattenDoubleStack(stackStack))) {
        throw new Error(
            `CardDoubleStack contains duplicates: ${JSON.stringify(stackStack)}`
        );
    }
    return stackStack;
};

const validateCardTripleStack = (o: any): CardTripleStack => {
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

export function validatePlayerProfile(x: any): PlayerProfile {
    const pp = expectObject(x) as PlayerProfile;
    return {
        name: getProperty(pp, "name", "string"),
        position: validatePlayerPosition(pp.position),
    };
}
