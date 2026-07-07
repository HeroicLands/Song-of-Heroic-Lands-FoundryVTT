/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Tests for issue #204: AttackResult.mode rehydrates to a live StrikeMode.
 *
 * Before the fix, AttackResult.mode held StrikeModeBase.PointerData in memory
 * (the wire form). After the fix it holds a live StrikeModeBase | undefined,
 * and toJSON() serializes the pointer so revival is lossless.
 */

import { describe, it, expect, vi } from "vitest";
import { AttackResult } from "@src/entity/result/AttackResult";
import { ImpactModifier } from "@src/entity/modifier/ImpactModifier";
import { MasteryLevelModifier } from "@src/entity/modifier/MasteryLevelModifier";
import { SimpleRoll } from "@src/entity/roll/SimpleRoll";
import { StrikeModeBase } from "@src/entity/strikemode/StrikeModeBase";
import { defaultToJSON, instanceFromJSON } from "@src/utils/helpers";

const POINTER: StrikeModeBase.PointerData = {
    itemUuid: "Item.weapon1",
    smId: "sm0",
};

vi.mock("@src/core/FoundryHelpers", async (importOriginal) => {
    const actual = await importOriginal<Record<string, unknown>>();
    return {
        ...actual,
        // Combatant resolves correctly; weapon item does NOT so mode stays undefined.
        fvttLogicFromUuidSync: (uuid: string) => {
            if (uuid === "Combatant.c1") return { uuid, name: "Combatant" };
            return undefined;
        },
    };
});

const parent: any = {
    id: "p",
    name: "P",
    label: "P",
    data: { kind: "skill" },
    item: { logic: { availableFate: [] } },
};

function makeAttackResult(): AttackResult {
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
            impact: new ImpactModifier(
                {
                    roll: { numDice: 2, dieFaces: 6 } as any,
                    aspect: "edged" as any,
                },
                { parent },
            ),
            mode: POINTER,
            combatantUuid: "Combatant.c1",
        } as any,
        { parent },
    );
}

describe("AttackResult.mode — live object in memory (#204)", () => {
    it("mode is undefined when the weapon cannot be resolved (test environment)", () => {
        const ar = makeAttackResult();
        // In the test environment fvttLogicFromUuidSync returns undefined for weapon
        // UUIDs, so mode stays undefined (unresolvable pointer).
        expect(ar.mode).toBeUndefined();
    });

    it("toJSON() serializes mode as PointerData so revival is lossless", () => {
        const ar = makeAttackResult();
        const json = ar.toJSON();
        expect(json.mode).toEqual(POINTER);
    });

    it("toJSON().mode is a plain object (PointerData), not a live StrikeModeBase", () => {
        const ar = makeAttackResult();
        const json = ar.toJSON();
        expect(json.mode).toStrictEqual({
            itemUuid: "Item.weapon1",
            smId: "sm0",
        });
    });

    it("round-trips losslessly: revived.toJSON().mode equals original pointer", () => {
        const ar = makeAttackResult();
        const revived = instanceFromJSON<AttackResult>(
            {
                ...JSON.parse(JSON.stringify(defaultToJSON(ar))),
                combatantUuid: "Combatant.c1",
            },
            parent,
        );
        expect(revived.toJSON().mode).toEqual(POINTER);
    });
});
