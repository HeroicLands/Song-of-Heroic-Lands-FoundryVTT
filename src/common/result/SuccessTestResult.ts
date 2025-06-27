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
import { SohlSpeaker, SohlSystem } from "@common";
import {
    SimpleRoll,
    SimpleRollData,
    SohlContextMenu,
    defineType,
    toFilePath,
    toHTMLWithTemplate,
} from "@utils";
import { MasteryLevelModifier, ValueDelta } from "@common/modifier";
import { inputDialog, DialogButtonCallback } from "@common/FoundryProxy";
import { SohlAction } from "@common/event";
import { SohlTokenDocument } from "@common/token";
const kSuccessTestResult = Symbol("SuccessTestResult");
const kData = Symbol("SuccessTestResult.Data");
const kContext = Symbol("SuccessTestResult.Context");

export class SuccessTestResult extends TestResult {
    private _resultText: string;
    private _resultDesc: string;
    private _successLevel: number;
    private _description: string;
    token!: SohlSpeaker;
    masteryLevelModifier!: MasteryLevelModifier;
    successes!: number;
    rollMode!: string;
    testType!: SuccessTestResult.TestType;
    roll!: SimpleRoll;
    movement!: SuccessTestResult.Movement;
    mishaps!: Set<string>;
    readonly [kSuccessTestResult] = true;

    static isA(obj: unknown): obj is SuccessTestResult {
        return (
            typeof obj === "object" && obj !== null && kSuccessTestResult in obj
        );
    }

    constructor(
        data: Partial<SuccessTestResult.Data> = {},
        options: Partial<SuccessTestResult.Options> = {},
    ) {
        if (options.testResult) {
            data = fvtt.utils.mergeObject(options.testResult.toJSON(), data, {
                inplace: false,
            }) as PlainObject;
        }
        super(data, options);
        if (options.chatSpeaker) this.speaker = options.chatSpeaker;
        if (options.mlMod) this.masteryLevelModifier = options.mlMod;
        this._resultText = "";
        this._resultDesc = "";
        this._successLevel = SuccessTestResult.MARGINAL_FAILURE;
        this._description = "";
    }

    get resultText(): string {
        return this._resultText;
    }

    get resultDesc(): string {
        return this._resultDesc;
    }

    get successLevel(): number {
        const level = this._successLevel;
        if (level <= SuccessTestResult.CRITICAL_FAILURE) {
            return SuccessTestResult.CRITICAL_FAILURE;
        } else if (level >= SuccessTestResult.CRITICAL_SUCCESS) {
            return SuccessTestResult.CRITICAL_SUCCESS;
        } else if (level === SuccessTestResult.MARGINAL_SUCCESS) {
            return SuccessTestResult.MARGINAL_SUCCESS;
        } else {
            return SuccessTestResult.MARGINAL_FAILURE;
        }
    }

    get availResponses() {
        const result: SohlContextMenu.Entry[] = [];
        if (this.testType === SuccessTestResult.TEST_TYPE.OPPOSEDTESTSTART.id) {
            result.push(SuccessTestResult.TEST_TYPE.OPPOSEDTESTRESUME);
        }

        return result;
    }

    get normSuccessLevel() {
        let result;
        if (this.isSuccess) {
            if (this.isCritical) {
                result = SuccessTestResult.CRITICAL_SUCCESS;
            } else {
                result = SuccessTestResult.MARGINAL_SUCCESS;
            }
        } else {
            if (this.isCritical) {
                result = SuccessTestResult.CRITICAL_FAILURE;
            } else {
                result = SuccessTestResult.MARGINAL_FAILURE;
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
            (this.successLevel <= SuccessTestResult.CRITICAL_FAILURE ||
                this.successLevel >= SuccessTestResult.CRITICAL_SUCCESS)
        );
    }

    get isSuccess() {
        return this.successLevel >= SuccessTestResult.MARGINAL_SUCCESS;
    }

    async testDialog(
        data: PlainObject = {},
        callback: (formData: StrictObject<string | number>) => void,
    ): Promise<any> {
        const ctor = this.constructor as typeof SuccessTestResult;
        let testData: PlainObject = {
            ...this.toJSON(),
            variant: sohl.game.id,
            template: toFilePath(
                "systems/sohl/templates/dialog/standard-test-dialog.html",
            ),
            title: sohl.i18n.format("SOHL.SuccessTestResult.testDialog.title", {
                name: this.speaker.name,
                title: this.title,
            }),
            movementOptions: SuccessTestResult.Movements.map((val) => [
                val,
                `SOHL.${ctor.name}.Movement.${val}`,
            ]),
            mishapOptions: SuccessTestResult.Mishaps.map((val) => [
                val,
                `SOHL.${ctor.name}.Mishap.${val}`,
            ]),
            rollModes: SohlSpeaker.RollModes.map(([k, v]) => ({
                group: "CHAT.RollDefault",
                value: k,
                label: v,
            })),
        };
        fvtt.utils.mergeObject(testData, data);
        const dlgHtml = await toHTMLWithTemplate(testData.template, data);

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
                        ValueDelta.ID.PLAYER,
                        formSituationalModifier,
                    );
                    //this.situationalModifier = formSituationalModifier;
                }

                this.masteryLevelModifier.successLevelMod =
                    Number.parseInt(String(formData.successLevelMod), 10) || 0;

                if (SohlSpeaker.isRollMode(String(formData.rollMode))) {
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
                    name: this.speaker.name,
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
                    this._successLevel = SuccessTestResult.CRITICAL_SUCCESS;
                } else {
                    this._successLevel = SuccessTestResult.MARGINAL_SUCCESS;
                }
            } else {
                if (
                    this.masteryLevelModifier.critFailureDigits.includes(
                        this.lastDigit,
                    )
                ) {
                    this._successLevel = SuccessTestResult.CRITICAL_FAILURE;
                } else {
                    this._successLevel = SuccessTestResult.MARGINAL_FAILURE;
                }
            }
        } else {
            if (
                this.roll.total <=
                this.masteryLevelModifier.constrainedEffective
            ) {
                this._successLevel = SuccessTestResult.MARGINAL_SUCCESS;
            } else {
                this._successLevel = SuccessTestResult.MARGINAL_FAILURE;
            }
        }

        this._successLevel += this.masteryLevelModifier.successLevelMod;
        if (!this.critAllowed) {
            this._successLevel = Math.min(
                Math.max(
                    this._successLevel,
                    SuccessTestResult.MARGINAL_FAILURE,
                ),
                SuccessTestResult.MARGINAL_SUCCESS,
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

    async toChat(data: PlainObject = {}): Promise<void> {
        let chatData = fvtt.utils.mergeObject(this.toJSON() as PlainObject, {
            ...data,
            variant: sohl.game.id,
            template: "systems/sohl/templates/chat/standard-test-card.html",
            movementOptions: SuccessTestResult.Movements.map((val) => [
                val,
                `SOHL.SuccessTestResult.Movement.${val}`,
            ]),
            rollModes: SohlSpeaker.RollModes.map(([k, v]) => ({
                group: "CHAT.RollDefault",
                value: k,
                label: v,
            })),
        });

        const options: PlainObject = {};
        options.roll = await this.roll.createRoll();
        options.sound = SohlSpeaker.SOUND.DICE;
        this.speaker.toChat(chatData.template, chatData, options);
    }
}

export namespace SuccessTestResult {
    export interface Options {
        testResult: SuccessTestResult;
        chatSpeaker: SohlSpeaker;
        mlMod: MasteryLevelModifier;
        skipDialog: boolean;
    }

    export const {
        kind: MISHAP,
        values: Mishaps,
        isValue: isMishap,
    } = defineType("SOHL.SuccessTestResult.Mishap", {
        MISFIRE: "misfire",
    });
    export type Mishap = (typeof MISHAP)[keyof typeof MISHAP];

    export const CRITICAL_FAILURE = -1;
    export const MARGINAL_FAILURE = 0;
    export const MARGINAL_SUCCESS = 1;
    export const CRITICAL_SUCCESS = 2;

    export type SuccessLevel = number;

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
        values: Movements,
        isValue: isMovement,
    } = defineType("SOHL.SuccessTestResult.Movement", {
        STILL: "still",
        MOVING: "moving",
    });
    export type Movement = (typeof MOVEMENT)[keyof typeof MOVEMENT];

    export const {
        kind: TEST_TYPE,
        values: TestTypes,
        isValue: isTestType,
    } = defineType("SOHL.SuccessTestResult.TestType", {
        SETIMPROVEFLAG: {
            id: "setImproveFlag",
            name: "Set Improve Flag",
            iconClass: "fas fa-star",
            condition: (header: HTMLElement) => {
                const item = SohlContextMenu._getContextItem(header);
                return item?.system.canImprove && !item?.system.improveFlag;
            },
            group: SohlContextMenu.SORT_GROUP.GENERAL,
        },
        UNSETIMPROVEFLAG: {
            id: "unsetImproveFlag",
            name: "Unset Improve Flag",
            iconClass: "far fa-star",
            condition: (header: HTMLElement) => {
                const item = SohlContextMenu._getContextItem(header);
                return (
                    item && item.system.canImprove && item.system.improveFlag
                );
            },
            group: SohlContextMenu.SORT_GROUP.GENERAL,
        },
        IMPROVEWITHSDR: {
            id: "improveWithSDR",
            name: "Improve with SDR",
            iconClass: "fas fa-star",
            condition: (header: HTMLElement) => {
                const item = SohlContextMenu._getContextItem(header);
                return item?.system.canImprove && item.system.improveFlag;
            },
            group: SohlContextMenu.SORT_GROUP.GENERAL,
        },
        SUCCESSTEST: {
            id: "successTest",
            name: "Success Test",
            iconClass: "fas fa-person",
            condition: (): boolean => true,
            group: SohlContextMenu.SORT_GROUP.ESSENTIAL,
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
            group: SohlContextMenu.SORT_GROUP.ESSENTIAL,
        },
        SHOCKTEST: {
            id: "shockTest",
            name: "Shock Test",
            iconClass: "far fa-face-eyes-xmarks",
            condition: () => true,
            group: SohlContextMenu.SORT_GROUP.GENERAL,
        },
        STUMBLETEST: {
            id: "stumbleTest",
            name: "Stumble Test",
            iconClass: "far fa-person-falling",
            condition: () => true,
            group: SohlContextMenu.SORT_GROUP.GENERAL,
        },
        FUMBLETEST: {
            id: "fumbleTest",
            name: "Fumble Test",
            iconClass: "far fa-ball-pile",
            condition: () => true,
            group: SohlContextMenu.SORT_GROUP.GENERAL,
        },
        MORALETEST: {
            id: "moraleTest",
            name: "Morale Test",
            iconClass: "far fa-people-group",
            condition: () => true,
            group: SohlContextMenu.SORT_GROUP.GENERAL,
        },
        FEARTEST: {
            id: "fearTest",
            name: "Fear Test",
            iconClass: "far fa-face-scream",
            condition: () => true,
            group: SohlContextMenu.SORT_GROUP.GENERAL,
        },
        TRANSMITAFFLICTION: {
            id: "transmitAffliction",
            name: "Transmit Affliction",
            iconClass: "fas fa-head-side-cough",
            condition: (header: HTMLElement) => {
                const item = SohlContextMenu._getContextItem(header);
                return item?.system.canTransmit;
            },
            group: SohlContextMenu.SORT_GROUP.ESSENTIAL,
        },
        CONTRACTAFFLICTIONTEST: {
            id: "contractAfflictionTest",
            name: "Contract Affliction Test",
            iconClass: "fas fa-virus",
            condition: () => true,
            group: SohlContextMenu.SORT_GROUP.GENERAL,
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
            group: SohlContextMenu.SORT_GROUP.ESSENTIAL,
        },
        FATIGUETEST: {
            id: "fatigueTest",
            name: "Fatigue Test",
            iconClass: "fas fa-face-downcast-sweat",
            condition: () => true,
            group: SohlContextMenu.SORT_GROUP.GENERAL,
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
            group: SohlContextMenu.SORT_GROUP.ESSENTIAL,
        },
        DIAGNOSISTEST: {
            id: "diagnosisTest",
            name: "Diagnosis Test",
            iconClass: "fas fa-stethoscope",
            condition: (header: HTMLElement) => {
                const item = SohlContextMenu._getContextItem(header);
                return !!item && !item.system.isTreated;
            },
            group: SohlContextMenu.SORT_GROUP.ESSENTIAL,
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
            group: SohlContextMenu.SORT_GROUP.ESSENTIAL,
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
            group: SohlContextMenu.SORT_GROUP.ESSENTIAL,
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
            group: SohlContextMenu.SORT_GROUP.ESSENTIAL,
        },
        OPPOSEDTESTRESUME: {
            id: "opposedTestResume",
            name: "Opposed Test Resume",
            iconClass: "fas fa-people-arrows",
            condition: () => false,
            group: SohlContextMenu.SORT_GROUP.HIDDEN,
        },
        RESOLVEIMPACT: {
            id: "resolveImpact",
            name: "Resolve Impact",
            iconClass: "fas fa-person-burst",
            condition: () => true,
            group: SohlContextMenu.SORT_GROUP.GENERAL,
        },
    } as StrictObject<SohlContextMenu.Entry>);
    export type TestType = (typeof TEST_TYPE)[keyof typeof TEST_TYPE]["id"];

    export interface Data extends TestResult.Data {
        readonly [kData]: true;
        resultText: string;
        resultDesc: string;
        successLevel: number;
        description: string;
        masteryLevelModifier: MasteryLevelModifier;
        rollMode: SohlSpeaker.RollMode;
        testType: SuccessTestResult.TestType;
        movement: Movement;
        mishaps: string[];
    }

    export namespace Data {
        export function isA(obj: unknown): obj is SuccessTestResult.Data {
            return typeof obj === "object" && obj !== null && kData in obj;
        }
    }

    export interface Options extends TestResult.Options {}

    export class Context extends SohlAction.Context {
        priorTestResult?: SuccessTestResult;
        targetToken?: SohlTokenDocument;
        rollMode: SohlSpeaker.RollMode;
        situationalModifier: number;
        readonly [kContext] = true;

        isA(obj: unknown): obj is Context {
            return typeof obj === "object" && obj !== null && kContext in obj;
        }

        constructor(data: Partial<SuccessTestResult.Context.Data> = {}) {
            super(data);
            if (data.priorTestResult)
                this.priorTestResult =
                    SuccessTestResult.isA(data.priorTestResult) ?
                        data.priorTestResult
                    :   new SuccessTestResult(data.priorTestResult);
            if (data.targetTokenUuid) {
                const targetToken = fromUuidSync(data.targetTokenUuid);
                if (targetToken) this.targetToken = targetToken;
            }
            this.rollMode = data.rollMode ?? SohlSpeaker.ROLL_MODE.SYSTEM;
            this.situationalModifier = data.situationalModifier ?? 0;
        }

        /** @inheritdoc */
        toJSON(): Record<string, unknown> {
            return {
                ...super.toJSON(),
                priorTestResult: this.priorTestResult?.toJSON() || null,
                targetTokenUuid: this.target?.uuid || null,
                rollMode: this.rollMode,
                situationalModifier: this.situationalModifier,
            };
        }
    }

    export namespace Context {
        export interface Data extends SohlAction.Context.Data {
            priorTestResult: Nullable<
                SuccessTestResult.Data | SuccessTestResult
            >;
            targetTokenUuid: Nullable<string>;
            rollMode: SohlSpeaker.RollMode;
            situationalModifier: number;
        }
    }
}
