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

import type { SohlActionContext } from "@common/SohlActionContext";
import { SohlItem, SohlItemSheetBase } from "@common/item/SohlItem";
import { ITEM_KIND, ITEM_METADATA } from "@utils/constants";
import { GearLogic, GearDataModel, GearData } from "@common/item/Gear";

/**
 * Logic for the **Misc Gear** item type — general-purpose equipment.
 *
 * Misc Gear is the catch-all category for physical items that don't fit into
 * more specific gear types: tools, torches, rope, rations, clothing, jewelry,
 * and other mundane possessions. It adds no specialized logic beyond the
 * base {@link GearLogic} (weight, value, quality, durability, carry/equip state).
 *
 * @typeParam TData - The MiscGear data interface.
 */
export class MiscGearLogic<
    TData extends MiscGearData = MiscGearData,
> extends GearLogic<TData> {
    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(): void {
        super.initialize();
    }

    /** @inheritdoc */
    override evaluate(): void {
        super.evaluate();
    }

    /** @inheritdoc */
    override finalize(): void {
        super.finalize();
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
    static override readonly LOCALIZATION_PREFIXES = ["SOHL.MiscGear", "SOHL.Gear", "SOHL.Item"];
    static override readonly kind = ITEM_KIND.MISCGEAR;

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineMiscGearSchema();
    }
}

export class MiscGearSheet extends SohlItemSheetBase {
    protected async _preparePropertiesContext(
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>,
        options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>
    > {
        await super._preparePropertiesContext(context, options);
        const system = this.document.system as any;
        return Object.assign(context, {
            quantity: system.quantity,
            weightBase: system.weightBase,
            valueBase: system.valueBase,
            isCarried: system.isCarried,
            isEquipped: system.isEquipped,
            qualityBase: system.qualityBase,
            durabilityBase: system.durabilityBase,
            visibleToCohort: system.visibleToCohort,
        });
    }
}
