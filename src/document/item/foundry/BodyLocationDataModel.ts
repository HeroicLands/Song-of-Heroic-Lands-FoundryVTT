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
    BodyLocationLogic,
    BodyLocationData,
} from "@src/document/item/logic/BodyLocationLogic";
import { ITEM_KIND } from "@src/utils/constants";
const { BooleanField } = foundry.data.fields;

function defineBodyLocationDataSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlItemDataModel.defineSchema(),
        isFumble: new BooleanField({ initial: false }),
        isStumble: new BooleanField({ initial: false }),
    };
}

type BodyLocationDataSchema = ReturnType<typeof defineBodyLocationDataSchema>;

export class BodyLocationDataModel<
    TSchema extends foundry.data.fields.DataSchema = BodyLocationDataSchema,
    TLogic extends BodyLocationLogic<BodyLocationData> =
        BodyLocationLogic<BodyLocationData>,
> extends SohlItemDataModel<TSchema, TLogic> {
    static override readonly LOCALIZATION_PREFIXES = [
        "SOHL.BodyLocation",
        "SOHL.Item",
    ];
    static override readonly kind = ITEM_KIND.BODYLOCATION;
    isFumble!: boolean;
    isStumble!: boolean;

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineBodyLocationDataSchema();
    }
}
