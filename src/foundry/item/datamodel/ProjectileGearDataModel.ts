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
    PROJECTILEGEAR_KIND,
    ProjectileGearData,
    ProjectileGearKind,
} from "@logic/common/item/data";
import { ProjectileGearPerformer } from "@logic/common/item/performer";
import { GearDataModel } from "@foundry/item/datamodel";
import { ASPECT, ImpactModifier } from "@logic/common/core/modifier";
const { SchemaField, NumberField, StringField } = (foundry.utils as any).fields;

export class ProjectileGearDataModel
    extends GearDataModel<ProjectileGearPerformer>
    implements ProjectileGearData
{
    protected static readonly logicClass = ProjectileGearPerformer;
    declare readonly parent: SohlItemProxy<ProjectileGearPerformer>;
    kind!: ProjectileGearKind;
    shortName!: string;
    impactBase!: {
        numDice: number;
        die: number;
        modifier: number;
        aspect: string;
    };

    static defineSchema() {
        return {
            ...super.defineSchema(),
            kind: new StringField({
                initial: PROJECTILEGEAR_KIND.NONE,
                required: true,
                choices: Object.values(PROJECTILEGEAR_KIND),
            }),
            shortName: new StringField(),
            impactBase: new SchemaField({
                numDice: new NumberField({
                    integer: true,
                    initial: 0,
                    min: 0,
                }),
                die: new NumberField({
                    integer: true,
                    initial: 6,
                    min: 1,
                }),
                modifier: new NumberField({
                    integer: true,
                    initial: -1,
                    min: -1,
                }),
                aspect: new StringField({
                    initial: ASPECT.BLUNT,
                    requried: true,
                    choices: Object.values(ASPECT),
                }),
            }),
        };
    }
}
