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
import {
    DispositionLogic,
    DispositionData,
} from "@src/item/logic/DispositionLogic";
import { ITEM_KIND, REACTION, Reactions } from "@src/utils/constants";
const { StringField } = foundry.data.fields;

function defineDispositionDataSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlItemDataModel.defineSchema(),
        targetShortcode: new StringField({
            // Blank indicates a general reaction that applies to all actors not specified in the reactions property
            blank: true,
            required: true,
        }),
        reaction: new StringField({
            choices: Reactions,
            initial: REACTION.NEUTRAL,
        }),
    };
}

type SohlDispositionDataSchema = ReturnType<typeof defineDispositionDataSchema>;

export class DispositionDataModel<
    TSchema extends foundry.data.fields.DataSchema = SohlDispositionDataSchema,
    TLogic extends DispositionLogic<DispositionData> =
        DispositionLogic<DispositionData>,
>
    extends SohlItemDataModel<TSchema, TLogic>
    implements DispositionData<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = [
        "SOHL.Disposition",
        "SOHL.Item",
    ];
    static override readonly kind = ITEM_KIND.DISPOSITION;
    targetShortcode!: string;
    reaction!: string;

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineDispositionDataSchema();
    }
}
