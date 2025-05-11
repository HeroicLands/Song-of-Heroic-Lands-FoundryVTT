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
import {
    CONCOCTIONGEAR_KIND,
    ConcoctionGearData,
    ConcoctionGearKind,
    POTENCY,
    PotencyValue,
} from "@logic/common/item/data";
import { ConcoctionGearPerformer } from "@logic/common/item/performer";
import { GearDataModel } from "@foundry/item/datamodel";
const { NumberField, StringField } = (foundry.utils as any).fields;

export class ConcoctionGearDataModel
    extends GearDataModel<ConcoctionGearPerformer>
    implements ConcoctionGearData
{
    protected static readonly logicClass = ConcoctionGearPerformer;
    declare readonly parent: SohlItemProxy<ConcoctionGearPerformer>;
    kind!: ConcoctionGearKind;
    potency!: PotencyValue;
    strength!: number;

    static defineSchema() {
        return {
            ...super.defineSchema(),
            kind: new StringField({
                initial: CONCOCTIONGEAR_KIND.MUNDANE,
                required: true,
                choices: Object.values(CONCOCTIONGEAR_KIND),
            }),
            potency: new StringField({
                initial: POTENCY.NOT_APPLICABLE,
                required: true,
                choices: Object.values(POTENCY),
            }),
            strength: new NumberField({
                integer: true,
                initial: 0,
                min: 0,
            }),
        };
    }
}
