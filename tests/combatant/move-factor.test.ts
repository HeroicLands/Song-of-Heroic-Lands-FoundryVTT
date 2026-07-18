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
import { chooseInitialDisplayedMedium } from "@src/document/combatant/logic/SohlCombatantLogic";
import { MOVEMENT_MEDIUM } from "@src/utils/constants";

describe("chooseInitialDisplayedMedium", () => {
    it("returns the user-set medium when explicitly provided", () => {
        expect(
            chooseInitialDisplayedMedium(
                MOVEMENT_MEDIUM.AQUATIC,
                MOVEMENT_MEDIUM.AERIAL,
            ),
        ).toBe(MOVEMENT_MEDIUM.AQUATIC);
    });

    it("returns the corpus default when user didn't set a medium", () => {
        expect(
            chooseInitialDisplayedMedium(undefined, MOVEMENT_MEDIUM.AERIAL),
        ).toBe(MOVEMENT_MEDIUM.AERIAL);
    });

    it("returns the corpus default for burrowing creature", () => {
        expect(
            chooseInitialDisplayedMedium(undefined, MOVEMENT_MEDIUM.BURROWING),
        ).toBe(MOVEMENT_MEDIUM.BURROWING);
    });

    it("returns null when neither user-set nor corpus-default is available", () => {
        expect(chooseInitialDisplayedMedium(undefined, undefined)).toBeNull();
        expect(chooseInitialDisplayedMedium(null, null)).toBeNull();
    });

    it("treats empty string as no preference", () => {
        expect(chooseInitialDisplayedMedium("", MOVEMENT_MEDIUM.AERIAL)).toBe(
            MOVEMENT_MEDIUM.AERIAL,
        );
    });
});
