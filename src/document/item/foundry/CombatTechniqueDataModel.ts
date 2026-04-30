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
} from "@src/document/item/logic/CombatTechniqueLogic";
import {
    IMPACT_ASPECT,
    ImpactAspect,
    ImpactAspects,
    ITEM_KIND,
    STRIKE_MODE_TYPE,
    StrikeModeType,
    StrikeModeTypes,
} from "@src/utils/constants";
import { SohlItemDataModel } from "@src/document/item/foundry/SohlItem";
const { NumberField, StringField, ArrayField, SchemaField, ObjectField } =
    foundry.data.fields;

function defineCombatTechniqueSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlItemDataModel.defineSchema(),
        group: new StringField({}),
        method: new StringField({
            required: true,
            initial: STRIKE_MODE_TYPE.MELEE,
            choices: StrikeModeTypes,
        }),
        assocSkillCode: new StringField(),

        // Melee fields
        strikeAccuracy: new NumberField({
            integer: true,
            initial: 0,
            min: 0,
        }),
        lengthBase: new NumberField({
            integer: true,
            initial: 0,
            min: 0,
        }),

        // Missile fields
        maxVolleyMult: new NumberField({
            integer: true,
            initial: 0,
            min: 0,
        }),
        baseRangeBase: new NumberField({
            integer: true,
            initial: 0,
            min: 0,
        }),

        // Shared fields
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
        traits: new ObjectField({ initial: {} }),
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
    group!: string;
    method!: StrikeModeType;
    assocSkillCode!: string;
    strikeAccuracy!: number;
    lengthBase!: number;
    maxVolleyMult!: number;
    baseRangeBase!: number;
    impactBase!: {
        numDice: number;
        die: number;
        modifier: number;
        aspect: ImpactAspect;
    };
    traits!: PlainObject;

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineCombatTechniqueSchema();
    }
}
