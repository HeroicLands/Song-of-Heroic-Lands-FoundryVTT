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
import { GearLogic, GearDataModel, GearData } from "@common/item/Gear";
import { ITEM_KIND, ITEM_METADATA } from "@utils/constants";
import { SohlItem, SohlItemSheetBase } from "@common/item/SohlItem";
const { NumberField } = foundry.data.fields;

/**
 * Logic for the **Weapon Gear** item type — a weapon that can be wielded in combat.
 *
 * Weapon Gear represents a physical weapon: swords, axes, bows, maces, daggers,
 * and similar. The weapon itself is primarily a container; the actual attack
 * capabilities are defined by nested {@link StrikeModeLogic | Strike Mode} items
 * (e.g., a sword might have "Slash" and "Thrust" strike modes with different
 * damage and skill associations).
 *
 * Weapon Gear tracks a base **length** (reach), which is inherited by its
 * melee strike modes. Inherits weight, value, quality, and durability tracking
 * from {@link GearLogic}. The weapon's durability is shared with its strike
 * modes during evaluation.
 *
 * @typeParam TData - The WeaponGear data interface.
 */
export class WeaponGearLogic<
    TData extends WeaponGearData = WeaponGearData,
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

export interface WeaponGearData<
    TLogic extends WeaponGearLogic<WeaponGearData> = WeaponGearLogic<any>,
> extends GearData<TLogic> {
    /** Base reach/length of the weapon */
    lengthBase: number;
}

function defineWeaponGearSchema(): foundry.data.fields.DataSchema {
    return {
        ...GearDataModel.defineSchema(),
        lengthBase: new NumberField({
            integer: true,
            initial: 0,
            min: 0,
        }),
    };
}

type WeaponGearSchema = ReturnType<typeof defineWeaponGearSchema>;

export class WeaponGearDataModel<
        TSchema extends foundry.data.fields.DataSchema = WeaponGearSchema,
        TLogic extends
            WeaponGearLogic<WeaponGearData> = WeaponGearLogic<WeaponGearData>,
    >
    extends GearDataModel<TSchema, TLogic>
    implements WeaponGearData<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = ["SOHL.WeaponGear", "SOHL.Gear", "SOHL.Item"];
    static override readonly kind = ITEM_KIND.WEAPONGEAR;
    lengthBase!: number;

    static defineSchema(): foundry.data.fields.DataSchema {
        return defineWeaponGearSchema();
    }
}

export class WeaponGearSheet extends SohlItemSheetBase {
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
            lengthBase: system.lengthBase,
        });
    }
}
