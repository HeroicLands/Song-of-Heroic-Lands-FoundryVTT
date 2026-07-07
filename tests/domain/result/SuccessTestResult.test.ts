import { describe, it, expect, vi, afterEach } from "vitest";
import { SuccessTestResult } from "@src/entity/result/SuccessTestResult";
import { MasteryLevelModifier } from "@src/entity/modifier/MasteryLevelModifier";
import { SUCCESS_TEST_RESULT_MOVEMENT } from "@src/utils/constants";
import * as FoundryHelpers from "@src/core/FoundryHelpers";

/** Minimal parent stub sufficient for SuccessTestResult + MasteryLevelModifier. */
const parent = {
    id: "actor0000000001",
    name: "Hero",
    label: "Hero",
    data: { kind: "skill" },
    item: { logic: { availableFate: [] } },
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
 * Mock inputDialog to call its config.callback with a fake fd.object,
 * simulating what DialogV2.input does when the user submits the form.
 */
function mockDialogSubmit(formValues: Record<string, string | number>) {
    return vi
        .spyOn(FoundryHelpers, "inputDialog")
        .mockImplementation(async (config?: any) => {
            if (config?.callback) {
                await config.callback({ object: formValues });
            }
            return null;
        });
}

afterEach(() => vi.restoreAllMocks());

describe("SuccessTestResult", () => {
    describe("constructor", () => {
        it.todo("creates an instance with default values");
        it.todo("throws when no parent is provided");
        it.todo("merges data from options.testResult when provided");
        it.todo(
            "initializes masteryLevelModifier from data or creates default",
        );
        it.todo(
            "initializes roll with MARGINAL_FAILURE standard data by default",
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
        it.todo(
            "sets CRITICAL_SUCCESS when roll succeeds and last digit is in critSuccessDigits",
        );
        it.todo(
            "sets CRITICAL_FAILURE when roll fails and last digit is in critFailureDigits",
        );
        it.todo("applies successLevelMod to the success level");
        it.todo("clamps success level to MS/MF range when crits not allowed");
        it.todo("sets description based on success/critical state");
        it.todo("computes successStars via handleLimitedDescription");
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
    });

    describe("StandardRollData", () => {
        it.todo("defines standard roll data for CF, MF, CS, MS outcomes");
    });
});
