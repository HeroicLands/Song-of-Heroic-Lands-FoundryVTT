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

import { SohlItemDataModel } from "@src/document/item/foundry/SohlItem";
import {
    ProtectionLogic,
    ProtectionData,
} from "@src/document/item/logic/ProtectionLogic";
import {
    ImpactAspects,
    ITEM_KIND,
    Variant,
    Variants,
} from "@src/utils/constants";

const { StringField, SchemaField, NumberField } = foundry.data.fields;

function defineProtectionDataSchema(): foundry.data.fields.DataSchema {
    const protectionObj = Object.fromEntries(
        ImpactAspects.map((aspect) => {
            const prot = new NumberField({
                integer: true,
                initial: 0,
                min: 0,
            });
            return [aspect, prot];
        }),
    ) as foundry.data.fields.DataSchema;

    return {
        ...SohlItemDataModel.defineSchema(),
        subType: new StringField({
            choices: Variants,
            required: true,
        }),
        protectionBase: new SchemaField({
            ...protectionObj,
        }),
    };
}

type ProtectionDataSchema = ReturnType<typeof defineProtectionDataSchema>;

export class ProtectionDataModel<
    TSchema extends foundry.data.fields.DataSchema = ProtectionDataSchema,
    TLogic extends ProtectionLogic<ProtectionData> =
        ProtectionLogic<ProtectionData>,
>
    extends SohlItemDataModel<TSchema, TLogic>
    implements ProtectionData<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = [
        "SOHL.Protection",
        "SOHL.Item",
    ];
    static override readonly kind = ITEM_KIND.PROTECTION;
    subType!: Variant;
    protectionBase!: StrictObject<number>;

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineProtectionDataSchema();
    }
}
