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

import { TestResult } from "@src/domain/result/TestResult";
import { ImpactModifier } from "@src/domain/modifier/ImpactModifier";
import { SimpleRoll } from "@src/utils/SimpleRoll";
import { registerKind } from "@src/utils/kindRegistry";
import type { ImpactAspect } from "@src/utils/constants";

/**
 * The result of computing an **impact** — a rolled quantum of damage to be
 * applied to a body, independent of what caused it.
 *
 * `ImpactResult` is deliberately **source-agnostic**: a melee/missile hit, a
 * fall, a spell, a trap, etc. all produce an `ImpactResult`, which then feeds
 * the injury-resolution stage (armor → effective impact → injury level). It is
 * **not** a success test — there is no roll-under-mastery outcome here; it
 * simply carries the rolled impact dice, the damage aspect, where the blow is
 * aimed (if anywhere), and a label for its source.
 *
 * In automated combat it is produced when a blow lands (see
 * {@link CombatResult}); the same class is reused for any non-combat damage.
 *
 * ## Position in the pipeline
 *
 * `<source>` → **`ImpactResult`** (raw impact: roll, total, aspect, aim)
 * → injury resolution (armor → effective impact → injury level) → injury.
 *
 * The total here is **pre-armor**; whether it actually wounds is decided
 * downstream, where armor may reduce the effective impact to zero.
 */
export class ImpactResult extends TestResult {
    /** The impact (damage) formula used: dice + modifier + aspect. */
    impactModifier: ImpactModifier;
    /** The rolled impact dice. */
    roll: SimpleRoll;
    /** The targeted body part shortcode, or `""` when unaimed (e.g. a fall). */
    aimBodyPartCode: string;
    /** A label for what caused the impact (weapon name, `"fall"`, `"spell"`, …). */
    source: string;

    constructor(
        data: Partial<ImpactResult.Data> = {},
        options: Partial<ImpactResult.Options> = {},
    ) {
        super(data, options);
        if (!data.impactModifier) {
            throw new Error("ImpactResult requires an impactModifier");
        }
        this.impactModifier = data.impactModifier;
        // The impact is rolled on creation (the impact has occurred). A
        // pre-rolled roll may be supplied — by tests, or when reviving a
        // serialized snapshot — in which case it is not re-rolled.
        if (data.roll) {
            this.roll = data.roll;
        } else {
            this.roll = SimpleRoll.fromFormula(this.impactModifier.diceFormula);
            this.roll.roll();
        }
        this.aimBodyPartCode = data.aimBodyPartCode ?? "";
        this.source = data.source ?? "";
    }

    /** Raw impact total (pre-armor), as rolled. */
    get total(): number {
        return this.roll?.total ?? 0;
    }

    /** The damage aspect (blunt/edged/piercing/fire) of this impact. */
    get aspect(): ImpactAspect {
        return this.impactModifier.aspectType;
    }
}

export namespace ImpactResult {
    export const Kind: string = "ImpactResult";

    export interface Data extends TestResult.Data {
        impactModifier: ImpactModifier;
        roll: SimpleRoll;
        aimBodyPartCode: string;
        source: string;
    }

    export interface Options extends TestResult.Options {}
}

registerKind(ImpactResult.Kind, ImpactResult);
