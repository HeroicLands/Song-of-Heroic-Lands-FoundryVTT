/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
import { ImpactResult } from "@src/entity/result/ImpactResult";
import { ImpactModifier } from "@src/entity/modifier/ImpactModifier";
import { SimpleRoll } from "@src/entity/roll/SimpleRoll";
import { instanceFromJSON } from "@src/utils/helpers";
import { IMPACT_ASPECT } from "@src/utils/constants";

const parent = {
    data: { kind: "weapongear" },
    name: "Broadsword",
    label: "Broadsword",
    item: { logic: { availableFate: [] } },
} as any;

function makeImpactMod(aimBodyPartCode = "", spread = 0): ImpactModifier {
    return new ImpactModifier(
        {
            roll: { numDice: 2, dieFaces: 6, modifier: 5 },
            aspect: IMPACT_ASPECT.EDGED,
            aimBodyPartCode,
            spread,
        } as any,
        { parent },
    );
}

describe("ImpactResult", () => {
    it.each([2, 0, -2])(
        "constructs, evaluates and revives fixed impact %s without consuming dice",
        async (value) => {
            const modifier = new ImpactModifier(
                { baseValue: value, aspect: IMPACT_ASPECT.BLUNT },
                { parent },
            );
            SimpleRoll.forceValues(6);
            try {
                const result = new ImpactResult({ impactModifier: modifier }, { parent });
                expect(result.total).toBe(value);
                expect(result.roll.numDice).toBe(0);
                await result.evaluate();
                expect(result.total).toBe(value);
                const revived = instanceFromJSON(result.toJSON(), { parent }) as ImpactResult;
                expect(revived).toBeInstanceOf(ImpactResult);
                expect(revived.total).toBe(value);
                expect(SimpleRoll.forcedRemaining).toBe(1);
            } finally {
                SimpleRoll.clearForced();
            }
        },
    );
    it("continues consuming dice for ordinary rolled impact", () => {
        SimpleRoll.forceValues(3, 4);
        try {
            const result = new ImpactResult({ impactModifier: makeImpactMod() }, { parent });
            expect(result.roll.numDice).toBe(2);
            expect(result.total).toBe(7);
            expect(SimpleRoll.forcedRemaining).toBe(0);
        } finally {
            SimpleRoll.clearForced();
        }
    });
    it("requires an impactModifier", () => {
        expect(() => new ImpactResult({} as any, { parent })).toThrow(/impactModifier/i);
    });

    it("exposes total and aspect from the (injected) roll + modifier", () => {
        const r = new ImpactResult(
            {
                impactModifier: makeImpactMod("head"),
                roll: new SimpleRoll(
                    {
                        numDice: 2,
                        dieFaces: 6,
                        modifier: 5,
                        rolls: [3, 4],
                    },
                    { parent },
                ),
                label: "Broadsword",
            } as any,
            { parent },
        );
        expect(r.total).toBe(12); // 3 + 4 + 5
        expect(r.aspect).toBe(IMPACT_ASPECT.EDGED);
        expect(r.aimBodyPartCode).toBe("head");
        expect(r.label).toBe("Broadsword");
    });

    it("rolls the impact on creation when no roll is supplied", () => {
        const r = new ImpactResult({ impactModifier: makeImpactMod() } as any, {
            parent,
        });
        expect(r.roll).toBeInstanceOf(SimpleRoll);
        // Rolled (not the inert total-0 of an unrolled SimpleRoll): 2d6 + the
        // modifier's flat bonus lands in [2, 17].
        expect(r.total).toBeGreaterThanOrEqual(2);
        expect(r.total).toBeLessThanOrEqual(17);
    });

    it("is source-agnostic — carries a non-combat source label", () => {
        const r = new ImpactResult(
            {
                impactModifier: makeImpactMod(),
                roll: new SimpleRoll(
                    {
                        numDice: 2,
                        dieFaces: 6,
                        modifier: 5,
                        rolls: [1, 1],
                    },
                    { parent },
                ),
                label: "fall",
            } as any,
            { parent },
        );
        expect(r.label).toBe("fall");
        expect(r.aimBodyPartCode).toBe("");
        expect(r.total).toBe(7);
    });

    it("round-trips through instanceFromJSON (kind-stamped)", () => {
        const r = new ImpactResult(
            {
                impactModifier: makeImpactMod("head"),
                roll: new SimpleRoll(
                    {
                        numDice: 2,
                        dieFaces: 6,
                        modifier: 5,
                        rolls: [3, 4],
                    },
                    { parent },
                ),
                label: "fall",
            } as any,
            { parent },
        );
        const revived = instanceFromJSON<ImpactResult>(JSON.stringify(r.toJSON()), parent);
        expect(revived).toBeInstanceOf(ImpactResult);
        expect(revived.total).toBe(12);
        expect(revived.aspect).toBe(IMPACT_ASPECT.EDGED);
        expect(revived.aimBodyPartCode).toBe("head");
        expect(revived.label).toBe("fall");
        expect(revived.impactModifier).toBeInstanceOf(ImpactModifier);
    });
});
