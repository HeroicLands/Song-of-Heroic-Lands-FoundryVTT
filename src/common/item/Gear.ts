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
import type { ValueModifier } from "@common/modifier/ValueModifier";
import {
    SohlItem,
    SohlItemBaseLogic,
    SohlItemData,
    SohlItemDataModel,
} from "@common/item/SohlItem";
const { StringField, NumberField, BooleanField } = foundry.data.fields;

export abstract class GearLogic<
    TData extends GearData = GearData,
> extends SohlItemBaseLogic<TData> {
    weight!: ValueModifier;
    value!: ValueModifier;
    quality!: ValueModifier;
    durability!: ValueModifier;

    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(context: SohlActionContext): void {
        super.initialize(context);
        this.weight = sohl.CONFIG.ValueModifier({}, { parent: this });
        this.value = sohl.CONFIG.ValueModifier({}, { parent: this });
        this.quality = sohl.CONFIG.ValueModifier({}, { parent: this });
        this.durability = sohl.CONFIG.ValueModifier({}, { parent: this });
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

export interface GearData<TLogic extends GearLogic<GearData> = GearLogic<any>>
    extends SohlItemData<TLogic> {
    quantity: number;
    weightBase: number;
    valueBase: number;
    isCarried: boolean;
    isEquipped: boolean;
    qualityBase: number;
    durabilityBase: number;
    visibleToCohort: boolean;
}

function defineGearDataSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlItemDataModel.defineSchema(),
        quantity: new NumberField({
            integer: true,
            initial: 1,
            min: 0,
        }),
        weightBase: new NumberField({
            initial: 0,
            min: 0,
        }),
        valueBase: new NumberField({
            initial: 0,
            min: 0,
        }),
        isCarried: new BooleanField({ initial: true }),
        isEquipped: new BooleanField({ initial: false }),
        qualityBase: new NumberField({
            integer: true,
            initial: 0,
            min: 0,
        }),
        durabilityBase: new NumberField({
            integer: true,
            initial: 0,
            min: 0,
        }),
        visibleToCohort: new BooleanField({
            initial: false,
        }),
    };
}

type GearDataSchema = ReturnType<typeof defineGearDataSchema>;

export abstract class GearDataModel<
    TSchema extends foundry.data.fields.DataSchema = GearDataSchema,
    TLogic extends GearLogic<GearData> = GearLogic<GearData>,
> extends SohlItemDataModel<TSchema, TLogic> {
    quantity!: number;
    weightBase!: number;
    valueBase!: number;
    isCarried!: boolean;
    isEquipped!: boolean;
    qualityBase!: number;
    durabilityBase!: number;
    visibleToCohort!: boolean;

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineGearDataSchema();
    }
}
