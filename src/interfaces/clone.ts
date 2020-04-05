export function clone<T extends object>(t: T): T {
    return JSON.parse(JSON.stringify(t));
}
