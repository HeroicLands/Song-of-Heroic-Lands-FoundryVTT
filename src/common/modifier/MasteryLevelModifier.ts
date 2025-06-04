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
import { SohlPerformer, SohlSpeaker, CHATMESSAGE_ROLL_MODE } from "@common";
import { VALUEDELTA_ID, ValueModifier } from "@common/modifier";
import { SuccessTestResult } from "@common/result";
import { FilePath, toFilePath } from "@utils";
import { SohlArray } from "@utils/collection";

export class TestLimitedDescription {
    lastDigits!: SohlArray<number>;
    label!: string | ((chatData: PlainObject) => string);
    description!: string | ((chatData: PlainObject) => string);
    success!: boolean;
    result!: number | ((chatData: PlainObject) => number);
}

export class TestDetailedDescription extends TestLimitedDescription {
    maxValue!: number;
    limited!: SohlArray<TestLimitedDescription>;
}

export class MasteryLevelModifier extends ValueModifier {
    declare parent: SohlPerformer;
    minTarget!: number;
    maxTarget!: number;
    successLevelMod!: number;
    critFailureDigits!: SohlArray<number>;
    critSuccessDigits!: number[];
    testDescTable!: SohlArray<TestDetailedDescription>;

    get constrainedEffective(): number {
        return Math.min(
            this.maxTarget,
            Math.max(this.minTarget, this.effective),
        );
    }

    constructor(
        parent: SohlPerformer,
        data: PlainObject = {},
        options: PlainObject = {},
    ) {
        if (!parent) {
            throw new Error(
                "MasteryLevelModifier must be constructed with a parent performer.",
            );
        }
        options.parent = parent;
        super(data, options);
    }

    /**
     * Perform Success Test for this Item
     *
     * @param {object} options
     * @returns `null` if the test was cancelled, `false` if the test failed,
     *      or a `SuccessTestResult` object if the test succeeded.
     */
    async createSuccessTest({
        speaker,
        skipDialog = false,
        type = `${this.parent.item?.type}-${this.parent.item?.name}-test`,
        title = "SOHL.MasteryLevelModifier.successTest.title",
        testResult,
    }: {
        speaker?: SohlSpeaker;
        skipDialog?: boolean;
        type?: string;
        title?: string;
        testResult?: SuccessTestResult;
    } = {}): Promise<SuccessTestResult | null | false> {
        if (!speaker) {
            speaker = new SohlSpeaker();
        }
        if (!testResult) {
            testResult = sohl.game.CONFIG.SuccessTestResult(this.parent, {
                chat: speaker,
                type,
                title,
                mlMod: this.clone(),
            });
            if (!testResult) {
                throw new Error("Failed to create SuccessTestResult.");
            }
        }

        if (!skipDialog) {
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
                        name: speaker._name,
                        title: testResult.title,
                    },
                ),
                mlMod: testResult.masteryLevelModifier,
                situationalModifier: 0,
                rollMode: testResult.rollMode,
                rollModes: Object.entries(CHATMESSAGE_ROLL_MODE).map(
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
                            VALUEDELTA_ID.PLAYER,
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

        if (allowed && speaker) {
            await testResult.toChat({ testResult });
        }
        return allowed ? testResult : false;
    }

    static _handleDetailedDescription(
        chatData: PlainObject,
        target: number,
        testDescTable: TestDetailedDescription[],
    ): number | undefined {
        let result: Optional<number | ((chatData: PlainObject) => number)>;
        testDescTable.sort((a, b) => a.maxValue - b.maxValue);
        const testDesc: Optional<TestDetailedDescription> = testDescTable.find(
            (entry) => entry.maxValue >= target,
        );
        if (testDesc) {
            // If the test description has a limitation based on
            // the last digit, find the one that applies.
            if (testDesc.limited?.length) {
                const limitedDesc: Optional<TestLimitedDescription> =
                    testDesc.limited
                        .values()
                        .find((d) =>
                            d.lastDigits.values().includes(chatData.lastDigit),
                        );
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
