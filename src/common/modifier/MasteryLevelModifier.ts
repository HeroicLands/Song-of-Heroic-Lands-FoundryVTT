/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2025 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
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
import { SohlSpeaker } from "@common/SohlSpeaker";
import { ValueModifier } from "@common/modifier/ValueModifier";
import { SuccessTestResult } from "@common/result/SuccessTestResult";
import type { OpposedTestResult } from "@common/result/OpposedTestResult";
import { FilePath, toFilePath } from "@utils/helpers";
import { SohlArray } from "@utils/collection/SohlArray";
import { SohlTokenDocument } from "@common/token/SohlTokenDocument";
import {
    SOHL_SPEAKER_ROLL_MODE,
    TEST_TYPE,
    VALUE_DELTA_ID,
} from "@utils/constants";
import { SohlEventContext } from "@common/event/SohlEventContext";

export class MasteryLevelModifier extends ValueModifier {
    minTarget!: number;
    maxTarget!: number;
    successLevelMod!: number;
    critFailureDigits!: number[];
    critSuccessDigits!: number[];
    testDescTable!: MasteryLevelModifier.DetailedDescription[];
    fate!: ValueModifier;

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
        this.testDescTable = data.testDescTable ?? [];
        this.fate = new sohl.CONFIG.ValueModifier(data.fate ?? {}, {
            parent: this,
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
        context: SohlEventContext,
    ): Promise<SuccessTestResult | null | false> {
        const scope: Partial<SuccessTestResult.ContextScope> =
            context.scope || {};
        const testResult: SuccessTestResult =
            scope.priorTestResult ??
            sohl.CONFIG.SuccessTestResult(
                {
                    chat: this.parent.speaker,
                    type: context.type,
                    title: context.title,
                    mlMod: this.clone(),
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
        context: SohlEventContext,
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
        context: SohlEventContext,
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

    static _handleDetailedDescription(
        chatData: PlainObject,
        target: number,
        testDescTable: MasteryLevelModifier.DetailedDescription[],
    ): number | undefined {
        let result: Optional<number | ((chatData: PlainObject) => number)>;
        testDescTable.sort((a, b) => a.maxValue - b.maxValue);
        const testDesc: Optional<MasteryLevelModifier.DetailedDescription> =
            testDescTable.find((entry) => entry.maxValue >= target);
        if (testDesc) {
            // If the test description has a limitation based on
            // the last digit, find the one that applies.
            if (testDesc.limited?.length) {
                const limitedDesc: Optional<MasteryLevelModifier.LimitedDescription> =
                    testDesc.limited
                        .values()
                        .find((d) => d.lastDigits.includes(chatData.lastDigit));
                if (limitedDesc) {
                    const label: string =
                        limitedDesc.label instanceof Function ?
                            limitedDesc.label(chatData)
                        :   limitedDesc.label;
                    const desc: string =
                        limitedDesc.description instanceof Function ?
                            limitedDesc.description(chatData)
                        :   limitedDesc.description;
                    chatData.resultText = label || "";
                    chatData.resultDesc = desc || "";
                    chatData.svSuccess = limitedDesc.success;
                    result = limitedDesc.result;
                }
            } else {
                const label =
                    testDesc.label instanceof Function ?
                        testDesc.label(chatData)
                    :   testDesc.label;
                const desc =
                    testDesc.description instanceof Function ?
                        testDesc.description(chatData)
                    :   testDesc.description;
                chatData.resultText = label || "";
                chatData.resultDesc = desc || "";
                chatData.svSuccess = testDesc.success;
                result = testDesc.result;
            }
        }

        if (typeof result === "function") result = result(chatData);

        return result;
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
        testDescTable: DetailedDescription[];
        fate: ValueModifier.Data;
    }

    export interface Options extends ValueModifier.Options {}

    export interface LimitedDescription {
        lastDigits: number[];
        label: string | ((chatData: PlainObject) => string);
        description: string | ((chatData: PlainObject) => string);
        success: boolean;
        result: number | ((chatData: PlainObject) => number);
    }

    export interface DetailedDescription extends LimitedDescription {
        maxValue: number;
        limited: SohlArray<LimitedDescription>;
    }
}
