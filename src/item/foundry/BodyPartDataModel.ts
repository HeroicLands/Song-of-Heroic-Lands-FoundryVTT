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

import { SohlItemDataModel } from "@src/item/foundry/SohlItem";
import { BodyPartLogic, BodyPartData } from "@src/item/logic/BodyPartLogic";
import { ITEM_KIND } from "@src/utils/constants";
const { BooleanField, DocumentIdField } = foundry.data.fields;

function defineBodyPartDataSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlItemDataModel.defineSchema(),
        canHoldItem: new BooleanField({ initial: false }),
        heldItemId: new DocumentIdField({ nullable: true }),
    };
}

type BodyPartDataSchema = ReturnType<typeof defineBodyPartDataSchema>;

export class BodyPartDataModel<
    TSchema extends foundry.data.fields.DataSchema = BodyPartDataSchema,
    TLogic extends BodyPartLogic<BodyPartData> = BodyPartLogic<BodyPartData>,
>
    extends SohlItemDataModel<TSchema, TLogic>
    implements BodyPartData<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = [
        "SOHL.BodyPart",
        "SOHL.Item",
    ];
    static override readonly kind = ITEM_KIND.BODYPART;
    canHoldItem!: boolean;
    heldItemId!: string | null;

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineBodyPartDataSchema();
    }
}
