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

import { DialogButtonCallback, inputDialog } from "@common/FoundryProxy";
import { ValueModifier } from "@common/modifier/ValueModifier";
import { SuccessTestResult } from "@common/result/SuccessTestResult";
import type { OpposedTestResult } from "@common/result/OpposedTestResult";
import { FilePath, toFilePath } from "@utils/helpers";
import { SohlTokenDocument } from "@common/token/SohlTokenDocument";
import { SOHL_SPEAKER_ROLL_MODE, VALUE_DELTA_ID } from "@utils/constants";
import { SohlActionContext } from "@common/SohlActionContext";

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

export class MasteryLevelModifier extends ValueModifier {
    minTarget: number;
    maxTarget: number;
    successLevelMod: number;
    critFailureDigits: number[];
    critSuccessDigits: number[];
    testDescTable: SuccessTestResult.LimitedDescription[];
    svTable: SuccessTestResult.LimitedDescription[];
    type: string;
    title: string;

    get constrainedEffective(): number {
        return Math.min(
            this.maxTarget,
            Math.max(this.minTarget, this.effective),
        );
    }

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
            sohl.CONFIG.SuccessTestResult(
                {
                    chat: this.parent.speaker,
                    type: context.type ?? this.type,
                    title: context.title ?? this.title,
                    mlMod: this.clone(),
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

        if (!context.skipDialog) {
            // Render modal dialog
            let dlgTemplate: FilePath = toFilePath(
                "systems/sohl/templates/dialog/standard-test-dialog.html",
            );

            let dialogData: PlainObject = {
                variant: sohl.id,
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

            // Create the dialog window
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
                    if (!form || !testResult) return Promise.resolve(null);
                    //                    const fd = new (foundry.applications as any).ux.FormDataExtended(
                    const fd = new FormDataExtended(form);
                    const formData = fd.object;
                    if (formData.situationalModifier) {
                        testResult.masteryLevelModifier.add(
                            VALUE_DELTA_ID.PLAYER,
                            formData.situationalModifier,
                        );
                    }
                    testResult.masteryLevelModifier.successLevelMod =
                        parseInt(String(formData.successLevelMod), 10) || 0;
                    testResult.rollMode = String(formData.rollMode);
                    return Promise.resolve(true);
                }) as DialogButtonCallback,
                rejectClose: false,
            });

            if (!result) return null;
        }

        let allowed: boolean = await testResult.evaluate();

        if (allowed) {
            await testResult.toChat(this.parent.speaker);
        }
        return allowed ? testResult : false;
    }

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
                ui.notifications.warn(
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

        const result: OpposedTestResult = new sohl.CONFIG.OpposedTestResult(
            {
                sourceTestResult,
                targetTestResult: null,
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
                    "systems/sohl/templates/chat/opposed-result-card.html",
                title: sohl.i18n.format("Opposed Action Result"),
            });
        }

        return allowed ? opposedTestResult : false;
    }
}

export namespace MasteryLevelModifier {
    export const Kind: string = "MasteryLevelModifier";

    export interface Data extends ValueModifier.Data {
        minTarget: number;
        maxTarget: number;
        successLevelMod: number;
        critFailureDigits: number[];
        critSuccessDigits: number[];
        testDescTable: SuccessTestResult.LimitedDescription[];
        svTable: SuccessTestResult.LimitedDescription[];
        type: string;
        title: string;
    }

    export interface Options extends ValueModifier.Options {}
}
