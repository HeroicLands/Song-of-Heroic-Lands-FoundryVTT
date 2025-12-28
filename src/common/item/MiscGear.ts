/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2025 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { SohlActionContext } from "@common/SohlActionContext";
import { SohlItem, SohlItemSheetBase } from "@common/item/SohlItem";
import { ITEM_KIND, ITEM_METADATA } from "@utils/constants";
import { GearLogic, GearDataModel, GearData } from "@common/item/Gear";

export class MiscGearLogic<
    TData extends MiscGearData = MiscGearData,
> extends GearLogic<TData> {
    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(context: SohlActionContext): void {
        super.initialize(context);
    }

    /** @inheritdoc */
    override evaluate(context: SohlActionContext): void {
        super.evaluate(context);
    }

    /** @inheritdoc */
    override finalize(context: SohlActionContext): void {
        super.finalize(context);
    }
}

export interface MiscGearData<
    TLogic extends MiscGearLogic<MiscGearData> = MiscGearLogic<any>,
> extends GearData<TLogic> {}

function defineMiscGearSchema(): foundry.data.fields.DataSchema {
    return {
        ...GearDataModel.defineSchema(),
    };
}

type MiscGearSchema = ReturnType<typeof defineMiscGearSchema>;

export class MiscGearDataModel<
        TSchema extends foundry.data.fields.DataSchema = MiscGearSchema,
        TLogic extends
            MiscGearLogic<MiscGearData> = MiscGearLogic<MiscGearData>,
    >
    extends GearDataModel<TSchema, TLogic>
    implements MiscGearData<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = ["SOHL.MiscGear.DATA"];
    static override readonly kind = ITEM_KIND.MISCGEAR;

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineMiscGearSchema();
    }
}

export class MiscGearSheet extends SohlItemSheetBase {
    override async _preparePropertiesContext(
        context: PlainObject,
        options: PlainObject,
    ): Promise<PlainObject> {
        return context;
    }
}
