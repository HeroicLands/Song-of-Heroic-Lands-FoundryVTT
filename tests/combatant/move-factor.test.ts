/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
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
    computeMove,
    chooseInitialDisplayedMedium,
} from "@src/document/combatant/logic/CombatantLogic";
import { MOVEMENT_MEDIUM } from "@src/utils/constants";

function fakeBeingLogic(moveBase: Record<string, number>) {
    return {
        effectiveBaseMove(medium: string) {
            return { effective: moveBase[medium] ?? 0 };
        },
    };
}

describe("computeMove", () => {
    it("multiplies effective base move by moveFactor", () => {
        const beingLogic = fakeBeingLogic({ terrestrial: 30 });
        expect(computeMove(beingLogic, MOVEMENT_MEDIUM.TERRESTRIAL, 1)).toBe(30);
        expect(computeMove(beingLogic, MOVEMENT_MEDIUM.TERRESTRIAL, 0.5))
            .toBe(15);
        expect(computeMove(beingLogic, MOVEMENT_MEDIUM.TERRESTRIAL, 2)).toBe(60);
    });

    it("returns null when actor has no BeingLogic (e.g. vehicle)", () => {
        expect(computeMove(undefined, MOVEMENT_MEDIUM.TERRESTRIAL, 1)).toBeNull();
        expect(computeMove(null, MOVEMENT_MEDIUM.TERRESTRIAL, 1)).toBeNull();
    });

    it("returns null when the base move for that medium is 0", () => {
        const beingLogic = fakeBeingLogic({ terrestrial: 0, aerial: 60 });
        expect(computeMove(beingLogic, MOVEMENT_MEDIUM.TERRESTRIAL, 1)).toBeNull();
        // Other media still work
        expect(computeMove(beingLogic, MOVEMENT_MEDIUM.AERIAL, 1)).toBe(60);
    });

    it("returns 0 when moveFactor is 0 (creature cannot move this turn)", () => {
        const beingLogic = fakeBeingLogic({ terrestrial: 30 });
        expect(computeMove(beingLogic, MOVEMENT_MEDIUM.TERRESTRIAL, 0)).toBe(0);
    });
});

describe("chooseInitialDisplayedMedium", () => {
    it("returns the user-set medium when explicitly provided", () => {
        expect(
            chooseInitialDisplayedMedium(
                MOVEMENT_MEDIUM.AQUATIC,
                MOVEMENT_MEDIUM.AERIAL,
            ),
        ).toBe(MOVEMENT_MEDIUM.AQUATIC);
    });

    it("returns the lineage default when user didn't set a medium", () => {
        expect(
            chooseInitialDisplayedMedium(undefined, MOVEMENT_MEDIUM.AERIAL),
        ).toBe(MOVEMENT_MEDIUM.AERIAL);
    });

    it("returns the lineage default for burrowing creature", () => {
        expect(
            chooseInitialDisplayedMedium(undefined, MOVEMENT_MEDIUM.BURROWING),
        ).toBe(MOVEMENT_MEDIUM.BURROWING);
    });

    it("returns null when neither user-set nor lineage-default is available", () => {
        expect(chooseInitialDisplayedMedium(undefined, undefined)).toBeNull();
        expect(chooseInitialDisplayedMedium(null, null)).toBeNull();
    });

    it("treats empty string as no preference", () => {
        expect(
            chooseInitialDisplayedMedium("", MOVEMENT_MEDIUM.AERIAL),
        ).toBe(MOVEMENT_MEDIUM.AERIAL);
    });
});
