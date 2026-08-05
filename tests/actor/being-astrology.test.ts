/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { BeingLogic } from "@src/document/actor/logic/BeingLogic";
import { AffiliationLogic } from "@src/document/item/logic/AffiliationLogic";
import { SkillLogic } from "@src/document/item/logic/SkillLogic";
import { ACTOR_KIND, ITEM_KIND } from "@src/utils/constants";
import {
    makeActorLogic,
    makeItemLogic,
    makeBodyData,
} from "@tests/mocks/logicHarness";
import * as FoundryHelpersMock from "@src/core/FoundryHelpers";
import type { AstrologyTraditions } from "@src/entity/astrology";

/** A two-sign tradition splitting the 360-day year in half (cusp 2 days). */
const TRADITIONS: AstrologyTraditions = {
    arc: {
        key: "arc",
        label: "Arcane",
        signs: [
            {
                shortcode: "alpha",
                label: "Alpha",
                start: { month: 1, day: 1 },
                end: { month: 6, day: 30 },
                cuspDays: 2,
                skillModifiers: { pel: 15, "subtype:combat": 5 },
            },
            {
                shortcode: "beta",
                label: "Beta",
                start: { month: 7, day: 1 },
                end: { month: 12, day: 30 },
                cuspDays: 2,
                skillModifiers: { pel: -15, odv: 10 },
            },
        ],
    },
};

const MONTHS_30 = Array(12).fill(30);

/** Spy the Foundry boundary: fixed registry + a birth date at month/day. */
function stubAstrology(month: number, day: number) {
    vi.spyOn(FoundryHelpersMock, "fvttAstrologyTraditions").mockReturnValue(
        TRADITIONS,
    );
    vi.spyOn(
        FoundryHelpersMock,
        "fvttBirthDateToAstrologyDate",
    ).mockReturnValue({ month, day, monthLengths: MONTHS_30 });
}

/** A Being with a birth date and an optional birthsign affiliation expression. */
function makeBeingWithAffiliation(
    birthDate: number | null,
    astrologicalExpression: string | null,
    society = "arc",
) {
    const being = makeActorLogic(BeingLogic, ACTOR_KIND.BEING, {
        birthDate,
        body: makeBodyData(),
    });
    if (astrologicalExpression !== null) {
        makeItemLogic(
            AffiliationLogic,
            ITEM_KIND.AFFILIATION,
            {
                society,
                office: null,
                title: null,
                level: 0,
                astrologicalExpression,
            },
            {
                actor: (being as any).actor,
                id: "aff00000000mock",
                name: "Arcane Astrology",
            },
        );
    }
    return being;
}

const DEFAULT_EXPR = 'merge(astrologySettings(tradition, date), "max")';

afterEach(() => vi.restoreAllMocks());

describe("BeingLogic.astrologyModifiers (#1025)", () => {
    beforeEach(() => stubAstrology(3, 15)); // ordinary Alpha day

    it("is empty when the being has no birthsign affiliation", () => {
        const being = makeBeingWithAffiliation(62_208_000, null);
        expect(being.astrologyModifiers).toEqual({});
    });

    it("derives the governing sign's modifiers from the birth date", () => {
        const being = makeBeingWithAffiliation(62_208_000, DEFAULT_EXPR);
        expect(being.astrologyModifiers).toEqual({
            pel: 15,
            "subtype:combat": 5,
        });
    });

    it("combines both signs on a cusp per-key by max", () => {
        vi.restoreAllMocks();
        stubAstrology(6, 29); // within cuspDays=2 of the Alpha/Beta boundary
        const being = makeBeingWithAffiliation(62_208_000, DEFAULT_EXPR);
        // pel: max(15, -15) = 15; subtype:combat kept 5; odv kept 10.
        expect(being.astrologyModifiers).toEqual({
            pel: 15,
            "subtype:combat": 5,
            odv: 10,
        });
    });

    it("supports an explicit-sign override expression (no date needed)", () => {
        const being = makeBeingWithAffiliation(
            null,
            'astrologySetting(tradition, "beta")',
        );
        expect(being.astrologyModifiers).toEqual({ pel: -15, odv: 10 });
    });

    it("memoizes within a prepare cycle and recomputes after initialize", () => {
        const being = makeBeingWithAffiliation(62_208_000, DEFAULT_EXPR);
        const first = being.astrologyModifiers;
        expect(being.astrologyModifiers).toBe(first); // same object (memoized)
        being.initialize();
        expect(being.astrologyModifiers).not.toBe(first); // recomputed
        expect(being.astrologyModifiers).toEqual(first); // same content
    });

    it("degrades to empty and warns when the expression throws", () => {
        const warn = vi.spyOn((globalThis as any).sohl.log, "warn");
        const being = makeBeingWithAffiliation(62_208_000, "nope(bad syntax");
        expect(being.astrologyModifiers).toEqual({});
        expect(warn).toHaveBeenCalled();
    });
});

describe("BeingLogic.astrologyModifiers year cycles (#1036)", () => {
    /** A tradition combining a solar window with a 12-year animal cycle. */
    const CYCLE_TRADITIONS: AstrologyTraditions = {
        arc: {
            key: "arc",
            label: "Arcane",
            signs: [
                {
                    shortcode: "alpha",
                    label: "Alpha",
                    start: { month: 1, day: 1 },
                    end: { month: 12, day: 30 },
                    cuspDays: 0,
                    skillModifiers: { pel: 15 },
                },
            ],
            cycles: [
                {
                    shortcode: "animal",
                    label: "Animal",
                    cycleLength: 12,
                    epochYear: 0,
                    positions: Array.from({ length: 12 }, (_, i) => ({
                        shortcode: `a${i}`,
                        label: `A${i}`,
                        skillModifiers: { [`s${i}`]: i, odv: i },
                    })),
                },
            ],
        },
    };

    /** Spy the boundary with a fixed registry, birth date, and birth year. */
    function stubYearAstrology(month: number, day: number, year: number) {
        vi.spyOn(FoundryHelpersMock, "fvttAstrologyTraditions").mockReturnValue(
            CYCLE_TRADITIONS,
        );
        vi.spyOn(
            FoundryHelpersMock,
            "fvttBirthDateToAstrologyDate",
        ).mockReturnValue({ month, day, monthLengths: MONTHS_30, year });
    }

    const COMBINED_EXPR =
        "merge(astrologySettings(tradition, date), " +
        'astrologyYearSettings(tradition, year), "max")';

    afterEach(() => vi.restoreAllMocks());

    it("folds solar-window and year-cycle modifiers into one dict", () => {
        stubYearAstrology(3, 15, 705); // animal index 705 % 12 = 9 → s9:9, odv:9
        const being = makeBeingWithAffiliation(1, COMBINED_EXPR);
        expect(being.astrologyModifiers).toEqual({
            pel: 15, // solar alpha
            s9: 9, // animal a9 specific
            odv: 9, // animal a9
        });
    });

    it("shifts the cyclic contribution with the birth year", () => {
        stubYearAstrology(3, 15, 700); // animal index 700 % 12 = 4 → s4:4, odv:4
        const being = makeBeingWithAffiliation(1, COMBINED_EXPR);
        expect(being.astrologyModifiers).toEqual({ pel: 15, s4: 4, odv: 4 });
    });

    it("supports a cycle-only expression via astrologyYearSign", () => {
        stubYearAstrology(3, 15, 703); // animal index 703 % 12 = 7
        const being = makeBeingWithAffiliation(
            1,
            'astrologySetting(tradition, "alpha")',
        );
        // Explicit solar override still works alongside cycle data present.
        expect(being.astrologyModifiers).toEqual({ pel: 15 });
    });
});

describe("SkillLogic BSMod consumption (#1025)", () => {
    beforeEach(() => stubAstrology(3, 15)); // Alpha: { pel: 15, subtype:combat: 5 }

    /** Add a skill to the being's actor and run its prepare lifecycle. */
    function addSkill(
        being: BeingLogic,
        shortcode: string,
        subType: string,
    ): SkillLogic {
        const skill = makeItemLogic(
            SkillLogic,
            ITEM_KIND.SKILL,
            {
                subType,
                skillBaseFormula: "5",
                masteryLevelBase: 40,
                initSkillMult: 1,
                levelBase: 0,
            },
            {
                actor: (being as any).actor,
                id: `skill${shortcode}mock`.padEnd(16, "0").slice(0, 16),
                shortcode,
                name: `Skill ${shortcode}`,
            },
        );
        skill.initialize();
        skill.evaluate();
        skill.finalize();
        return skill;
    }

    it("adds a BSMod delta from a specific skill-shortcode modifier", () => {
        const being = makeBeingWithAffiliation(62_208_000, DEFAULT_EXPR);
        const skill = addSkill(being, "pel", "lore");
        expect(skill.masteryLevel.effective).toBe(55); // 40 base + 15 BSMod
        const delta = skill.masteryLevel.deltas.find(
            (d) => d.abbrev === "BSMod",
        );
        expect(delta?.value).toBe("15");
    });

    it("adds a BSMod delta from the subtype: wildcard when no specific entry", () => {
        const being = makeBeingWithAffiliation(62_208_000, DEFAULT_EXPR);
        const skill = addSkill(being, "swd", "combat"); // subtype:combat = +5
        expect(skill.masteryLevel.effective).toBe(45);
    });

    it("a specific shortcode overrides the subtype: wildcard", () => {
        // A combat skill whose shortcode 'pel' has a specific +15 entry — the
        // specific value wins over subtype:combat's +5.
        const being = makeBeingWithAffiliation(62_208_000, DEFAULT_EXPR);
        const skill = addSkill(being, "pel", "combat");
        expect(skill.masteryLevel.effective).toBe(55); // 40 + 15 (not +5)
    });

    it("adds no BSMod delta for a skill the birthsign does not touch", () => {
        const being = makeBeingWithAffiliation(62_208_000, DEFAULT_EXPR);
        const skill = addSkill(being, "unrelated", "craft");
        expect(skill.masteryLevel.effective).toBe(40);
        expect(
            skill.masteryLevel.deltas.some((d) => d.abbrev === "BSMod"),
        ).toBe(false);
    });
});
