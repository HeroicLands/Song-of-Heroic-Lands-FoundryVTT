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

import { TestResult } from "@common/result";
import {
    SohlSpeaker,
    ChatMessageRollMode,
    isChatMessageRollMode,
    SohlPerformer,
    chatMessageSounds,
    chatMessageRollModes,
    SohlBaseOptions,
    CHATMESSAGE_SOUND,
} from "@common";
import {
    getStatic,
    SimpleRoll,
    foundryHelpers,
    SimpleRollData,
    CONTEXTMENU_SORT_GROUP,
    SohlContextMenu,
    SohlContextMenuEntry,
    defineType,
} from "@utils";
import { MasteryLevelModifier, VALUEDELTA_ID } from "@common/modifier";
import { inputDialog, DialogButtonCallback } from "@common/FoundryProxy";

export interface SuccessTestResultOptions extends SohlBaseOptions {
    testResult: SuccessTestResult;
    chatSpeaker: SohlSpeaker;
    mlMod: MasteryLevelModifier;
    skipDialog: boolean;
}

export const {
    kind: MISHAP,
    values: Mishaps,
    isValue: isMishap,
} = defineType({
    MISFIRE: "misfire",
});
export type Mishap = (typeof MISHAP)[keyof typeof MISHAP];

export const {
    kind: SUCCESS_LEVEL,
    values: SuccessLevels,
    isValue: isSuccessLevel,
} = defineType({
    CRITICAL_FAILURE: -1,
    MARGINAL_FAILURE: 0,
    MARGINAL_SUCCESS: 1,
    CRITICAL_SUCCESS: 2,
});
export type SuccessLevel = (typeof SUCCESS_LEVEL)[keyof typeof SUCCESS_LEVEL];

export const StandardRollData: StrictObject<SimpleRollData> = {
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

export const {
    kind: MOVEMENT,
    values: movements,
    isValue: isMovement,
} = defineType({
    STILL: "still",
    MOVING: "moving",
});
export type Movement = (typeof MOVEMENT)[keyof typeof MOVEMENT];

export const {
    kind: SUCCESSTEST_TESTTYPE,
    values: successTestTestType,
    isValue: isSuccessTestTestType,
} = defineType<StrictObject<SohlContextMenuEntry>>({
    SETIMPROVEFLAG: {
        id: "setImproveFlag",
        name: "Set Improve Flag",
        iconClass: "fas fa-star",
        condition: (header: HTMLElement) => {
            const item = SohlContextMenu._getContextItem(header);
            return item?.system.canImprove && !item?.system.improveFlag;
        },
        group: CONTEXTMENU_SORT_GROUP.GENERAL,
    },
    UNSETIMPROVEFLAG: {
        id: "unsetImproveFlag",
        name: "Unset Improve Flag",
        iconClass: "far fa-star",
        condition: (header: HTMLElement) => {
            const item = SohlContextMenu._getContextItem(header);
            return item && item.system.canImprove && item.system.improveFlag;
        },
        group: CONTEXTMENU_SORT_GROUP.GENERAL,
    },
    IMPROVEWITHSDR: {
        id: "improveWithSDR",
        name: "Improve with SDR",
        iconClass: "fas fa-star",
        condition: (header: HTMLElement) => {
            const item = SohlContextMenu._getContextItem(header);
            return item?.system.canImprove && item.system.improveFlag;
        },
        group: CONTEXTMENU_SORT_GROUP.GENERAL,
    },
    SUCCESSTEST: {
        id: "successTest",
        name: "Success Test",
        iconClass: "fas fa-person",
        condition: (): boolean => true,
        group: CONTEXTMENU_SORT_GROUP.ESSENTIAL,
    },
    OPPOSEDTESTSTART: {
        id: "opposedTestStart",
        name: "Opposed Test Start",
        iconClass: "fas fa-arrow-down-left-and-arrow-up-right-to-center",
        condition: (header: HTMLElement): boolean => {
            // FIXME: This is a temporary fix to allow opposed tests to be
            // started from the item header. It should be replaced with a
            // proper implementation that allows opposed tests to be started
            // from any item in the context menu.
            return true;
            // const item = cast<BaseItem>(
            //     SohlContextMenu._getContextItem(header),
            // );
            // const token = cast<SohlActor>(
            //     cast<Item>(item)?.actor,
            // )?.getToken();
            // return token && !item.system.$masteryLevel.disabled;
        },
        group: CONTEXTMENU_SORT_GROUP.ESSENTIAL,
    },
    SHOCKTEST: {
        id: "shockTest",
        name: "Shock Test",
        iconClass: "far fa-face-eyes-xmarks",
        condition: () => true,
        group: CONTEXTMENU_SORT_GROUP.GENERAL,
    },
    STUMBLETEST: {
        id: "stumbleTest",
        name: "Stumble Test",
        iconClass: "far fa-person-falling",
        condition: () => true,
        group: CONTEXTMENU_SORT_GROUP.GENERAL,
    },
    FUMBLETEST: {
        id: "fumbleTest",
        name: "Fumble Test",
        iconClass: "far fa-ball-pile",
        condition: () => true,
        group: CONTEXTMENU_SORT_GROUP.GENERAL,
    },
    MORALETEST: {
        id: "moraleTest",
        name: "Morale Test",
        iconClass: "far fa-people-group",
        condition: () => true,
        group: CONTEXTMENU_SORT_GROUP.GENERAL,
    },
    FEARTEST: {
        id: "fearTest",
        name: "Fear Test",
        iconClass: "far fa-face-scream",
        condition: () => true,
        group: CONTEXTMENU_SORT_GROUP.GENERAL,
    },
    TRANSMITAFFLICTION: {
        id: "transmitAffliction",
        name: "Transmit Affliction",
        iconClass: "fas fa-head-side-cough",
        condition: (header: HTMLElement) => {
            const item = SohlContextMenu._getContextItem(header);
            return item?.system.canTransmit;
        },
        group: CONTEXTMENU_SORT_GROUP.ESSENTIAL,
    },
    CONTRACTAFFLICTIONTEST: {
        id: "contractAfflictionTest",
        name: "Contract Affliction Test",
        iconClass: "fas fa-virus",
        condition: () => true,
        group: CONTEXTMENU_SORT_GROUP.GENERAL,
    },
    COURSETTEST: {
        id: "courseTest",
        name: "Course Test",
        iconClass: "fas fa-heart-pulse",
        condition: (header: HTMLElement) => {
            // FIXME: This is a temporary fix to allow opposed tests to be
            // started from the item header. It should be replaced with a
            // proper implementation that allows opposed tests to be started
            // from any item in the context menu.
            return true;
            // const item = cast<BaseItem>(
            //     SohlContextMenu._getContextItem(header),
            // );
            // if (item?.system.isDormant) return false;
            // const endurance = item?.actor?.getTraitByAbbrev("end");
            // return endurance && !endurance.system.$masteryLevel.disabled;
        },
        group: CONTEXTMENU_SORT_GROUP.ESSENTIAL,
    },
    FATIGUETEST: {
        id: "fatigueTest",
        name: "Fatigue Test",
        iconClass: "fas fa-face-downcast-sweat",
        condition: () => true,
        group: CONTEXTMENU_SORT_GROUP.GENERAL,
    },
    TREATMENTTEST: {
        id: "treatmentTest",
        name: "Treatment Test",
        iconClass: "fas fa-staff-snake",
        condition: (header: HTMLElement) => {
            // FIXME: This is a temporary fix to allow opposed tests to be
            // started from the item header. It should be replaced with a
            // proper implementation that allows opposed tests to be started
            // from any item in the context menu.
            return true;
            // const item = cast<BaseItem>(
            //     SohlContextMenu._getContextItem(header),
            // );
            // if (item?.system.isBleeding) return false;
            // const physician = item?.actor?.getSkillByAbbrev("pysn");
            // return physician && !physician.system.$masteryLevel.disabled;
        },
        group: CONTEXTMENU_SORT_GROUP.ESSENTIAL,
    },
    DIAGNOSISTEST: {
        id: "diagnosisTest",
        name: "Diagnosis Test",
        iconClass: "fas fa-stethoscope",
        condition: (header: HTMLElement) => {
            const item = SohlContextMenu._getContextItem(header);
            return !!item && !item.system.isTreated;
        },
        group: CONTEXTMENU_SORT_GROUP.ESSENTIAL,
    },
    HEALINGTEST: {
        id: "healingTest",
        name: "Healing Test",
        iconClass: "fas fa-heart-pulse",
        condition: (header: HTMLElement) => {
            // FIXME: This is a temporary fix to allow opposed tests to be
            // started from the item header. It should be replaced with a
            // proper implementation that allows opposed tests to be started
            // from any item in the context menu.
            return true;
            // const item = cast<BaseItem>(
            //     SohlContextMenu._getContextItem(header),
            // );
            // if (item?.system.isBleeding) return false;
            // const endurance = item?.actor?.getTraitByAbbrev("end");
            // return endurance && !endurance.system.$masteryLevel.disabled;
        },
        group: CONTEXTMENU_SORT_GROUP.ESSENTIAL,
    },
    BLEEDINGSTOPPAGETEST: {
        id: "bleedingStoppageTest",
        name: "Bleeding Stoppage Test",
        iconClass: "fas fa-droplet-slash",
        condition: (header: HTMLElement) => {
            // FIXME: This is a temporary fix to allow opposed tests to be
            // started from the item header. It should be replaced with a
            // proper implementation that allows opposed tests to be started
            // from any item in the context menu.
            return true;
            // const item = cast<BaseItem>(
            //     SohlContextMenu._getContextItem(header),
            // );
            // if (!item?.system.isBleeding) return false;
            // const physician = item?.actor?.getSkillByAbbrev("pysn");
            // return physician && !physician.system.$masteryLevel.disabled;
        },
        group: CONTEXTMENU_SORT_GROUP.ESSENTIAL,
    },
    BLOODLOSSADVANCETEST: {
        id: "bloodlossAdvanceTest",
        name: "Bloodloss Advance Test",
        iconClass: "fas fa-droplet",
        condition: (header: HTMLElement) => {
            // FIXME: This is a temporary fix to allow opposed tests to be
            // started from the item header. It should be replaced with a
            // proper implementation that allows opposed tests to be started
            // from any item in the context menu.
            return true;
            // const item = cast<BaseItem>(
            //     SohlContextMenu._getContextItem(header),
            // );
            // if (!item || !item.system.isBleeding) return false;
            // const strength = item?.actor?.getTraitByAbbrev("str");
            // return strength && !strength.system.$masteryLevel?.disabled;
        },
        group: CONTEXTMENU_SORT_GROUP.ESSENTIAL,
    },
    OPPOSEDTESTRESUME: {
        id: "opposedTestResume",
        name: "Opposed Test Resume",
        iconClass: "fas fa-people-arrows",
        condition: () => false,
        group: CONTEXTMENU_SORT_GROUP.HIDDEN,
    },
    RESOLVEIMPACT: {
        id: "resolveImpact",
        name: "Resolve Impact",
        iconClass: "fas fa-person-burst",
        condition: () => true,
        group: CONTEXTMENU_SORT_GROUP.GENERAL,
    },
});
export type SuccessTestTestType =
    (typeof SUCCESSTEST_TESTTYPE)[keyof typeof SUCCESSTEST_TESTTYPE]["id"];

export class SuccessTestResult extends TestResult {
    private _resultText: string;
    private _resultDesc: string;
    private _successLevel: number;
    private _description: string;
    token!: SohlSpeaker;
    masteryLevelModifier!: MasteryLevelModifier;
    successes!: number;
    rollMode!: string;
    testType!: SuccessTestTestType;
    roll!: SimpleRoll;
    movement!: Movement;
    mishaps!: Set<string>;

    constructor(
        data: PlainObject = {},
        options: Partial<SuccessTestResultOptions> = {},
    ) {
        if (options.testResult) {
            data = foundryHelpers.mergeObject(
                options.testResult.toJSON(),
                data,
                {
                    inplace: false,
                },
            ) as PlainObject;
        }
        super(data, options);
        if (options.chatSpeaker) this.speaker = options.chatSpeaker;
        if (options.mlMod) this.masteryLevelModifier = options.mlMod;
        this._resultText = "";
        this._resultDesc = "";
        this._successLevel = SUCCESS_LEVEL.MARGINAL_FAILURE;
        this._description = "";
    }

    get resultText(): string {
        return this._resultText;
    }

    get resultDesc(): string {
        return this._resultDesc;
    }

    get successLevel(): SuccessLevel {
        const level = this._successLevel;
        if (level <= SUCCESS_LEVEL.CRITICAL_FAILURE) {
            return SUCCESS_LEVEL.CRITICAL_FAILURE;
        } else if (level >= SUCCESS_LEVEL.CRITICAL_SUCCESS) {
            return SUCCESS_LEVEL.CRITICAL_SUCCESS;
        } else if (level === SUCCESS_LEVEL.MARGINAL_SUCCESS) {
            return SUCCESS_LEVEL.MARGINAL_SUCCESS;
        } else {
            return SUCCESS_LEVEL.MARGINAL_FAILURE;
        }
    }

    get availResponses() {
        const result: SohlContextMenuEntry[] = [];
        if (this.testType === SUCCESSTEST_TESTTYPE.OPPOSEDTESTSTART.id) {
            result.push(SUCCESSTEST_TESTTYPE.OPPOSEDTESTRESUME);
        }

        return result;
    }

    get normSuccessLevel() {
        let result;
        if (this.isSuccess) {
            if (this.isCritical) {
                result = SUCCESS_LEVEL.CRITICAL_SUCCESS;
            } else {
                result = SUCCESS_LEVEL.MARGINAL_SUCCESS;
            }
        } else {
            if (this.isCritical) {
                result = SUCCESS_LEVEL.CRITICAL_FAILURE;
            } else {
                result = SUCCESS_LEVEL.MARGINAL_FAILURE;
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
            (this.successLevel <= SUCCESS_LEVEL.CRITICAL_FAILURE ||
                this.successLevel >= SUCCESS_LEVEL.CRITICAL_SUCCESS)
        );
    }

    get isSuccess() {
        return this.successLevel >= SUCCESS_LEVEL.MARGINAL_SUCCESS;
    }

    async testDialog(
        data: PlainObject = {},
        callback: (formData: StrictObject<string | number>) => void,
    ): Promise<any> {
        const ctor = this.constructor as typeof SuccessTestResult;
        let testData: PlainObject = {
            ...this.toJSON(),
            variant: sohl.game.id,
            template: "systems/sohl/templates/dialog/standard-test-dialog.html",
            title: sohl.i18n.format("SOHL.SuccessTestResult.testDialog.title", {
                name: this.speaker._name,
                title: this.title,
            }),
            movementOptions: movements.map((val) => [
                val,
                `SOHL.${ctor.name}.Movement.${val}`,
            ]),
            mishapOptions: Mishaps.map((val) => [
                val,
                `SOHL.${ctor.name}.Mishap.${val}`,
            ]),
            rollModes: chatMessageRollModes.map(([k, v]) => ({
                group: "CHAT.RollDefault",
                value: k,
                label: v,
            })),
        };
        foundryHelpers.mergeObject(testData, data);
        const dlgHtml = await (
            foundry.applications.handlebars as any
        ).renderTemplate(testData.template, data);

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
                        VALUEDELTA_ID.PLAYER,
                        formSituationalModifier,
                    );
                    //this.situationalModifier = formSituationalModifier;
                }

                this.masteryLevelModifier.successLevelMod =
                    Number.parseInt(String(formData.successLevelMod), 10) || 0;

                if (isChatMessageRollMode(String(formData.rollMode))) {
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
        if (!this.speaker.isOwner) {
            sohl.log.uiWarn(
                sohl.i18n.format("SOHL.SUCCESSTESTRESULT.evaluate.NoPerm", {
                    name: this.speaker._name,
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
                    this._successLevel = SUCCESS_LEVEL.CRITICAL_SUCCESS;
                } else {
                    this._successLevel = SUCCESS_LEVEL.MARGINAL_SUCCESS;
                }
            } else {
                if (
                    this.masteryLevelModifier.critFailureDigits
                        .values()
                        .includes(this.lastDigit)
                ) {
                    this._successLevel = SUCCESS_LEVEL.CRITICAL_FAILURE;
                } else {
                    this._successLevel = SUCCESS_LEVEL.MARGINAL_FAILURE;
                }
            }
        } else {
            if (
                this.roll.total <=
                this.masteryLevelModifier.constrainedEffective
            ) {
                this._successLevel = SUCCESS_LEVEL.MARGINAL_SUCCESS;
            } else {
                this._successLevel = SUCCESS_LEVEL.MARGINAL_FAILURE;
            }
        }

        this._successLevel += this.masteryLevelModifier.successLevelMod;
        if (!this.critAllowed) {
            this._successLevel = Math.min(
                Math.max(this._successLevel, SUCCESS_LEVEL.MARGINAL_FAILURE),
                SUCCESS_LEVEL.MARGINAL_SUCCESS,
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

        return allowed;
    }

    async toChat(data: Partial<PlainObject> = {}): Promise<void> {
        let chatData = foundryHelpers.mergeObject(
            this.toJSON() as PlainObject,
            {
                ...data,
                variant: sohl.game.id,
                template: "systems/sohl/templates/chat/standard-test-card.html",
                movementOptions: movements.map((val) => [
                    val,
                    `SOHL.SuccessTestResult.Movement.${val}`,
                ]),
                rollModes: chatMessageRollModes.map(([k, v]) => ({
                    group: "CHAT.RollDefault",
                    value: k,
                    label: v,
                })),
            },
        );

        const chatOptions: PlainObject = {};
        chatOptions.roll = await this.roll.createRoll();
        chatOptions.sound = CHATMESSAGE_SOUND.DICE;
        this.speaker.toChat(data.template, data, chatOptions);
    }
}
