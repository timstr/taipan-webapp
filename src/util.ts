export function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function countNonNull<T>(
    arr: null extends T ? ReadonlyArray<T> : never
): number {
    return arr.reduce((acc, x) => (x === null ? acc : acc + 1), 0);
}
