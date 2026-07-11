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

import { MasteryLevelModifier } from "@src/entity/modifier/MasteryLevelModifier";
import { SohlEntity } from "@src/entity/SohlEntity";
import type { SohlLogic } from "@src/core/logic/SohlLogic";
import { registerEntity } from "@src/entity/entityRegistry";
import { registerKind } from "@src/utils/kindRegistry";

/**
 * A {@link MasteryLevelModifier} specialized for combat resolution — attack
 * rolls, defense rolls, and combat technique tests.
 *
 * CombatModifier inherits all mastery level test functionality and adds
 * no new properties or methods. Its purpose is **type discrimination**:
 * combat-related modifiers can be identified and handled separately from
 * general mastery level modifiers (e.g., when listing active modifiers
 * on the combat tab, or when combat-specific hooks need to filter for
 * attack/defense modifiers).
 *
 * ## Usage
 *
 * Created by the combat-technique {@link SkillLogic} during initialize for each
 * strike mode's attack and defense (block/counterstrike) modifiers:
 *
 * ```typescript
 * this.defense = {
 *     block: new CombatModifier(this),
 *     counterstrike: new CombatModifier(this),
 * };
 * ```
 *
 * Deltas are added during evaluate/finalize for weapon quality, injuries,
 * tactical advantages, and other combat-specific effects.
 */
export class CombatModifier extends MasteryLevelModifier {
    /**
     * Construct an empty combat modifier owned by `parent` — shorthand for
     * `new CombatModifier({}, { parent })`.
     * @param parent - The owning {@link SohlLogic}.
     */
    constructor(parent: SohlLogic<any>);
    /**
     * Constructs a combat modifier, delegating to the mastery-level base.
     * @param data - Combat-modifier data (same shape as
     *   {@link MasteryLevelModifier.Data}).
     * @param options - Must provide `options.parent`.
     */
    constructor(
        data: Partial<CombatModifier.Data>,
        options: Partial<CombatModifier.Options>,
    );
    /**
     * Implementation backing the constructor overloads: normalizes the
     * `(parent)` shorthand and requires a resolved parent.
     * @param dataOrParent - Combat-modifier data, or the owning parent Logic
     *   (shorthand).
     * @param options - Construction options; `options.parent` is required in the
     *   data form.
     * @throws If no `parent` resolves.
     */
    constructor(
        dataOrParent: SohlEntity.DataOrParent<CombatModifier.Data> = {},
        options: Partial<CombatModifier.Options> = {},
    ) {
        super(
            SohlEntity.dataOf<CombatModifier.Data>(dataOrParent),
            SohlEntity.optionsOf<CombatModifier.Options>(dataOrParent, options),
        );
    }
}

export namespace CombatModifier {
    /** Registry key identifying this modifier kind for serialization. */
    export const Kind: string = "CombatModifier";

    /** Construction data for a {@link CombatModifier} (identical to {@link MasteryLevelModifier.Data}). */
    export interface Data extends MasteryLevelModifier.Data {}

    /** Options for a {@link CombatModifier} (identical to {@link MasteryLevelModifier.Options}). */
    export interface Options extends MasteryLevelModifier.Options {}
}

registerKind(CombatModifier.Kind, CombatModifier);
registerEntity("CombatModifier", CombatModifier);
