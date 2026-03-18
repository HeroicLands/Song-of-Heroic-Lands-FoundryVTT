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

import { StrikeModeDataModel } from "@src/item/foundry/StrikeModeDataModel";
import {
    CombatTechniqueStrikeModeLogic,
    CombatTechniqueStrikeModeData,
} from "@src/item/logic/CombatTechniqueStrikeModeLogic";
import { ITEM_KIND } from "@src/utils/constants";
const { NumberField, StringField } = foundry.data.fields;

function defineCombatTechniqueStrikeModeSchema(): foundry.data.fields.DataSchema {
    return {
        ...StrikeModeDataModel.defineSchema(),
        group: new StringField({}),
        lengthBase: new NumberField({
            integer: true,
            initial: 0,
            min: 0,
        }),
    };
}

type CombatTechniqueStrikeModeSchema = ReturnType<
    typeof defineCombatTechniqueStrikeModeSchema
>;

export class CombatTechniqueStrikeModeDataModel<
    TSchema extends foundry.data.fields.DataSchema =
        CombatTechniqueStrikeModeSchema,
    TLogic extends
        CombatTechniqueStrikeModeLogic<CombatTechniqueStrikeModeData> =
        CombatTechniqueStrikeModeLogic<
            CombatTechniqueStrikeModeData<CombatTechniqueStrikeModeLogic<any>>
        >,
>
    extends StrikeModeDataModel<TSchema, TLogic>
    implements CombatTechniqueStrikeModeData<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = [
        "SOHL.CombatTechniqueStrikeMode",
        "SOHL.StrikeMode",
        "SOHL.Item",
    ];
    static override readonly kind = ITEM_KIND.COMBATTECHNIQUESTRIKEMODE;
    lengthBase!: number;
    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineCombatTechniqueStrikeModeSchema();
    }
}
