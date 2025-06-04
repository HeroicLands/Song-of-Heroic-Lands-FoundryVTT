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

import { getSystemSetting, SohlPerformer } from "@common";
import { SohlAction } from "@common/event";
import { SohlItem } from "@common/item";
import { MasteryLevelModifier } from "@common/modifier";
import { SuccessTestResult } from "@common/result";
import { defineType } from "@utils";
const { StringField, NumberField, BooleanField } = (foundry.data as any).fields;
const kMasteryLevelMixin = Symbol("MasteryLevelMixin");
const kDataModel = Symbol("MasteryLevelMixin.DataModel");

/**
 * A mixin for item data models that represent gear.
 *
 * @template TBase
 *
 * @param Base Base class to extend (should be a `TypeDataModel` subclass).
 * @returns The extended class with the basic gear properties.
 */
export function MasteryLevelMixin<
    TBase extends Constructor<SohlPerformer.Shape>,
>(Base: TBase): TBase & Data {
    return class InternalMasteryLevelPerformer extends Base {
        declare readonly parent: MasteryLevelMixin.Data;
        _boosts!: number;
        _skillBase!: SkillBase;
        _masteryLevel!: MasteryLevelModifier;
        readonly [kMasteryLevelMixin] = true;

        static isA(obj: unknown): obj is TBase & Data<TPerformer, TSubType> {
            return (
                typeof obj === "object" &&
                obj !== null &&
                kMasteryLevelMixin in obj
            );
        }

        get fateSkills(): string[] {
            return (this.item?.getFlag("sohl", "fateSkills") as string[]) || [];
        }

        get magicMod(): number {
            return 0;
        }

        get boosts(): number {
            return this._boosts;
        }

        /**
         * Searches through all of the Fate mysteries on the actor, gathering any that
         * are applicable to this skill, and returns them.
         *
         * @readonly
         * @type {SohlItem[]} An array of Mystery fate items that apply to this skill.
         */
        get availableFate() {
            let result: SohlItem[] = [];
            if (!this._masteryLevel.disabled && this.actor) {
                this.actor.items.values().forEach((it: SohlItem) => {
                    if (
                        Mystery.isA(it.system) &&
                        it.system.subType === Mystery.CATEGORY.FATE
                    ) {
                        const fateSkills = this.fateSkills;
                        // If a fate item has a list of fate skills, then that fate
                        // item is only applicable to those skills.  If the fate item
                        // has no list of skills, then the fate item is applicable
                        // to all skills.
                        if (
                            !fateSkills.length ||
                            fateSkills.includes(this.item?.name || "")
                        ) {
                            if (it.system.$level.effective > 0) result.push(it);
                        }
                    }
                });
            }
            return result;
        }

        get fateBonusItems() {
            let result: SohlItem[] = [];
            if (this.actor) {
                for (const it of this.actor.allItems()) {
                    if (
                        Mystery.isA(it.system) &&
                        it.system.config.category === Mystery.CATEGORY.FATEBONUS
                    ) {
                        const skills = it.fateSkills;
                        if (!skills || skills.includes(this.item?.name || "")) {
                            if (
                                !it.system.$charges.disabled ||
                                it.system.$charges.effective > 0
                            ) {
                                result.push(it);
                            }
                        }
                    }
                }
            }
            return result;
        }

        get canImprove() {
            return (
                ((fvtt.game.user as any)?.isGM || this.item?.isOwner) &&
                !this._masteryLevel.disabled
            );
        }

        get valid() {
            return this.skillBase.valid;
        }

        get skillBase() {
            return this._skillBase;
        }

        get sdrIncr() {
            return 1;
        }

        async successTest(
            context: SohlAction.Context = {},
        ): Promise<SuccessTestResult> {
            if (!this.item) {
                throw new Error("No item found for success test.");
            }
            context.mlMod = fvtt.utils.deepClone(this._masteryLevel);
            context.type = `${this.item.type}-${this.item.name}-success-test`;
            context.title = sohl.i18n.format("{label} Test", {
                label: this.item?.label,
            });
            return await super.successTest(context);
        }

        /**
         * Perform an opposed test
         * @param {object} options
         * @returns {SuccessTestChatData}
         */
        async opposedTestStart(
            context: SohlAction.Context = {},
        ): Promise<SuccessTestResult | null> {
            let {
                skipDialog = false,
                type = `${this.item?.type}-${this.item?.name}-source-opposedtest`,
                title = sohl.i18n.format("{label} Opposed Test", {
                    label: this.item?.label,
                }),
                targetToken,
            } = context;

            targetToken ||= getUserTargetedToken(token);
            if (!targetToken) return null;

            const token = context.token;

            if (!token) {
                ui.notifications.warn(
                    sohl.i18n.format("No attacker token identified."),
                );
                return null;
            }

            if (!token.isOwner) {
                ui.notifications.warn(
                    sohl.i18n.format(
                        "You do not have permissions to perform this operation on {name}",
                        { name: token.name },
                    ),
                );
                return null;
            }

            let sourceTestResult = new sohl.game.CONFIG.SuccessTestResult(
                {
                    speaker,
                    item: this.item,
                    rollMode: getSystemSetting("rollMode", "core"),
                    type,
                    title:
                        title ||
                        sohl.i18n.format("{name} {label} Test", {
                            name: token?.name || context.actor?.name,
                            label: this.item?.label,
                        }),
                    situationalModifier: 0,
                    mlMod: fvtt.utils.deepClone(this._masteryLevel),
                },
                { parent: this },
            );

            sourceTestResult = await this.successTest(context);

            const opposedTest = new sohl.game.CONFIG.SOHL.OpposedTestResult(
                {
                    speaker,
                    targetToken,
                    sourceTestResult,
                },
                { parent: this },
            );

            return opposedTest.toRequestChat();
        }

        async opposedTestResume(
            context: SohlAction.Context = {},
        ): Promise<SuccessTestResult | false | null> {
            let {
                noChat = false,
                opposedTestResult,
                testType = SuccessTestResult.TEST_TYPE.SKILL,
            } = context;

            if (!opposedTestResult) {
                throw new Error("Must supply opposedTestResult");
            }

            if (!opposedTestResult.targetTestResult) {
                opposedTestResult.targetTestResult =
                    new sohl.game.CONFIG.SOHL.SuccessTestResult(
                        {
                            speaker,
                            item: this.item,
                            rollMode: getSystemSetting("rollMode", "core"),
                            type: SuccessTestResult.TEST_TYPE.SKILL,
                            title: sohl.i18n.format("Opposed {label} Test", {
                                label: this.item?.label,
                            }),
                            situationalModifier: 0,
                            mlMod: fvtt.utils.deepClone(
                                this.item?.system._masteryLevel,
                            ),
                        },
                        { parent: this },
                    );

                opposedTestResult.targetTestResult = this.successTest({
                    noChat: true,
                    testType,
                });
                if (!opposedTestResult.targetTestResult) return null;
            } else {
                // In this situation, where the targetTestResult is provided,
                // the GM is modifying the result of a prior opposedTest.
                // Therefore, we re-display the dialog for each of the prior
                // successTests.
                opposedTestResult.sourceTestResult =
                    opposedTestResult.sourceTestResult.item.successTest({
                        noChat: true,
                        successTestResult: opposedTestResult.sourceTestResult,
                    });
                opposedTestResult.targetTestResult =
                    opposedTestResult.targetTestResult.item.successTest({
                        noChat: true,
                        successTestResult: opposedTestResult.targetTestResult,
                    });
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

        async improveWithSDR(context: SohlAction.Context = {}): Promise<void> {
            const updateData: PlainObject = { "system.improveFlag": false };
            let roll = await Roll.create(`1d100 + ${this.skillBase.value}`);
            const isSuccess = (roll.total ?? 0) > this._masteryLevel.base;

            if (isSuccess) {
                updateData["system.masteryLevelBase"] =
                    this.parent.masteryLevelBase + this.sdrIncr;
            }
            let prefix = sohl.i18n.format("{subType} {label}", {
                subType: this.constructor.subTypes[this.subType],
                label: _l(this.constructor.metadata.label),
            });
            const chatTemplate =
                "systems/sohl/templates/chat/standard-test-card.html";
            const chatTemplateData = {
                variant: CONFIG.SOHL.id,
                type: `${this.type}-${this.name}-improve-sdr`,
                title: _l("{label} Development Roll", {
                    label: this.item.label,
                }),
                effTarget: this._masteryLevel.base,
                isSuccess: isSuccess,
                rollValue: roll.total,
                rollResult: roll.result,
                showResult: true,
                resultText:
                    isSuccess ?
                        _l("{prefix} Increase", { prefix })
                    :   _l("No {prefix} Increase", { prefix }),
                resultDesc:
                    isSuccess ?
                        _l("{label} increased by {incr} to {final}", {
                            label: this.item.label,
                            incr: this.sdrIncr,
                            final: this._masteryLevel.base + this.sdrIncr,
                        })
                    :   "",
                description:
                    isSuccess ?
                        SuccessTestResult.SUCCESS_TEXT.SUCCESS
                    :   SuccessTestResult.SUCCESS_TEXT.FAILURE,
                notes: "",
                sdrIncr: this.sdrIncr,
            };

            const chatHtml = await renderTemplate(
                chatTemplate,
                chatTemplateData,
            );

            const messageData = {
                user: game.user.id,
                speaker,
                content: chatHtml.trim(),
                sound: CONFIG.sounds.dice,
            };

            ChatMessage.applyRollMode(messageData, ChatMessageRollMode.SYSTEM);

            // Create a chat message
            await ChatMessageClass.create(messageData);
        }

        /** @inheritdoc */
        override initialize(context: SohlAction.Context = {}): void {
            this._boosts = 0;
            this._masteryLevel = new CONFIG.SOHL.class.MasteryLevelModifier(
                {
                    properties: {
                        fate: new CONFIG.SOHL.class.MasteryLevelModifier(
                            {},
                            { parent: this },
                        ),
                    },
                },
                { parent: this },
            );
            this._masteryLevel.setBase(this.masteryLevelBase);
            if (this.actor) {
                const fateSetting = game.settings.get("sohl", "optionFate");

                if (fateSetting === "everyone") {
                    this._masteryLevel.fate.setBase(50);
                } else if (fateSetting === "pconly") {
                    if (this.actor.hasPlayerOwner) {
                        this._masteryLevel.fate.setBase(50);
                    } else {
                        this._masteryLevel.fate.setDisabled(
                            _l("Non-Player Character/Creature"),
                            "NPC",
                        );
                    }
                } else {
                    this._masteryLevel.fate.setDisabled(
                        _l("Fate Disabled in Settings"),
                        "NoFate",
                    );
                }
            }
            this._skillBase ||= new SkillBase(this.skillBaseFormula, {
                items: this.actor?.items,
            });
        }

        /** @inheritdoc */
        override evaluate(context: SohlAction.Context = {}): void {
            this._skillBase.setAttributes(this.actor.allItems());

            if (this._masteryLevel.base > 0) {
                let newML = this._masteryLevel.base;

                for (let i = 0; i < this.boosts; i++) {
                    newML += this.constructor.calcMasteryBoost(newML);
                }

                this._masteryLevel.setBase(newML);
            }

            // Ensure base ML is not greater than MaxML
            if (this._masteryLevel.base > this._masteryLevel.max) {
                this._masteryLevel.setBase(this._masteryLevel.max);
            }

            if (this.skillBase.attributes.includes("Aura")) {
                // Any skill that has Aura in its SB formula cannot use fate
                this._masteryLevel.fate.setDisabled(
                    _l("Aura-Based, No Fate"),
                    "AurBsd",
                );
            }
        }

        /** @inheritdoc */
        override finalize(context: SohlAction.Context = {}): void {
            if (this._masteryLevel.disabled) {
                this._masteryLevel.fate.setDisabled(
                    CONFIG.SOHL.MOD.MLDSBL.name,
                    CONFIG.SOHL.MOD.MLDSBL.abbrev,
                );
            }
            if (!this._masteryLevel.fate.disabled) {
                const fate = this.actor.getTraitByAbbrev("fate");
                if (fate) {
                    this._masteryLevel.fate.addVM(fate.system.$score, {
                        includeBase: true,
                    });
                } else {
                    this._masteryLevel.fate.setBase(50);
                }

                // Apply magic modifiers
                if (this.magicMod) {
                    this._masteryLevel.fate.add(
                        CONFIG.SOHL.MOD.MAGICMOD,
                        this.magicMod,
                    );
                }

                this.fateBonusItems.forEach((it) => {
                    this._masteryLevel.fate.add(
                        CONFIG.SOHL.MOD.FATEBNS,
                        it.system.$level.effective,
                        { skill: it.label },
                    );
                });
                if (!this.availableFate.length) {
                    this._masteryLevel.fate.setDisabled(CONFIG.SOHL.MOD.NOFATE);
                }
            }
        }
    };
}

export namespace MasteryLevelMixin {
    export const kIsMasteryLevel = Symbol("MasteryLevel");
    export const Kind = "masterylevel";

    export const {
        kind: EFFECT_KEYS,
        values: EffectKeys,
        isValue: isEffectKey,
        labels: effectKeysLabels,
    } = defineType(`Gear.GEAR_KIND`, {
        "system._boosts": "MBoost",
        "mod:system.masteryLevel": "ML",
        "mod:system.masteryLevel.fate": "Fate",
        "system.masteryLevel.successLevelMod": "SL",
    });
    export type EffectKey = (typeof EFFECT_KEYS)[keyof typeof EFFECT_KEYS];

    export interface Data<TPerformer extends SohlPerformer = SohlPerformer>
        extends SohlItem.Data<TPerformer> {
        abbrev: string;
        skillBaseFormula: string;
        masteryLevelBase: number;
        improveFlag: boolean;
    }

    export function DataModel<
        TBase extends AnyConstructor,
        TPerformer extends SohlPerformer = SohlPerformer,
    >(Base: TBase): TBase & Data<TPerformer> {
        class InternalDataModel extends Base {
            declare abbrev: string;
            declare skillBaseFormula: string;
            declare masteryLevelBase: number;
            declare improveFlag: boolean;
            readonly [kDataModel] = true;

            static isA(obj: unknown): obj is TBase & Data<TPerformer> {
                return (
                    typeof obj === "object" && obj !== null && kDataModel in obj
                );
            }

            static defineSchema() {
                return {
                    ...super.defineSchema(),
                    abbrev: new StringField(),
                    skillBaseFormula: new StringField(),
                    masteryLevelBase: new NumberField({
                        initial: 0,
                        min: 0,
                    }),
                    improveFlag: new BooleanField({ initial: false }),
                };
            }
        }

        (InternalDataModel.prototype as any)[
            MasteryLevelMixin.kIsMasteryLevel
        ] = true;

        return InternalDataModel as unknown as TBase &
            SohlPerformer.Constructor;
    }
}
