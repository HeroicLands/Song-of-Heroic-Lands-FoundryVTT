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
import { InjuryData } from "@logic/common/item/data";
import { InjuryPerformer } from "@logic/common/item/performer";
import { SohlItemDataModel } from "@foundry/item/datamodel";
import { ASPECT, AspectType } from "@logic/common/core/modifier";
const { NumberField, BooleanField, StringField } = (foundry.utils as any)
    .fields;

export class InjuryDataModel
    extends SohlItemDataModel<InjuryPerformer>
    implements InjuryData
{
    protected static readonly logicClass = InjuryPerformer;
    declare readonly parent: SohlItemProxy<InjuryPerformer>;
    injuryLevelBase!: number;
    healingRateBase!: number;
    aspect!: AspectType;
    isTreated!: boolean;
    isBleeding!: boolean;
    bodyLocationId!: string;

    get sheet(): string {
        return "systems/sohl/templates/item/injury-sheet.hbs";
    }

    static defineSchema() {
        return {
            ...super.defineSchema(),
            injuryLevelBase: new NumberField({
                integer: true,
                initial: 0,
                min: 0,
            }),
            healingRateBase: new NumberField({
                integer: true,
                initial: 0,
                min: 0,
            }),
            aspect: new StringField({
                initial: ASPECT.BLUNT,
                choices: Object.values(ASPECT),
            }),
            isTreated: new BooleanField({ initial: false }),
            isBleeding: new BooleanField({ initial: false }),
            bodyLocationId: new StringField(),
        };
    }
}
