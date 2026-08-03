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

/**
 * Skill-Base pipeline contract (#972) — `SkillLogic.initialize()` computing
 * `skillBase` / `skillBaseValid` / `skillBaseError` by evaluating the
 * `skillBaseFormula` as a value-returning `SafeExpression` against a Foundry-free
 * context of attribute **values** (`attr.<shortcode>`) and `birthsigns`.
 *
 * This replaces the old comma-DSL `calcSkillBase` unit suite: the helper math
 * (`sb`, `birthsignBonus`) is unit-tested in
 * `tests/entity/expr/ExpressionHelperRegistry.test.ts` and the AST accessor
 * (`attrRefs`) in `tests/entity/expr/SafeExpression.test.ts`; here we exercise
 * the whole pipeline and the value-preservation carried from the DSL era.
 */

import { describe, it, expect } from "vitest";
import { SkillLogic } from "@src/document/item/logic/SkillLogic";
import { ITEM_KIND, MYSTERY_SUBTYPE } from "@src/utils/constants";
import {
    makeItemLogic,
    makeMockActor,
    makeAttributeStub,
} from "@tests/mocks/logicHarness";

/** Default SkillData fields; override per test. */
function skillFields(overrides: Record<string, unknown> = {}) {
    return {
        subType: "social",
        skillBaseFormula: "",
        masteryLevelBase: 30,
        improveFlag: false,
        combatCategory: "none",
        parentSkillCode: null,
        adoptParentMasteryLevel: false,
        initSkillMult: 1,
        ...overrides,
    };
}

/**
 * Build an actor with the given attribute (shortcode → score) and optional
 * `birthsign`-subtype birthsign mysteries, then a skill whose formula is `formula`,
 * initialize it, and return the initialized SkillLogic.
 */
function skillFor(
    formula: string,
    attrs: Record<string, number> = {},
    birthsigns: string[] = [],
): SkillLogic {
    const actor = makeMockActor();
    for (const [code, score] of Object.entries(attrs)) {
        actor.items.set(`${code}1`, makeAttributeStub(code, score));
    }
    for (const shortcode of birthsigns) {
        actor.items.set(`mys-${shortcode}`, {
            id: `mys-${shortcode}`,
            type: "mystery",
            system: { shortcode, subType: MYSTERY_SUBTYPE.BIRTHSIGN },
            logic: { data: { shortcode, subType: MYSTERY_SUBTYPE.BIRTHSIGN } },
        } as any);
    }
    const logic = makeItemLogic(
        SkillLogic,
        ITEM_KIND.SKILL,
        skillFields({ skillBaseFormula: formula }),
        { name: "Test Skill", actor },
    );
    logic.initialize();
    return logic;
}

describe("SkillLogic Skill-Base pipeline (#972)", () => {
    describe("guards", () => {
        it("blank formula → SB 0, valid, no error", () => {
            const logic = skillFor("", { str: 60 });
            expect(logic.skillBase).toBe(0);
            expect(logic.skillBaseValid).toBe(true);
            expect(logic.skillBaseError).toBeUndefined();
        });

        it("off an actor → every attr resolves to 0", () => {
            const logic = makeItemLogic(
                SkillLogic,
                ITEM_KIND.SKILL,
                skillFields({ skillBaseFormula: "sb(attr.str, attr.dex)" }),
                { name: "World Skill" },
            );
            logic.initialize();
            expect(logic.skillBase).toBe(0);
            expect(logic.skillBaseValid).toBe(true);
        });
    });

    describe("attribute averaging (value-preservation from the DSL era)", () => {
        it("averages two attribute values", () => {
            expect(
                skillFor("sb(attr.str, attr.dex)", { str: 60, dex: 40 })
                    .skillBase,
            ).toBe(50);
        });

        it("rounds up when the primary exceeds the secondary", () => {
            // (61 + 40) / 2 = 50.5, primary > secondary → 51
            expect(
                skillFor("sb(attr.str, attr.dex)", { str: 61, dex: 40 })
                    .skillBase,
            ).toBe(51);
        });

        it("rounds down when the primary does not exceed the secondary", () => {
            // (40 + 61) / 2 = 50.5, primary <= secondary → 50
            expect(
                skillFor("sb(attr.str, attr.dex)", { str: 40, dex: 61 })
                    .skillBase,
            ).toBe(50);
        });

        it("uses nearest rounding for three or more attributes", () => {
            // (60 + 50 + 41) / 3 = 50.33 → 50
            expect(
                skillFor("sb(attr.str, attr.int, attr.dex)", {
                    str: 60,
                    int: 50,
                    dex: 41,
                }).skillBase,
            ).toBe(50);
        });

        it("treats a missing attribute as 0", () => {
            // str=60, dex absent=0 → (60+0)/2=30, primary>secondary → 30
            expect(
                skillFor("sb(attr.str, attr.dex)", { str: 60 }).skillBase,
            ).toBe(30);
        });

        it("supports a single-attribute formula (now valid)", () => {
            expect(skillFor("sb(attr.str)", { str: 60 }).skillBase).toBe(60);
        });

        it("is case-insensitive on attribute references", () => {
            expect(
                skillFor("sb(attr.STR, attr.Dex)", { str: 60, dex: 40 })
                    .skillBase,
            ).toBe(50);
        });
    });

    describe("arithmetic and clamping", () => {
        it("adds a flat modifier", () => {
            expect(
                skillFor("sb(attr.str, attr.dex) + 5", { str: 60, dex: 40 })
                    .skillBase,
            ).toBe(55);
        });

        it("applies a multiplier written into the expression", () => {
            // str×2 = 120, dex = 40 → sb(120, 40) = 80
            expect(
                skillFor("sb(attr.str * 2, attr.dex)", { str: 60, dex: 40 })
                    .skillBase,
            ).toBe(80);
        });

        it("clamps the final SB to a minimum of 0", () => {
            // average 50, − 60 → −10 → clamped to 0
            expect(
                skillFor("sb(attr.str, attr.dex) - 60", { str: 60, dex: 40 })
                    .skillBase,
            ).toBe(0);
        });
    });

    describe("birthsign bonuses (birthsign mysteries) — now stack", () => {
        it("adds the bonus when the actor has the matching birthsign", () => {
            const logic = skillFor(
                "sb(attr.str, attr.dex) + birthsignBonus(birthsigns, 'hirin', 2)",
                { str: 60, dex: 40 },
                ["hirin"],
            );
            expect(logic.skillBase).toBe(52);
        });

        it("adds nothing when the actor lacks the birthsign", () => {
            const logic = skillFor(
                "sb(attr.str, attr.dex) + birthsignBonus(birthsigns, 'hirin', 2)",
                { str: 60, dex: 40 },
                [],
            );
            expect(logic.skillBase).toBe(50);
        });

        it("stacks multiple matching birthsign terms (replaces largest-only)", () => {
            const logic = skillFor(
                "sb(attr.str, attr.dex) + birthsignBonus(birthsigns, 'hirin', 2) + birthsignBonus(birthsigns, 'ahnu', 3)",
                { str: 60, dex: 40 },
                ["hirin", "ahnu"],
            );
            expect(logic.skillBase).toBe(55); // 50 + 2 + 3
        });
    });

    describe("invalid formulas flag the skill (SB stays 0)", () => {
        it("syntax error → invalid + error message", () => {
            const logic = skillFor("sb(attr.str,", { str: 60 });
            expect(logic.skillBase).toBe(0);
            expect(logic.skillBaseValid).toBe(false);
            expect(logic.skillBaseError).toBeTruthy();
        });

        it("unknown helper → invalid", () => {
            const logic = skillFor("bogus(attr.str)", { str: 60 });
            expect(logic.skillBaseValid).toBe(false);
            expect(logic.skillBase).toBe(0);
        });

        it("non-numeric result → invalid", () => {
            const logic = skillFor("'not a number'", { str: 60 });
            expect(logic.skillBaseValid).toBe(false);
            expect(logic.skillBase).toBe(0);
        });
    });
});
