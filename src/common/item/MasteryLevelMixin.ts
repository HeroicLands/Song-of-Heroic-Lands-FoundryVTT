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

import { sohl, fvtt } from "@common";

import {
    getSystemSetting,
    getTargetedTokens,
    SohlLogic,
    SohlSpeaker,
    SohlSystem,
} from "@common";
import { SohlActor } from "@common/actor";
import { SohlAction, SohlEvent } from "@common/event";
import { Mystery, SohlItem } from "@common/item";
import { MasteryLevelModifier } from "@common/modifier";
import { OpposedTestResult, SuccessTestResult } from "@common/result";
import { defineType, FilePath, toFilePath, toHTMLWithTemplate } from "@utils";
const { StringField, NumberField, BooleanField } = fvtt.data.fields;
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
export function MasteryLevelMixin<TBase extends Constructor<SohlLogic.Logic>>(
    Base: TBase,
): TBase {
    return class extends Base {
        declare readonly actions: SohlAction[];
        declare readonly events: SohlEvent[];
        declare readonly item: SohlItem;
        declare readonly actor: SohlActor | null;
        declare readonly typeLabel: string;
        declare readonly label: string;
        declare readonly defaultIntrinsicActionName: string;
        declare setDefaultAction: () => void;
        _boosts!: number;
        _skillBase!: MasteryLevelMixin.SkillBase;
        _masteryLevel!: MasteryLevelModifier;
        readonly [kMasteryLevelMixin] = true;

        static isA(obj: unknown): obj is TBase & MasteryLevelMixin.Logic {
            return (
                typeof obj === "object" &&
                obj !== null &&
                kMasteryLevelMixin in obj
            );
        }

        get masteryLevel(): MasteryLevelModifier {
            return this._masteryLevel;
        }

        get fateSkills(): string[] {
            return (
                (fvtt.utils.getProperty(
                    this.item,
                    "sohl.fateSkills",
                ) as string[]) || []
            );
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
                    if (Mystery.Data.isA(it.system, Mystery.SUBTYPE.FATE)) {
                        const logic = it.system.logic;
                        const fateSkills = this.fateSkills;
                        // If a fate item has a list of fate skills, then that fate
                        // item is only applicable to those skills.  If the fate item
                        // has no list of skills, then the fate item is applicable
                        // to all skills.
                        if (
                            !fateSkills.length ||
                            fateSkills.includes(this.item?.name || "")
                        ) {
                            if (logic.level.effective > 0) result.push(it);
                        }
                    }
                });
            }
            return result;
        }

        // get fateBonusItems() {
        //     let result: SohlItem[] = [];
        //     if (this.actor) {
        //         this.actor.items.forEach((it: SohlItem) => {
        //             if (
        //                 Mystery.Data.isA(it.system, Mystery.SUBTYPE.FATEBONUS)) {
        //                 const skills:  = it.fateSkills;
        //                 if (!skills || skills.includes(this.item?.name || "")) {
        //                     if (
        //                         !it.system.$charges.disabled ||
        //                         it.system.$charges.effective > 0
        //                     ) {
        //                         result.push(it);
        //                     }
        //                 }
        //             }
        //         }
        //     }
        //     return result;
        // }

        // get canImprove() {
        //     return (
        //         ((fvtt.game.user as any)?.isGM || this.item?.isOwner) &&
        //         !this._masteryLevel.disabled
        //     );
        // }

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
            context: SuccessTestResult.Context,
        ): Promise<SuccessTestResult | null | false> {
            if (!this.item) {
                throw new Error("No item found for success test.");
            }
            return await this._masteryLevel.successTest(context);
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
            if (!context.scope) context.scope = {};
            context.scope.targetToken ||=
                getTargetedTokens(true)?.[0] ?? undefined;
            if (!context.scope.targetToken) return null;
            context.type ||= `${this.item?.type}-${this.item?.name}-opposedtest`;
            context.title ||= sohl.i18n.format("{label} Opposed Test", {
                label: this.item?.label,
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
            let sourceTestContext: SuccessTestResult.Context;
            if (context.priorTestResult) {
                const srcTestRes = context.priorTestResult.sourceTestResult;
                sourceTestContext = new sohl.game.CONFIG.SuccessTestResult.Context({
                    speaker: srcTestRes.speaker.toJSON() as SohlSpeaker.Data,
                    item: this.item,
                    title: srcTestRes.title,
                    mlMod: srcTestRes.masteryLevelModifier,
                });
            } else {
                context.priorTestResult = new sohl.game.CONFIG.SuccessTestResult({
                        speaker: context.speaker,
                        item: this.item,
                        rollMode: getSystemSetting("rollMode", "core"),
                        type: SuccessTestResult.TEST_TYPE.SKILL,
                        title:
                            context.title ||
                            sohl.i18n.format("{name} {label} Test", {
                                name:
                                    context.token.name ||
                                    context.speaker.actor?.name,
                                label: this.item?.label,
                            }),
                        situationalModifier: 0,
                        mlMod: fvtt.utils.deepClone(this._masteryLevel),
                    },
                    { parent: this },
                );
            }
            let sourceTestContext: SuccessTestResult.Context =
                new SuccessTestResult.Context({
                    speaker: context.priorTestResult.speaker.toJSON() as SohlSpeaker.Data,
                    item: this.item,
                    rollMode: getSystemSetting("rollMode", "core"),
                    title: context.title,
                    situationalModifier: context.situationalModifier || 0,
                    mlMod: fvtt.utils.deepClone(this._masteryLevel),
                });
            let sourceTestResult =
                context.priorTestResult?.sourceTestResult ??
                new sohl.game.CONFIG.SuccessTestResult(
                    {
                        speaker: context.speaker,
                        item: this.item,
                        rollMode: getSystemSetting("rollMode", "core"),
                        title:
                            context.title ||
                            sohl.i18n.format("{name} {label} Test", {
                                name:
                                    context.token.name ||
                                    context.speaker.actor?.name,
                                label: this.item?.label,
                            }),
                        situationalModifier: 0,
                        mlMod: fvtt.utils.deepClone(this._masteryLevel),
                    },
                    { parent: this },
                );

            const sourceTestContext: SuccessTestResult.Context =
                new SuccessTestResult.Context({
                    speaker: context.speaker.toJSON() as SohlSpeaker.Data,
                    item: this.item,
                    rollMode: getSystemSetting("rollMode", "core"),
                    title: context.title,
                    situationalModifier: context..sourceTestResult.situationalModifier || 0,
                    mlMod: fvtt.utils.deepClone(this._masteryLevel),
                });
            const targetTestResult =
                await this._masteryLevel.successTest(sourceTestContext);

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

                const targetTestResult = await this.successTest(new SuccessTestResult.Context({
                    noChat: true,
                    rollMode:
                        getSystemSetting("rollMode", "core") ||
                        SohlSpeaker.ROLL_MODE.SYSTEM,
                    title:
                        context.title ||
                        sohl.i18n.format("{name} {label} Test", {
                            name:
                                context.token?.name ||
                                context.speaker.actor?.name,
                            label: this.item?.label,
                        }),
                    situationalModifier: 0,
                }));
                if (!targetTestResult) return targetTestResult;
                priorTestResult.targetTestResult = targetTestResult;
            } else {
                // In this situation, where the targetTestResult is provided,
                // the GM is modifying the result of a prior opposedTest.
                // Therefore, we re-display the dialog for each of the prior
                // successTests.
                opposedTestResult.sourceTestResult =
                    opposedTestResult.sourceTestResult..item.successTest({
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

        async improveWithSDR(context: SohlAction.Context): Promise<void> {
            const updateData: PlainObject = { "system.improveFlag": false };
            let roll = await Roll.create(`1d100 + ${this.skillBase.value}`);
            const isSuccess = (roll.total ?? 0) > this._masteryLevel.base;

            if (isSuccess) {
                updateData["system.masteryLevelBase"] =
                    this.parent.masteryLevelBase + this.sdrIncr;
            }
            let prefix = sohl.i18n.format("{subType} {label}", {
                subType: this.constructor.subTypes[this.subType],
                label: sohl.i18n.format(this.constructor.metadata.label),
            });
            const chatTemplate: FilePath = toFilePath(
                "systems/sohl/templates/chat/standard-test-card.html",
            );
            const chatTemplateData = {
                variant: CONFIG.SOHL.id,
                type: `${this.type}-${this.name}-improve-sdr`,
                title: sohl.i18n.format("{label} Development Roll", {
                    label: this.item.label,
                }),
                effTarget: this._masteryLevel.base,
                isSuccess: isSuccess,
                rollValue: roll.total,
                rollResult: roll.result,
                showResult: true,
                resultText:
                    isSuccess ?
                        sohl.i18n.format("{prefix} Increase", { prefix })
                    :   sohl.i18n.format("No {prefix} Increase", { prefix }),
                resultDesc:
                    isSuccess ?
                        sohl.i18n.format(
                            "{label} increased by {incr} to {final}",
                            {
                                label: this.item.label,
                                incr: this.sdrIncr,
                                final: this._masteryLevel.base + this.sdrIncr,
                            },
                        )
                    :   "",
                description:
                    isSuccess ?
                        sohl.i18n.format("SOHL.TestResult.SUCCESS")
                    :   sohl.i18n.format("SOHL.TestResult.FAILURE"),
                notes: "",
                sdrIncr: this.sdrIncr,
            };

            const chatHtml = await toHTMLWithTemplate(
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
        override initialize(context: SohlAction.Context): void {
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
                            sohl.i18n.format("Non-Player Character/Creature"),
                            "NPC",
                        );
                    }
                } else {
                    this._masteryLevel.fate.setDisabled(
                        sohl.i18n.format("Fate Disabled in Settings"),
                        "NoFate",
                    );
                }
            }
            this._skillBase ||= new SkillBase(this.skillBaseFormula, {
                items: this.actor?.items,
            });
        }

        /** @inheritdoc */
        override evaluate(context: SohlAction.Context): void {
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
                    sohl.i18n.format("Aura-Based, No Fate"),
                    "AurBsd",
                );
            }
        }

        /** @inheritdoc */
        override finalize(context: SohlAction.Context): void {
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
    } as unknown as TBase & MasteryLevelMixin.Logic;
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

    export interface Logic extends SohlLogic.Logic {}

    export interface Data extends SohlItem.Data {
        abbrev: string;
        skillBaseFormula: string;
        masteryLevelBase: number;
        improveFlag: boolean;
    }

    export function DataModel<TBase extends AnyConstructor>(
        Base: TBase,
    ): TBase & Data {
        class InternalDataModel extends Base {
            declare abbrev: string;
            declare skillBaseFormula: string;
            declare masteryLevelBase: number;
            declare improveFlag: boolean;
            readonly [kDataModel] = true;

            static isA(obj: unknown): obj is TBase & Data {
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

        return InternalDataModel as unknown as TBase & SohlLogic.Constructor;
    }

    export class SkillBase {
        _attrs;
        _formula;
        _sunsigns;
        _parsedFormula;
        _value;

        constructor(formula, { items = null, sunsign = null } = {}) {
            if (!formula) {
                this._formula = null;
                this._attrs = {};
                this._sunsigns = [];
            }

            if (items && !(Symbol.iterator in Object(items))) {
                throw new Error("items must be iterable");
            }

            this._formula = formula || null;
            this._attrs = {};
            this._sunsigns = sunsign?.system.textValue.split("-") || [];
            this._parsedFormula = formula ? this._parseFormula : [];
            this._value = 0;
            if (items) {
                this.setAttributes(items);
            }
        }

        setAttributes(items) {
            const attributes = [];
            for (const it of items) {
                if (
                    it.type === TraitItemData.DATA_TYPE &&
                    it.system.intensity === TraitItemData.INTENSITY.ATTRIBUTE &&
                    it.system.isNumeric
                )
                    attributes.push(it);
            }
            this._parsedFormula.forEach((param) => {
                const type = typeof param;

                if (type === "string") {
                    const [subType, name, mult = 1] = param.split(":");
                    if (subType === "attr") {
                        const attr = attributes.find(
                            (obj) => obj.system.abbrev === name,
                        );

                        if (attr) {
                            const score = Number.parseInt(
                                attr.system.textValue,
                                10,
                            );
                            if (Number.isInteger(score)) {
                                this._attrs[attr.system.abbrev] = {
                                    name: attr.name,
                                    value: score * mult,
                                };
                            } else {
                                throw new Error(
                                    "invalid attribute value not number",
                                );
                            }
                        }
                    }
                }
            });
            this._value = this.formula ? this._calcValue() : 0;
        }

        get valid() {
            return !!this.parsedFormula.length;
        }

        get formula() {
            return this._formula;
        }

        get parsedFormula() {
            return this._parsedFormula;
        }

        get sunsigns() {
            return this._sunsigns;
        }

        get attributes() {
            return Object.values(this._attrs).map((a) => a.name);
        }

        get value() {
            return this._value;
        }

        /**
         * Parses a skill base formula.
         *
         * A valid SB formula looks like this:
         *
         *   "@str, @int, @sta, hirin:2, ahnu, 5"
         *
         * meaning
         *   average STR, INT, and STA
         *   add 2 if sunsign hirin (modifier after colon ":")
         *   add 1 if sunsign ahnu (1 since no modifier specified)
         *   add 5 to result
         *
         * A valid formula must have exactly 2 or more attributes, everything else is optional.
         *
         * @returns {object[]} A parsed skill base formula
         */
        get _parseFormula() {
            const parseResult = [];
            let modifier = 0;

            let isFormulaValid = true;
            // All parts of the formula are separated by commas,
            // and we lowercase here since the string is processed
            // case-insensitive.
            const sbParts = this._formula.toLowerCase().split(",");

            for (let param of sbParts) {
                if (!isFormulaValid) break;

                param = param.trim();
                if (param != "") {
                    if (param.startsWith("@")) {
                        // This is a reference to an attribute

                        // Must have more than just the "@" sign
                        if (param.length === 1) {
                            isFormulaValid = false;
                            break;
                        }

                        const paramName = param.slice(1);
                        parseResult.push(`attr:${paramName}`);
                        continue;
                    }

                    if (param.match(/^\W/)) {
                        // This is a sunsign

                        let ssParts = param.split(":");

                        // if more than 2 parts, it's invalid
                        if (ssParts.length > 2) {
                            isFormulaValid = false;
                            break;
                        }

                        const ssName = ssParts[0].trim;
                        let ssCount = 1;
                        // if second part provided, must be a number
                        if (ssParts.length === 2) {
                            const ssNumber = ssParts[1]
                                .trim()
                                .match(/^[-+]?\d+/);
                            if (ssNumber) {
                                ssCount = Number.parseInt(ssNumber[0], 10);
                            } else {
                                isFormulaValid = false;
                            }
                            break;
                        }

                        parseResult.push(`ss:${ssName}:${ssCount}`);

                        continue;
                    }

                    // The only valid possibility left is a number.
                    // If it"s not a number, it's invalid.
                    if (param.match(/^[-+]?\d+$/)) {
                        modifier += Number.parseInt(param, 10);
                        parseResult.push(modifier);
                    } else {
                        isFormulaValid = false;
                        break;
                    }
                }
            }

            return isFormulaValid ? parseResult : null;
        }

        /**
         * Calculates a skill base value.
         *
         * @returns A number representing the calculated skill base
         */
        _calcValue() {
            if (!this.valid) return 0;
            let attrScores = [];
            let ssBonus = Number.MIN_SAFE_INTEGER;
            let modifier = 0;
            this.parsedFormula.forEach((param) => {
                const type = typeof param;

                if (type === "number") {
                    modifier += param;
                } else if (type === "string") {
                    const [subType, name, mult = 1] = param.split(":");
                    if (subType === "attr") {
                        attrScores.push(this._attrs[name]?.value || 0);
                    } else if (subType === "ss") {
                        if (this.sunsigns.includes(name)) {
                            // We matched a character's sunsign, apply modifier
                            // Character only gets the largest sunsign bonus
                            ssBonus = Math.max(
                                Number.parseInt(mult, 10),
                                ssBonus,
                            );
                        }
                    }
                }
            });

            ssBonus = ssBonus > Number.MIN_SAFE_INTEGER ? ssBonus : 0;
            let result = attrScores.reduce((acc, cur) => acc + cur, 0);
            result = result / attrScores.length;

            if (attrScores.length === 2) {
                // Special rounding rule: if only two attributes, and
                // primary attr > secondary attr, round up, otherwise round down
                result =
                    attrScores[0] > attrScores[1] ?
                        Math.ceil(result)
                    :   Math.floor(result);
            } else {
                // Otherwise use normal rounding rules
                result = Math.round(result);
            }

            result += ssBonus + modifier;

            result = Math.max(0, result); // Make sure result is >= 0

            return result;
        }
    }
}
