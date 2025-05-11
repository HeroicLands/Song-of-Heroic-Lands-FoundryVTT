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

import { cloneDeep, SohlMap } from "@utils";
import { SohlPerformer } from "@logic/common/core";
import { DeltaInfo, ValueModifier } from "@logic/common/core/modifier";
import { CollectionType, DataField, RegisterClass } from "@utils";
import {
    renderTemplate,
    ChatMessageRollMode,
    SohlSpeaker,
    SohlSystem,
    inputDialog,
    FormDataExtended,
    DialogButtonCallback,
} from "@foundry/core";
import { SuccessTestResult } from "@logic/common/core/result";
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

export type MasteryLevelModifierMap = SohlMap<string, MasteryLevelModifier>;

@RegisterClass("MasteryLevelModifier", "0.6.0")
export class MasteryLevelModifier extends ValueModifier {
    @DataField("minTarget", { type: Number, initial: 0 })
    minTarget!: number;

    @DataField("maxTarget", { type: Number, initial: 0 })
    maxTarget!: number;

    @DataField("successLevelMod", { type: Number, initial: 0 })
    successLevelMod!: number;

    @DataField("critFailureDigits", {
        type: Number,
        collection: CollectionType.ARRAY,
    })
    critFailureDigits!: SohlArray<number>;

    @DataField("critSuccessDigits", {
        type: Number,
        collection: CollectionType.ARRAY,
    })
    critSuccessDigits!: number[];

    @DataField("testDescTable", {
        type: TestDetailedDescription,
        collection: CollectionType.ARRAY,
    })
    testDescTable!: SohlArray<TestDetailedDescription>;

    get constrainedEffective() {
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
        super(parent, data, options);
    }

    /**
     * Perform Success Test for this Item
     *
     * @param {object} options
     * @returns {SuccessTestChatData}
     */
    async createSuccessTest({
        chat,
        skipDialog = false,
        type = `${this.parent.item.type}-${this.parent.item.name}-test`,
        title = "SOHL.MasteryLevelModifier.successTest.title",
        testResult,
    }: {
        chat?: SohlSpeaker;
        skipDialog?: boolean;
        type?: string;
        title?: string;
        testResult?: SuccessTestResult;
    } = {}) {
        if (!chat) {
            chat = new SohlSpeaker(this);
        }
        if (!testResult) {
            testResult = SohlSystem.successTestResultFactory(this.parent, {
                chat,
                type,
                title,
                mlMod: cloneDeep(this),
            });
            if (!testResult) return false;
        }

        if (!skipDialog) {
            // Render modal dialog
            let dlgTemplate =
                "systems/sohl/templates/dialog/standard-test-dialog.html";

            let dialogData = {
                variant: sohl.game.id,
                type: testResult.testType,
                title: sohl.i18n.format(
                    "SOHL.MasteryLevelModifier.successTest.dialogTitle",
                    {
                        name: chat.name,
                        title: testResult.title,
                    },
                ),
                mlMod: testResult.masteryLevelModifier,
                situationalModifier: 0,
                rollMode: testResult.rollMode,
                rollModes: Object.entries(ChatMessageRollMode).map(
                    ([k, v]) => ({
                        group: "CHAT.RollDefault",
                        value: k,
                        label: v,
                    }),
                ),
            };
            const dlgHtml = await renderTemplate(dlgTemplate, dialogData);

            // Create the dialog window
            const result = await inputDialog({
                title: sohl.i18n.format(
                    "SOHL.MasteryLevelModifier.successTest.dialogLabel",
                ),
                content: dlgHtml.trim(),
                callback: ((
                    _event: PointerEvent | SubmitEvent,
                    button: HTMLButtonElement,
                    _dialog: HTMLDialogElement,
                ): Promise<any> => {
                    const form = button.querySelector("form");
                    if (!form || !testResult) return Promise.resolve(null);
                    const fd = new FormDataExtended(form);
                    const formData = fd.object;
                    if (formData.situationalModifier) {
                        testResult.masteryLevelModifier.add(
                            DeltaInfo.PLAYER,
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

            if (!result) return;
        }

        let allowed = await testResult.evaluate();

        if (allowed && chat) {
            await testResult.toChat({ testResult });
        }
        return allowed ? testResult : false;
    }

    static _handleDetailedDescription(
        chatData: PlainObject,
        target: number,
        testDescTable: TestDetailedDescription[],
    ): number | null {
        let result = null;
        testDescTable.sort((a, b) => a.maxValue - b.maxValue);
        const testDesc = testDescTable.find(
            (entry) => entry.maxValue >= target,
        );
        if (testDesc) {
            // If the test description has a limitation based on
            // the last digit, find the one that applies.
            if (testDesc.limited?.length) {
                const limitedDesc = testDesc.limited
                    .values()
                    .find((d) =>
                        d.lastDigits.values().includes(chatData.lastDigit),
                    );
                if (limitedDesc) {
                    const label =
                        limitedDesc.label instanceof Function ?
                            limitedDesc.label(chatData)
                        :   limitedDesc.label;
                    const desc =
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

        if (result instanceof Function) result = result(chatData);

        return result;
    }
}
