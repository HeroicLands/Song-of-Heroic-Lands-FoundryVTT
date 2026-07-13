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

import { ValueModifier } from "@src/entity/modifier/ValueModifier";
import { SohlEntity } from "@src/entity/SohlEntity";
import type { SohlLogic } from "@src/core/logic/SohlLogic";
import { registerEntity } from "@src/entity/entityRegistry";
import { registerKind } from "@src/utils/kindRegistry";
import {
    IMPACT_ASPECT,
    IMPACT_ASPECT_CHAR,
    ImpactAspect,
    isImpactAspect,
} from "@src/utils/constants";
import { SimpleRoll } from "@src/entity/roll/SimpleRoll";

/**
 * A {@link ValueModifier} specialized for damage/impact calculation —
 * the amount of harm delivered by an attack or effect before defenses
 * and resistances are applied.
 *
 * ## Impact components
 *
 * An impact has three parts:
 *
 * - **Dice** — a {@link SimpleRoll} defining the random component
 *   (e.g., 2d6 for a broadsword). Access via {@link numDice} and
 *   {@link die}.
 * - **Modifier** — the ValueModifier base + deltas (strength bonus,
 *   weapon quality, situational effects).
 * - **Aspect** — the damage type ({@link ImpactAspect}): blunt, edged,
 *   piercing, or fire. Determines which protection values defend
 *   against this impact.
 *
 * ## Key properties
 *
 * - {@link diceFormula} — human-readable formula string, e.g. `"2d6+3"`
 * - {@link label} — formula with aspect suffix, e.g. `"2d6+3e"` (edged)
 * - {@link evaluate} — rolls the dice (if not already rolled) and returns
 *   the total impact value (dice + effective modifier)
 *
 * ## Disabled state
 *
 * Automatically disabled when both dice and effective modifier are zero,
 * meaning the strike deals no damage. Can also be explicitly disabled
 * via the inherited `disabled` property.
 *
 * ## Lifecycle
 *
 * Created from strike mode data during combat resolution. The base
 * modifier comes from the weapon/technique's impact base, and deltas
 * are added for strength, quality, and situational factors before
 * {@link evaluate} is called.
 */
export class ImpactModifier extends ValueModifier {
    private roll: SimpleRoll | null;
    private aspect: ImpactAspect;
    private _aimBodyPartCode: string;
    private _spread: number;

    /**
     * Construct an empty impact modifier owned by `parent` — shorthand for
     * `new ImpactModifier({}, { parent })` (aspect defaults to blunt).
     * @param parent - The owning {@link sohl.core.logic.SohlLogic}.
     */
    constructor(parent: SohlLogic<any>);
    /**
     * Builds an impact modifier, parsing the optional damage roll and resolving
     * the aspect (defaulting to blunt when none is supplied).
     *
     * @param data - Impact data; `roll` (the dice) and `aspect` are optional —
     *   aspect defaults to blunt.
     * @param options - Must provide `options.parent` (base {@link ValueModifier}).
     */
    constructor(
        data: Partial<ImpactModifier.Data>,
        options: Partial<ImpactModifier.Options>,
    );
    /**
     * Implementation backing the constructor overloads: normalizes the
     * `(parent)` shorthand and requires a resolved parent.
     * @param dataOrParent - Impact data, or the owning parent Logic (shorthand).
     * @param options - Construction options; `options.parent` is required in the
     *   data form.
     * @throws If no `parent` resolves.
     */
    constructor(
        dataOrParent: SohlEntity.DataOrParent<ImpactModifier.Data> = {},
        options: Partial<ImpactModifier.Options> = {},
    ) {
        super(
            SohlEntity.dataOf<ImpactModifier.Data>(dataOrParent),
            SohlEntity.optionsOf<ImpactModifier.Options>(dataOrParent, options),
        );
        const data = SohlEntity.dataOf<ImpactModifier.Data>(dataOrParent);
        this.roll =
            data.roll ?
                new SimpleRoll(data.roll, { parent: this.parent })
            :   null;
        this.aspect =
            isImpactAspect(data.aspect) ? data.aspect : IMPACT_ASPECT.BLUNT;
        this._aimBodyPartCode = data.aimBodyPartCode ?? "";
        this._spread = data.spread ?? 0;
    }

    /** The body part shortcode this attack aims at (empty when unaimed). */
    get aimBodyPartCode(): string {
        return this._aimBodyPartCode;
    }

    /**
     * Strike spread governing hit-location scatter from {@link aimBodyPartCode}.
     * `0` when not aimed.
     */
    get spread(): number {
        return this._spread;
    }

    /**
     * Serialize to a plain object satisfying {@link ImpactModifier.Data}: the
     * inherited {@link ValueModifier} fields plus the impact `roll` and `aspect`.
     * @returns The plain-object representation.
     */
    override toJSON(): PlainObject {
        return {
            ...super.toJSON(),
            roll: this.roll ? this.roll.toJSON() : null,
            aspect: this.aspect,
            aimBodyPartCode: this._aimBodyPartCode,
            spread: this._spread,
        };
    }

    /**
     * Beyond the inherited disabled reason, an impact is disabled automatically
     * when it would deal no damage — both the dice and the effective modifier
     * are zero.
     */
    override get disabled(): string {
        return (
            super.disabled ||
            (this.die === 0 && this.effective === 0 ?
                "SOHL.ImpactModifier.DISABLED"
            :   "")
        );
    }

    /** The damage aspect (blunt/edged/piercing/fire) this impact delivers. */
    get aspectType(): ImpactAspect {
        return this.aspect;
    }

    /** Number of faces on the impact die (0 when there are no dice). */
    get die(): number {
        return this.roll?.dieFaces || 0;
    }

    /** Number of impact dice (0 when none). */
    get numDice(): number {
        return this.roll?.numDice || 0;
    }

    /** The impact as a formula string, e.g. `"2d6+3"` (or `"0"` when empty). */
    get diceFormula(): string {
        if (!this.numDice && !this.effective) return "0";
        const result =
            (this.numDice ?
                `${this.numDice > 1 ? this.numDice : ""}d${this.die}${
                    this.effective >= 0 ? "+" : ""
                }`
            :   "") + this.effective;
        return result;
    }

    /** The {@link diceFormula} with the aspect suffix appended, e.g. `"2d6+3e"` for edged. */
    get label(): string {
        return `${this.diceFormula}${IMPACT_ASPECT_CHAR[this.aspect]}`;
    }

    /**
     * Roll the impact (dice plus effective modifier) once and return the total.
     *
     * @returns The total impact. If already rolled, the existing total is
     *   returned rather than re-rolling.
     */
    evaluate(): number {
        if (this.roll) return this.roll.total;
        this.roll = SimpleRoll.fromFormula(this.diceFormula, this.parent);
        return this.roll.roll();
    }
}

export namespace ImpactModifier {
    /** Registry key identifying this modifier kind for serialization. */
    export const Kind: string = "ImpactModifier";

    /** Construction data for an {@link ImpactModifier}. */
    export interface Data extends ValueModifier.Data {
        /** Pre-rolled or seed dice for the impact. */
        roll: SimpleRoll;
        /** The damage aspect (blunt/edged/piercing/fire); defaults to blunt. */
        aspect: ImpactAspect;
        /** The body part shortcode this attack aims at (empty when unaimed). */
        aimBodyPartCode: string;
        /** Strike spread for hit-location scatter (`0` when unaimed). */
        spread: number;
    }

    export interface Options extends ValueModifier.Options {}
}

registerKind(ImpactModifier.Kind, ImpactModifier);
registerEntity("ImpactModifier", ImpactModifier);
