import { describe, it, expect, vi, afterEach } from "vitest";
import { SuccessTestResult } from "@src/entity/result/SuccessTestResult";
import { MasteryLevelModifier } from "@src/entity/modifier/MasteryLevelModifier";
import { SimpleRoll } from "@src/entity/roll/SimpleRoll";
import { SafeExpression } from "@src/entity/expr/SafeExpression";
import { SohlSpeaker } from "@src/core/logic/SohlSpeaker";
import { BRAND, SUCCESS_TEST_RESULT_MOVEMENT } from "@src/utils/constants";
import * as FoundryHelpers from "@src/core/FoundryHelpers";

/**
 * Minimal parent stub sufficient for SuccessTestResult + MasteryLevelModifier.
 * Carries the SohlLogic brand so the `(parent)` constructor shorthand recognizes
 * it as a Logic (not data).
 */
const parent = {
    id: "actor0000000001",
    name: "Hero",
    label: "Hero",
    data: { kind: "skill" },
    item: { logic: { availableFate: [] } },
    [BRAND.SohlLogic]: true,
} as any;

function makeResult(): SuccessTestResult {
    const mlMod = new MasteryLevelModifier({ baseValue: 50 } as any, {
        parent,
    });
    return new SuccessTestResult({ masteryLevelModifier: mlMod } as any, {
        parent,
    });
}

/**
 * Mock the `dialog` boundary to invoke its callback with the given form values
 * (a plain object) and resolve to the callback's return — mirroring what the
 * real boundary does when the user submits the form.
 */
function mockDialogSubmit(formValues: Record<string, string | number>) {
    return vi
        .spyOn(FoundryHelpers, "dialog")
        .mockImplementation(async (spec?: any) => {
            // Mirror the real boundary: hand the callback the parsed form data
            // (a plain object) and resolve to whatever it returns.
            return spec?.callback ?
                    await spec.callback(formValues, "ok")
                :   null;
        });
}

afterEach(() => vi.restoreAllMocks());

describe("SuccessTestResult", () => {
    describe("constructor", () => {
        it.todo("creates an instance with default values");

        it("throws when no parent is provided", () => {
            expect(() => new SuccessTestResult({}, {} as any)).toThrow(
                "SohlEntity requires a parent",
            );
        });

        it("the (parent) shorthand equals ({}, { parent }) and skips the testResult merge", () => {
            const shorthand = new SuccessTestResult(parent);
            const longhand = new SuccessTestResult({}, { parent });
            expect(shorthand.parent).toBe(parent);
            // No prior result is merged in the shorthand form → default state.
            expect(shorthand.name).toBe("");
            expect(shorthand.name).toBe(longhand.name);
            expect(shorthand.title).toBe(longhand.title);
        });

        it("merges data from options.testResult when provided (seeds fields from prior)", () => {
            const prior = new SuccessTestResult(
                { name: "Prior Test", title: "Prior Title" } as any,
                { parent },
            );
            const revived = new SuccessTestResult({} as any, {
                parent,
                testResult: prior,
            });
            // The pre-super merge folds prior.toJSON() into data, so the revived
            // result recovers the prior's serialized fields.
            expect(revived.name).toBe("Prior Test");
            expect(revived.title).toBe("Prior Title");
        });

        it.todo(
            "initializes masteryLevelModifier from data or creates default",
        );
        it.todo(
            "initializes roll with an unrolled d100 by default (evaluate casts it)",
        );
        it.todo("initializes testType, rollMode, movement, and mishaps");
        it.todo("sets speaker from options.chatSpeaker or creates from token");
    });

    describe("successLevel", () => {
        it.todo("clamps to CRITICAL_FAILURE when level is very low");
        it.todo("returns MARGINAL_FAILURE for levels between CF and MS");
        it.todo("returns MARGINAL_SUCCESS for level equal to MS constant");
        it.todo("clamps to CRITICAL_SUCCESS when level is very high");
    });

    describe("computed properties", () => {
        it.todo("targetValue calls targetValueFunc with successLevel");
        it.todo(
            "normSuccessLevel returns normalized success level based on isSuccess and isCritical",
        );
        it.todo("lastDigit returns roll total mod 10");
        it.todo(
            "isCapped is true when effective differs from constrainedEffective",
        );
        it.todo("critAllowed is true when crit digit arrays are non-empty");
        it.todo("isCritical is true for critical success or failure levels");
        it.todo("isSuccess is true when successLevel >= MARGINAL_SUCCESS");
        it.todo("canFate reflects available fate on item logic");
    });

    describe("availResponses", () => {
        it.todo("includes OPPOSEDTESTRESUME when testType is OPPOSEDTESTSTART");
        it.todo("returns empty array for other test types");
    });

    describe("evaluate()", () => {
        it.todo("returns false when speaker is not owner");
        it.todo(
            "sets MARGINAL_SUCCESS when roll <= constrainedEffective (no crits)",
        );
        it.todo(
            "sets MARGINAL_FAILURE when roll > constrainedEffective (no crits)",
        );
        // CRITICAL_SUCCESS / CRITICAL_FAILURE from the last digit, and the
        // matching descriptions, are covered by the
        // "critical outcomes on a standard test (#908)" block below.
        it.todo("applies successLevelMod to the success level");
        it.todo("clamps success level to MS/MF range when crits not allowed");
        // valueDiamonds is no longer computed in evaluate() — it derives on read
        // from the description table (see the "derived outcome data (#205)" block).
    });

    describe("testDialog()", () => {
        it.todo("renders a dialog with test data");
        it.todo("applies situational modifier from form data");
        it.todo("sets rollMode from form data");

        describe("targetMovement (#75)", () => {
            it("records 'moving' from form data onto movement", async () => {
                const result = makeResult();
                mockDialogSubmit({
                    targetMovement:
                        SUCCESS_TEST_RESULT_MOVEMENT.MOVING as string,
                    rollMode: "roll",
                    situationalModifier: 0,
                    successLevelMod: 0,
                });
                await result.testDialog({}, () => {});
                expect(result.movement).toBe(
                    SUCCESS_TEST_RESULT_MOVEMENT.MOVING,
                );
            });

            it("records 'stationary' from form data onto movement", async () => {
                const result = makeResult();
                mockDialogSubmit({
                    targetMovement:
                        SUCCESS_TEST_RESULT_MOVEMENT.STATIONARY as string,
                    rollMode: "roll",
                    situationalModifier: 0,
                    successLevelMod: 0,
                });
                await result.testDialog({}, () => {});
                expect(result.movement).toBe(
                    SUCCESS_TEST_RESULT_MOVEMENT.STATIONARY,
                );
            });

            it("throws when targetMovement is not a valid movement value", async () => {
                const result = makeResult();
                mockDialogSubmit({
                    targetMovement: "flying",
                    rollMode: "roll",
                    situationalModifier: 0,
                    successLevelMod: 0,
                });
                await expect(result.testDialog({}, () => {})).rejects.toThrow(
                    /Invalid target movement "flying"/,
                );
            });
        });
    });

    describe("toChat()", () => {
        it.todo("sends chat message with test result data");
        it.todo("includes roll in chat options");

        it("folds caller-supplied `buttons` through toRenderableButtons into the card data (#853)", async () => {
            const result = makeResult();
            const spy = vi
                .spyOn(SohlSpeaker.prototype, "toChat")
                .mockResolvedValue(undefined as any);
            await result.toChat({
                buttons: {
                    action: "treatInjury",
                    handlerUuid: "@self",
                    scope: { woundId: "w1" },
                    label: "Accept Treatment",
                    iconFAClass: "fa-solid fa-kit-medical",
                },
            });
            expect(spy).toHaveBeenCalledTimes(1);
            const chatData = spy.mock.calls[0][1] as any;
            // The raw ActionCardButton spec is normalized (scope pre-serialized,
            // skipDialog defaulted), never passed through as template data.
            expect(chatData.buttons).toEqual([
                {
                    action: "treatInjury",
                    handlerUuid: "@self",
                    scopeJSON: JSON.stringify({ woundId: "w1" }),
                    label: "Accept Treatment",
                    iconFAClass: "fa-solid fa-kit-medical",
                    skipDialog: true,
                },
            ]);
        });

        it("normalizes an array of buttons and defaults skipDialog per-button (#853)", async () => {
            const result = makeResult();
            const spy = vi
                .spyOn(SohlSpeaker.prototype, "toChat")
                .mockResolvedValue(undefined as any);
            await result.toChat({
                buttons: [
                    { action: "a1", handlerUuid: "Actor.x", label: "One" },
                    {
                        action: "a2",
                        handlerUuid: "@self",
                        label: "Two",
                        skipDialog: false,
                    },
                ],
            });
            const chatData = spy.mock.calls[0][1] as any;
            expect(chatData.buttons).toHaveLength(2);
            expect(chatData.buttons[0].skipDialog).toBe(true);
            expect(chatData.buttons[1].skipDialog).toBe(false);
            expect(chatData.buttons[0].scopeJSON).toBe("{}");
        });

        it("omits `buttons` from the card data when none are supplied (#853)", async () => {
            const result = makeResult();
            const spy = vi
                .spyOn(SohlSpeaker.prototype, "toChat")
                .mockResolvedValue(undefined as any);
            await result.toChat();
            const chatData = spy.mock.calls[0][1] as any;
            expect(chatData.buttons).toBeUndefined();
        });
    });

    // Derived outcome data (resultText / resultDesc / valueDiamonds) is never
    // stored — it is computed on read from the description table (which rides
    // the wire as data, #206) plus the evaluated successLevel / targetValue /
    // lastDigit. See #205.
    describe("derived outcome data (#205)", () => {
        /** One-row table: literal label/description, star count = successLevel + 1. */
        function starTable() {
            return [
                {
                    maxValue: 999,
                    lastDigits: [],
                    label: "Superb",
                    description: "well done",
                    success: true,
                    result: new SafeExpression(
                        { source: "successLevel + 1" },
                        { parent },
                    ),
                },
            ];
        }

        it("omits valueDiamonds, resultText, resultDesc from toJSON", () => {
            const result = new SuccessTestResult(
                { resultDescTable: starTable(), successLevel: 2 } as any,
                { parent },
            );
            const wire = result.toJSON();
            expect(wire).not.toHaveProperty("valueDiamonds");
            expect(wire).not.toHaveProperty("resultText");
            expect(wire).not.toHaveProperty("resultDesc");
        });

        it("derives valueDiamonds/resultText/resultDesc from the table on read", () => {
            const result = new SuccessTestResult(
                { resultDescTable: starTable(), successLevel: 2 } as any,
                { parent },
            );
            // targetValueFunc defaults to identity → targetValue === successLevel (2).
            expect(result.valueDiamonds).toBe(3);
            expect(result.resultText).toBe("Superb");
            expect(result.resultDesc).toBe("well done");
        });

        it("recomputes derived data correctly after a JSON round-trip", () => {
            const source = new SuccessTestResult(
                { resultDescTable: starTable(), successLevel: 2 } as any,
                { parent },
            );
            const wire = JSON.parse(JSON.stringify(source.toJSON()));
            const revived = new SuccessTestResult(wire, { parent });
            expect(revived.valueDiamonds).toBe(3);
            expect(revived.resultText).toBe("Superb");
            expect(revived.resultDesc).toBe("well done");
        });

        it("returns empty text and zero stars when no table is supplied", () => {
            const result = new SuccessTestResult({} as any, { parent });
            expect(result.valueDiamonds).toBe(0);
            expect(result.resultText).toBe("");
            expect(result.resultDesc).toBe("");
        });
    });

    describe("StandardRollData", () => {
        it.todo("defines standard roll data for CF, MF, CS, MS outcomes");
    });

    describe("evaluate() — rolls unless a die was supplied (#551)", () => {
        const owned = { isOwner: true, name: "GM" } as any;

        /** A result owned by `owned`, optionally seeded with a supplied die. */
        function makeOwnedResult(roll?: SimpleRoll): SuccessTestResult {
            const mlMod = new MasteryLevelModifier({ baseValue: 50 } as any, {
                parent,
            });
            return new SuccessTestResult(
                {
                    masteryLevelModifier: mlMod,
                    ...(roll ? { roll } : {}),
                } as any,
                { parent, chatSpeaker: owned },
            );
        }

        it("casts a fresh d100 when no die was supplied (regression: not a fixed 99)", async () => {
            const totals = new Set<number>();
            for (let i = 0; i < 40; i++) {
                const result = makeOwnedResult();
                await result.evaluate();
                expect(result.roll.total).toBeGreaterThanOrEqual(1);
                expect(result.roll.total).toBeLessThanOrEqual(100);
                totals.add(result.roll.total);
            }
            expect(totals.size).toBeGreaterThan(1);
        });

        it("resolves a supplied die without rolling it", async () => {
            const supplied = new SimpleRoll(
                { numDice: 1, dieFaces: 100, modifier: 0, rolls: [23] } as any,
                { parent },
            );
            const result = makeOwnedResult(supplied);
            await result.evaluate();
            expect(result.roll.total).toBe(23);
        });

        it("does not re-roll on a second evaluate", async () => {
            const result = makeOwnedResult();
            await result.evaluate();
            const first = result.roll.total;
            await result.evaluate();
            expect(result.roll.total).toBe(first);
        });

        it("returns false and never rolls when the speaker is not owned", async () => {
            const mlMod = new MasteryLevelModifier({ baseValue: 50 } as any, {
                parent,
            });
            const result = new SuccessTestResult(
                { masteryLevelModifier: mlMod } as any,
                { parent, chatSpeaker: { isOwner: false, name: "NPC" } as any },
            );
            expect(await result.evaluate()).toBe(false);
            expect(result.roll.rolls.length).toBe(0);
        });
    });

    describe("critical outcomes on a standard test (#908)", () => {
        const owned = { isOwner: true, name: "GM" } as any;

        /**
         * A result owned by `owned`, built from a modifier at the given base ML
         * with the constructor's default crit digits ([0, 5]) — i.e. a plain
         * standard success test, exactly as attribute/skill logic builds one.
         */
        function makeStandardResult(baseValue: number): SuccessTestResult {
            const mlMod = new MasteryLevelModifier({ baseValue } as any, {
                parent,
            });
            return new SuccessTestResult(
                { masteryLevelModifier: mlMod } as any,
                {
                    parent,
                    chatSpeaker: owned,
                },
            );
        }

        afterEach(() => SimpleRoll.clearForced());

        it("crits are allowed by default on a standard test", () => {
            expect(makeStandardResult(42).critAllowed).toBe(true);
        });

        it("a succeeding roll ending in 5 is a Critical Success", async () => {
            SimpleRoll.forceValues(15); // 15 <= 42, last digit 5 -> crit success
            const result = makeStandardResult(42);
            await result.evaluate();
            expect(result.roll.total).toBe(15);
            expect(result.isSuccess).toBe(true);
            expect(result.isCritical).toBe(true);
            expect(result.successLevel).toBe(2); // CRITICAL_SUCCESS
            expect(result.description).toBe(
                "SOHL.SuccessTestResult.CriticalSuccess",
            );
        });

        it("a failing roll ending in 5 is a Critical Failure", async () => {
            SimpleRoll.forceValues(65); // 65 > 42, last digit 5 -> crit failure
            const result = makeStandardResult(42);
            await result.evaluate();
            expect(result.roll.total).toBe(65);
            expect(result.isSuccess).toBe(false);
            expect(result.isCritical).toBe(true);
            expect(result.successLevel).toBe(-1); // CRITICAL_FAILURE
            expect(result.description).toBe(
                "SOHL.SuccessTestResult.CriticalFailure",
            );
        });

        it("a roll of 100 is a Critical Failure", async () => {
            SimpleRoll.forceValues(100); // last digit 0, always a failure
            const result = makeStandardResult(42);
            await result.evaluate();
            expect(result.roll.total).toBe(100);
            expect(result.isCritical).toBe(true);
            expect(result.successLevel).toBe(-1);
            expect(result.description).toBe(
                "SOHL.SuccessTestResult.CriticalFailure",
            );
        });

        it("a succeeding roll not ending in 0 or 5 is a Marginal Success", async () => {
            SimpleRoll.forceValues(23); // 23 <= 42, last digit 3 -> marginal
            const result = makeStandardResult(42);
            await result.evaluate();
            expect(result.isSuccess).toBe(true);
            expect(result.isCritical).toBe(false);
            expect(result.successLevel).toBe(1); // MARGINAL_SUCCESS
            expect(result.description).toBe(
                "SOHL.SuccessTestResult.MarginalSuccess",
            );
        });

        it("a failing roll not ending in 0 or 5 is a Marginal Failure", async () => {
            SimpleRoll.forceValues(63); // 63 > 42, last digit 3 -> marginal
            const result = makeStandardResult(42);
            await result.evaluate();
            expect(result.isSuccess).toBe(false);
            expect(result.isCritical).toBe(false);
            expect(result.successLevel).toBe(0); // MARGINAL_FAILURE
            expect(result.description).toBe(
                "SOHL.SuccessTestResult.MarginalFailure",
            );
        });
    });

    describe("a supplied 00 face forces a Critical Failure (#1148)", () => {
        const owned = { isOwner: true, name: "GM" } as any;

        /**
         * The seam an undetermined Healing Rate uses: a pre-seeded die handed to
         * the result rather than one cast by `evaluate()`.
         */
        function makeSuppliedResult(
            baseValue: number,
            dieValue: number,
        ): SuccessTestResult {
            const mlMod = new MasteryLevelModifier({ baseValue } as any, {
                parent,
            });
            const roll = new SimpleRoll(
                {
                    numDice: 1,
                    dieFaces: 100,
                    modifier: 0,
                    rolls: [dieValue],
                } as any,
                { parent } as any,
            );
            return new SuccessTestResult(
                { masteryLevelModifier: mlMod, roll } as any,
                { parent, chatSpeaker: owned },
            );
        }

        afterEach(() => SimpleRoll.clearForced());

        it("resolves as a Critical Failure without casting a die", async () => {
            const cast = vi.spyOn(SimpleRoll.prototype, "roll");
            const result = makeSuppliedResult(0, 100);
            await result.evaluate();
            // 100 exceeds the target (so it fails) and ends in a
            // critical-failure digit — a Critical Failure, deterministically.
            expect(cast).not.toHaveBeenCalled();
            expect(result.roll.total).toBe(100);
            expect(result.isSuccess).toBe(false);
            expect(result.isCritical).toBe(true);
            expect(result.successLevel).toBe(-1); // CRITICAL_FAILURE
        });

        it("is a Critical Failure at every ordinary mastery level", async () => {
            for (const eml of [0, 5, 20, 50, 80, 99]) {
                const result = makeSuppliedResult(eml, 100);
                await result.evaluate();
                expect(result.successLevel, `eml ${eml}`).toBe(-1);
            }
        });

        it("a supplied 5 would NOT do — it succeeds against any target of 5 or more", async () => {
            // Why the forced value is the 00 face and not a low digit: a roll of
            // 5 only fails against a target below 5, and it crits on the way.
            const result = makeSuppliedResult(30, 5);
            await result.evaluate();
            expect(result.isSuccess).toBe(true);
            expect(result.successLevel).toBe(2); // CRITICAL_SUCCESS
        });

        it("a supplied 0 would be worse still — it is a Critical Success against every target", async () => {
            const result = makeSuppliedResult(0, 0);
            await result.evaluate();
            // 0 <= any target takes the success branch, and 0 is a
            // critical-success digit.
            expect(result.isSuccess).toBe(true);
            expect(result.successLevel).toBe(2); // CRITICAL_SUCCESS
        });
    });

    describe("auto-Critical-Failure (#568)", () => {
        const owned = { isOwner: true, name: "GM" } as any;

        it("forces a Critical Failure regardless of the roll when autoCriticalFail is set", async () => {
            const mlMod = new MasteryLevelModifier({ baseValue: 99 } as any, {
                parent,
            });
            const result = new SuccessTestResult(
                {
                    masteryLevelModifier: mlMod,
                    autoCriticalFail: true,
                } as any,
                { parent, chatSpeaker: owned },
            );
            await result.evaluate();
            // Even at effective 99 (almost always a success), the outcome is CF.
            expect(result.successLevel).toBe(-1);
            expect(result.isSuccess).toBe(false);
            expect(result.isCritical).toBe(true);
            expect(result.normSuccessLevel).toBe(-1);
        });

        it("leaves a normal test unaffected when autoCriticalFail is absent", async () => {
            const mlMod = new MasteryLevelModifier({ baseValue: 99 } as any, {
                parent,
            });
            const result = new SuccessTestResult(
                { masteryLevelModifier: mlMod } as any,
                { parent, chatSpeaker: owned },
            );
            await result.evaluate();
            expect(result.isSuccess).toBe(true);
        });
    });
});
