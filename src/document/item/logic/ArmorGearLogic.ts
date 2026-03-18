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

import { GearLogic, GearData } from "@src/document/item/logic/GearLogic";

/**
 * Logic for the **Armor Gear** item type — wearable protective equipment.
 *
 * Armor Gear represents physical armor worn by a character: chainmail, leather
 * jerkins, plate cuirasses, helmets, shields, and similar protective equipment.
 * Each piece of armor covers specific {@link BodyLocationLogic | body locations},
 * categorized as **flexible** or **rigid** coverage.
 *
 * Armor Gear acts as a container for nested {@link ProtectionLogic | Protection}
 * items, which define the actual damage reduction values per impact aspect.
 * It may also contain nested Trait items representing armor-specific properties.
 *
 * The armor's **material** affects its properties (weight, protection values,
 * durability). Inherits weight, value, quality, and durability tracking from
 * {@link GearLogic}.
 *
 * @typeParam TData - The ArmorGear data interface.
 */
export class ArmorGearLogic<
    TData extends ArmorGearData = ArmorGearData,
> extends GearLogic<TData> {
    protection!: PlainObject;
    traits!: StrictObject<string>;

    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(): void {
        super.initialize();
        this.protection = {};
        this.traits = {};
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

export interface ArmorGearData<
    TLogic extends ArmorGearLogic<ArmorGearData> = ArmorGearLogic<any>,
> extends GearData<TLogic> {
    /** Primary material the armor is made from */
    material: string;
    /** Body locations covered, split by flexible and rigid coverage */
    locations: {
        flexible: string[];
        rigid: string[];
    };
}
