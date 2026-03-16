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
import { GearLogic, GearDataModel, GearData } from "@common/item/Gear";
import { ITEM_KIND, ITEM_METADATA } from "@utils/constants";
const { NumberField } = foundry.data.fields;

/**
 * Logic for the **Container Gear** item type — storage for other items.
 *
 * Container Gear represents backpacks, saddlebags, chests, belt pouches, cargo
 * holds, and other receptacles that hold nested gear items. Containers track a
 * **maximum capacity** limiting how much they can store.
 *
 * Container Gear may be attached to Beings (a character's backpack) or Vehicles
 * (a ship's cargo hold). Nested items inside a container inherit carry/equip
 * state from the container.
 *
 * Inherits weight, value, quality, and durability tracking from {@link GearLogic}.
 *
 * @typeParam TData - The ContainerGear data interface.
 */
export class ContainerGearLogic<
    TData extends ContainerGearData = ContainerGearData,
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

export interface ContainerGearData<
    TLogic extends
        ContainerGearLogic<ContainerGearData> = ContainerGearLogic<any>,
> extends GearData<TLogic> {
    /** Maximum weight or volume this container can hold */
    maxCapacityBase: number;
}

function defineContainerGearSchema(): foundry.data.fields.DataSchema {
    return {
        ...GearDataModel.defineSchema(),
        maxCapacityBase: new NumberField({
            integer: true,
            initial: 0,
            min: 0,
        }),
    };
}

type ContainerGearSchema = ReturnType<typeof defineContainerGearSchema>;

export class ContainerGearDataModel<
        TSchema extends foundry.data.fields.DataSchema = ContainerGearSchema,
        TLogic extends
            ContainerGearLogic<ContainerGearData> = ContainerGearLogic<ContainerGearData>,
    >
    extends GearDataModel<TSchema, TLogic>
    implements ContainerGearData<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = ["SOHL.ContainerGear", "SOHL.Gear", "SOHL.Item"];
    static override readonly kind = ITEM_KIND.CONTAINERGEAR;
    maxCapacityBase!: number;

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineContainerGearSchema();
    }
}

export class ContainerGearSheet extends SohlItemSheetBase {
    protected async _preparePropertiesContext(
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>,
        options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>
    > {
        return context;
    }
}
