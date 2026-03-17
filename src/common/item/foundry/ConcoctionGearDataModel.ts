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

import { GearDataModel } from "@common/item/foundry/GearDataModel";
import { ConcoctionGearLogic, ConcoctionGearData } from "@common/item/logic/ConcoctionGearLogic";
import {
    CONCOCTIONGEAR_POTENCY,
    ConcoctionGearPotency,
    ConcoctionGearSubType,
    ConcoctionGearSubTypes,
    ITEM_KIND,
} from "@utils/constants";
const { NumberField, StringField } = foundry.data.fields;

function defineConcoctionGearSchema(): foundry.data.fields.DataSchema {
    return {
        ...GearDataModel.defineSchema(),
        subType: new StringField({
            choices: ConcoctionGearSubTypes,
            required: true,
        }),
        potency: new StringField({
            initial: CONCOCTIONGEAR_POTENCY.NOT_APPLICABLE,
            required: true,
            choices: Object.values(CONCOCTIONGEAR_POTENCY),
        }),
        strength: new NumberField({
            integer: true,
            initial: 0,
            min: 0,
        }),
    };
}

type ConcoctionGearSchema = ReturnType<typeof defineConcoctionGearSchema>;

export class ConcoctionGearDataModel<
        TSchema extends foundry.data.fields.DataSchema = ConcoctionGearSchema,
        TLogic extends
            ConcoctionGearLogic<ConcoctionGearData> = ConcoctionGearLogic<ConcoctionGearData>,
    >
    extends GearDataModel<TSchema, TLogic>
    implements ConcoctionGearData<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = ["SOHL.ConcoctionGear", "SOHL.Gear", "SOHL.Item"];
    static override readonly kind: string = ITEM_KIND.CONCOCTIONGEAR;
    subType!: ConcoctionGearSubType;
    potency!: ConcoctionGearPotency;
    strength!: number;

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineConcoctionGearSchema();
    }
}
