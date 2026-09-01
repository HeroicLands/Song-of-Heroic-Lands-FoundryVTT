import { describe, it, expect } from "vitest";
import { TraumaLogic } from "@src/document/item/logic/TraumaLogic";
import { AfflictionLogic } from "@src/document/item/logic/AfflictionLogic";
import { TraumaSubTypes, AfflictionSubTypes } from "@src/utils/constants";

/**
 * Guard against a `visible` expression naming a subtype value that does not
 * exist (#1182). Five Trauma actions were gated on `'physical'` — a **Skill**
 * subtype — so they never appeared in the Actions context menu for any trauma
 * that has ever existed, and nothing noticed.
 */
function subTypeLiterals(expression: string): string[] {
    // Matches `data.subType === 'x'` / `subType === "x"` in either quote style.
    return [...expression.matchAll(/subType\s*===\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
}

describe("intrinsic-action visibility gates name real subtypes (#1182)", () => {
    it("every Trauma `visible` subtype literal is a real TRAUMA_SUBTYPE", () => {
        const valid = new Set<string>(TraumaSubTypes as readonly string[]);
        for (const action of TraumaLogic.defineIntrinsicActions()) {
            for (const literal of subTypeLiterals(String(action.visible ?? ""))) {
                expect(
                    valid.has(literal),
                    `${action.shortcode}: visible gates on subType "${literal}", which is not a trauma subtype`,
                ).toBe(true);
            }
        }
    });

    it("every Affliction `visible` subtype literal is a real AFFLICTION_SUBTYPE", () => {
        const valid = new Set<string>(AfflictionSubTypes as readonly string[]);
        for (const action of AfflictionLogic.defineIntrinsicActions()) {
            for (const literal of subTypeLiterals(String(action.visible ?? ""))) {
                expect(
                    valid.has(literal),
                    `${action.shortcode}: visible gates on subType "${literal}", which is not an affliction subtype`,
                ).toBe(true);
            }
        }
    });

    it("the injury-only Trauma actions are gated on the injury subtype", () => {
        const actions = TraumaLogic.defineIntrinsicActions();
        for (const code of [
            "requestTreatment",
            "treatInjury",
            "treatmenttest",
            "healingtest",
            "healingCheck",
        ]) {
            const action = actions.find((a) => a.shortcode === code);
            expect(action, code).toBeDefined();
            expect(subTypeLiterals(String(action?.visible ?? "")), code).toContain("injury");
        }
    });
});
