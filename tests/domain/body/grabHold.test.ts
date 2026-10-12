/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
import {
    canAnswerHold,
    nextHoldMaintenanceRound,
    holdLocation,
    type GrabHoldState,
} from "@src/entity/body/grabHold";
import type { SettledGrabTrial } from "@src/entity/strikemode/grabTrial";
const trial = {
    choice: { manoeuvre: "hold" },
    outcome: { initiatorWins: true },
    targetPartCode: "arm",
} as SettledGrabTrial;
const hold: GrabHoldState = {
    traumaId: "own",
    bodyLocationCode: "hand",
    status: "active",
    revision: 0,
};
describe("Hold identity and maintenance", () => {
    it("locates the struck part without changing its grip", () => {
        const parts = [
            { shortcode: "arm", heldItemId: "sword", locations: [{ shortcode: "hand" }] },
        ];
        expect(holdLocation(trial, parts)).toBe("hand");
        expect(parts[0].heldItemId).toBe("sword");
    });
    it("cannot immobilize another part when the struck part disappeared", () => {
        expect(
            holdLocation(trial, [{ shortcode: "leg", locations: [{ shortcode: "foot" }] }]),
        ).toBeUndefined();
    });
    it("does not apply a condition after a lost or Take trial", () => {
        expect(
            holdLocation({ ...trial, outcome: { ...trial.outcome, initiatorWins: false } }, []),
        ).toBeUndefined();
        expect(
            holdLocation({ ...trial, choice: { ...trial.choice, manoeuvre: "take" } }, []),
        ).toBeUndefined();
    });
    it("accepts a current revision on the grabber turn", () => {
        expect(canAnswerHold(hold, { revision: 0, turnKey: "combat:2:1" }, "combat:2:1")).toBe(
            true,
        );
    });
    it("rejects stale turns, answered revisions, and repeated same-turn contests", () => {
        expect(canAnswerHold(hold, { revision: 0, turnKey: "old" }, "new")).toBe(false);
        expect(
            canAnswerHold({ ...hold, revision: 1 }, { revision: 0, turnKey: "new" }, "new"),
        ).toBe(false);
        expect(
            canAnswerHold({ ...hold, lastTurnKey: "new" }, { revision: 0, turnKey: "new" }, "new"),
        ).toBe(false);
    });
    it("a target turn supplies no grabber turn key and cannot reroll escape", () => {
        expect(canAnswerHold(hold, { revision: 0, turnKey: "new" }, undefined)).toBe(false);
    });
    it("loss cleanup and released holds cannot be renewed", () => {
        for (const status of ["prepared", "ending", "ended"] as const)
            expect(canAnswerHold({ ...hold, status }, { revision: 0, turnKey: "new" }, "new")).toBe(
                false,
            );
    });
});

describe("counterstrike Hold maintenance timing", () => {
    it("a grabber whose turn is still ahead maintains in this round", () => {
        expect(nextHoldMaintenanceRound(4, 1, 3)).toBe(4);
    });
    it("a grabber whose turn already passed maintains next round", () => {
        expect(nextHoldMaintenanceRound(4, 3, 1)).toBe(5);
    });
    it("an attacking grabber on its current turn maintains next round", () => {
        expect(nextHoldMaintenanceRound(4, 2, 2)).toBe(5);
    });
});
