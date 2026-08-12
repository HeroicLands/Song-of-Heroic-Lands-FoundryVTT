/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { GearDataModel } from "@src/document/item/foundry/GearDataModel";
import {
    ArmorGearLogic,
    ArmorGearData,
} from "@src/document/item/logic/ArmorGearLogic";
import {
    ARMOR_FACING,
    ArmorFacingChoices,
    ImpactAspects,
    ITEM_KIND,
} from "@src/utils/constants";
import type { ArmorLocationFacing } from "@src/entity/body/armor-aggregation";
const { StringField, SchemaField, ArrayField, NumberField, BooleanField } =
    foundry.data.fields;

/**
 * Builds the data schema for the Armor Gear item, extending the base gear
 * schema with armor-specific fields (material, covered locations, per-aspect
 * protection, encumbrance, etc.).
 * @returns The Foundry data schema for the armor gear.
 */
function defineArmorGearSchema(): foundry.data.fields.DataSchema {
    return {
        ...GearDataModel.defineSchema(),
        isWorn: new BooleanField({ initial: false }),
        material: new StringField({
            nullable: true,
            blank: false,
            initial: null,
        }),
        locations: new SchemaField({
            flexible: new ArrayField(new StringField()),
            rigid: new ArrayField(new StringField()),
            // Only the articles that protect a location from one side alone
            // appear here — a cloak's rear-facing torso, a breastplate's
            // front-facing one. An absent entry means the location is
            // protected from any direction, so every all-round article (very
            // nearly all of them) carries an empty list and needs no
            // migration.
            facing: new ArrayField(
                new SchemaField({
                    location: new StringField({ required: true, blank: false }),
                    side: new StringField({
                        choices: ArmorFacingChoices,
                        initial: ARMOR_FACING.ALL,
                    }),
                }),
                { initial: [] },
            ),
        }),
        protectionBase: new SchemaField({
            blunt: new NumberField({ integer: true, initial: 0, min: 0 }),
            edged: new NumberField({ integer: true, initial: 0, min: 0 }),
            piercing: new NumberField({ integer: true, initial: 0, min: 0 }),
            fire: new NumberField({ integer: true, initial: 0, min: 0 }),
        }),
        encumbrance: new NumberField({ initial: 0, min: 0 }),
    };
}

type ArmorGearDataSchema = ReturnType<typeof defineArmorGearSchema>;

/** @internal */
export class ArmorGearDataModel<
    TSchema extends foundry.data.fields.DataSchema = ArmorGearDataSchema,
    TLogic extends ArmorGearLogic<ArmorGearData> =
        ArmorGearLogic<ArmorGearData>,
>
    extends GearDataModel<TSchema, TLogic>
    implements ArmorGearData<TLogic>
{
    /** @inheritDoc */
    static override readonly LOCALIZATION_PREFIXES = [
        "SOHL.ArmorGear",
        "SOHL.Gear",
        "SOHL.Item",
    ];
    /** @inheritDoc */
    static override readonly kind = ITEM_KIND.ARMORGEAR;
    isWorn!: boolean;
    material!: string | null;
    locations!: {
        flexible: string[];
        rigid: string[];
        facing: ArmorLocationFacing[];
    };
    protectionBase!: {
        blunt: number;
        edged: number;
        piercing: number;
        fire: number;
    };
    encumbrance!: number;

    /**
     * Returns the Foundry data schema for the armor gear item.
     * @returns The armor gear data schema.
     */
    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineArmorGearSchema();
    }
}
