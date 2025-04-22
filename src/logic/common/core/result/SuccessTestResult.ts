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

import { TestResult } from "@logic/common/core/result";
import { SohlLogic } from "@logic/common/core";
import { CollectionType, DataField, RegisterClass } from "@utils/decorators";
import {
    isChatMessageRollMode,
    SohlSystem,
    SohlSpeaker,
    ChatMessageRollMode,
    ContextMenuSortGroup,
    SohlContextMenu,
    renderTemplate,
    inputDialog,
    DialogButtonCallback,
    ChatMessageSounds,
} from "@foundry/core";
import { getStatic, SimpleRoll, deepMerge, SimpleRollData } from "@utils";
import { MasteryLevelModifier } from "@logic/common/core/modifier";

export interface TestTypeEntry {
    id: string;
    iconClass: string;
    condition: ((header: HTMLElement) => boolean) | boolean;
    group: ContextMenuSortGroup;
}

export interface SuccessTestResultOptions {
    testResult: SuccessTestResult;
    chatSpeaker: SohlSpeaker;
    mlMod: MasteryLevelModifier;
    skipDialog: boolean;
}

export type ValueFrom<T extends PlainObject> = T[keyof T];

export interface SuccessTestResultStatic<
    MISHAP extends StrictObject<string>,
    MOVEMENT extends StrictObject<string>,
    TESTTYPE extends StrictObject<{ id: string }>,
> {
    Mishap: MISHAP;
    isMishap(value: unknown): value is ValueFrom<MISHAP>;

    Movement: MOVEMENT;
    isMovement(value: unknown): value is ValueFrom<MOVEMENT>;

    TestType: TESTTYPE;
    //TestTypeEnum: Record<keyof TESTTYPE, TESTTYPE[keyof TESTTYPE]["id"]>;
    TestTypeEnum: StrictObject<string>;
    isTestType(value: unknown): value is TESTTYPE[keyof TESTTYPE];
}

export abstract class STResultBase<
    MISHAP extends StrictObject<string>,
    MOVEMENT extends StrictObject<string>,
    TESTTYPE extends StrictObject<{ id: string }>,
> extends TestResult {
    static Mishap: StrictObject<string>;
    static Movement: StrictObject<string>;
    static TestType: StrictObject<{ id: string }>;
    static TestTypeEnum: StrictObject<string>;

    static isMishap(value: unknown): boolean {
        return Object.values((this as typeof STResultBase).Mishap).includes(
            value as string,
        );
    }

    static isMovement(value: unknown): boolean {
        return Object.values((this as typeof STResultBase).Movement).includes(
            value as string,
        );
    }

    static isTestType(value: unknown): boolean {
        return Object.values((this as any).TestType)
            .map((entry: any) => entry.id)
            .includes(value as string);
    }
}

@RegisterClass("SuccessTestResult", "0.6.0")
export class SuccessTestResult extends STResultBase<
    typeof SuccessTestResult.Mishap,
    typeof SuccessTestResult.Movement,
    typeof SuccessTestResult.TestType
> {
    @DataField("token", { type: SohlSpeaker, required: true })
    token!: SohlSpeaker;

    @DataField("masteryLevelModifier", {
        type: MasteryLevelModifier,
        required: true,
    })
    masteryLevelModifier!: MasteryLevelModifier;

    @DataField("successes", { type: Number, initial: 0 })
    successes!: number;

    @DataField("rollMode", {
        type: String,
        initial: ChatMessageRollMode.SYSTEM,
    })
    rollMode!: string;

    @DataField("testType", { type: String, required: true })
    testType!: string;

    @DataField("roll", { type: SimpleRoll })
    roll!: SimpleRoll;

    @DataField("movement", {
        type: String,
        initial: SuccessTestResult.Movement.STILL,
    })
    movement!: string;

    @DataField("mishaps", {
        type: String,
        collection: CollectionType.SET,
        validator(this: SuccessTestResult, value: unknown): boolean {
            const ctor = this.constructor as typeof SuccessTestResult;
            return ctor.isMishap(value);
        },
    })
    mishaps!: Set<string>;

    private _resultText: string;
    private _resultDesc: string;
    private _successLevel: number;
    private _description: string;

    /**
     * Test mishap constants representing results of a critical failure.
     * These should be extended in subclasses to include specific mishap types.
     */
    static readonly Mishap: StrictObject<string> = {
        MISFIRE: "misfire",
    } as const;

    static readonly SuccessLevel: StrictObject<number> = {
        CRITICAL_FAILURE: -1,
        MARGINAL_FAILURE: 0,
        MARGINAL_SUCCESS: 1,
        CRITICAL_SUCCESS: 2,
    } as const;

    static readonly StandardRollData: StrictObject<SimpleRollData> = {
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

    static readonly Movement: StrictObject<string> = {
        STILL: "still",
        MOVING: "moving",
    } as const;

    static readonly TestType: StrictObject<TestTypeEntry> = {
        SETIMPROVEFLAG: {
            id: "setImproveFlag",
            iconClass: "fas fa-star",
            condition: (header: HTMLElement) => {
                const item = SohlContextMenu._getContextItem(header);
                return item?.system.canImprove && !item?.system.improveFlag;
            },
            group: ContextMenuSortGroup.GENERAL,
        },
        UNSETIMPROVEFLAG: {
            id: "unsetImproveFlag",
            iconClass: "far fa-star",
            condition: (header: HTMLElement) => {
                const item = SohlContextMenu._getContextItem(header);
                return (
                    item && item.system.canImprove && item.system.improveFlag
                );
            },
            group: ContextMenuSortGroup.GENERAL,
        },
        IMPROVEWITHSDR: {
            id: "improveWithSDR",
            iconClass: "fas fa-star",
            condition: (header: HTMLElement) => {
                const item = SohlContextMenu._getContextItem(header);
                return item?.system.canImprove && item.system.improveFlag;
            },
            group: ContextMenuSortGroup.GENERAL,
        },
        SUCCESSTEST: {
            id: "successTest",
            iconClass: "fas fa-person",
            condition: (): boolean => true,
            group: ContextMenuSortGroup.ESSENTIAL,
        },
        OPPOSEDTESTSTART: {
            id: "opposedTestStart",
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
            group: ContextMenuSortGroup.ESSENTIAL,
        },
        SHOCKTEST: {
            id: "shockTest",
            iconClass: "far fa-face-eyes-xmarks",
            condition: () => true,
            group: ContextMenuSortGroup.GENERAL,
        },
        STUMBLETEST: {
            id: "stumbleTest",
            iconClass: "far fa-person-falling",
            condition: () => true,
            group: ContextMenuSortGroup.GENERAL,
        },
        FUMBLETEST: {
            id: "fumbleTest",
            iconClass: "far fa-ball-pile",
            condition: () => true,
            group: ContextMenuSortGroup.GENERAL,
        },
        MORALETEST: {
            id: "moraleTest",
            iconClass: "far fa-people-group",
            condition: () => true,
            group: ContextMenuSortGroup.GENERAL,
        },
        FEARTEST: {
            id: "fearTest",
            iconClass: "far fa-face-scream",
            condition: () => true,
            group: ContextMenuSortGroup.GENERAL,
        },
        TRANSMITAFFLICTION: {
            id: "transmitAffliction",
            iconClass: "fas fa-head-side-cough",
            condition: (header: HTMLElement) => {
                const item = SohlContextMenu._getContextItem(header);
                return item?.system.canTransmit;
            },
            group: ContextMenuSortGroup.ESSENTIAL,
        },
        CONTRACTAFFLICTIONTEST: {
            id: "contractAfflictionTest",
            iconClass: "fas fa-virus",
            condition: () => true,
            group: ContextMenuSortGroup.GENERAL,
        },
        COURSETTEST: {
            id: "courseTest",
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
            group: ContextMenuSortGroup.ESSENTIAL,
        },
        FATIGUETEST: {
            id: "fatigueTest",
            iconClass: "fas fa-face-downcast-sweat",
            condition: () => true,
            group: ContextMenuSortGroup.GENERAL,
        },
        TREATMENTTEST: {
            id: "treatmentTest",
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
            group: ContextMenuSortGroup.ESSENTIAL,
        },
        DIAGNOSISTEST: {
            id: "diagnosisTest",
            iconClass: "fas fa-stethoscope",
            condition: (header: HTMLElement) => {
                const item = SohlContextMenu._getContextItem(header);
                return item && !item.system.isTreated;
            },
            group: ContextMenuSortGroup.ESSENTIAL,
        },
        HEALINGTEST: {
            id: "healingTest",
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
            group: ContextMenuSortGroup.ESSENTIAL,
        },
        BLEEDINGSTOPPAGETEST: {
            id: "bleedingStoppageTest",
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
            group: ContextMenuSortGroup.ESSENTIAL,
        },
        BLOODLOSSADVANCETEST: {
            id: "bloodlossAdvanceTest",
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
            group: ContextMenuSortGroup.ESSENTIAL,
        },
        OPPOSEDTESTRESUME: {
            id: "opposedTestResume",
            iconClass: "fas fa-people-arrows",
            condition: () => false,
            group: ContextMenuSortGroup.HIDDEN,
        },
        RESOLVEIMPACT: {
            id: "resolveImpact",
            iconClass: "fas fa-person-burst",
            condition: () => true,
            group: ContextMenuSortGroup.GENERAL,
        },
    } as const;

    static readonly TestTypeEnum = Object.freeze(
        Object.fromEntries(
            Object.entries(SuccessTestResult.TestType).map(([key, value]) => [
                key,
                value.id,
            ]),
        ),
    ) as StrictObject<string>;

    constructor(
        parent: SohlLogic,
        data: PlainObject = {},
        options: Partial<SuccessTestResultOptions> = {},
    ) {
        if (options.testResult) {
            data = deepMerge(options.testResult.toJSON(), data, {
                inplace: false,
            }) as PlainObject;
        }
        super(parent, data, options);
        if (options.chatSpeaker) this.speaker = options.chatSpeaker;
        if (options.mlMod) this.masteryLevelModifier = options.mlMod;
        this._resultText = "";
        this._resultDesc = "";
        this._successLevel = SuccessTestResult.SuccessLevel.MARGINAL_FAILURE;
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
        if (level <= SuccessTestResult.SuccessLevel.CRITICAL_FAILURE) {
            return SuccessTestResult.SuccessLevel.CRITICAL_FAILURE;
        } else if (level >= SuccessTestResult.SuccessLevel.CRITICAL_SUCCESS) {
            return SuccessTestResult.SuccessLevel.CRITICAL_SUCCESS;
        } else if (level === SuccessTestResult.SuccessLevel.MARGINAL_SUCCESS) {
            return SuccessTestResult.SuccessLevel.MARGINAL_SUCCESS;
        } else {
            return SuccessTestResult.SuccessLevel.MARGINAL_FAILURE;
        }
    }

    get availResponses() {
        const result: TestTypeEntry[] = [];
        const testTypes = getStatic(this, "testTypes") as SuccessTestType;
        if (this.testType === testTypes.OPPOSEDTESTSTART.id) {
            result.push(testTypes.OPPOSEDTESTRESUME);
        }

        return result;
    }

    get normSuccessLevel() {
        let result;
        if (this.isSuccess) {
            if (this.isCritical) {
                result = SuccessTestResult.SuccessLevel.CRITICAL_SUCCESS;
            } else {
                result = SuccessTestResult.SuccessLevel.MARGINAL_SUCCESS;
            }
        } else {
            if (this.isCritical) {
                result = SuccessTestResult.SuccessLevel.CRITICAL_FAILURE;
            } else {
                result = SuccessTestResult.SuccessLevel.MARGINAL_FAILURE;
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
            (this.successLevel <=
                SuccessTestResult.SuccessLevel.CRITICAL_FAILURE ||
                this.successLevel >=
                    SuccessTestResult.SuccessLevel.CRITICAL_SUCCESS)
        );
    }

    get isSuccess() {
        return (
            this.successLevel >= SuccessTestResult.SuccessLevel.MARGINAL_SUCCESS
        );
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
                name: this.speaker.name,
                title: this.title,
            }),
            movementOptions: Object.values(ctor.Movement).map((val) => [
                val,
                `SOHL.${ctor.name}.Movement.${val}`,
            ]),
            mishapOptions: Object.values(ctor.Mishap).map((val) => [
                val,
                `SOHL.${ctor.name}.Mishap.${val}`,
            ]),
            rollModes: Object.entries(ChatMessageRollMode).map(([k, v]) => ({
                group: "CHAT.RollDefault",
                value: k,
                label: v,
            })),
        };
        sohl.utils.deepMerge(testData, data);
        const dlgHtml = await renderTemplate(testData.template, data);

        // Create the dialog window
        return await inputDialog({
            title: "SOHL.SuccessTestResult.testDialog.title",
            content: dlgHtml.trim(),
            callback: ((fd: PlainObject) => {
                const formData = fd.object;
                const formSituationalModifier = formData.situationalModifier;
                if (formSituationalModifier) {
                    this.masteryLevelModifier.add(
                        sohl.game.MOD.PLAYER,
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
                    this._successLevel =
                        SuccessTestResult.SuccessLevel.CRITICAL_SUCCESS;
                } else {
                    this._successLevel =
                        SuccessTestResult.SuccessLevel.MARGINAL_SUCCESS;
                }
            } else {
                if (
                    this.masteryLevelModifier.critFailureDigits
                        .values()
                        .includes(this.lastDigit)
                ) {
                    this._successLevel =
                        SuccessTestResult.SuccessLevel.CRITICAL_FAILURE;
                } else {
                    this._successLevel =
                        SuccessTestResult.SuccessLevel.MARGINAL_FAILURE;
                }
            }
        } else {
            if (
                this.roll.total <=
                this.masteryLevelModifier.constrainedEffective
            ) {
                this._successLevel =
                    SuccessTestResult.SuccessLevel.MARGINAL_SUCCESS;
            } else {
                this._successLevel =
                    SuccessTestResult.SuccessLevel.MARGINAL_FAILURE;
            }
        }

        this._successLevel += this.masteryLevelModifier.successLevelMod;
        if (!this.critAllowed) {
            this._successLevel = Math.min(
                Math.max(
                    this._successLevel,
                    SuccessTestResult.SuccessLevel.MARGINAL_FAILURE,
                ),
                SuccessTestResult.SuccessLevel.MARGINAL_SUCCESS,
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
        let chatData = sohl.utils.deepMerge(this.toJSON() as PlainObject, {
            ...data,
            variant: sohl.game.id,
            template: "systems/sohl/templates/chat/standard-test-card.html",
            movementOptions: Object.values(SuccessTestResult.Movement).map(
                (val) => [val, `SOHL.SuccessTestResult.Movement.${val}`],
            ),
            rollModes: Object.entries(ChatMessageRollMode).map(([k, v]) => ({
                group: "CHAT.RollDefault",
                value: k,
                label: v,
            })),
        });

        const chatOptions: PlainObject = {};
        chatOptions.roll = SohlSystem.createRoll(this.roll);
        chatOptions.sound = ChatMessageSounds.DICE;
        this.speaker.toChatWithTemplate(data.template, data, chatOptions);
    }
}

export type SuccessLevel =
    (typeof SuccessTestResult.SuccessLevel)[keyof typeof SuccessTestResult.SuccessLevel];
export function isSuccessLevel(value: unknown): value is SuccessLevel {
    return Object.values(SuccessTestResult.SuccessLevel).includes(
        value as SuccessLevel,
    );
}

export type Movement =
    (typeof SuccessTestResult.Movement)[keyof typeof SuccessTestResult.Movement];
export function isMovement(value: unknown): value is Movement {
    return Object.values(SuccessTestResult.Movement).includes(
        value as Movement,
    );
}

export type TestType<T extends typeof SuccessTestResult> =
    T["TestType"][keyof T["TestType"]];
export function isTestTypeFor<T extends typeof SuccessTestResult>(
    cls: T,
    value: unknown,
): value is TestType<T> {
    return Object.values(cls.TestType)
        .map((entry) => entry.id)
        .includes(value as string);
}

type SuccessTestType = typeof SuccessTestResult.TestType;
type SuccessTestTypeKey = keyof SuccessTestType;
type SuccessTestTypeId = SuccessTestType[SuccessTestTypeKey]["id"];
