import { strictEqual } from "assert";
import { deepEqual } from "assert/strict";
import { countStack } from "../src/interfaces/cards";
import { playerAction } from "../src/interfaces/game/actions/createaction";
import {
    playerIsReadyAction,
    playerJoinedAction,
} from "../src/interfaces/game/actions/joinphase";
import {
    DealPhaseTag,
    DefaultGameState,
    JoinPhaseState,
    JoinPhaseTag,
} from "../src/interfaces/game/state/state";
import { updateGameState } from "../src/interfaces/game/update/update";

describe("Update join phase", () => {
    it("should allow player 0 to join", () => {
        const s0 = DefaultGameState;
        const s0_expected: JoinPhaseState = {
            phase: JoinPhaseTag,
            players: [null, null, null, null],
        };
        deepEqual(s0, s0_expected);

        const s1 = updateGameState(s0, playerAction(0, playerJoinedAction()));

        const s1_expected: JoinPhaseState = {
            phase: JoinPhaseTag,
            players: [{ ready: false }, null, null, null],
        };

        deepEqual(s1, s1_expected);
    });

    it("should allow player 1 to join after player 0 has joined", () => {
        const s0: JoinPhaseState = {
            phase: JoinPhaseTag,
            players: [{ ready: false }, null, null, null],
        };

        const s1 = updateGameState(s0, playerAction(1, playerJoinedAction()));

        const s1_expected: JoinPhaseState = {
            phase: JoinPhaseTag,
            players: [{ ready: false }, { ready: false }, null, null],
        };

        deepEqual(s1, s1_expected);
    });

    it("should advance to the deal phase when the last player is ready", () => {
        const s0: JoinPhaseState = {
            phase: JoinPhaseTag,
            players: [
                { name: "a", position: "North", ready: true },
                { name: "b", position: "South", ready: true },
                { name: "c", position: "East", ready: true },
                { name: "d", position: "West", ready: false },
            ],
        };

        const a = playerAction(3, playerIsReadyAction());

        const s1 = updateGameState(s0, a);

        strictEqual(s1.phase, DealPhaseTag);
        if (s1.phase !== DealPhaseTag) {
            throw Error("What???");
        }

        const p0 = s1.players[0];
        const p1 = s1.players[1];
        const p2 = s1.players[2];
        const p3 = s1.players[3];

        strictEqual(p0.connected, true);
        strictEqual(countStack(p0.firstDeal), 8);
        strictEqual(countStack(p0.secondDeal), 6);
        strictEqual(p0.tookSecondDeal, false);
        deepEqual(p0.profile, {
            name: "a",
            position: "North",
        });

        strictEqual(p1.connected, true);
        strictEqual(countStack(p1.firstDeal), 8);
        strictEqual(countStack(p1.secondDeal), 6);
        strictEqual(p1.tookSecondDeal, false);
        deepEqual(p1.profile, {
            name: "b",
            position: "South",
        });

        strictEqual(p2.connected, true);
        strictEqual(countStack(p2.firstDeal), 8);
        strictEqual(countStack(p2.secondDeal), 6);
        strictEqual(p2.tookSecondDeal, false);
        deepEqual(p2.profile, {
            name: "c",
            position: "East",
        });

        strictEqual(p3.connected, true);
        strictEqual(countStack(p3.firstDeal), 8);
        strictEqual(countStack(p3.secondDeal), 6);
        strictEqual(p3.tookSecondDeal, false);
        deepEqual(p3.profile, {
            name: "d",
            position: "West",
        });
    });
});
