import { deepEqual } from "assert/strict";
import {
    CardStack,
    dealCards,
    EmptyDoubleStack,
    EmptyStack,
    EmptyTripleStack,
} from "../src/interfaces/cards";
import { mapAllPlayers } from "../src/interfaces/game/player/player";
import {
    DealPhaseState,
    DealPhaseTag,
    DefaultGameState,
    JoinPhaseState,
    JoinPhaseTag,
    PassPhaseState,
    PassPhaseTag,
    PlayPhaseState,
    PlayPhaseTag,
    ScorePhaseState,
    ScorePhaseTag,
} from "../src/interfaces/game/state/state";
import {
    viewGameState,
    viewJoinPhase,
} from "../src/interfaces/game/view/stateview";

import {
    clientFailedToJoinGameMessage,
    clientJoinedGameMessage,
    clientWasKickedMessage,
    clientWillBeKickedSoonMessage,
    JoinFailedBecauseBanned,
    JoinFailedBecauseFull,
    JoinFailedBecauseWrongPassword,
    serializeServerMessage,
    updatedPlayerStateMessage,
} from "../src/interfaces/messages/servermessages";
import { parseServerMessage } from "../src/interfaces/parse/messages";
import { generateNewSessionToken } from "../src/sessiontoken";
import { defaultPlayerProfiles } from "./playerprofiles";

describe("Parse server messages", () => {
    it("Should be able to parse a kick warning message", () => {
        const m = clientWillBeKickedSoonMessage();
        const m_s = serializeServerMessage(m);
        const m_d = parseServerMessage(m_s);
        deepEqual(m_d, m);
    });

    it("Should be able to parse a kick message", () => {
        const m = clientWasKickedMessage();
        const m_s = serializeServerMessage(m);
        const m_d = parseServerMessage(m_s);
        deepEqual(m_d, m);
    });

    it("Should be able to parse a join message", () => {
        const s = DefaultGameState;
        const sv = viewJoinPhase(s, 0);
        const tk = generateNewSessionToken();
        const m = clientJoinedGameMessage(sv, tk);
        const m_s = serializeServerMessage(m);
        const m_d = parseServerMessage(m_s);
        deepEqual(m_d, m);
    });

    it("Should be able to parse a join failed because full message", () => {
        const m = clientFailedToJoinGameMessage(JoinFailedBecauseFull);
        const m_s = serializeServerMessage(m);
        const m_d = parseServerMessage(m_s);
        deepEqual(m_d, m);
    });

    it("Should be able to parse a join failed because wrong password message", () => {
        const m = clientFailedToJoinGameMessage(JoinFailedBecauseWrongPassword);
        const m_s = serializeServerMessage(m);
        const m_d = parseServerMessage(m_s);
        deepEqual(m_d, m);
    });

    it("Should be able to parse a join failed because banned message", () => {
        const m = clientFailedToJoinGameMessage(JoinFailedBecauseBanned);
        const m_s = serializeServerMessage(m);
        const m_d = parseServerMessage(m_s);
        deepEqual(m_d, m);
    });

    it("Should be able to parse an updated player state message during join phase", () => {
        const s: JoinPhaseState = {
            phase: JoinPhaseTag,
            players: [
                { ready: false },
                null,
                { name: "c", position: "East", ready: false },
                { name: "d", position: "West", ready: true },
            ],
        };
        const sv = viewGameState(s, 0);
        const m = updatedPlayerStateMessage(sv);
        const m_s = serializeServerMessage(m);
        const m_d = parseServerMessage(m_s);
        deepEqual(m_d, m);
    });

    it("Should be able to parse an updated player state message during deal phase", () => {
        const all_hands = dealCards();
        const first_deals = mapAllPlayers(
            all_hands,
            (cs, _): CardStack => ({ cards: cs.cards.slice(0, 8) })
        );
        const second_deals = mapAllPlayers(
            all_hands,
            (cs, _): CardStack => ({ cards: cs.cards.slice(8, 14) })
        );
        const profiles = defaultPlayerProfiles();
        const s: DealPhaseState = {
            phase: DealPhaseTag,
            players: mapAllPlayers(profiles, (p, i) => ({
                profile: p,
                firstDeal: first_deals[i],
                secondDeal: second_deals[i],
                connected: true,
                tookSecondDeal: false,
            })),
        };
        const sv = viewGameState(s, 0);
        const m = updatedPlayerStateMessage(sv);
        const m_s = serializeServerMessage(m);
        const m_d = parseServerMessage(m_s);
        deepEqual(m_d, m);
    });

    it("Should be able to parse an updated player state message during pass phase", () => {
        const all_hands = dealCards();
        const profiles = defaultPlayerProfiles();
        const s: PassPhaseState = {
            phase: PassPhaseTag,
            players: mapAllPlayers(profiles, (p, i) => ({
                profile: p,
                inHand: all_hands[i],
                give: {
                    leftOpponent: null,
                    partner: null,
                    rightOpponent: null,
                },
                ready: false,
                connected: true,
            })),
        };
        const sv = viewGameState(s, 0);
        const m = updatedPlayerStateMessage(sv);
        const m_s = serializeServerMessage(m);
        const m_d = parseServerMessage(m_s);
        deepEqual(m_d, m);
    });

    it("Should be able to parse an updated player state message during play phase", () => {
        const all_hands = dealCards();
        const profiles = defaultPlayerProfiles();
        const s: PlayPhaseState = {
            phase: PlayPhaseTag,
            currentTrick: EmptyDoubleStack,
            players: mapAllPlayers(profiles, (p, i) => ({
                profile: p,
                inHand: all_hands[i],
                staged: EmptyStack,
                tricksWon: EmptyTripleStack,
                connected: true,
            })),
        };
        const sv = viewGameState(s, 0);
        const m = updatedPlayerStateMessage(sv);
        const m_s = serializeServerMessage(m);
        const m_d = parseServerMessage(m_s);
        deepEqual(m_d, m);
    });

    it("Should be able to parse an updated player state message during score phase", () => {
        const all_hands = dealCards();
        const profiles = defaultPlayerProfiles();
        const s: ScorePhaseState = {
            phase: ScorePhaseTag,
            players: mapAllPlayers(profiles, (p, i) => ({
                profile: p,
                cards: all_hands[i],
                readyToPlayAgain: false,
                connected: true,
            })),
        };
        const sv = viewGameState(s, 0);
        const m = updatedPlayerStateMessage(sv);
        const m_s = serializeServerMessage(m);
        const m_d = parseServerMessage(m_s);
        deepEqual(m_d, m);
    });
});
