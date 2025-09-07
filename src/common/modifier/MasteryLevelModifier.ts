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
import { SOHL_SPEAKER_ROLL_MODE, VALUE_DELTA_ID } from "@utils/constants";

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
        context: Partial<SuccessTestResult.Context>,
    ): Promise<SuccessTestResult | null | false> {
        const testResult: SuccessTestResult = sohl.CONFIG.SuccessTestResult(
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
                situationalModifier: 0,
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

        if (allowed && context.speaker) {
            await testResult.toChat(context.speaker);
        }
        return allowed ? testResult : false;
    }

    /**
     * Perform an opposed test
     * @param {object} options
     * @returns {SuccessTestChatData}
     */
    async opposedTestStart(
        context: OpposedTestResult.Context,
    ): Promise<SuccessTestResult | null> {
        if (!context.speaker) {
            context.speaker = new SohlSpeaker();
        }
        let {
            targetToken,
            situationalModifier,
        }: { targetToken?: SohlTokenDocument; situationalModifier?: number } =
            context.scope || {};
        if (!context.scope) context.scope = {};
        targetToken ||= SohlTokenDocument.getTargetedTokens(true)?.[0];
        if (!targetToken) return null;
        context.type ||= `${this.parent.item?.type}-${this.parent.item?.name}-opposedtest`;
        context.title ||= sohl.i18n.format("{label} Opposed Test", {
            label: this.parent.item?.system.label,
        });
        if (!context.token) {
            ui.notifications.warn(
                sohl.i18n.format("No attacker token identified."),
            );
            return null;
        }

        if (!context.token.isOwner) {
            ui.notifications.warn(
                sohl.i18n.format(
                    "You do not have permissions to perform this operation on {name}",
                    { name: context.token.name },
                ),
            );
            return null;
        }

        context.priorTestResult ??= (() => {
            const srcTestResult = new sohl.CONFIG.SuccessTestResult(
                {
                    speaker: context.speaker,
                    item: this.parent.item,
                    type: SuccessTestResult.TEST_TYPE.SKILL,
                    title:
                        context.title ||
                        sohl.i18n.format("{label} Test", {
                            label: this.parent.label,
                        }),
                    situationalModifier: 0,
                    mlMod: this.clone(),
                },
                { parent: this },
            );
            return new sohl.CONFIG.OpposedTestResult(
                {
                    speaker: context.speaker,
                    targetTokenUuid: targetToken.uuid,
                    sourceTestResult: srcTestResult,
                    targetTestResult: null,
                },
                { parent: this },
            );
        }) as unknown as OpposedTestResult;

        let sourceTestContext: SuccessTestResult.Context =
            new sohl.CONFIG.SuccessTestResult.Context({
                speaker:
                    context.priorTestResult.speaker.toJSON() as SohlSpeaker.Data,
                item: this.parent.item,
                title: context.title,
                situationalModifier: situationalModifier || 0,
                mlMod: this.clone(),
            });
        let sourceTestResult =
            context.priorTestResult?.sourceTestResult ??
            new sohl.CONFIG.SuccessTestResult(
                {
                    speaker: context.speaker,
                    item: this.parent.item,
                    rollMode: (game as any).settings.get("core", "rollMode"),
                    title:
                        context.title ||
                        sohl.i18n.format("{name} {label} Test", {
                            name:
                                context.token.name ||
                                context.speaker.actor?.name,
                            label: this.parent.item?.system.label,
                        }),
                    situationalModifier: 0,
                    mlMod: this.clone(),
                },
                { parent: this },
            );
        const targetTestResult = await this.successTest(sourceTestContext);

        const opposedTest = new sohl.CONFIG.OpposedTestResult(
            {
                speaker: context.speaker,
                targetToken: context.scope.targetToken,
                sourceTestResult,
                targetTestResult,
            },
            { parent: this },
        );

        return opposedTest.toRequestChat();
    }

    async opposedTestResume(
        context: OpposedTestResult.Context,
    ): Promise<OpposedTestResult | false | null> {
        let { noChat = false, priorTestResult } = context;

        if (!priorTestResult) {
            throw new Error("Must supply priorTestResult");
        }

        let opposedTestResult: OpposedTestResult = priorTestResult;
        if (!priorTestResult.targetTestResult) {
            priorTestResult.targetTestResult =
                new sohl.CONFIG.SuccessTestResult(
                    {
                        speaker: context.speaker || new SohlSpeaker(),
                        item: this.parent.item,
                        rollMode: (game as any).settings.get(
                            "core",
                            "rollMode",
                        ),
                        type: SuccessTestResult.TEST_TYPE.SKILL,
                        title: sohl.i18n.format("Opposed {label} Test", {
                            label: this.parent.item?.system.label,
                        }),
                        situationalModifier: 0,
                        mlMod: foundry.utils.deepClone(
                            this.parent.item?.system._masteryLevel,
                        ),
                    },
                    { parent: this },
                );

            const targetTestResult = await this.successTest(
                new SuccessTestResult.Context({
                    noChat: true,
                    rollMode:
                        (game as any).settings.get("core", "rollMode") ||
                        SOHL_SPEAKER_ROLL_MODE.SYSTEM,
                    title:
                        context.title ||
                        sohl.i18n.format("{name} {label} Test", {
                            name:
                                context.token?.name ||
                                context.speaker.actor?.name,
                            label: this.parent.item?.system.label,
                        }),
                    situationalModifier: 0,
                }),
            );
            if (!targetTestResult) return targetTestResult;
            priorTestResult.targetTestResult = targetTestResult;
        } else {
            // In this situation, where the targetTestResult is provided,
            // the GM is modifying the result of a prior opposedTest.
            // Therefore, we re-display the dialog for each of the prior
            // successTests.
            let maybeTestResult =
                await opposedTestResult.sourceTestResult.masteryLevelModifier.successTest(
                    {
                        noChat: true,
                        priorTestResult: opposedTestResult.sourceTestResult,
                    },
                );
            if (!maybeTestResult) return maybeTestResult;
            opposedTestResult.sourceTestResult = maybeTestResult;
            maybeTestResult =
                await opposedTestResult.targetTestResult.masteryLevelModifier.successTest(
                    {
                        noChat: true,
                        priorTestResult: opposedTestResult.targetTestResult,
                    },
                );
            if (!maybeTestResult) return maybeTestResult;
            opposedTestResult.targetTestResult = maybeTestResult;
        }

        let allowed = await opposedTestResult.evaluate();

        if (allowed && !noChat) {
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
