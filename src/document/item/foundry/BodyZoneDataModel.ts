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
    BodyZoneLogic,
    BodyZoneData,
} from "@src/document/item/logic/BodyZoneLogic";
import { ITEM_KIND } from "@src/utils/constants";

function defineBodyZoneDataSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlItemDataModel.defineSchema(),
    };
}

type BodyZoneDataSchema = ReturnType<typeof defineBodyZoneDataSchema>;

export class BodyZoneDataModel<
    TSchema extends foundry.data.fields.DataSchema = BodyZoneDataSchema,
    TLogic extends BodyZoneLogic<BodyZoneData> = BodyZoneLogic<BodyZoneData>,
>
    extends SohlItemDataModel<TSchema, TLogic>
    implements BodyZoneData<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = [
        "SOHL.BodyZone",
        "SOHL.Item",
    ];
    static override readonly kind = ITEM_KIND.BODYZONE;

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineBodyZoneDataSchema();
    }
}
