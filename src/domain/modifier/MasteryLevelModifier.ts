/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { DialogButtonCallback, inputDialog } from "@src/core/FoundryHelpers";
import { resolveActionInput } from "@src/utils/actionInput";
import { registerKind } from "@src/utils/kindRegistry";
import { ValueModifier } from "@src/domain/modifier/ValueModifier";
import { SuccessTestResult } from "@src/domain/result/SuccessTestResult";
import { OpposedTestResult } from "@src/domain/result/OpposedTestResult";
import { FilePath, toFilePath } from "@src/utils/helpers";
import { SohlTokenDocument } from "@src/document/token/SohlTokenDocument";
import {
    SOHL_SPEAKER_ROLL_MODE,
    TestType,
    VALUE_DELTA_ID,
} from "@src/utils/constants";
import { SohlActionContext } from "@src/core/SohlActionContext";

// TODO: This needs to be internationalized
const STANDARD_SUCCESS_VALUE_TABLE: SuccessTestResult.LimitedDescription[] = [
    {
        maxValue: 0,
        label: "No Value",
        description: "Test fails to produce a usable result.",
        lastDigits: [],
        success: false,
        result: 0,
    },
    {
        maxValue: 2,
        label: "Little Value",
        description: "Test produces a limited or flawed result.",
        lastDigits: [],
        success: true,
        result: 0,
    },
    {
        maxValue: 4,
        label: "Base Value",
        description: "Test produces an average result.",
        lastDigits: [],
        success: true,
        result: 0,
    },
    {
        maxValue: 5,
        label: "Bonus Value",
        description: "Test produces a one-star superior result.",
        lastDigits: [],
        success: true,
        result: 1,
    },
    {
        maxValue: 6,
        label: "Bonus Value",
        description: "Test produces a two-star superior result.",
        lastDigits: [],
        success: true,
        result: 2,
    },
    {
        maxValue: 7,
        label: "Bonus Value",
        description: "Test produces a three-star superior result.",
        lastDigits: [],
        success: true,
        result: 3,
    },
    {
        maxValue: 8,
        label: "Bonus Value",
        description: "Test produces a four-star superior result.",
        lastDigits: [],
        success: true,
        result: 4,
    },
    {
        maxValue: Number.MAX_SAFE_INTEGER,
        label: "Bonus Value",
        description: "Test produces a five-star superior result.",
        lastDigits: [],
        success: true,
        result: 5,
    },
] as const;

const STANDARD_SUCCESS_DESCRIPTION_TABLE: SuccessTestResult.LimitedDescription[] =
    [
        {
            maxValue: -1,
            label: "",
            description: "",
            lastDigits: [],
            success: false,
            result: (chatData: PlainObject): number =>
                chatData.successLevel + 1,
        },
        {
            maxValue: 0,
            label: "",
            description: "",
            lastDigits: [],
            success: false,
            result: 0,
        },
        {
            maxValue: 1,
            label: "",
            description: "",
            lastDigits: [],
            success: true,
            result: 0,
        },
        {
            maxValue: Number.MAX_SAFE_INTEGER,
            label: "",
            description: "",
            lastDigits: [],
            success: true,
            result: (chatData: PlainObject): number =>
                chatData.successLevel - 1,
        },
    ] as const;

/**
 * A {@link ValueModifier} specialized for mastery level tests — the primary
 * resolution mechanic in SoHL.
 *
 * Extends ValueModifier with test-specific state and the ability to
 * execute success tests, success value tests, and opposed tests.
 *
 * ## Test-specific properties
 *
 * - **minTarget / maxTarget** — clamp the effective mastery level to a
 *   valid range. `constrainedEffective` returns the clamped value.
 * - **successLevelMod** — flat offset to the success level after the
 *   roll (e.g., fate bonuses).
 * - **critFailureDigits / critSuccessDigits** — last-digit lists that
 *   trigger critical results (e.g., `[0, 5]` means rolls ending in 0
 *   or 5 are critical).
 * - **testDescTable** — maps success levels to descriptive labels and
 *   star ratings for chat output.
 * - **svTable** — maps success levels to success value results for
 *   value-producing tests.
 *
 * ## Test methods
 *
 * - {@link successTest} — standard d100 test against the constrained
 *   effective mastery level. Displays a dialog (unless suppressed) to
 *   collect situational modifiers, rolls, evaluates, and posts to chat.
 * - {@link successValueTest} — like successTest but produces a success
 *   value (quality of result) rather than just pass/fail.
 * - {@link opposedTestStart} — initiates an opposed test by performing
 *   the source actor's success test and creating an
 *   {@link OpposedTestResult} awaiting the target's response.
 * - {@link opposedTestResume} — completes an opposed test by performing
 *   the target actor's success test and evaluating the opposed outcome.
 *
 * ## Lifecycle
 *
 * Created during {@link MasteryLevelLogic.initialize} with a base from
 * the persisted mastery level. Deltas are added during evaluate/finalize
 * (e.g., injury penalties, equipment bonuses, situational modifiers from
 * the test dialog). Rebuilt each preparation cycle like all ValueModifiers.
 */
export class MasteryLevelModifier extends ValueModifier {
    /** Lower clamp on the effective mastery level — the roll-under target can't go below this. */
    minTarget: number;
    /** Upper clamp on the effective mastery level — the roll-under target can't exceed this. */
    maxTarget: number;
    /** Flat offset applied to the success level after the roll (e.g. a fate bonus). */
    successLevelMod: number;
    /** Roll last-digits that make a failure critical (e.g. `[0]`). */
    critFailureDigits: number[];
    /** Roll last-digits that make a success critical (e.g. `[5]`). */
    critSuccessDigits: number[];
    /** Description table mapping success levels to labels and star ratings for chat output. */
    testDescTable: SuccessTestResult.LimitedDescription[];
    /** Success-value table mapping success levels to graded results for value-producing tests. */
    svTable: SuccessTestResult.LimitedDescription[];
    /** Identifier for the kind of test (used in dialogs and chat). */
    type: string;
    /** Display title for the test. */
    title: string;

    /**
     * The effective mastery level clamped to [{@link minTarget},
     * {@link maxTarget}] — the actual roll-under target a success test uses.
     */
    get constrainedEffective(): number {
        return Math.min(
            this.maxTarget,
            Math.max(this.minTarget, this.effective),
        );
    }

    /**
     * @param data - Test data; targets default to unbounded, crit-digit lists to
     *   empty, and the description/value tables to the standard ones.
     * @param options - Must provide `options.parent` (base {@link ValueModifier}).
     * @throws If no `parent` is provided.
     */
    constructor(
        data: Partial<MasteryLevelModifier.Data> = {},
        options: Partial<MasteryLevelModifier.Options> = {},
    ) {
        super(data, options);
        this.minTarget = data.minTarget ?? Number.MIN_SAFE_INTEGER;
        this.maxTarget = data.maxTarget ?? Number.MAX_SAFE_INTEGER;
        this.successLevelMod = data.successLevelMod ?? 0;
        this.critFailureDigits = data.critFailureDigits ?? [];
        this.critSuccessDigits = data.critSuccessDigits ?? [];
        this.testDescTable =
            data.testDescTable ?? STANDARD_SUCCESS_DESCRIPTION_TABLE;
        this.svTable = data.svTable ?? STANDARD_SUCCESS_VALUE_TABLE;
        this.type =
            data.type ?? `${this.parent.data.kind}-${this.parent.name}-test`;
        this.title =
            data.title ??
            sohl.i18n.format("SOHL.MasteryLevelModifier.successTest", {
                label: this.parent.label,
            });
    }

    /**
     * Performs a Mastery Level success test.
     * @remarks
     * If no `priorTestResult` is provided, this method will create a new
     * test result based on the mastery level of the current item, displaying a
     * dialog (unless inhibited) to collect modifiers to the test and then
     * rolling dice to determine test outcome.
     *
     * If a `priorTestResult` is provided, this method will display a dialog
     * (unless inhibited) to collect modifiers but will then apply those
     * modifiers to the prior test roll (without rolling again), generating
     * a new test result based on the modifiers and the prior roll.
     *
     * The purpose of the `priorTestResult` is to allow modifiers to be changed
     * without modifying the random dice roll itself, such as when fate is applied
     * to an already rolled test.
     *
     * @param context - The context in which to perform the test.
     * @returns A Promise resolving to `null` if the test was cancelled, `false`
     * if there was an error during the test, or the result of the success test.
     */
    async successTest(
        context: SohlActionContext,
    ): Promise<SuccessTestResult | null | false> {
        const scope: Partial<SuccessTestResult.ContextScope> = {
            ...(context.scope ?? {}),
            targetValueFunc: (sl: number) => sl,
            successStarTable: this.testDescTable,
        };
        const testResult: SuccessTestResult =
            scope.priorTestResult ??
            new SuccessTestResult(
                {
                    speaker: this.parent.speaker,
                    testType: (context.type ?? this.type) as TestType,
                    title: context.title ?? this.title,
                    masteryLevelModifier: this.clone() as MasteryLevelModifier,
                    targetValueFunc: scope.targetValueFunc,
                    successStarTable: scope.successStarTable,
                },
                {
                    parent: this.parent,
                },
            );
        if (!testResult) {
            throw new Error("Failed to create SuccessTestResult.");
        }

        // Resolve the dialog inputs from a single place: the standard test
        // dialog, or — when `context.skipDialog` (shift-click / headless) — from
        // `context.scope`. The dialog callback is side-effect-free (returns
        // data); the values are applied once, below, for both paths.
        interface SuccessTestInput {
            situationalModifier: number;
            successLevelMod: number;
            rollMode: string;
        }
        const dialogInput = await resolveActionInput<SuccessTestInput>(context, {
            fromScope: (s) => ({
                situationalModifier: Number(s.situationalModifier) || 0,
                successLevelMod: Number(s.successLevelMod) || 0,
                rollMode: String(s.rollMode ?? testResult.rollMode),
            }),
            dialog: async () => {
                const dlgTemplate: FilePath = toFilePath(
                    "systems/sohl/templates/dialog/standard-test-dialog.hbs",
                );
                const dialogData: PlainObject = {
                    type: testResult.testType,
                    title: sohl.i18n.format(
                        "SOHL.MasteryLevelModifier.successTest.dialogTitle",
                        {
                            name: testResult.speaker.name,
                            title: testResult.testType,
                        },
                    ),
                    mlMod: testResult.masteryLevelModifier,
                    situationalModifier: scope.situationalModifier ?? 0,
                    rollMode: testResult.rollMode,
                    rollModes: Object.entries(SOHL_SPEAKER_ROLL_MODE).map(
                        ([k, v]) => ({
                            group: "CHAT.RollDefault",
                            value: k,
                            label: v,
                        }),
                    ),
                };
                const result: PlainObject | null = await inputDialog({
                    title: sohl.i18n.format(
                        "SOHL.MasteryLevelModifier.successTest.dialogLabel",
                    ),
                    template: dlgTemplate,
                    data: dialogData,
                    callback: ((
                        _event: PointerEvent | SubmitEvent,
                        button: HTMLButtonElement,
                        _dialog: HTMLDialogElement,
                    ): Promise<any> => {
                        const form = button.querySelector("form");
                        if (!form) return Promise.resolve(null);
                        const fd = new FormDataExtended(form);
                        const formData = fd.object;
                        return Promise.resolve({
                            situationalModifier:
                                parseInt(
                                    String(formData.situationalModifier),
                                    10,
                                ) || 0,
                            successLevelMod:
                                parseInt(
                                    String(formData.successLevelMod),
                                    10,
                                ) || 0,
                            rollMode: String(formData.rollMode),
                        } satisfies SuccessTestInput);
                    }) as DialogButtonCallback,
                    rejectClose: false,
                });
                return (result as SuccessTestInput | null) ?? null;
            },
        });

        // A dismissed dialog cancels the test; a bypass always yields values.
        if (!dialogInput) return null;

        if (dialogInput.situationalModifier) {
            testResult.masteryLevelModifier.add(
                VALUE_DELTA_ID.PLAYER,
                dialogInput.situationalModifier,
            );
        }
        testResult.masteryLevelModifier.successLevelMod =
            dialogInput.successLevelMod;
        testResult.rollMode = dialogInput.rollMode;

        let allowed: boolean = await testResult.evaluate();

        if (allowed) {
            await testResult.toChat(this.parent.speaker);
        }
        return allowed ? testResult : false;
    }

    /**
     * Perform a **success value** test — a success test whose outcome is graded
     * into a quality/quantity result (a "success value") via {@link svTable},
     * rather than reported as a simple pass/fail.
     *
     * @param context - The action context for the test.
     * @returns The evaluated {@link SuccessTestResult}, `null` if cancelled, or
     *   `false` on error.
     */
    // TODO(doc): the locally-built success-value scope (svTable / targetValueFunc)
    // is not currently passed into successTest — confirm the intended wiring.
    async successValueTest(
        context: SohlActionContext,
    ): Promise<SuccessTestResult | null | false> {
        const scope: Partial<SuccessTestResult.ContextScope> = {
            ...(context.scope ?? {}),
            targetValueFunc: (sl: number) => sl,
            successStarTable: this.testDescTable,
        };

        const svTestContext = new SohlActionContext({
            speaker: context.speaker,
            type: `${this.parent.data.kind}-${this.parent.name}-success-value-test`,
            title: sohl.i18n.format(
                "SOHL.MasteryLevelModifier.successValueTest",
                {
                    name: this.parent.label,
                },
            ),
            noChat: true,
            scope: {
                situationalModifier: 0,
                targetValueFunc: (successLevel: number) =>
                    this.index + successLevel - 1,
                successStarTable: this.svTable,
            },
        });

        const svTestResult: SuccessTestResult | null | false =
            await this.successTest(context);
        if (!svTestResult) return svTestResult;

        return svTestResult;
    }

    /**
     * Perform an opposed test
     *
     * @remarks
     * This method handles both starting a new opposed test and resuming
     * an existing one. If `context.priorTestResult` is not provided, a new
     * opposed test is started by creating a new `OpposedTestResult` with
     * the current `SuccessTestResult` as the source test. If
     * `context.priorTestResult` is provided, it is assumed to be an existing
     * `OpposedTestResult` that needs to be completed by performing the target
     * test.
     * @param {object} options
     * @returns {SuccessTestChatData}
     */
    async opposedTestStart(
        context: SohlActionContext,
    ): Promise<OpposedTestResult | null> {
        const scope: Partial<OpposedTestResult.ContextScope> =
            context.scope || {};

        let sourceTestResult: SuccessTestResult | false | null | undefined =
            scope.priorTestResult?.sourceTestResult;

        if (!sourceTestResult) {
            // No prior test result, so we are starting a new opposed test.
            // Setup the context for the source test.
            scope.targetToken ??=
                SohlTokenDocument.getTargetedTokens(true)?.[0];
            if (!scope.targetToken) return null;
            scope.situationalModifier ??= 0;
            scope.type ??= `${this.parent.type}-${this.parent.name}-opposedtest`;
            scope.title ??= sohl.i18n.format("{label} Opposed Test", {
                label: this.parent.label,
            });

            if (!scope.targetToken.isOwner) {
                sohl.log.uiWarn(
                    sohl.i18n.format(
                        "You do not have permissions to perform this operation on {name}",
                        { name: scope.targetToken.name },
                    ),
                );
                return null;
            }
        }

        foundry.utils.mergeObject(
            context,
            {
                scope: {
                    priorTestResult: {
                        sourceTestResult,
                    },
                },
            },
            { inplace: true },
        );

        // Perform the success test for the source actor.
        sourceTestResult = await this.successTest(context);

        if (!sourceTestResult) return null;

        const result: OpposedTestResult = new OpposedTestResult(
            {
                sourceTestResult,
                targetTestResult: undefined,
                targetToken: scope.targetToken,
            },
            {
                ...context,
                parent: this.parent,
            },
        );

        await result.toChat();
        return result;
    }

    /**
     * Complete an opposed test by rolling the **target's** side and evaluating
     * the contest.
     *
     * @remarks
     * If the target hasn't rolled yet, its success test is performed and stored
     * on the opposed result; if it already has (a GM editing a prior result),
     * both sides' dialogs are re-shown. The opposed outcome is then evaluated
     * and posted to chat unless `context.noChat` is set.
     *
     * @param context - The action context; must carry the in-progress opposed
     *   result in `scope.priorTestResult` (from {@link opposedTestStart}).
     * @returns The evaluated {@link OpposedTestResult}, `false` if a side's test
     *   was cancelled or failed, or `null`.
     * @throws If `scope.priorTestResult` is missing.
     */
    async opposedTestResume(
        context: SohlActionContext,
    ): Promise<OpposedTestResult | false | null> {
        const scope: Partial<OpposedTestResult.ContextScope> =
            context.scope || {};

        if (!scope.priorTestResult) {
            throw new Error("Must supply priorTestResult");
        }

        let opposedTestResult: OpposedTestResult = scope.priorTestResult;
        const successTestContext = context.clone();

        if (!opposedTestResult.targetTestResult) {
            successTestContext.scope = {
                situationalModifier: 0,
            };
            const targetTestResult = await this.successTest(successTestContext);
            if (!targetTestResult) return targetTestResult;
            opposedTestResult.targetTestResult = targetTestResult;
        } else {
            // In this situation, where the targetTestResult is provided,
            // the GM is modifying the result of a prior opposedTest.
            // Therefore, we re-display the dialog for each of the prior
            // successTests.
            successTestContext.scope = {
                priorTestResult: opposedTestResult.targetTestResult,
            };
            let maybeTestResult =
                await opposedTestResult.sourceTestResult.masteryLevelModifier.successTest(
                    successTestContext,
                );
            if (!maybeTestResult) return maybeTestResult;
            opposedTestResult.targetTestResult = maybeTestResult;
        }

        let allowed = await opposedTestResult.evaluate();

        if (allowed && !context.noChat) {
            opposedTestResult.toChat({
                template:
                    "systems/sohl/templates/chat/opposed-result-card.hbs",
                title: sohl.i18n.format("Opposed Action Result"),
            });
        }

        return allowed ? opposedTestResult : false;
    }
}

export namespace MasteryLevelModifier {
    /** Registry key identifying this modifier kind for serialization. */
    export const Kind: string = "MasteryLevelModifier";

    /** Construction data for a {@link MasteryLevelModifier}. */
    export interface Data extends ValueModifier.Data {
        /** Lower clamp on the effective mastery level. */
        minTarget: number;
        /** Upper clamp on the effective mastery level. */
        maxTarget: number;
        /** Flat success-level offset applied after the roll. */
        successLevelMod: number;
        /** Roll last-digits that make a failure critical. */
        critFailureDigits: number[];
        /** Roll last-digits that make a success critical. */
        critSuccessDigits: number[];
        /** Description table for chat output. */
        testDescTable: SuccessTestResult.LimitedDescription[];
        /** Success-value table for value-producing tests. */
        svTable: SuccessTestResult.LimitedDescription[];
        /** Identifier for the kind of test. */
        type: string;
        /** Display title for the test. */
        title: string;
    }

    export interface Options extends ValueModifier.Options {}
}

registerKind(MasteryLevelModifier.Kind, MasteryLevelModifier);
