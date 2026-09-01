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
    eligibleFateSources,
    fatePointsAvailable,
    preferredFateSource,
    resolveFateOutcome,
    type FateMysteryProjection,
} from "@src/document/item/logic/fate";
import {
    CRITICAL_FAILURE,
    CRITICAL_SUCCESS,
    MARGINAL_FAILURE,
    MARGINAL_SUCCESS,
    MYSTERY_SUBTYPE,
} from "@src/utils/constants";

const FATE = MYSTERY_SUBTYPE.FATE;

function proj(
    over: Partial<FateMysteryProjection<string>> & { ref: string },
): FateMysteryProjection<string> {
    return {
        subType: FATE,
        assocSkillCode: null,
        infinite: false,
        remaining: 1,
        ...over,
    };
}

describe("resolveFateOutcome — rung-driven, not isSuccess (#854)", () => {
    it("critical failure consumes a point for no effect", () => {
        expect(resolveFateOutcome(CRITICAL_FAILURE)).toEqual({
            path: "loseFateNoEffect",
            consumesPoint: true,
            levelDelta: 0,
            requiresChoice: false,
        });
    });

    it("marginal failure neither consumes nor bumps", () => {
        expect(resolveFateOutcome(MARGINAL_FAILURE)).toEqual({
            path: "noLossNoEffect",
            consumesPoint: false,
            levelDelta: 0,
            requiresChoice: false,
        });
    });

    it("marginal success consumes a point for +1", () => {
        expect(resolveFateOutcome(MARGINAL_SUCCESS)).toEqual({
            path: "success",
            consumesPoint: true,
            levelDelta: 1,
            requiresChoice: false,
        });
    });

    it("critical success defaults to the spending (+2) branch", () => {
        expect(resolveFateOutcome(CRITICAL_SUCCESS)).toEqual({
            path: "critSpend",
            consumesPoint: true,
            levelDelta: 2,
            requiresChoice: true,
        });
    });

    it("critical success 'keep' branch bumps +1 without consuming", () => {
        expect(resolveFateOutcome(CRITICAL_SUCCESS, "keep")).toEqual({
            path: "critKeep",
            consumesPoint: false,
            levelDelta: 1,
            requiresChoice: true,
        });
    });

    it("critical success 'spend' branch bumps +2 and consumes", () => {
        expect(resolveFateOutcome(CRITICAL_SUCCESS, "spend")).toEqual({
            path: "critSpend",
            consumesPoint: true,
            levelDelta: 2,
            requiresChoice: true,
        });
    });
});

describe("eligibleFateSources — scope + charge availability", () => {
    it("keeps general (null) and matching skill-specific fate mysteries", () => {
        const sources = [
            proj({ ref: "general", assocSkillCode: null }),
            proj({ ref: "melee", assocSkillCode: "melee" }),
            proj({ ref: "other-skill", assocSkillCode: "init" }),
        ];
        const eligible = eligibleFateSources(sources, FATE, "melee");
        expect(eligible.map((p) => p.ref)).toEqual(["general", "melee"]);
    });

    it("excludes non-fate mysteries", () => {
        const sources = [
            proj({ ref: "fate", subType: FATE }),
            proj({ ref: "blessing", subType: MYSTERY_SUBTYPE.OTHER }),
        ];
        expect(eligibleFateSources(sources, FATE, "melee").map((p) => p.ref)).toEqual(["fate"]);
    });

    it("excludes depleted finite sources but keeps infinite ones", () => {
        const sources = [
            proj({ ref: "spent", remaining: 0 }),
            proj({ ref: "left", remaining: 2 }),
            proj({ ref: "infinite", infinite: true, remaining: 0 }),
        ];
        expect(eligibleFateSources(sources, FATE, "melee").map((p) => p.ref)).toEqual([
            "left",
            "infinite",
        ]);
    });
});

describe("fatePointsAvailable", () => {
    it("sums finite remaining charges", () => {
        const eligible = [proj({ ref: "a", remaining: 2 }), proj({ ref: "b", remaining: 3 })];
        expect(fatePointsAvailable(eligible)).toBe(5);
    });

    it("is Infinity when any source is infinite", () => {
        const eligible = [
            proj({ ref: "a", remaining: 2 }),
            proj({ ref: "inf", infinite: true, remaining: 0 }),
        ];
        expect(fatePointsAvailable(eligible)).toBe(Infinity);
    });

    it("is 0 when empty", () => {
        expect(fatePointsAvailable([])).toBe(0);
    });
});

describe("preferredFateSource — most-restricted first", () => {
    it("prefers a skill-specific point over a general one", () => {
        const eligible = [
            proj({ ref: "general", assocSkillCode: null }),
            proj({ ref: "specific", assocSkillCode: "melee" }),
        ];
        expect(preferredFateSource(eligible)?.ref).toBe("specific");
    });

    it("prefers a finite source over an infinite one within the same scope", () => {
        const eligible = [
            proj({ ref: "infinite", assocSkillCode: null, infinite: true }),
            proj({ ref: "finite", assocSkillCode: null, remaining: 1 }),
        ];
        expect(preferredFateSource(eligible)?.ref).toBe("finite");
    });

    it("returns undefined when nothing is eligible", () => {
        expect(preferredFateSource([])).toBeUndefined();
    });
});
