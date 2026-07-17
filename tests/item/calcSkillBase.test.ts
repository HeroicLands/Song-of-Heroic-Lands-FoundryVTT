/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
import { calcSkillBase } from "@src/document/item/logic/SkillLogic";
import { ITEM_KIND, MYSTERY_SUBTYPE } from "@src/utils/constants";

// A minimal AttributeLogic stand-in — calcSkillBase reads only
// `data.shortcode` and `score.effective`.
function attr(shortcode: string, score: number): any {
    return { data: { shortcode }, score: { effective: score } };
}

// A minimal MysteryLogic stand-in — a birthsign is a `buff` mystery whose
// `shortcode` is the birthsign token. `other`-subtype mysteries are ignored.
function mystery(shortcode: string, subType: string): any {
    return { data: { shortcode, subType } };
}

// A minimal actor logic exposing the two item kinds calcSkillBase reads.
function actor(attributes: any[], mysteries: any[] = []): any {
    return {
        logicTypes: {
            [ITEM_KIND.ATTRIBUTE]: attributes,
            [ITEM_KIND.MYSTERY]: mysteries,
        },
    };
}

describe("calcSkillBase", () => {
    describe("guards", () => {
        it("returns 0 for an empty formula", () => {
            expect(calcSkillBase("", actor([attr("str", 60)]))).toBe(0);
        });

        it("returns 0 when the actor logic is absent", () => {
            expect(calcSkillBase("@str, @int", null)).toBe(0);
            expect(calcSkillBase("@str, @int", undefined)).toBe(0);
        });

        it("returns 0 when fewer than two attributes are referenced", () => {
            expect(calcSkillBase("@str", actor([attr("str", 60)]))).toBe(0);
            expect(calcSkillBase("@", actor([]))).toBe(0);
        });
    });

    describe("attribute averaging", () => {
        it("averages two attribute scores", () => {
            expect(
                calcSkillBase(
                    "@str, @dex",
                    actor([attr("str", 60), attr("dex", 40)]),
                ),
            ).toBe(50);
        });

        it("rounds up when the primary exceeds the secondary (two attrs)", () => {
            // (61 + 40) / 2 = 50.5, primary > secondary → ceil = 51
            expect(
                calcSkillBase(
                    "@str, @dex",
                    actor([attr("str", 61), attr("dex", 40)]),
                ),
            ).toBe(51);
        });

        it("rounds down when the primary does not exceed the secondary (two attrs)", () => {
            // (40 + 61) / 2 = 50.5, primary <= secondary → floor = 50
            expect(
                calcSkillBase(
                    "@str, @dex",
                    actor([attr("str", 40), attr("dex", 61)]),
                ),
            ).toBe(50);
        });

        it("uses nearest rounding for three or more attributes", () => {
            // (60 + 50 + 41) / 3 = 50.333 → round = 50
            expect(
                calcSkillBase(
                    "@str, @int, @dex",
                    actor([attr("str", 60), attr("int", 50), attr("dex", 41)]),
                ),
            ).toBe(50);
        });

        it("treats a missing attribute as 0", () => {
            // str=60, dex missing=0 → (60+0)/2=30, primary>secondary → ceil=30
            expect(calcSkillBase("@str, @dex", actor([attr("str", 60)]))).toBe(
                30,
            );
        });

        it("ignores attributes not referenced by the formula", () => {
            expect(
                calcSkillBase(
                    "@str, @dex",
                    actor([attr("str", 60), attr("dex", 40), attr("wis", 100)]),
                ),
            ).toBe(50);
        });

        it("applies an attribute multiplier (@code:mult)", () => {
            // str×2 = 120, dex = 40 → (120+40)/2 = 80
            expect(
                calcSkillBase(
                    "@str:2, @dex",
                    actor([attr("str", 60), attr("dex", 40)]),
                ),
            ).toBe(80);
        });

        it("is case-insensitive on attribute shortcodes", () => {
            expect(
                calcSkillBase(
                    "@STR, @Dex",
                    actor([attr("str", 60), attr("dex", 40)]),
                ),
            ).toBe(50);
        });
    });

    describe("numeric modifiers", () => {
        it("adds a flat modifier", () => {
            expect(
                calcSkillBase(
                    "@str, @dex, 5",
                    actor([attr("str", 60), attr("dex", 40)]),
                ),
            ).toBe(55);
        });

        it("accumulates multiple modifiers", () => {
            expect(
                calcSkillBase(
                    "@str, @dex, 3, 2",
                    actor([attr("str", 60), attr("dex", 40)]),
                ),
            ).toBe(55);
        });

        it("clamps the result to a minimum of 0", () => {
            // average 50, modifier -60 → -10 → clamped to 0
            expect(
                calcSkillBase(
                    "@str, @dex, -60",
                    actor([attr("str", 60), attr("dex", 40)]),
                ),
            ).toBe(0);
        });
    });

    describe("birthsign bonuses (buff mysteries)", () => {
        it("adds the bonus when the actor has the matching birthsign", () => {
            // average 50 + hirin:2 → 52
            expect(
                calcSkillBase(
                    "@str, @dex, hirin:2",
                    actor(
                        [attr("str", 60), attr("dex", 40)],
                        [mystery("hirin", MYSTERY_SUBTYPE.BUFF)],
                    ),
                ),
            ).toBe(52);
        });

        it("defaults a bare birthsign term to +1", () => {
            expect(
                calcSkillBase(
                    "@str, @dex, ahnu",
                    actor(
                        [attr("str", 60), attr("dex", 40)],
                        [mystery("ahnu", MYSTERY_SUBTYPE.BUFF)],
                    ),
                ),
            ).toBe(51);
        });

        it("adds nothing when the actor lacks the birthsign", () => {
            expect(
                calcSkillBase(
                    "@str, @dex, hirin:2",
                    actor([attr("str", 60), attr("dex", 40)]),
                ),
            ).toBe(50);
        });

        it("applies only the single largest matching birthsign bonus", () => {
            // average 50, matches hirin:2 and ahnu:3 → +3 only → 53
            expect(
                calcSkillBase(
                    "@str, @dex, hirin:2, ahnu:3",
                    actor(
                        [attr("str", 60), attr("dex", 40)],
                        [
                            mystery("hirin", MYSTERY_SUBTYPE.BUFF),
                            mystery("ahnu", MYSTERY_SUBTYPE.BUFF),
                        ],
                    ),
                ),
            ).toBe(53);
        });

        it("ignores non-buff mysteries as birthsigns", () => {
            expect(
                calcSkillBase(
                    "@str, @dex, hirin:2",
                    actor(
                        [attr("str", 60), attr("dex", 40)],
                        [mystery("hirin", MYSTERY_SUBTYPE.OTHER)],
                    ),
                ),
            ).toBe(50);
        });
    });
});
