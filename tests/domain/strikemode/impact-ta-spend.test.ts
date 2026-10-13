/* SPDX-License-Identifier: GPL-3.0-or-later */
import { describe, expect, it } from "vitest";
import { ImpactResult } from "@src/entity/result/ImpactResult";
import { ImpactModifier } from "@src/entity/modifier/ImpactModifier";
import { SimpleRoll } from "@src/entity/roll/SimpleRoll";
import { applyImpactTacticalAdvantages } from "@src/entity/strikemode/impactTacticalAdvantage";
const parent = {} as any;
function impact() {
    return new ImpactResult(
        {
            impactModifier: new ImpactModifier(
                { baseValue: 2, aspect: "blunt", roll: { numDice: 1, dieFaces: 6 } } as any,
                { parent },
            ),
            roll: new SimpleRoll({ numDice: 1, dieFaces: 6, modifier: 2, rolls: [4] }, { parent }),
        },
        { parent },
    );
}
const mode = { traits: {}, impact: { aspectType: "blunt" } } as any;
describe("chosen Impact Tactical Advantage arithmetic", () => {
    it("adds a named bonus without mutating the original or drawing dice", () => {
        const original = impact();
        SimpleRoll.forceValues(6);
        try {
            const chosen = applyImpactTacticalAdvantages(original, mode, 2);
            expect(chosen.total).toBe(12);
            expect(chosen.impactModifier.get("ImpTA")?.numValue).toBe(6);
            expect(chosen.roll.rolls).toEqual([4]);
            expect(original.total).toBe(6);
            expect(SimpleRoll.forcedRemaining).toBe(1);
        } finally {
            SimpleRoll.clearForced();
        }
    });
    it("replaces a previous count and removes it for zero rather than stacking", () => {
        const chosen = applyImpactTacticalAdvantages(impact(), mode, 2);
        const changed = applyImpactTacticalAdvantages(chosen, mode, 1);
        expect(changed.total).toBe(9);
        const cleared = applyImpactTacticalAdvantages(changed, mode, 0);
        expect(cleared.total).toBe(6);
        expect(cleared.impactModifier.get("ImpTA")).toBeUndefined();
    });
    it.each([-1, 1.5, Infinity, NaN])("rejects invalid count %s", (count) => {
        expect(() => applyImpactTacticalAdvantages(impact(), mode, count)).toThrow();
    });
});
