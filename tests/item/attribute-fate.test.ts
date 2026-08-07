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

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as FoundryHelpersMock from "@src/core/FoundryHelpers";
import { AttributeLogic } from "@src/document/item/logic/AttributeLogic";
import { MysteryLogic } from "@src/document/item/logic/MysteryLogic";
import { MysticalAbilityLogic } from "@src/document/item/logic/MysticalAbilityLogic";
import { SuccessTestResult } from "@src/entity/result/SuccessTestResult";
import { makeItemLogic, makeMockActor } from "@tests/mocks/logicHarness";

/** Build a Fate Mystery logic embedded on `actor`. */
function makeFateMystery(
    actor: any,
    opts: {
        id: string;
        assocSkillCode?: string | null;
        value?: number | null;
    },
): MysteryLogic {
    const mystery = makeItemLogic(
        MysteryLogic,
        "mystery",
        {
            subType: "fate",
            assocSkillCode: opts.assocSkillCode ?? null,
            levelBase: null,
            charges: {
                value: opts.value === undefined ? 1 : opts.value,
                max: 3,
            },
        },
        { actor, id: opts.id, name: opts.id, shortcode: opts.id },
    ) as MysteryLogic;
    mystery.initialize();
    return mystery;
}

/** Build an attribute logic embedded on `actor`. */
function makeAttribute(
    actor: any,
    shortcode: string,
    scoreBase = 12,
): AttributeLogic {
    const attr = makeItemLogic(
        AttributeLogic,
        "attribute",
        {
            scoreBase,
            valueDesc: [],
            initDiceFormula: null,
            impairedByRoles: [],
        },
        {
            actor,
            id: `${shortcode}1`,
            name: shortcode.toUpperCase(),
            shortcode,
        },
    ) as AttributeLogic;
    return attr;
}

/**
 * Run the lifecycle for every attribute on the actor, so the Aura attribute the
 * fate mastery level derives from is itself finalized first.
 */
function prepareAll(attrs: AttributeLogic[]): void {
    for (const a of attrs) a.initialize();
    for (const a of attrs) a.evaluate();
    for (const a of attrs) a.finalize();
}

describe("AttributeLogic — Fate (#1106)", () => {
    let actor: any;

    beforeEach(() => {
        actor = makeMockActor();
        vi.spyOn(FoundryHelpersMock, "fvttGetSetting").mockReturnValue(
            "everyone",
        );
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("fateMasteryLevel", () => {
        it("is initialized, so an attribute has something to roll fate against", () => {
            const aur = makeAttribute(actor, "aur", 14);
            const str = makeAttribute(actor, "str", 12);
            actor.items.set("aur1", aur.data);
            actor.items.set("str1", str.data);
            prepareAll([aur, str]);

            expect(str.fateMasteryLevel).toBeDefined();
            expect(str.fateMasteryLevel.disabled).toBeFalsy();
            // Same seeding rule a skill uses: 50 + half the Aura mastery level.
            expect(str.fateMasteryLevel.base).toBe(50);
            expect(str.fateMasteryLevel.effective).toBe(50 + 35);
        });

        it("can never be rolled for the Aura attribute itself", () => {
            const aur = makeAttribute(actor, "aur", 14);
            actor.items.set("aur1", aur.data);
            prepareAll([aur]);

            expect(aur.fateMasteryLevel.disabled).toBe(
                "SOHL.MasteryLevel.AuraBasedNoFate",
            );
        });

        it("is disabled when the actor has no usable Aura attribute", () => {
            const str = makeAttribute(actor, "str", 12);
            actor.items.set("str1", str.data);
            prepareAll([str]);

            expect(str.fateMasteryLevel.disabled).toBe(
                "SOHL.MasteryLevel.FateNotSupported",
            );
        });

        it("is disabled when the fate setting is off", () => {
            vi.spyOn(FoundryHelpersMock, "fvttGetSetting").mockReturnValue(
                "none",
            );
            const aur = makeAttribute(actor, "aur", 14);
            const str = makeAttribute(actor, "str", 12);
            actor.items.set("aur1", aur.data);
            actor.items.set("str1", str.data);
            prepareAll([aur, str]);

            expect(str.fateMasteryLevel.disabled).toBe(
                "SOHL.MasteryLevel.FateDisabled",
            );
        });
    });

    describe("availableFate", () => {
        it("offers a general Fate Point on any attribute", () => {
            const str = makeAttribute(actor, "str");
            actor.items.set("str1", str.data);
            makeFateMystery(actor, { id: "fate1", assocSkillCode: null });
            prepareAll([str]);

            expect(str.availableFate.map((m) => m.id)).toEqual(["fate1"]);
        });

        it("offers a Fate Point associated with this attribute's shortcode", () => {
            const str = makeAttribute(actor, "str");
            actor.items.set("str1", str.data);
            makeFateMystery(actor, { id: "fate1", assocSkillCode: "str" });
            prepareAll([str]);

            expect(str.availableFate.map((m) => m.id)).toEqual(["fate1"]);
        });

        it("withholds a Fate Point associated with something else", () => {
            const str = makeAttribute(actor, "str");
            actor.items.set("str1", str.data);
            makeFateMystery(actor, { id: "fate1", assocSkillCode: "melee" });
            prepareAll([str]);

            expect(str.availableFate).toEqual([]);
        });

        it("withholds an exhausted Fate Point", () => {
            const str = makeAttribute(actor, "str");
            actor.items.set("str1", str.data);
            makeFateMystery(actor, {
                id: "fate1",
                assocSkillCode: null,
                value: 0,
            });
            prepareAll([str]);

            expect(str.availableFate).toEqual([]);
        });

        it("is empty off an actor", () => {
            const attr = makeItemLogic(AttributeLogic, "attribute", {
                scoreBase: 12,
                valueDesc: [],
                initDiceFormula: null,
                impairedByRoles: [],
            }) as AttributeLogic;
            attr.initialize();
            expect(attr.availableFate).toEqual([]);
        });
    });

    describe("the success-test card's Fate gate", () => {
        it("offers Fate when an eligible point exists", () => {
            const aur = makeAttribute(actor, "aur", 14);
            const str = makeAttribute(actor, "str", 12);
            actor.items.set("aur1", aur.data);
            actor.items.set("str1", str.data);
            makeFateMystery(actor, { id: "fate1", assocSkillCode: null });
            prepareAll([aur, str]);

            const result = new SuccessTestResult(
                { successLevel: 0, canFate: true },
                { parent: str },
            );
            expect(result.canFate).toBe(true);
        });

        it("does not offer Fate with no eligible point", () => {
            const aur = makeAttribute(actor, "aur", 14);
            const str = makeAttribute(actor, "str", 12);
            actor.items.set("aur1", aur.data);
            actor.items.set("str1", str.data);
            prepareAll([aur, str]);

            const result = new SuccessTestResult(
                { successLevel: 0, canFate: true },
                { parent: str },
            );
            expect(result.canFate).toBe(false);
        });
    });

    describe("card dispatch", () => {
        // The test card's Fate button carries `data-action="fateTest"`, which
        // chat-card-dispatch resolves by calling the method of that name on the
        // logic. A skill needs no intrinsic action for this, and neither does an
        // attribute — the method IS the handle.
        it("exposes a fateTest method for the card button to dispatch to", () => {
            const str = makeAttribute(actor, "str");
            expect(typeof (str as any).fateTest).toBe("function");
        });

        it("adds no intrinsic action, staying symmetric with skills", () => {
            const attrCodes = AttributeLogic.defineIntrinsicActions().map(
                (a) => a.shortcode,
            );
            expect(attrCodes).not.toContain("fateTest");
        });
    });

    describe("Mystical Abilities never gain Fate", () => {
        it("has no fate surface at all", () => {
            const ma = makeItemLogic(MysticalAbilityLogic, "mysticalability", {
                subType: "other",
                assocSkillCode: null,
                assocAffiliationCode: null,
                levelBase: 0,
                charges: { value: null, max: null },
            }) as MysticalAbilityLogic;
            expect((ma as any).availableFate).toBeUndefined();
            expect((ma as any).fateMasteryLevel).toBeUndefined();
            expect(
                MysticalAbilityLogic.defineIntrinsicActions().map(
                    (a) => a.shortcode,
                ),
            ).not.toContain("fateTest");
        });
    });
});
