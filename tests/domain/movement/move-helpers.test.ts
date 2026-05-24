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
import { readBaseMove } from "@src/domain/movement/move-helpers";
import { MOVEMENT_MEDIUM } from "@src/utils/constants";

describe("readBaseMove", () => {
    const sample = {
        terrestrial: 30,
        aquatic: 15,
        aerial: 60,
        burrowing: 5,
        astral: 100,
    };

    it("reads each medium independently", () => {
        expect(readBaseMove(sample, MOVEMENT_MEDIUM.TERRESTRIAL)).toBe(30);
        expect(readBaseMove(sample, MOVEMENT_MEDIUM.AQUATIC)).toBe(15);
        expect(readBaseMove(sample, MOVEMENT_MEDIUM.AERIAL)).toBe(60);
        expect(readBaseMove(sample, MOVEMENT_MEDIUM.BURROWING)).toBe(5);
        expect(readBaseMove(sample, MOVEMENT_MEDIUM.ASTRAL)).toBe(100);
    });

    it("returns 0 when moveBase is undefined (no lineage)", () => {
        expect(readBaseMove(undefined, MOVEMENT_MEDIUM.TERRESTRIAL)).toBe(0);
    });

    it("returns 0 when moveBase is null", () => {
        expect(readBaseMove(null, MOVEMENT_MEDIUM.TERRESTRIAL)).toBe(0);
    });

    it("returns 0 for a medium the creature has no value in (fish on land)", () => {
        const fish = {
            terrestrial: 0,
            aquatic: 30,
            aerial: 0,
            burrowing: 0,
            astral: 0,
        };
        expect(readBaseMove(fish, MOVEMENT_MEDIUM.TERRESTRIAL)).toBe(0);
        expect(readBaseMove(fish, MOVEMENT_MEDIUM.AQUATIC)).toBe(30);
    });

    it("returns 0 for an unrecognized medium key", () => {
        expect(
            readBaseMove(sample, "ethereal" as any),
        ).toBe(0);
    });

    it("reflects post-AE values (caller passes already-modified dict)", () => {
        // Foundry has applied an AE that doubled terrestrial; the dict we
        // receive is already post-AE. readBaseMove just reads it.
        const postAE = { ...sample, terrestrial: 60 };
        expect(readBaseMove(postAE, MOVEMENT_MEDIUM.TERRESTRIAL)).toBe(60);
    });
});
