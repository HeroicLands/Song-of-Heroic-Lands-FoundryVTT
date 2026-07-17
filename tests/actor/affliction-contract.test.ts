/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
import {
    AfflictionChoice,
    CONTRACT_AFFLICTION_CUSTOM,
    buildContractedAfflictionData,
    contagionTarget,
    readContractAfflictionForm,
} from "@src/document/actor/logic/affliction-contract";
import { ITEM_KIND } from "@src/utils/constants";

const AFFLICTIONS: AfflictionChoice[] = [
    {
        name: "Grippe",
        contagionIndex: 3,
        source: { _id: "src1", type: "affliction", name: "Grippe" },
    },
    {
        name: "Marsh Fever",
        contagionIndex: 2,
        source: { _id: "src2", type: "affliction", name: "Marsh Fever" },
    },
];

describe("contagionTarget", () => {
    it("is CI × Endurance", () => {
        expect(contagionTarget(3, 13)).toBe(39);
        expect(contagionTarget(5, 20)).toBe(100);
    });

    it("makes a lower CI a lower (easier-to-fail) target — lower CI is more contagious", () => {
        expect(contagionTarget(1, 12)).toBeLessThan(contagionTarget(5, 12));
    });

    it("never returns negative and coerces non-finite to 0", () => {
        expect(contagionTarget(-3, 10)).toBe(0);
        expect(contagionTarget(NaN, 10)).toBe(0);
    });
});

describe("readContractAfflictionForm", () => {
    it("reads an existing affliction by its index, carrying source and CI", () => {
        const choice = readContractAfflictionForm(
            { selection: "1" },
            AFFLICTIONS,
        );
        expect(choice).toEqual({
            kind: "existing",
            name: "Marsh Fever",
            contagionIndex: 2,
            source: AFFLICTIONS[1].source,
        });
    });

    it("returns null for an unknown index", () => {
        expect(
            readContractAfflictionForm({ selection: "9" }, AFFLICTIONS),
        ).toBeNull();
    });

    it("reads a custom disease (subtype fixed to disease), trimming the name and clamping CI to 1..5", () => {
        expect(
            readContractAfflictionForm(
                {
                    selection: CONTRACT_AFFLICTION_CUSTOM,
                    customName: "  Rattle Cough  ",
                    customCI: "7",
                },
                AFFLICTIONS,
            ),
        ).toEqual({
            kind: "custom",
            name: "Rattle Cough",
            subType: "disease",
            contagionIndex: 5,
        });
        expect(
            readContractAfflictionForm(
                {
                    selection: CONTRACT_AFFLICTION_CUSTOM,
                    customName: "Chill",
                    customCI: "0",
                },
                AFFLICTIONS,
            ),
        ).toMatchObject({ contagionIndex: 1 });
    });

    it("returns null for a custom affliction with no name", () => {
        expect(
            readContractAfflictionForm(
                { selection: CONTRACT_AFFLICTION_CUSTOM, customName: "   " },
                AFFLICTIONS,
            ),
        ).toBeNull();
    });
});

describe("buildContractedAfflictionData", () => {
    it("copies an existing affliction's source, dropping its _id", () => {
        const data = buildContractedAfflictionData({
            kind: "existing",
            name: "Grippe",
            contagionIndex: 3,
            source: AFFLICTIONS[0].source,
        });
        expect(data).not.toHaveProperty("_id");
        expect(data).toMatchObject({ type: "affliction", name: "Grippe" });
    });

    it("builds a fresh affliction item from a custom choice", () => {
        const data = buildContractedAfflictionData({
            kind: "custom",
            name: "Rattle Cough",
            subType: "disease",
            contagionIndex: 4,
        });
        expect(data).toEqual({
            type: ITEM_KIND.AFFLICTION,
            name: "Rattle Cough",
            system: { subType: "disease", contagionIndexBase: 4 },
        });
    });
});
