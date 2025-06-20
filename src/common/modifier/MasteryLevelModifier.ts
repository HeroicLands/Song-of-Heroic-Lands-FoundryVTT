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
import { SohlLogic, SohlSpeaker } from "@common";
import { ValueDelta, ValueModifier } from "@common/modifier";
import { SuccessTestResult } from "@common/result";
import { FilePath, toFilePath } from "@utils";
import { SohlArray } from "@utils/collection";

export class MasteryLevelModifier extends ValueModifier {
    minTarget!: number;
    maxTarget!: number;
    successLevelMod!: number;
    critFailureDigits!: number[];
    critSuccessDigits!: number[];
    testDescTable!: MasteryLevelModifier.DetailedDescription[];

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
        context: SuccessTestResult.Context,
    ): Promise<SuccessTestResult | null | false> {
        const testResult: SuccessTestResult =
            sohl.game.CONFIG.SuccessTestResult(
                context.priorTestResult ?? {
                    chat: context.speaker,
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
                variant: sohl.game.id,
                type: testResult.testType,
                title: sohl.i18n.format(
                    "SOHL.MasteryLevelModifier.successTest.dialogTitle",
                    {
                        name: testResult.speaker.name,
                        title: testResult.testType,
                    },
                ),
                mlMod: testResult.masteryLevelModifier,
                situationalModifier: 0,
                rollMode: testResult.rollMode,
                rollModes: Object.entries(SohlSpeaker.ROLL_MODE).map(
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
                    const fd = new fvtt.applications.ux.FormDataExtended(form);
                    const formData = fd.object;
                    if (formData.situationalModifier) {
                        testResult.masteryLevelModifier.add(
                            ValueDelta.ID.PLAYER,
                            formData.situationalModifier,
                        );
                    }
                    testResult.masteryLevelModifier.successLevelMod =
                        formData.successLevelMod;
                    testResult.rollMode = formData.rollMode;
                    return Promise.resolve(true);
                }) as DialogButtonCallback,
                rejectClose: false,
            });

            if (!result) return null;
        }

        let allowed: boolean = await testResult.evaluate();

        if (allowed && context.speaker) {
            await testResult.toChat(context.speaker);
        }
        return allowed ? testResult : false;
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
    export interface Data extends ValueModifier.Data {
        minTarget: number;
        maxTarget: number;
        successLevelMod: number;
        critFailureDigits: number[];
        critSuccessDigits: number[];
        testDescTable: DetailedDescription[];
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
