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
 * Like getProperty, but returns an optional second value in case the key is missing.
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

type ExpectAndRemoveNull<T> = null extends T ? Exclude<T, null> : never;

/**
 * Like getProperty, but the value, whatever the expected type, is allowed to be null, in which case null is returned.
 * Throws an exception if the key does not exist.
 */
export function getNullableProperty<
    O extends object,
    K extends keyof O,
    T extends FilterKnownTypes<ExpectAndRemoveNull<O[K]>>
>(o: O, key: K, type: StringifyType<T>): T | null {
    if (o[key] === null) {
        return null;
    }
    return getProperty(o, key, type);
}

export function expectBoolean(x: any): boolean {
    if (typeof x === "boolean") {
        return x;
    }
    throw new Error("Expected a boolean");
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

export function expectQuadruple(x: any): [any, any, any, any] {
    if (Array.isArray(x) && x.length === 4) {
        return [x[0], x[1], x[2], x[3]];
    }
    throw new Error("Expected an array of 4 elements");
}
