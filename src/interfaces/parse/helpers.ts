export function getProperty<O extends object, K extends keyof O, T>(
    o: O,
    key: K,
    typeAssertion: (x: any) => T
): T {
    const obj = o as object;
    if (!obj.hasOwnProperty(key)) {
        throw Error(`Key "${key}" not found in object ${JSON.stringify(obj)}`);
    }
    const val = (obj as any)[key];
    return typeAssertion(val);
}

export function getPropertyOr<
    O extends object,
    K extends keyof O,
    T,
    S extends Exclude<object, undefined>
>(o: O, key: K, typeAssertion: (x: any) => T, valueOtherwise: S): T | S {
    const obj = o as object;
    if (!obj.hasOwnProperty(key)) {
        return valueOtherwise;
    }
    const val = (obj as any)[key];
    return typeAssertion(val);
}

export function getOptionalProperty<O extends object, K extends keyof O, T>(
    o: O,
    key: K,
    typeAssertion: (x: any) => T
): T | undefined {
    const obj = o as object;
    if (!obj.hasOwnProperty(key)) {
        return undefined;
    }
    const val = (obj as any)[key];
    return typeAssertion(val);
}

export function withOptionalProperty<O extends object, K extends keyof O, T>(
    o: O,
    key: K,
    typeAssertion: (x: any) => T
): { K: T } | {} {
    const obj = o as object;
    if (!obj.hasOwnProperty(key)) {
        return {};
    }
    const val = (obj as any)[key];
    return { [key]: typeAssertion(val) };
}

type ExpectAndRemoveNull<T> = null extends T ? Exclude<T, null> : never;

export function getNullableProperty<
    O extends object,
    K extends keyof O,
    T extends ExpectAndRemoveNull<O[K]>
>(o: O, key: K, typeAssertion: (x: any) => T): T | null {
    if (o[key] === null) {
        return null;
    }
    return getProperty(o, key, typeAssertion);
}

export function expectNumber(x: any): number {
    if (typeof x === "number") {
        return x;
    }
    throw new Error("Expected a number");
}

export function expectBoolean(x: any): boolean {
    if (typeof x === "boolean") {
        return x;
    }
    throw new Error("Expected a boolean");
}

export function expectString(x: any): string {
    if (typeof x === "string") {
        return x;
    }
    throw new Error("Expected a string");
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
