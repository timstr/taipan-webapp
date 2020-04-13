import { Writable } from "../typeutils";

export function clone<T extends object>(t: T): Writable<T> {
    return JSON.parse(JSON.stringify(t));
}
