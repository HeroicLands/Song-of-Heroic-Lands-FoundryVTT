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

import {
    CombatTechniqueLogic,
    CombatTechniqueData,
    CombatTechniqueStrikeMode,
} from "@src/document/item/logic/CombatTechniqueLogic";
import { IMPACT_ASPECT, ImpactAspects, ITEM_KIND } from "@src/utils/constants";
import { SohlItemDataModel } from "@src/document/item/foundry/SohlItem";
const { NumberField, StringField, ArrayField, SchemaField } =
    foundry.data.fields;

function defineCombatTechniqueSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlItemDataModel.defineSchema(),
        strikeModes: new ArrayField(
            new SchemaField({
                mode: new StringField(),
                strikeAccuracy: new NumberField({
                    integer: true,
                    initial: 0,
                    min: 0,
                }),
                assocSkillCode: new StringField(),
                lengthBase: new NumberField({
                    integer: true,
                    initial: 0,
                    min: 0,
                }),
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
                        initial: IMPACT_ASPECT.BLUNT,
                        required: true,
                        choices: ImpactAspects,
                    }),
                }),
            }),
            { initial: [] },
        ),

        group: new StringField({}),
        lengthBase: new NumberField({
            integer: true,
            initial: 0,
            min: 0,
        }),
    };
}

type CombatTechniqueSchema = ReturnType<typeof defineCombatTechniqueSchema>;

export class CombatTechniqueDataModel<
    TSchema extends foundry.data.fields.DataSchema = CombatTechniqueSchema,
    TLogic extends CombatTechniqueLogic<CombatTechniqueData> =
        CombatTechniqueLogic<CombatTechniqueData<CombatTechniqueLogic<any>>>,
>
    extends SohlItemDataModel<TSchema, TLogic>
    implements CombatTechniqueData<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = [
        "SOHL.CombatTechnique",
        "SOHL.StrikeMode",
        "SOHL.Item",
    ];
    static override readonly kind = ITEM_KIND.COMBATTECHNIQUE;
    lengthBase!: number;
    strikeModes!: CombatTechniqueStrikeMode[];

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineCombatTechniqueSchema();
    }
}
