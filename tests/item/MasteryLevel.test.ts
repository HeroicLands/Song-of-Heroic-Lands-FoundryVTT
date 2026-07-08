import { describe, it, expect, vi, afterEach } from "vitest";
import { MasteryLevelModifier } from "@src/entity/modifier/MasteryLevelModifier";
import { SuccessTestResult } from "@src/entity/result/SuccessTestResult";
import { TraitLogic } from "@src/document/item/logic/TraitLogic";
import { ITEM_KIND, VALUE_DELTA_INFO } from "@src/utils/constants";
import { makeItemLogic } from "@tests/mocks/logicHarness";
import * as FoundryHelpers from "@src/core/FoundryHelpers";

/*
 * The former MasteryLevelLogic class no longer exists; mastery-level test
 * mechanics now live in the pure domain class MasteryLevelModifier
 * (src/domain/modifier/MasteryLevelModifier.ts), parented by any item Logic.
 * A TraitLogic built with the harness serves as a cheap parent.
 */

/** Build a parent Logic for the modifier under test. */
function makeParentLogic(name = "Aura") {
    return makeItemLogic(
        TraitLogic,
        ITEM_KIND.TRAIT,
        {
            subType: "physique",
            textValue: "",
            isNumeric: true,
            score: { value: 12, max: null },
            intensity: "trait",
            valueDesc: [],
            choices: {},
        },
        { name },
    );
}

function makeMLMod(
    data: Partial<MasteryLevelModifier.Data> = {},
    logic = makeParentLogic(),
) {
    return new MasteryLevelModifier(data, { parent: logic });
}

afterEach(() => {
    vi.restoreAllMocks();
});

describe("MasteryLevelModifier", () => {
    describe("constructor", () => {
        it("throws when constructed without a parent", () => {
            expect(() => new MasteryLevelModifier({})).toThrow(
                "SohlEntity requires a parent",
            );
        });

        it("defaults targets to unbounded and successLevelMod to 0", () => {
            const ml = makeMLMod();
            expect(ml.minTarget).toBe(Number.MIN_SAFE_INTEGER);
            expect(ml.maxTarget).toBe(Number.MAX_SAFE_INTEGER);
            expect(ml.successLevelMod).toBe(0);
        });

        it("defaults the critical digit lists to empty", () => {
            const ml = makeMLMod();
            expect(ml.critFailureDigits).toEqual([]);
            expect(ml.critSuccessDigits).toEqual([]);
        });

        it("defaults the description and success-value tables to the standard ones", () => {
            const ml = makeMLMod();
            // Standard description table: crit failure / failure / success / crit success
            expect(ml.testDescTable).toHaveLength(4);
            // Standard success-value table: 8 graded bands
            expect(ml.svTable).toHaveLength(8);
            // Both tables ascend by maxValue
            for (const table of [ml.testDescTable, ml.svTable]) {
                const maxes = table.map((row) => row.maxValue);
                expect(maxes).toEqual([...maxes].sort((a, b) => a - b));
            }
        });

        it("derives the default test type from the parent's kind and name", () => {
            const ml = makeMLMod({}, makeParentLogic("Aura"));
            expect(ml.type).toBe("trait-Aura-test");
        });

        it("derives the default title from the localized format key", () => {
            const ml = makeMLMod();
            // The test i18n mock returns the key with {placeholders} substituted;
            // this key has none, so it comes back verbatim.
            expect(ml.title).toBe("SOHL.MasteryLevelModifier.successTest");
        });

        it("honors explicit data over defaults", () => {
            const ml = makeMLMod({
                minTarget: 5,
                maxTarget: 95,
                successLevelMod: 1,
                critFailureDigits: [0],
                critSuccessDigits: [5],
                type: "custom-test",
                title: "Custom Title",
            });
            expect(ml.minTarget).toBe(5);
            expect(ml.maxTarget).toBe(95);
            expect(ml.successLevelMod).toBe(1);
            expect(ml.critFailureDigits).toEqual([0]);
            expect(ml.critSuccessDigits).toEqual([5]);
            expect(ml.type).toBe("custom-test");
            expect(ml.title).toBe("Custom Title");
        });
    });

    describe("constrainedEffective", () => {
        it("returns effective when within [minTarget, maxTarget]", () => {
            const ml = makeMLMod({ minTarget: 5, maxTarget: 95 });
            ml.setBase(50);
            expect(ml.constrainedEffective).toBe(50);
        });

        it("clamps to minTarget when effective is below it", () => {
            const ml = makeMLMod({ minTarget: 5, maxTarget: 95 });
            ml.setBase(-10);
            expect(ml.effective).toBe(-10);
            expect(ml.constrainedEffective).toBe(5);
        });

        it("clamps to maxTarget when effective is above it", () => {
            const ml = makeMLMod({ minTarget: 5, maxTarget: 95 });
            ml.setBase(120);
            expect(ml.constrainedEffective).toBe(95);
        });

        it("is unclamped by default (unbounded targets)", () => {
            const ml = makeMLMod();
            ml.setBase(150);
            expect(ml.constrainedEffective).toBe(150);
        });

        it("clamps the disabled value (0) like any other effective value", () => {
            const ml = makeMLMod({ minTarget: 30, maxTarget: 95 });
            ml.setBase(80).setDisabled("out of action");
            expect(ml.effective).toBe(0);
            expect(ml.constrainedEffective).toBe(30);
        });
    });

    describe("inherited ValueModifier behavior", () => {
        it("setBase seeds base and effective", () => {
            const ml = makeMLMod();
            ml.setBase(45);
            expect(ml.base).toBe(45);
            expect(ml.effective).toBe(45);
            expect(ml.hasBase).toBe(true);
        });

        it("add layers additive deltas onto the base", () => {
            const ml = makeMLMod();
            ml.setBase(40);
            ml.add("Equipment Bonus", "EqBns", 10);
            expect(ml.effective).toBe(50);
            expect(ml.modifier).toBe(10);
            expect(ml.has("EqBns")).toBe(true);
        });

        it("a delta with the same shortcode replaces the previous one", () => {
            const ml = makeMLMod();
            ml.setBase(40);
            ml.add("Bonus", "Bns", 10);
            ml.add("Bonus", "Bns", 5);
            expect(ml.deltas).toHaveLength(1);
            expect(ml.effective).toBe(45);
        });

        it("disabled forces effective to 0 and reports the reason", () => {
            const ml = makeMLMod();
            ml.setBase(60).add("Bonus", "Bns", 10);
            ml.setDisabled("SOHL.MasteryLevel.FateDisabled");
            expect(ml.disabled).toBe("SOHL.MasteryLevel.FateDisabled");
            expect(ml.effective).toBe(0);
            // Re-enabling restores the computed value
            ml.setDisabled(false);
            expect(ml.disabled).toBe("");
            expect(ml.effective).toBe(70);
        });

        it("index is the base divided by 10, truncated", () => {
            const ml = makeMLMod();
            ml.setBase(67);
            expect(ml.index).toBe(6);
        });
    });

    describe("successTest (dialog-driven flow)", () => {
        /*
         * The current source always drives the standard-test dialog: it builds
         * the dialog data and awaits FoundryHelpers.dialog, then applies
         * the returned situational modifier / success-level mod / roll mode to a
         * cloned MasteryLevelModifier. A dismissed dialog (falsy return) cancels
         * the test. We exercise that flow by stubbing dialog's return.
         */
        function ctx(scope: Record<string, unknown> = {}) {
            return { scope } as any;
        }

        /** Stub the standard-test dialog to resolve the given form values. */
        function mockDialog(
            values: {
                situationalModifier?: number;
                successLevelMod?: number;
                rollMode?: string;
            } | null,
        ) {
            return vi
                .spyOn(FoundryHelpers, "dialog")
                .mockResolvedValue(values as any);
        }

        /** Stub out the Foundry-adjacent result evaluation/chat. */
        function stubResult(allowed = true) {
            const evaluate = vi
                .spyOn(SuccessTestResult.prototype, "evaluate")
                .mockResolvedValue(allowed);
            const toChat = vi
                .spyOn(SuccessTestResult.prototype, "toChat")
                .mockResolvedValue(undefined);
            return { evaluate, toChat };
        }

        it("applies the dialog's success-level mod and roll mode to the result", async () => {
            const { evaluate, toChat } = stubResult(true);
            mockDialog({ successLevelMod: 2, rollMode: "gmroll" });
            const ml = makeMLMod();
            ml.setBase(50);
            const result = await ml.successTest(ctx());
            expect(result).toBeInstanceOf(SuccessTestResult);
            const tr = result as SuccessTestResult;
            expect(tr.masteryLevelModifier.successLevelMod).toBe(2);
            expect(tr.rollMode).toBe("gmroll");
            expect(evaluate).toHaveBeenCalledTimes(1);
            expect(toChat).toHaveBeenCalledTimes(1);
        });

        it("applies the situational modifier as the SitMod delta", async () => {
            // The source adds the situational modifier under
            // VALUE_DELTA_INFO.PLAYER ("SitMod").
            stubResult(true);
            mockDialog({ situationalModifier: 10 });
            const ml = makeMLMod();
            ml.setBase(50);
            const result = (await ml.successTest(ctx())) as SuccessTestResult;
            expect(
                result.masteryLevelModifier.has(VALUE_DELTA_INFO.PLAYER),
            ).toBe(true);
            expect(result.masteryLevelModifier.effective).toBe(60);
        });

        it("tests against a clone — the source modifier is left untouched", async () => {
            stubResult(true);
            mockDialog({ situationalModifier: 10 });
            const ml = makeMLMod();
            ml.setBase(50);
            const result = (await ml.successTest(ctx())) as SuccessTestResult;
            expect(result.masteryLevelModifier).not.toBe(ml);
            expect(ml.deltas).toHaveLength(0);
            expect(ml.effective).toBe(50);
        });

        it("adds no SitMod delta when the situational modifier is zero", async () => {
            stubResult(true);
            mockDialog({
                situationalModifier: 0,
                successLevelMod: 0,
                rollMode: "roll",
            });
            const ml = makeMLMod();
            ml.setBase(50);
            const result = (await ml.successTest(ctx())) as SuccessTestResult;
            // A zero situational modifier adds no delta at all
            expect(result.masteryLevelModifier.deltas).toHaveLength(0);
            expect(
                result.masteryLevelModifier.has(VALUE_DELTA_INFO.PLAYER),
            ).toBe(false);
            expect(result.masteryLevelModifier.successLevelMod).toBe(0);
            expect(result.rollMode).toBe("roll");
        });

        it("reuses a priorTestResult from scope instead of creating a new one", async () => {
            stubResult(true);
            mockDialog({
                situationalModifier: 0,
                successLevelMod: 0,
                rollMode: "roll",
            });
            const ml = makeMLMod();
            ml.setBase(50);
            const first = (await ml.successTest(ctx())) as SuccessTestResult;
            const second = await ml.successTest(
                ctx({ priorTestResult: first }),
            );
            expect(second).toBe(first);
        });

        it("returns false (no chat) when evaluation is not allowed", async () => {
            const { toChat } = stubResult(false);
            mockDialog({
                situationalModifier: 0,
                successLevelMod: 0,
                rollMode: "roll",
            });
            const ml = makeMLMod();
            ml.setBase(50);
            const result = await ml.successTest(ctx());
            expect(result).toBe(false);
            expect(toChat).not.toHaveBeenCalled();
        });

        it("returns undefined when the dialog is dismissed", async () => {
            // A falsy dialog return cancels the test; the source bare-returns
            // (undefined), not null.
            const { evaluate } = stubResult(true);
            mockDialog(null);
            const ml = makeMLMod();
            ml.setBase(50);
            const result = await ml.successTest(ctx());
            expect(result).toBeUndefined();
            expect(evaluate).not.toHaveBeenCalled();
        });
    });

    describe("Foundry-entangled test flows", () => {
        // These drive real dialogs, targeting, and chat across two actors;
        // they are exercised in Foundry integration, not unit tests.
        it.todo("successValueTest grades the outcome via svTable");
        it.todo(
            "opposedTestStart requires a targeted token and posts an OpposedTestResult",
        );
        it.todo(
            "opposedTestResume completes the target side and evaluates the contest",
        );
    });
});
