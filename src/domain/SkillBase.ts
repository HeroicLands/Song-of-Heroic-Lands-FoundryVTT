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

import type { AttributeLogic } from "@src/document/item/logic/AttributeLogic";
import type { TraitLogic } from "@src/document/item/logic/TraitLogic";

/**
 * Computes the **skill base** (SB) for a skill from a formula referencing
 * trait attributes and optional birthsign bonuses.
 *
 * The skill base is the foundation value for a mastery level — it
 * represents natural aptitude before any training. Most skills derive
 * their SB by averaging two or more trait attributes (Strength,
 * Dexterity, Intelligence, etc.) and adding optional modifiers.
 *
 * ## Formula syntax
 *
 * A skill base formula is a comma-separated list of terms:
 *
 * ```
 * "@str, @int, @sta, hirin:2, ahnu, 5"
 * ```
 *
 * | Term | Meaning |
 * |------|---------|
 * | `@str` | Reference to attribute trait by shortcode (prefixed with `@`) |
 * | `hirin:2` | Birthsign bonus: add 2 if character's birthsign includes "hirin" |
 * | `ahnu` | Birthsign bonus: add 1 (default when no modifier specified) |
 * | `5` | Flat numeric modifier added to the result |
 *
 * A valid formula must have **2 or more** attribute references.
 * Birthsign bonuses and numeric modifiers are optional.
 *
 * ## Calculation
 *
 * 1. Look up each referenced attribute's numeric value from the actor's
 *    attribute items.
 * 2. Average the attribute values:
 *    - If exactly 2 attributes: round **up** if the first (primary)
 *      attribute is larger, otherwise round **down**.
 *    - If 3+ attributes: standard rounding.
 * 3. Add the **largest** matching birthsign bonus (only one applies,
 *    even if multiple birthsigns match).
 * 4. Add any flat numeric modifiers.
 * 5. Clamp to minimum 0.
 *
 * ## Lifecycle
 *
 * Created during the owning logic's `initialize` phase from the skill's
 * persisted `skillBaseFormula` field and the actor's current items.
 * Rebuilt each preparation cycle. The computed {@link value} feeds into
 * the mastery level modifier and SDR improvement rolls.
 *
 * ## Key properties
 *
 * - {@link value} — the computed skill base number
 * - {@link formula} — the raw formula string (or null)
 * - {@link valid} — whether the formula parsed successfully
 * - {@link attributes} — the resolved AttributeLogic instances referenced
 *   by the formula
 */
export class SkillBase {
    /**
     * Resolved attribute references, keyed by attribute shortcode. Each
     * entry records the owning item's display `name`, the (possibly
     * multiplied) attribute `value`, and the backing {@link AttributeLogic}.
     * Populated by {@link setAttributes}.
     * @internal
     */
    protected _attrs: StrictObject<{
        name: string;
        value: number;
        logic: AttributeLogic;
    }>;
    /**
     * The raw formula string, or `null` when no formula was supplied.
     * @internal
     */
    protected _formula: string | null;
    /**
     * The character's birthsign tokens (the birthsign item's hyphen-split
     * `textValue`), used to match `bs:` terms in the formula.
     * @internal
     */
    protected _birthsigns: string[];
    /**
     * The tokenized formula (e.g. `["attr:str", "bs:hirin:2", "5"]`), or
     * `null` when the formula is absent or invalid. Produced by
     * `_parseFormula`.
     * @internal
     */
    protected _parsedFormula: string[] | null;
    /**
     * The most recently computed skill base value. Recalculated by
     * {@link setAttributes} via `_calcValue`.
     * @internal
     */
    protected _value: number;

    /**
     * Builds a skill base from a formula and, optionally, the actor's
     * attribute logics.
     *
     * Parses {@link formula} immediately and, when `options.attributes` are
     * given, resolves attribute references and computes {@link value}.
     * Birthsign tokens are extracted from `options.birthsign` for `bs:` term
     * matching. Operates entirely on the logic layer — no Foundry documents.
     * @param formula - The skill base formula string (see class docs for
     *   syntax). An empty/falsy value yields an inactive skill base.
     * @param options - Optional inputs.
     * @param options.attributes - The actor's attribute logics, used to resolve
     *   `@attr` references (matched by `data.shortcode`).
     * @param options.birthsign - The character's birthsign trait logic, whose
     *   `data.textValue` supplies the birthsign tokens.
     */
    constructor(
        formula: string,
        options: { attributes?: AttributeLogic[]; birthsign?: TraitLogic } = {},
    ) {
        if (!formula) {
            this._formula = null;
            this._attrs = {};
            this._birthsigns = [];
        }

        this._formula = formula || null;
        this._attrs = {};
        this._birthsigns = options.birthsign?.data.textValue?.split("-") || [];
        this._parsedFormula = this._parseFormula;
        this._value = 0;
        if (options.attributes) {
            this.setAttributes(options.attributes);
        }
    }

    /**
     * Resolves the formula's `@attr` references against the supplied attribute
     * logics and recomputes {@link value}.
     *
     * Matches each `attr:` term by shortcode against `attributes`, multiplies
     * the attribute's effective score by any per-term multiplier, and stores
     * the result in `_attrs`. Then recomputes the skill base via `_calcValue`
     * (0 when there is no formula).
     * @param attributes - The actor's attribute logics; matched by `data.shortcode`.
     * @throws If a matched attribute's effective score is not an integer, or
     *   if a term's multiplier is present but not a number.
     */
    setAttributes(attributes: AttributeLogic[] = []): void {
        this._parsedFormula?.forEach((param) => {
            if (typeof param !== "string") return;
            const [subType, name, multval] = param.split(":");
            if (subType !== "attr") return;

            const attrLogic = attributes.find((a) => a.data.shortcode === name);
            if (!attrLogic) return;

            const score = attrLogic.score?.effective ?? Number.NaN;
            if (!Number.isInteger(score)) {
                throw new Error("invalid attribute value not number");
            }
            const mult =
                typeof multval === "string" ? Number.parseInt(multval, 10) : 1;
            if (Number.isNaN(mult)) {
                throw new Error("invalid attribute multiplier not number");
            }
            this._attrs[attrLogic.data.shortcode] = {
                name: attrLogic.data.name || "",
                value: score * mult,
                logic: attrLogic,
            };
        });
        this._value = this.formula ? this._calcValue() : 0;
    }

    /**
     * Whether the formula parsed into at least one usable term.
     * @returns `true` when {@link parsedFormula} is non-empty.
     */
    get valid(): boolean {
        return !!this.parsedFormula?.length;
    }

    /**
     * The raw skill base formula string, or `null` when none was supplied.
     */
    get formula(): string | null {
        return this._formula;
    }

    /**
     * The tokenized formula terms (see `_parseFormula`), or `null`
     * when the formula is absent or failed to parse.
     */
    get parsedFormula(): string[] | null {
        return this._parsedFormula;
    }

    /**
     * The character's birthsign tokens used to match `bs:` formula terms.
     */
    get birthsigns(): string[] {
        return this._birthsigns;
    }

    /**
     * The {@link AttributeLogic} instances resolved from the formula's
     * `@attr` references (derived from `_attrs`).
     */
    get attributes(): AttributeLogic[] {
        return Object.values(this._attrs).map((a) => a.logic);
    }

    /**
     * The attribute shortcodes referenced by this skill base's formula.
     *
     * `_attrs` is keyed by attribute shortcode (e.g. `"str"`, `"per"`),
     * so this exposes the resolved set without leaking the internal map. Used
     * by data-driven `test` expressions to detect which attributes a skill
     * draws on.
     * @returns The referenced attribute shortcodes.
     */
    get attrShortcodes(): string[] {
        return Object.keys(this._attrs);
    }

    /**
     * The computed skill base number (averaged attributes plus birthsign and
     * flat modifiers, clamped to ≥ 0). See `_calcValue`.
     */
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
     *   add 2 if birthsign hirin (modifier after colon ":")
     *   add 1 if birthsign ahnu (1 since no modifier specified)
     *   add 5 to result
     *
     * A valid formula must have exactly 2 or more attributes, everything else is optional.
     *
     * @returns {object[]} A parsed skill base formula
     * @internal
     */
    protected get _parseFormula(): string[] | null {
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
                    // This is a birthsign

                    let bsParts = param.split(":");

                    // if more than 2 parts, it's invalid
                    if (bsParts.length > 2) {
                        isFormulaValid = false;
                        break;
                    }

                    const bsName = bsParts[0].trim;
                    let bsCount = 1;
                    // if second part provided, must be a number
                    if (bsParts.length === 2) {
                        const bsNumber = bsParts[1].trim().match(/^[-+]?\d+/);
                        if (bsNumber) {
                            bsCount = Number.parseInt(bsNumber[0], 10);
                        } else {
                            isFormulaValid = false;
                        }
                        break;
                    }

                    parseResult.push(`bs:${bsName}:${bsCount}`);

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

        return (isFormulaValid && parseResult.length && parseResult) || null;
    }

    /**
     * Calculates a skill base value.
     *
     * @returns A number representing the calculated skill base
     * @internal
     */
    protected _calcValue(): number {
        if (!this.valid) return 0;
        let attrScores: number[] = [];
        let bsBonus: number = Number.MIN_SAFE_INTEGER;
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
                } else if (subType === "bs") {
                    if (this.birthsigns.includes(name)) {
                        // We matched a character's birthsign, apply modifier
                        // Character only gets the largest birthsign bonus
                        bsBonus = Math.max(mult, bsBonus);
                    }
                }
            } else {
                sohl.log.error(`Invalid skill base formula part: ${param}`);
            }
        });

        bsBonus = bsBonus > Number.MIN_SAFE_INTEGER ? bsBonus : 0;
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

        result += bsBonus + modifier;

        result = Math.max(0, result); // Make sure result is >= 0

        return result;
    }
}
