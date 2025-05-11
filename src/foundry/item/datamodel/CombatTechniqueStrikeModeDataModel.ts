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

import { SohlItemProxy } from "@logic/common/item";
import { CombatTechniqueStrikeModeData } from "@logic/common/item/data";
import { CombatTechniqueStrikeModePerformer } from "@logic/common/item/performer";
import { StrikeModeDataModel } from "@foundry/item/datamodel";
const { NumberField } = (foundry.utils as any).fields;

export class CombatTechniqueStrikeModeDataModel
    extends StrikeModeDataModel<CombatTechniqueStrikeModePerformer>
    implements CombatTechniqueStrikeModeData
{
    protected static readonly logicClass = CombatTechniqueStrikeModePerformer;
    declare readonly parent: SohlItemProxy<CombatTechniqueStrikeModePerformer>;
    lengthBase!: number;

    static defineSchema() {
        return {
            ...super.defineSchema(),
            lengthBase: new NumberField({
                integer: true,
                initial: 0,
                min: 0,
            }),
        };
    }
}
