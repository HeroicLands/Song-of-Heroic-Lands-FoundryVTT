/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
import {
    AfflictionChoice,
    buildContractedAfflictionData,
    readContagionTestForm,
} from "@src/document/actor/logic/affliction-contract";

const AFFLICTIONS: AfflictionChoice[] = [
    {
        name: "Grippe",
        shortcode: "grippe",
        onsetFormula: "2d6",
        contagionIndex: 3,
        source: { _id: "src1", type: "affliction", name: "Grippe" },
    },
    {
        name: "Marsh Fever",
        shortcode: "marshfever",
        onsetFormula: null,
        contagionIndex: 2,
        source: {
            _id: "src2",
            type: "affliction",
            name: "Marsh Fever",
            system: { contagionIndexBase: 2 },
        },
    },
];

describe("readContagionTestForm (#1183)", () => {
    it("selects the affliction by shortcode, not by index", () => {
        const choice = readContagionTestForm(
            { affliction: "marshfever" },
            AFFLICTIONS,
        );
        expect(choice?.affliction.name).toBe("Marsh Fever");
        expect(choice?.affliction.contagionIndex).toBe(2);
    });

    it("returns null for an unknown shortcode", () => {
        expect(readContagionTestForm({ affliction: "nope" }, AFFLICTIONS)).toBe(
            null,
        );
        expect(readContagionTestForm({}, AFFLICTIONS)).toBe(null);
    });

    it("reads the situational and success-level modifiers as integers", () => {
        const choice = readContagionTestForm(
            {
                affliction: "grippe",
                situationalModifier: "-10",
                successLevelMod: "2",
            },
            AFFLICTIONS,
        );
        expect(choice?.situationalModifier).toBe(-10);
        expect(choice?.successLevelMod).toBe(2);
    });

    it("defaults both modifiers to 0 when absent or unparseable", () => {
        const choice = readContagionTestForm(
            { affliction: "grippe", situationalModifier: "abc" },
            AFFLICTIONS,
        );
        expect(choice?.situationalModifier).toBe(0);
        expect(choice?.successLevelMod).toBe(0);
    });

    it("reads the record checkbox as a boolean", () => {
        expect(
            readContagionTestForm(
                { affliction: "grippe", record: true },
                AFFLICTIONS,
            )?.record,
        ).toBe(true);
        expect(
            readContagionTestForm({ affliction: "grippe" }, AFFLICTIONS)
                ?.record,
        ).toBe(false);
    });
});

describe("buildContractedAfflictionData (#1183)", () => {
    it("copies the source affliction without its _id", () => {
        const data = buildContractedAfflictionData(AFFLICTIONS[0], 1000, 0);
        expect(data._id).toBeUndefined();
        expect(data.type).toBe("affliction");
        expect(data.name).toBe("Grippe");
    });

    it("anchors the contract at now and records the rolled incubation", () => {
        const data = buildContractedAfflictionData(
            AFFLICTIONS[0],
            5_000,
            3 * 86_400,
        ) as { system: Record<string, unknown> };
        expect(data.system.contractDate).toBe(5_000);
        expect(data.system.onsetDurationBase).toBe(3 * 86_400);
    });

    it("preserves the source's own system fields alongside the new anchors", () => {
        const data = buildContractedAfflictionData(AFFLICTIONS[1], 42, 0) as {
            system: Record<string, unknown>;
        };
        expect(data.system.contagionIndexBase).toBe(2);
        expect(data.system.contractDate).toBe(42);
        expect(data.system.onsetDurationBase).toBe(0);
    });
});
