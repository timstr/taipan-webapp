export class Emitter<Args extends any[] = []> {
    constructor() {
        this.listeners = [];
    }

    addListener(listener: (...a: Args) => void) {
        if (this.listeners.indexOf(listener) !== -1) {
            throw new Error("Adding a duplicate listener");
        }
        this.listeners.push(listener);
    }
    removeListener(listener: (...a: Args) => void) {
        const idx = this.listeners.indexOf(listener);
        if (idx === -1) {
            throw new Error("Removing a non-existent listener");
        }
        this.listeners.splice(idx, 1);
    }
    emit(...a: Args) {
        for (const listener of this.listeners) {
            listener(...a);
        }
    }

    private listeners: ((...a: Args) => void)[];
}
