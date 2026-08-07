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
    resolveActorSheetParts,
    buildMovementRows,
} from "@src/document/actor/logic/sheet-parts";
import { MOVEMENT_MEDIUM, MovementMediumChoices } from "@src/utils/constants";

/** The Being sheet's declared parts, in declaration order. */
const BEING_PARTS = [
    "header",
    "tabs",
    "facade",
    "profile",
    "skills",
    "combat",
    "trauma",
    "mysteries",
    "gear",
    "actions",
    "effects",
];

/** A fenced sheet's declared parts (Vehicle / Structure), in order. */
const VEHICLE_PARTS = [
    "fencedBanner",
    "header",
    "tabs",
    "facade",
    "gear",
    "actions",
    "effects",
];

describe("resolveActorSheetParts", () => {
    it("renders every declared content part, in declaration order", () => {
        expect(
            resolveActorSheetParts(BEING_PARTS, {
                isFenced: false,
                isLimited: false,
            }),
        ).toEqual(BEING_PARTS);
    });

    // The #1088 regression: a fenced sheet declared gear/actions/effects but the
    // base sheet hard-coded the render list to header/tabs/facade, so those tabs
    // had no section in the DOM at all.
    it("renders a fenced sheet's content parts, not just the facade (#1088)", () => {
        expect(
            resolveActorSheetParts(VEHICLE_PARTS, {
                isFenced: true,
                isLimited: false,
            }),
        ).toEqual(VEHICLE_PARTS);
    });

    it("keeps the fenced banner first, above the header", () => {
        const parts = resolveActorSheetParts(VEHICLE_PARTS, {
            isFenced: true,
            isLimited: false,
        });
        expect(parts[0]).toBe("fencedBanner");
        expect(parts.indexOf("header")).toBe(1);
    });

    it("drops the fenced banner when the type is not fenced", () => {
        expect(
            resolveActorSheetParts(VEHICLE_PARTS, {
                isFenced: false,
                isLimited: false,
            }),
        ).toEqual(["header", "tabs", "facade", "gear", "actions", "effects"]);
    });

    it("omits the detail tabs under limited permission", () => {
        expect(
            resolveActorSheetParts(BEING_PARTS, {
                isFenced: false,
                isLimited: true,
            }),
        ).toEqual(["header", "tabs", "facade"]);
    });

    it("keeps the fenced banner under limited permission", () => {
        expect(
            resolveActorSheetParts(VEHICLE_PARTS, {
                isFenced: true,
                isLimited: true,
            }),
        ).toEqual(["fencedBanner", "header", "tabs", "facade"]);
    });

    it("returns an empty list for a sheet with no declared parts", () => {
        expect(
            resolveActorSheetParts([], { isFenced: true, isLimited: false }),
        ).toEqual([]);
    });
});

describe("buildMovementRows (#1204)", () => {
    /** A minimal authored movement profile. */
    function profile(medium: string, feetPerRound: number) {
        return {
            medium,
            feetPerRound,
            leaguesPerWatch: 0,
            encumbrance: "0",
            strMod: "0",
            disabled: false,
        } as any;
    }

    it("always leads with the no-movement row, so any actor can be made immobile", () => {
        const rows = buildMovementRows([], MOVEMENT_MEDIUM.NONE);

        expect(rows).toHaveLength(1);
        expect(rows[0].medium).toBe(MOVEMENT_MEDIUM.NONE);
        expect(rows[0].value).toBe(0);
    });

    it("lists each authored profile after it, with its tactical move", () => {
        const rows = buildMovementRows(
            [
                profile(MOVEMENT_MEDIUM.TERRESTRIAL, 30),
                profile(MOVEMENT_MEDIUM.AQUATIC, 12),
            ],
            MOVEMENT_MEDIUM.TERRESTRIAL,
        );

        expect(rows.map((r) => r.medium)).toEqual([
            MOVEMENT_MEDIUM.NONE,
            MOVEMENT_MEDIUM.TERRESTRIAL,
            MOVEMENT_MEDIUM.AQUATIC,
        ]);
        expect(rows[1].value).toBe(30);
        expect(rows[2].value).toBe(12);
    });

    it("stars exactly the actor's current medium", () => {
        const rows = buildMovementRows(
            [
                profile(MOVEMENT_MEDIUM.TERRESTRIAL, 30),
                profile(MOVEMENT_MEDIUM.AQUATIC, 12),
            ],
            MOVEMENT_MEDIUM.AQUATIC,
        );

        expect(rows.map((r) => r.isCurrent)).toEqual([false, false, true]);
    });

    it("stars the no-movement row for a non-mover", () => {
        const rows = buildMovementRows(
            [profile(MOVEMENT_MEDIUM.TERRESTRIAL, 30)],
            MOVEMENT_MEDIUM.NONE,
        );

        expect(rows[0].isCurrent).toBe(true);
        expect(rows[1].isCurrent).toBe(false);
    });

    it("carries a localization key for each medium's label", () => {
        const rows = buildMovementRows(
            [profile(MOVEMENT_MEDIUM.TERRESTRIAL, 30)],
            MOVEMENT_MEDIUM.TERRESTRIAL,
        );

        expect(rows[1].label).toBe(
            MovementMediumChoices[MOVEMENT_MEDIUM.TERRESTRIAL],
        );
    });
});
