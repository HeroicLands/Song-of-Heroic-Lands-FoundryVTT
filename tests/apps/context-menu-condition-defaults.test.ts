import { describe, it, expect } from "vitest";
import { SafeExpression } from "@src/entity/expr/SafeExpression";
import { TEST_TYPE } from "@src/utils/constants";

// The default context-menu `condition` strings in constants.ts are compiled by
// SohlContextMenu and evaluated against the context makeConditionContext builds
// — which binds the **logic layer** as `itemLogic` / `actorLogic` (see #459),
// not the raw documents. These tests pin each affected default (#458) to the
// migrated bindings: they must read live logic state, and the pre-#459
// `item.system.*` / `item.system.data.*` document paths (which are always
// falsy — the bug) must not creep back in.
//
// String conditions compile to a SafeExpression, which (as a SohlEntity)
// requires an owning parent logic. A truthy stand-in is enough here.
const parent = { id: "test" } as any;

/** Evaluate a condition string as the compiled context menu does. */
function evalCondition(
    source: string,
    context: Record<string, unknown>,
): boolean {
    return !!new SafeExpression({ source }, { parent }).evaluate(context);
}

describe("default context-menu conditions (constants.ts TEST_TYPE)", () => {
    describe.each([
        ["SETIMPROVEFLAG", TEST_TYPE.SETIMPROVEFLAG],
        ["UNSETIMPROVEFLAG", TEST_TYPE.UNSETIMPROVEFLAG],
        ["IMPROVEWITHSDR", TEST_TYPE.IMPROVEWITHSDR],
    ])("%s (improve-flag entries)", (_name, entry) => {
        // These defaults are authored as string SafeExpressions.
        const source = entry.condition as string;

        it("shows when the skill can improve and is not already flagged", () => {
            const itemLogic = {
                canImprove: true,
                data: { improveFlag: false },
            };
            expect(evalCondition(source, { itemLogic })).toBe(true);
        });

        it("hides when the skill cannot improve", () => {
            const itemLogic = {
                canImprove: false,
                data: { improveFlag: false },
            };
            expect(evalCondition(source, { itemLogic })).toBe(false);
        });

        it("hides when the improve flag is already set", () => {
            const itemLogic = { canImprove: true, data: { improveFlag: true } };
            expect(evalCondition(source, { itemLogic })).toBe(false);
        });

        it("hides when no item row resolves (itemLogic undefined)", () => {
            expect(evalCondition(source, { itemLogic: undefined })).toBe(false);
        });

        it("reads logic state, not the stale document paths", () => {
            // The pre-#459 string referenced `item.system.*`; a bound `item`
            // with that shape must have no effect on the (logic-driven) result.
            const item = { system: { canImprove: true, data: {} } };
            expect(evalCondition(source, { item, itemLogic: undefined })).toBe(
                false,
            );
        });
    });

    describe("TRANSMITAFFLICTION", () => {
        const source = TEST_TYPE.TRANSMITAFFLICTION.condition as string;

        it("shows when the affliction can transmit", () => {
            expect(
                evalCondition(source, { itemLogic: { canTransmit: true } }),
            ).toBe(true);
        });

        it("hides when the affliction cannot transmit", () => {
            expect(
                evalCondition(source, { itemLogic: { canTransmit: false } }),
            ).toBe(false);
        });

        it("hides when no item row resolves (itemLogic undefined)", () => {
            expect(evalCondition(source, { itemLogic: undefined })).toBe(false);
        });
    });

    describe("DIAGNOSISTEST", () => {
        const source = TEST_TYPE.DIAGNOSISTEST.condition as string;

        it("shows when the affliction has been treated", () => {
            // isTreated is a derived getter on the logic (treatmentDate != null).
            const itemLogic = { isTreated: true };
            expect(evalCondition(source, { itemLogic })).toBe(true);
        });

        it("hides when the affliction has not been treated", () => {
            const itemLogic = { isTreated: false };
            expect(evalCondition(source, { itemLogic })).toBe(false);
        });

        it("hides when no item row resolves (itemLogic undefined)", () => {
            expect(evalCondition(source, { itemLogic: undefined })).toBe(false);
        });
    });
});
