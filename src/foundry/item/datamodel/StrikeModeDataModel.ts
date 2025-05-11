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

import { SubTypeDataModel } from "@foundry/item/datamodel";
import { SohlVariant } from "@logic/common/core";
import { ASPECT, AspectType } from "@logic/common/core/modifier";
import { StrikeModeData } from "@logic/common/item/data";
import { StrikeModePerformer } from "@logic/common/item/performer";
const { StringField, NumberField, SchemaField } = (foundry.utils as any).fields;

export abstract class StrikeModeDataModel<
        T extends StrikeModePerformer = StrikeModePerformer,
    >
    extends SubTypeDataModel<T, SohlVariant>
    implements StrikeModeData
{
    mode!: string;
    minParts!: number;
    assocSkillName!: string;
    impactBase!: {
        numDice: number;
        die: number;
        modifier: number;
        aspect: AspectType;
    };

    static defineSchema() {
        return {
            ...super.defineSchema(),
            mode: new StringField(),
            minParts: new NumberField({
                integer: true,
                initial: 1,
                min: 0,
            }),
            assocSkillName: new StringField(),
            impactBase: new SchemaField({
                numDice: new NumberField({
                    integer: true,
                    initial: 0,
                    min: 0,
                }),
                die: new NumberField({
                    integer: true,
                    initial: 6,
                    min: 0,
                }),
                modifier: new NumberField({
                    integer: true,
                    initial: 0,
                }),
                aspect: new StringField({
                    initial: ASPECT.BLUNT,
                    required: true,
                    choices: Object.values(ASPECT),
                }),
            }),
        };
    }
}
