/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Tests for issue #207: aim/spread deduplication.
 *
 * Before the fix, `aimBodyPartCode` and `spread` were stored as direct fields
 * on both `AttackResult` and `ImpactResult`, creating a second copy of each
 * value in the serialized tree. The fix moves ownership to `ImpactModifier`
 * and makes both results read-through getters.
 */

import { describe, it, expect, vi } from "vitest";
import { ImpactModifier } from "@src/entity/modifier/ImpactModifier";
import { AttackResult } from "@src/entity/result/AttackResult";
import { ImpactResult } from "@src/entity/result/ImpactResult";
import { MasteryLevelModifier } from "@src/entity/modifier/MasteryLevelModifier";
import { SimpleRoll } from "@src/entity/roll/SimpleRoll";

vi.mock("@src/core/FoundryHelpers", async (importOriginal) => {
    const actual = await importOriginal<Record<string, unknown>>();
    return {
        ...actual,
        fvttLogicFromUuidSync: (uuid: string) => ({ uuid, name: "Combatant" }),
    };
});

const parent: any = {
    id: "p",
    name: "P",
    label: "P",
    data: { kind: "skill" },
    item: { logic: { availableFate: [] } },
};

function makeImpact(aim = "head", spread = 3): ImpactModifier {
    return new ImpactModifier(
        {
            roll: { numDice: 2, dieFaces: 6, modifier: 0, rolls: [] } as any,
            aspect: "edged" as any,
            aimBodyPartCode: aim,
            spread,
        },
        { parent },
    );
}

function makeAttackResult(impact: ImpactModifier): AttackResult {
    return new AttackResult(
        {
            roll: new SimpleRoll(
                { numDice: 1, dieFaces: 100, rolls: [30] },
                { parent },
            ),
            masteryLevelModifier: new MasteryLevelModifier(
                { baseValue: 50 } as any,
                { parent },
            ),
            impact,
            mode: { itemUuid: "Item.mode", smId: "sm1" },
            combatantUuid: "Combatant.c1",
        } as any,
        { parent },
    );
}

function makeImpactResult(impact: ImpactModifier): ImpactResult {
    return new ImpactResult(
        {
            impactModifier: impact,
            roll: new SimpleRoll(
                { numDice: 2, dieFaces: 6, rolls: [3, 4] },
                { parent },
            ),
            label: "Broadsword",
        } as any,
        { parent },
    );
}

describe("ImpactModifier aim/spread ownership (#207)", () => {
    it("stores aimBodyPartCode and spread", () => {
        const im = makeImpact("torso", 5);
        expect(im.aimBodyPartCode).toBe("torso");
        expect(im.spread).toBe(5);
    });

    it("serializes aimBodyPartCode and spread in toJSON()", () => {
        const im = makeImpact("head", 4);
        const json = im.toJSON();
        expect(json.aimBodyPartCode).toBe("head");
        expect(json.spread).toBe(4);
    });

    it("defaults aimBodyPartCode to '' and spread to 0", () => {
        const im = new ImpactModifier(
            {
                roll: { numDice: 1, dieFaces: 6 } as any,
                aspect: "blunt" as any,
            },
            { parent },
        );
        expect(im.aimBodyPartCode).toBe("");
        expect(im.spread).toBe(0);
    });
});

describe("AttackResult aim/spread read-through (#207)", () => {
    it("aimBodyPartCode delegates to this.impact", () => {
        const im = makeImpact("shoulder", 6);
        const ar = makeAttackResult(im);
        expect(ar.aimBodyPartCode).toBe("shoulder");
        expect(ar.aimBodyPartCode).toBe(ar.impact.aimBodyPartCode);
    });

    it("spread delegates to this.impact", () => {
        const im = makeImpact("leg", 8);
        const ar = makeAttackResult(im);
        expect(ar.spread).toBe(8);
        expect(ar.spread).toBe(ar.impact.spread);
    });

    it("toJSON() does NOT include top-level aimBodyPartCode", () => {
        const im = makeImpact("head", 4);
        const ar = makeAttackResult(im);
        const json = ar.toJSON();
        expect(Object.keys(json)).not.toContain("aimBodyPartCode");
    });

    it("toJSON() does NOT include top-level spread", () => {
        const im = makeImpact("head", 4);
        const ar = makeAttackResult(im);
        const json = ar.toJSON();
        expect(Object.keys(json)).not.toContain("spread");
    });

    it("toJSON().impact carries aimBodyPartCode and spread", () => {
        const im = makeImpact("head", 4);
        const ar = makeAttackResult(im);
        const json = ar.toJSON();
        expect((json.impact as any).aimBodyPartCode).toBe("head");
        expect((json.impact as any).spread).toBe(4);
    });
});

describe("ImpactResult aim/spread read-through (#207)", () => {
    it("aimBodyPartCode delegates to this.impactModifier", () => {
        const im = makeImpact("neck", 6);
        const ir = makeImpactResult(im);
        expect(ir.aimBodyPartCode).toBe("neck");
        expect(ir.aimBodyPartCode).toBe(ir.impactModifier.aimBodyPartCode);
    });

    it("spread delegates to this.impactModifier", () => {
        const im = makeImpact("arm", 3);
        const ir = makeImpactResult(im);
        expect(ir.spread).toBe(3);
        expect(ir.spread).toBe(ir.impactModifier.spread);
    });

    it("toJSON() does NOT include top-level aimBodyPartCode", () => {
        const im = makeImpact("head", 4);
        const ir = makeImpactResult(im);
        const json = ir.toJSON();
        expect(Object.keys(json)).not.toContain("aimBodyPartCode");
    });

    it("toJSON() does NOT include top-level spread", () => {
        const im = makeImpact("head", 4);
        const ir = makeImpactResult(im);
        const json = ir.toJSON();
        expect(Object.keys(json)).not.toContain("spread");
    });

    it("toJSON().impactModifier carries aimBodyPartCode and spread", () => {
        const im = makeImpact("head", 4);
        const ir = makeImpactResult(im);
        const json = ir.toJSON();
        expect((json.impactModifier as any).aimBodyPartCode).toBe("head");
        expect((json.impactModifier as any).spread).toBe(4);
    });
});
