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

import { SohlItemDataModel } from "@common/item/foundry/SohlItem";
import { PhilosophyLogic, PhilosophyData } from "@common/item/logic/PhilosophyLogic";
import { ITEM_KIND } from "@utils/constants";

function definePhilosophyDataSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlItemDataModel.defineSchema(),
    };
}

type PhilosophyDataSchema = ReturnType<typeof definePhilosophyDataSchema>;

export class PhilosophyDataModel<
        TSchema extends foundry.data.fields.DataSchema = PhilosophyDataSchema,
        TLogic extends
            PhilosophyLogic<PhilosophyData> = PhilosophyLogic<PhilosophyData>,
    >
    extends SohlItemDataModel<TSchema, TLogic>
    implements PhilosophyData<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = ["SOHL.Philosophy", "SOHL.Item"];
    static override readonly kind = ITEM_KIND.PHILOSOPHY;

    static override defineSchema(): foundry.data.fields.DataSchema {
        return definePhilosophyDataSchema();
    }
}
