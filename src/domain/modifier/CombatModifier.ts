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

import { MasteryLevelModifier } from "@src/domain/modifier/MasteryLevelModifier";

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
 * Created by {@link CombatTechniqueLogic} during initialize for each
 * strike mode's attack and defense (block/counterstrike) modifiers:
 *
 * ```typescript
 * this.defense = {
 *     block: new CombatModifier({}, { parent: this }),
 *     counterstrike: new CombatModifier({}, { parent: this }),
 * };
 * ```
 *
 * Deltas are added during evaluate/finalize for weapon quality, injuries,
 * tactical advantages, and other combat-specific effects.
 */
export class CombatModifier extends MasteryLevelModifier {
    constructor(
        data: Partial<CombatModifier.Data> = {},
        options: Partial<CombatModifier.Options> = {},
    ) {
        super(data, options);
    }
}

export namespace CombatModifier {
    export const Kind: string = "CombatModifier";

    export interface Data extends MasteryLevelModifier.Data {}

    export interface Options extends MasteryLevelModifier.Options {}
}
