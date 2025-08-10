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

import { SohlLogic } from "@common/SohlLogic";
import { SohlActor } from "@common/actor/SohlActor";
import type { SohlEvent } from "@common/event/SohlEvent";
import type { SohlAction } from "@common/event/SohlAction";
import { SohlItem } from "@common/item/SohlItem";
import { MasteryLevelModifier } from "@common/modifier/MasteryLevelModifier";
import { FilePath, toFilePath } from "@utils/helpers";
import { defineType, ITEM_KIND, TRAIT_INTENSITY } from "@utils/constants";
const { StringField, NumberField, BooleanField } = foundry.data.fields;
export const kMasteryLevelMixin = Symbol("MasteryLevelMixin");
export const kMasteryLevelMixinData = Symbol("MasteryLevelMixin.Data");

/**
 * A mixin for item data models that represent gear.
 *
 * @template TBase
 *
 * @param Base Base class to extend (should be a `TypeDataModel` subclass).
 * @returns The extended class with the basic gear properties.
 */
export function MasteryLevelMixin<TBase extends AnyConstructor<SohlLogic>>(
    Base: TBase,
): TBase & MasteryLevelMixin.Logic {
    return class extends Base implements MasteryLevelMixin.Logic {
        declare parent: MasteryLevelMixin.Data;
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

        async improveWithSDR(context: SohlAction.Context): Promise<void> {
            const updateData: PlainObject = { "system.improveFlag": false };
            let roll = await Roll.create(`1d100 + ${this.skillBase.value}`);
            const isSuccess = (roll.total ?? 0) > this._masteryLevel.base;

            if (isSuccess) {
                updateData["system.masteryLevelBase"] =
                    this.parent.masteryLevelBase + this.sdrIncr;
            }
            const chatTemplate: FilePath = toFilePath(
                "systems/sohl/templates/chat/standard-test-card.html",
            );
            const chatTemplateData = {
                variant: sohl.id,
                type: `${this.parent.kind}-${this.parent.item.name}-improve-sdr`,
                title: `${this.parent.label(false)} Development Roll`,
                effTarget: this._masteryLevel.base,
                isSuccess: isSuccess,
                rollValue: roll.total,
                rollResult: roll.result,
                showResult: true,
                resultText:
                    isSuccess ?
                        sohl.i18n.format("{prefix} Increase", {
                            prefix: this.parent.item.label,
                        })
                    :   sohl.i18n.format("No {prefix} Increase", {
                            prefix: this.parent.item.label,
                        }),
                resultDesc:
                    isSuccess ?
                        sohl.i18n.format(
                            "{label} increased by {incr} to {final}",
                            {
                                label: this.parent.item.label,
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

            context.speaker.toChat(chatTemplate, chatTemplateData);
        }

        get magicMod(): number {
            return 0;
        }

        get boosts(): number {
            return this._boosts;
        }

        get _availableFate(): SohlItem[] {
            return [];
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
            if (!this._masteryLevel.disabled && this.parent.actor) {
                this.parent.actor.items.forEach((it: SohlItem) => {
                    if (MasteryLevelMixin.Data.isA(it.system)) {
                        result.push(...it.system.logic._availableFate);
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
        //                 if (!skills || skills.includes(this.parent.item?.name || "")) {
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
        //         (((game as any).user as any)?.isGM || this.parent.item?.isOwner) &&
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

        initialize(context: SohlAction.Context): void {
            this._boosts = 0;
            // this._masteryLevel = new CONFIG.SOHL.class.MasteryLevelModifier(
            //     {
            //         properties: {
            //             fate: new CONFIG.SOHL.class.MasteryLevelModifier(
            //                 {},
            //                 { parent: this },
            //             ),
            //         },
            //     },
            //     { parent: this },
            // );
            // this._masteryLevel.setBase(this.masteryLevelBase);
            // if (this.actor) {
            //     const fateSetting = (game as any).settings.get("sohl", "optionFate");

            //     if (fateSetting === "everyone") {
            //         this._masteryLevel.fate.setBase(50);
            //     } else if (fateSetting === "pconly") {
            //         if (this.actor.hasPlayerOwner) {
            //             this._masteryLevel.fate.setBase(50);
            //         } else {
            //             this._masteryLevel.fate.setDisabled(
            //                 sohl.i18n.format("Non-Player Character/Creature"),
            //                 "NPC",
            //             );
            //         }
            //     } else {
            //         this._masteryLevel.fate.setDisabled(
            //             sohl.i18n.format("Fate Disabled in Settings"),
            //             "NoFate",
            //         );
            //     }
            // }
            // this._skillBase ||= new SkillBase(this.skillBaseFormula, {
            //     items: this.actor?.items,
            // });
        }

        evaluate(context: SohlAction.Context): void {
            // this._skillBase.setAttributes(this.actor.allItems());
            // if (this._masteryLevel.base > 0) {
            //     let newML = this._masteryLevel.base;
            //     for (let i = 0; i < this.boosts; i++) {
            //         newML += this.constructor.calcMasteryBoost(newML);
            //     }
            //     this._masteryLevel.setBase(newML);
            // }
            // // Ensure base ML is not greater than MaxML
            // if (this._masteryLevel.base > this._masteryLevel.max) {
            //     this._masteryLevel.setBase(this._masteryLevel.max);
            // }
            // if (this.skillBase.attributes.includes("Aura")) {
            //     // Any skill that has Aura in its SB formula cannot use fate
            //     this._masteryLevel.fate.setDisabled(
            //         sohl.i18n.format("Aura-Based, No Fate"),
            //         "AurBsd",
            //     );
            // }
        }

        finalize(context: SohlAction.Context): void {
            // if (this._masteryLevel.disabled) {
            //     this._masteryLevel.fate.setDisabled(
            //         CONFIG.SOHL.MOD.MLDSBL.name,
            //         CONFIG.SOHL.MOD.MLDSBL.abbrev,
            //     );
            // }
            // if (!this._masteryLevel.fate.disabled) {
            //     const fate = this.actor.getTraitByAbbrev("fate");
            //     if (fate) {
            //         this._masteryLevel.fate.addVM(fate.system.$score, {
            //             includeBase: true,
            //         });
            //     } else {
            //         this._masteryLevel.fate.setBase(50);
            //     }
            //     // Apply magic modifiers
            //     if (this.magicMod) {
            //         this._masteryLevel.fate.add(
            //             CONFIG.SOHL.MOD.MAGICMOD,
            //             this.magicMod,
            //         );
            //     }
            //     this.fateBonusItems.forEach((it) => {
            //         this._masteryLevel.fate.add(
            //             CONFIG.SOHL.MOD.FATEBNS,
            //             it.system.$level.effective,
            //             { skill: it.label },
            //         );
            //     });
            //     if (!this.availableFate.length) {
            //         this._masteryLevel.fate.setDisabled(CONFIG.SOHL.MOD.NOFATE);
            //     }
            // }
        }
    } as unknown as TBase & MasteryLevelMixin.Logic;
}

export namespace MasteryLevelMixin {
    export const {
        kind: EFFECT_KEYS,
        values: EffectKeys,
        isValue: isEffectKey,
        labels: effectKeysLabels,
    } = defineType(`SOHL.Gear.GEAR_KIND`, {
        "system._boosts": "MBoost",
        "mod:system.masteryLevel": "ML",
        "mod:system.masteryLevel.fate": "Fate",
        "system.masteryLevel.successLevelMod": "SL",
    });
    export type EffectKey = (typeof EFFECT_KEYS)[keyof typeof EFFECT_KEYS];

    export interface Logic extends SohlLogic.Logic {
        readonly [kMasteryLevelMixin]: true;
        readonly parent: MasteryLevelMixin.Data;
        readonly masteryLevel: MasteryLevelModifier;
        readonly magicMod: number;
        readonly boosts: number;
        readonly _availableFate: SohlItem[];
        readonly availableFate: SohlItem[];
        readonly valid: boolean;
        readonly skillBase: MasteryLevelMixin.SkillBase;
        readonly sdrIncr: number;
        improveWithSDR(context: SohlAction.Context): Promise<void>;
    }

    export interface Data extends SohlItem.Data {
        readonly [kMasteryLevelMixinData]: true;
        readonly logic: Logic;
        abbrev: string;
        skillBaseFormula: string;
        masteryLevelBase: number;
        improveFlag: boolean;
    }

    export namespace Data {
        export function isA(obj: unknown): obj is Data {
            return (
                typeof obj === "object" &&
                obj !== null &&
                kMasteryLevelMixinData in obj
            );
        }
    }

    export function DataModel<TBase extends AnyConstructor>(
        Base: TBase,
    ): TBase & Data {
        return class extends Base {
            declare abbrev: string;
            declare skillBaseFormula: string;
            declare masteryLevelBase: number;
            declare improveFlag: boolean;
            readonly [kMasteryLevelMixinData] = true;

            static defineSchema(): foundry.data.fields.DataSchema {
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
        } as unknown as TBase & Data;
    }

    export class SkillBase {
        _attrs: StrictObject<{ name: string; value: number }>;
        _formula: string | null;
        _sunsigns: string[];
        _parsedFormula: string[] | null;
        _value: number;

        constructor(
            formula: string,
            options?: { items?: SohlItem[]; sunsign?: SohlItem },
        ) {
            if (!formula) {
                this._formula = null;
                this._attrs = {};
                this._sunsigns = [];
            }

            if (options?.items && !(Symbol.iterator in Object(options.items))) {
                throw new Error("items must be iterable");
            }

            this._formula = formula || null;
            this._attrs = {};
            this._sunsigns =
                options?.sunsign?.system.textValue.split("-") || [];
            this._parsedFormula = null;
            this._value = 0;
            if (options?.items) {
                this.setAttributes(options.items);
            }
        }

        setAttributes(items: SohlItem[] = []): void {
            const attributes: SohlItem[] = [];
            for (const it of items) {
                const itData = it.type === ITEM_KIND.TRAIT ? it.system : null;
                if (
                    itData?.intensity === TRAIT_INTENSITY.ATTRIBUTE &&
                    itData.isNumeric
                )
                    attributes.push(it);
            }
            this._parsedFormula?.forEach((param) => {
                const type = typeof param;

                if (type === "string") {
                    const [subType, name, multval] = param.split(":");
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
                                let mult =
                                    typeof multval === "string" ?
                                        Number.parseInt(multval, 10)
                                    :   1;
                                if (Number.isNaN(mult)) {
                                    throw new Error(
                                        "invalid attribute multiplier not number",
                                    );
                                }
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

        get valid(): boolean {
            return !!this.parsedFormula?.length;
        }

        get formula(): string | null {
            return this._formula;
        }

        get parsedFormula(): string[] | null {
            return this._parsedFormula;
        }

        get sunsigns(): string[] {
            return this._sunsigns;
        }

        get attributes(): string[] {
            return Object.values(this._attrs).map((a) => a.name);
        }

        get value(): number {
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
        get _parseFormula(): string[] | null {
            const parseResult: string[] = [];
            let modifier = 0;

            let isFormulaValid = true;
            // All parts of the formula are separated by commas,
            // and we lowercase here since the string is processed
            // case-insensitive.
            const sbParts = this._formula?.toLowerCase().split(",") || [];

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
                    // If it's not a number, it's invalid.
                    const num = Number.parseInt(param, 10);
                    if (Number.isNaN(num)) {
                        isFormulaValid = false;
                        break;
                    } else {
                        modifier += num;
                        parseResult.push(modifier.toString());
                    }
                }
            }

            return (
                (isFormulaValid && parseResult.length && parseResult) || null
            );
        }

        /**
         * Calculates a skill base value.
         *
         * @returns A number representing the calculated skill base
         */
        _calcValue(): number {
            if (!this.valid) return 0;
            let attrScores: number[] = [];
            let ssBonus: number = Number.MIN_SAFE_INTEGER;
            let modifier: number = 0;
            this.parsedFormula?.forEach((param) => {
                let val: number;
                const type = typeof param;
                val = Number.parseInt(param, 10);
                if (Number.isInteger(val)) {
                    modifier += val;
                } else if (type === "string") {
                    const [subType, name, multval] = param.split(":");
                    let mult = Math.max(
                        1,
                        (typeof multval === "string" &&
                            Number.parseInt(multval, 10)) ||
                            1,
                    );

                    if (subType === "attr") {
                        attrScores.push(this._attrs[name]?.value || 0);
                    } else if (subType === "ss") {
                        if (this.sunsigns.includes(name)) {
                            // We matched a character's sunsign, apply modifier
                            // Character only gets the largest sunsign bonus
                            ssBonus = Math.max(mult, ssBonus);
                        }
                    }
                } else {
                    sohl.log.error(`Invalid skill base formula part: ${param}`);
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
