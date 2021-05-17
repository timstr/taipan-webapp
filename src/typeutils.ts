export type Writable<T> = { -readonly [P in keyof T]: Writable<T[P]> };

export type OptionalSpread<T = undefined> = T extends undefined ? [] : [T];

export type UnionToIntersection<U> = (
    U extends any ? (k: U) => void : never
) extends (k: infer I) => void
    ? I
    : never;

export type IsUnion<T> = [T] extends [UnionToIntersection<T>] ? false : true;

export type NotUnion<T> = IsUnion<T> extends false ? T : never;

export type KeyMustBe<O extends object, K extends keyof O, T> = O[K] extends T
    ? K
    : never;

export function hasOwnProperty<X extends {}, Y extends PropertyKey>(
    obj: X,
    prop: Y
): obj is X & Record<Y, unknown> {
    return obj.hasOwnProperty(prop);
}
