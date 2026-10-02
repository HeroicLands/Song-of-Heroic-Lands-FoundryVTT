/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
import {
    IMPACT_TA_DEFAULT,
    impactTacticalAdvantageValue,
    impactTacticalAdvantageBonus,
} from "@src/entity/strikemode/impactTacticalAdvantage";
import { IMPACT_ASPECT, ImpactAspects } from "@src/utils/constants";

/** A strike mode stub carrying only what the rule reads. */
function mode(aspect: string, traits: Record<string, unknown> = {}) {
    return { impact: { aspectType: aspect }, traits } as never;
}

describe("IMPACT_TA_DEFAULT", () => {
    it("covers every impact aspect the system models", () => {
        // Derived from the enum, so a new aspect fails here rather than
        // silently resolving to no value.
        expect(Object.keys(IMPACT_TA_DEFAULT).sort()).toEqual([...ImpactAspects].sort());
    });

    it("carries the published per-aspect values", () => {
        expect(IMPACT_TA_DEFAULT[IMPACT_ASPECT.BLUNT]).toBe(3);
        expect(IMPACT_TA_DEFAULT[IMPACT_ASPECT.EDGED]).toBe(5);
        expect(IMPACT_TA_DEFAULT[IMPACT_ASPECT.PIERCING]).toBe(4);
        expect(IMPACT_TA_DEFAULT[IMPACT_ASPECT.FIRE]).toBe(2);
    });
});

describe("impactTacticalAdvantageValue", () => {
    it("falls back to the aspect default for each aspect", () => {
        expect(impactTacticalAdvantageValue(mode(IMPACT_ASPECT.BLUNT))).toBe(3);
        expect(impactTacticalAdvantageValue(mode(IMPACT_ASPECT.EDGED))).toBe(5);
        expect(impactTacticalAdvantageValue(mode(IMPACT_ASPECT.PIERCING))).toBe(4);
        expect(impactTacticalAdvantageValue(mode(IMPACT_ASPECT.FIRE))).toBe(2);
    });

    it("an impTA trait overrides the aspect default rather than adding to it", () => {
        // A Battleaxe cut at impTA 6 is worth 6 per TA, not edged's 5 plus 6.
        expect(impactTacticalAdvantageValue(mode(IMPACT_ASPECT.EDGED, { impTA: 6 }))).toBe(6);
    });

    it("an override below the aspect default still wins", () => {
        expect(impactTacticalAdvantageValue(mode(IMPACT_ASPECT.EDGED, { impTA: 2 }))).toBe(2);
    });

    it("a zero impTA is the authored default and defers to the aspect", () => {
        // Content seeds `impTA: 0` on every mode that states no override, so a
        // zero must read as "unset" or every aspect default would be erased.
        expect(impactTacticalAdvantageValue(mode(IMPACT_ASPECT.BLUNT, { impTA: 0 }))).toBe(3);
    });

    it("a mode with no traits bag at all resolves by aspect", () => {
        expect(
            impactTacticalAdvantageValue({ impact: { aspectType: IMPACT_ASPECT.EDGED } } as never),
        ).toBe(5);
    });

    it("an unrecognized aspect yields no value", () => {
        expect(impactTacticalAdvantageValue(mode("frost"))).toBeUndefined();
    });
});

describe("impactTacticalAdvantageBonus", () => {
    it("is nothing when no Tactical Advantage is spent", () => {
        expect(impactTacticalAdvantageBonus(mode(IMPACT_ASPECT.BLUNT), 0)).toBe(0);
    });

    it("multiplies the value by the number spent", () => {
        // Two TAs on a blunt attack: 2 × 3.
        expect(impactTacticalAdvantageBonus(mode(IMPACT_ASPECT.BLUNT), 2)).toBe(6);
        // The same attack from a mode overriding to 6: 2 × 6.
        expect(impactTacticalAdvantageBonus(mode(IMPACT_ASPECT.BLUNT, { impTA: 6 }), 2)).toBe(12);
    });

    it("ignores a negative or fractional spend", () => {
        expect(impactTacticalAdvantageBonus(mode(IMPACT_ASPECT.EDGED), -1)).toBe(0);
        expect(impactTacticalAdvantageBonus(mode(IMPACT_ASPECT.EDGED), 1.9)).toBe(5);
    });

    it("is nothing when the mode's aspect carries no value", () => {
        expect(impactTacticalAdvantageBonus(mode("frost"), 3)).toBe(0);
    });
});
