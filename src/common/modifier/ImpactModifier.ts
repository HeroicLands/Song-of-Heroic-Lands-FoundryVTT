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

import { ValueModifier } from "@common/modifier";
import { defineType, SimpleRoll } from "@utils";

/**
 * Specialized ValueModifier for Impacts
 */
export class ImpactModifier extends ValueModifier {
    private roll: SimpleRoll | null;
    private aspect: ImpactModifier.AspectType;

    constructor(
        data: Partial<ImpactModifier.Data> = {},
        options: Partial<ImpactModifier.Options> = {},
    ) {
        super(data, options);
        this.roll = data.roll ? new SimpleRoll(data.roll, options) : null;
        this.aspect =
            ImpactModifier.isAspect(data.aspect) ?
                data.aspect
            :   ImpactModifier.ASPECT.BLUNT;
    }
    // Getter for disabled
    get disabled(): string {
        return (
            super.disabled ||
            (this.die === 0 && this.effective === 0 ?
                "SOHL.ImpactModifier.DISABLED"
            :   "")
        );
    }

    get die(): number {
        return this.roll?.dieFaces || 0;
    }

    get numDice(): number {
        return this.roll?.numDice || 0;
    }

    // Getter for dice formula
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

    // Getter for label
    get label(): string {
        return `${this.diceFormula}${ImpactModifier.AspectChar[this.aspect]}`;
    }

    // Evaluate method
    evaluate(): number {
        if (this.roll) return this.roll.total;
        this.roll = SimpleRoll.fromFormula(this.diceFormula);
        return this.roll.roll();
    }
}

export namespace ImpactModifier {
    export const {
        kind: ASPECT,
        values: Aspects,
        isValue: isAspect,
    } = defineType("SOHL.ImpactModifier.Aspect", {
        BLUNT: "blunt",
        EDGED: "edged",
        PIERCING: "piercing",
        FIRE: "fire",
    });
    export type AspectType = (typeof ASPECT)[keyof typeof ASPECT];

    export const AspectChar: Record<AspectType, string> = {
        [ASPECT.BLUNT]: "b",
        [ASPECT.EDGED]: "e",
        [ASPECT.PIERCING]: "p",
        [ASPECT.FIRE]: "f",
    };
}

export namespace ImpactModifier {
    export interface Data extends ValueModifier.Data {
        roll: SimpleRoll;
        aspect: ImpactModifier.AspectType;
    }

    export interface Options extends ValueModifier.Options {}
}
