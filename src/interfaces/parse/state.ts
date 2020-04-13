import { GamePhase } from "../game/state/state";

interface WithPhase<T extends GamePhase> {
    readonly phase: T;
}

export function assertPhaseTag<P extends GamePhase, S extends WithPhase<P>>(
    s: S,
    tag: P
) {
    const p = s.phase;
    if (p !== tag) {
        throw new Error(`Incorrect game phase tag: ${JSON.stringify(p)}`);
    }
}
