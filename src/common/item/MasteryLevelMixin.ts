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
import { Mystery, SohlItem, Trait } from "@common/item";
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
        _attrs: StrictObject<string>;
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
                const itData: Trait.DataModel | null =
                    Trait.DataModel.isA(it) ? it.system : null;
                if (
                    itData?.intensity === Trait.INTENSITY.ATTRIBUTE &&
                    itData.isNumeric
                )
                    attributes.push(it);
            }
            this._parsedFormula?.forEach((param) => {
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

        get valid(): boolean {
            return !!this.parsedFormula.length;
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
