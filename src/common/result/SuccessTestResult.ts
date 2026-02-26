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

import type { MasteryLevelModifier } from "@common/modifier/MasteryLevelModifier";
import type { SohlTokenDocument } from "@common/token/SohlTokenDocument";
import type { SohlContextMenu } from "@utils/SohlContextMenu";
import type { SohlItem } from "@common/item/SohlItem";
import { SohlSpeaker } from "@common/SohlSpeaker";
import { SimpleRoll } from "@utils/SimpleRoll";
import { TestResult } from "@common/result/TestResult";
import { toFilePath } from "@utils/helpers";
import { inputDialog, DialogButtonCallback } from "@common/FoundryProxy";
import {
    MARGINAL_FAILURE,
    CRITICAL_FAILURE,
    MARGINAL_SUCCESS,
    CRITICAL_SUCCESS,
    VALUE_DELTA_ID,
    SOHL_SPEAKER_SOUND,
    SOHL_SPEAKER_ROLL_MODE,
    SUCCESS_TEST_RESULT_MOVEMENT,
    TEST_TYPE,
    SuccessTestResultMovement,
    SuccessTestResultMovements,
    SuccessTestResultMishaps,
    SohlSpeakerRollModes,
    isSohlSpeakerRollMode,
    SohlSpeakerRollMode,
    TestType,
} from "@utils/constants";

export class SuccessTestResult extends TestResult {
    resultText: string;
    resultDesc: string;
    private _successLevel: number;
    protected _token: SohlTokenDocument | null;
    protected _masteryLevelModifier: MasteryLevelModifier;
    protected _successStars: number;
    protected _testType: TestType;
    protected _roll: SimpleRoll;
    protected _movement: SuccessTestResultMovement;
    protected _mishaps: Set<string>;
    protected _canFate: boolean;
    protected _item: SohlItem;
    rollMode: string;
    protected _targetValueFunc: (successLevel: number) => number;
    protected _successStarTable: SuccessTestResult.LimitedDescription[];

    constructor(
        data: Partial<SuccessTestResult.Data> = {},
        options: Partial<SuccessTestResult.Options> = {},
    ) {
        if (options.testResult) {
            data = foundry.utils.mergeObject(
                options.testResult.toJSON(),
                data,
                {
                    inplace: false,
                },
            );
        }
        super(data, options);
        if (options.mlMod)
            this._masteryLevelModifier =
                data.masteryLevelModifier ??
                new sohl.ValueModifier({}, { parent: this.parent });
        this.resultText = data.resultText ?? "";
        this.resultDesc = data.resultDesc ?? "";
        this._successLevel = MARGINAL_FAILURE;
        this._token = data.token ?? null;
        this._masteryLevelModifier =
            data.masteryLevelModifier ??
            new sohl.MasteryLevelModifier(
                {},
                {
                    parent: this.parent,
                },
            );
        this._successStars = data.successStars ?? 0;
        this._successStarTable = data.successStarTable || [];
        this.rollMode = data.rollMode || SOHL_SPEAKER_ROLL_MODE.SYSTEM;
        this._testType = data.testType || TEST_TYPE.SUCCESSTEST.id;
        this._roll =
            data.roll ??
            new SimpleRoll(SuccessTestResult.StandardRollData.MARGINAL_FAILURE);
        this._movement =
            data.movement || SUCCESS_TEST_RESULT_MOVEMENT.STATIONARY;
        this._mishaps = new Set<string>(data.mishaps || []);
        this._item = this.parent.item;
        this._canFate =
            (this._item.logic as any).availableFate?.length > 0 &&
            !!data.canFate;
        if (options.chatSpeaker) {
            this._speaker = options.chatSpeaker;
        } else {
            this._speaker = new SohlSpeaker({ token: this._token?.id });
        }
        this._targetValueFunc = data.targetValueFunc || ((sl: number) => sl);
    }

    get targetValue(): number {
        return this._targetValueFunc(this.successLevel);
    }

    get successLevel(): number {
        const level = this._successLevel;
        if (level <= CRITICAL_FAILURE) {
            return CRITICAL_FAILURE;
        } else if (level >= CRITICAL_SUCCESS) {
            return CRITICAL_SUCCESS;
        } else if (level === MARGINAL_SUCCESS) {
            return MARGINAL_SUCCESS;
        } else {
            return MARGINAL_FAILURE;
        }
    }

    get token(): SohlTokenDocument | null {
        return this._token;
    }

    get masteryLevelModifier(): MasteryLevelModifier {
        return this._masteryLevelModifier;
    }

    get successStars(): number {
        return this._successStars;
    }

    get testType(): TestType {
        return this._testType;
    }

    get roll(): SimpleRoll {
        return this._roll;
    }

    get movement(): SuccessTestResultMovement {
        return this._movement;
    }

    get mishaps(): Set<string> {
        if (!this._mishaps) this._mishaps = new Set<string>();
        return this._mishaps;
    }

    get availResponses() {
        const result: SohlContextMenu.Entry[] = [];
        if (this.testType === TEST_TYPE.OPPOSEDTESTSTART.id) {
            result.push(TEST_TYPE.OPPOSEDTESTRESUME);
        }

        return result;
    }

    get normSuccessLevel() {
        let result;
        if (this.isSuccess) {
            if (this.isCritical) {
                result = CRITICAL_SUCCESS;
            } else {
                result = MARGINAL_SUCCESS;
            }
        } else {
            if (this.isCritical) {
                result = CRITICAL_FAILURE;
            } else {
                result = MARGINAL_FAILURE;
            }
        }
        return result;
    }

    get lastDigit() {
        return (this.roll?.total ?? 0) % 10;
    }

    get isCapped() {
        return this.masteryLevelModifier ?
                this.masteryLevelModifier.effective !==
                    this.masteryLevelModifier.constrainedEffective
            :   false;
    }

    get critAllowed() {
        return !!(
            this.masteryLevelModifier?.critSuccessDigits.length ||
            this.masteryLevelModifier?.critFailureDigits.length
        );
    }

    get isCritical() {
        return (
            this.critAllowed &&
            (this.successLevel <= CRITICAL_FAILURE ||
                this.successLevel >= CRITICAL_SUCCESS)
        );
    }

    get isSuccess() {
        return this.successLevel >= MARGINAL_SUCCESS;
    }

    get canFate() {
        return this._canFate;
    }

    async testDialog(
        data: PlainObject = {},
        callback: (formData: StrictObject<string | number>) => void,
    ): Promise<any> {
        const ctor = this.constructor as typeof SuccessTestResult;
        let testData: PlainObject = {
            ...this.toJSON(),
            variant: sohl.id,
            template: toFilePath(
                "systems/sohl/templates/dialog/standard-test-dialog.html",
            ),
            title: sohl.i18n.format("SOHL.SuccessTestResult.testDialog.title", {
                name: this._speaker.name,
                title: this._title,
            }),
            movementOptions: SuccessTestResultMovements.map((val) => [
                val,
                `SOHL.${ctor.name}.Movement.${val}`,
            ]),
            mishapOptions: SuccessTestResultMishaps.map((val) => [
                val,
                `SOHL.${ctor.name}.Mishap.${val}`,
            ]),
            rollModes: SohlSpeakerRollModes.map(([k, v]) => ({
                group: "CHAT.RollDefault",
                value: k,
                label: v,
            })),
        };
        foundry.utils.mergeObject(testData, data);

        // Create the dialog window
        return await inputDialog({
            title: "SOHL.SuccessTestResult.testDialog.title",
            template: testData.template,
            data,
            callback: ((fd: PlainObject) => {
                const formData = fd.object;
                const formSituationalModifier = formData.situationalModifier;
                if (formSituationalModifier) {
                    this.masteryLevelModifier.add(
                        VALUE_DELTA_ID.PLAYER,
                        formSituationalModifier,
                    );
                }

                this.masteryLevelModifier.successLevelMod =
                    Number.parseInt(String(formData.successLevelMod), 10) || 0;

                if (isSohlSpeakerRollMode(String(formData.rollMode))) {
                    this.rollMode = String(formData.rollMode);
                } else {
                    throw new Error(`Invalid roll mode "${formData.rollMode}"`);
                }

                // FIXME
                // if (isMovement(data.targetMovement)) {
                //     this.targetMovement = data.targetMovement;
                // } else {
                //     throw new Error(
                //         `Invalid target movement "${data.targetMovement}"`,
                //     );
                // }

                if (callback) callback.call(this, formData);
                return Promise.resolve(true);
            }) as DialogButtonCallback,
        });
    }

    async evaluate() {
        let allowed = await super.evaluate();
        if (allowed === false) return false;
        if (!this._speaker.isOwner) {
            sohl.log.uiWarn(
                sohl.i18n.format("SOHL.SUCCESSTESTRESULT.evaluate.NoPerm", {
                    name: this._speaker.name,
                }),
            );
            return false;
        }

        if (this.critAllowed) {
            if (
                this.roll.total <=
                this.masteryLevelModifier.constrainedEffective
            ) {
                if (
                    this.masteryLevelModifier.critSuccessDigits.includes(
                        this.lastDigit,
                    )
                ) {
                    this._successLevel = CRITICAL_SUCCESS;
                } else {
                    this._successLevel = MARGINAL_SUCCESS;
                }
            } else {
                if (
                    this.masteryLevelModifier.critFailureDigits.includes(
                        this.lastDigit,
                    )
                ) {
                    this._successLevel = CRITICAL_FAILURE;
                } else {
                    this._successLevel = MARGINAL_FAILURE;
                }
            }
        } else {
            if (
                this.roll.total <=
                this.masteryLevelModifier.constrainedEffective
            ) {
                this._successLevel = MARGINAL_SUCCESS;
            } else {
                this._successLevel = MARGINAL_FAILURE;
            }
        }

        this._successLevel += this.masteryLevelModifier.successLevelMod;
        if (!this.critAllowed) {
            this._successLevel = Math.min(
                Math.max(this._successLevel, MARGINAL_FAILURE),
                MARGINAL_SUCCESS,
            );
        }

        if (this.critAllowed) {
            if (this.isCritical) {
                this._description =
                    this.isSuccess ?
                        "SOHL.SuccessTestResult.CriticalSuccess"
                    :   "SOHL.SuccessTestResult.CriticalFailure";
            } else {
                this._description =
                    this.isSuccess ?
                        "SOHL.SuccessTestResult.MarginalSuccess"
                    :   "SOHL.SuccessTestResult.MarginalFailure";
            }
        } else {
            this._description =
                this.isSuccess ?
                    "SOHL.SuccessTestResult.Success"
                :   "SOHL.SuccessTestResult.Failure";
        }

        this._successStars = handleLimitedDescription(
            this,
            this._successStarTable,
        );
        return allowed;
    }

    async toChat(data: PlainObject = {}): Promise<void> {
        let chatData = foundry.utils.mergeObject(this.toJSON() as PlainObject, {
            ...data,
            variant: sohl.id,
            template: "systems/sohl/templates/chat/standard-test-card.html",
            movementOptions: SuccessTestResultMovements.map((val) => [
                val,
                `SOHL.SuccessTestResult.Movement.${val}`,
            ]),
            rollModes: SohlSpeakerRollModes.map(([k, v]) => ({
                group: "CHAT.RollDefault",
                value: k,
                label: v,
            })),
        });

        const options: PlainObject = {};
        options.roll = await this.roll.createRoll();
        options.sound = SOHL_SPEAKER_SOUND.DICE;
        this._speaker.toChat(chatData.template, chatData, options);
    }
}

export namespace SuccessTestResult {
    export const Kind: string = "SuccessTestResult";

    export interface Options {
        testResult: SuccessTestResult;
        chatSpeaker: SohlSpeaker;
        mlMod: MasteryLevelModifier;
        skipDialog: boolean;
    }

    export const StandardRollData: StrictObject<SimpleRoll.Data> = {
        CRITICAL_FAILURE: {
            numDice: 1,
            dieFaces: 100,
            modifier: 0,
            rolls: [100],
        },
        MARGINAL_FAILURE: {
            numDice: 1,
            dieFaces: 100,
            modifier: 0,
            rolls: [99],
        },
        CRITICAL_SUCCESS: {
            numDice: 1,
            dieFaces: 100,
            modifier: 0,
            rolls: [5],
        },
        MARGINAL_SUCCESS: {
            numDice: 1,
            dieFaces: 100,
            modifier: 0,
            rolls: [1],
        },
    } as const;

    export interface Data extends TestResult.Data {
        resultText: string;
        resultDesc: string;
        successLevel: number;
        token: SohlTokenDocument;
        masteryLevelModifier: MasteryLevelModifier;
        successStars: number;
        successStarTable: LimitedDescription[];
        rollMode: SohlSpeakerRollMode;
        testType: TestType;
        roll: SimpleRoll;
        movement: SuccessTestResultMovement;
        mishaps: string[];
        canFate: boolean;
        targetValueFunc: (sl: number) => number;
    }

    export interface Options extends TestResult.Options {}

    export interface ContextScope {
        priorTestResult: SuccessTestResult;
        situationalModifier: number;
        targetValueFunc: (sl: number) => number;
        successStarTable: LimitedDescription[];
    }

    export interface LimitedDescription {
        maxValue: number;
        lastDigits: number[];
        label: string | ((chatData: PlainObject) => string);
        description: string | ((chatData: PlainObject) => string);
        success: boolean;
        result: number | ((chatData: PlainObject) => number);
    }
}

function handleLimitedDescription(
    chatData: SuccessTestResult,
    testDescTable: SuccessTestResult.LimitedDescription[],
): number {
    if (testDescTable.length === 0) return 0;

    let result: number = 0;
    const targetValue = chatData.targetValue;
    testDescTable.sort((a, b) => a.maxValue - b.maxValue);
    const testDesc: SuccessTestResult.LimitedDescription | undefined =
        testDescTable.find(
            (entry) =>
                entry.maxValue >= targetValue &&
                (entry.lastDigits.length === 0 ||
                    entry.lastDigits.includes(chatData.lastDigit)),
        );
    if (testDesc) {
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
        result =
            typeof testDesc.result === "function" ?
                testDesc.result(chatData)
            :   testDesc.result;
    }

    return result;
}
