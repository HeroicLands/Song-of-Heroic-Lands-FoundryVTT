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
import { ValueModifier } from "@src/domain/modifier/ValueModifier";
import { ImpactAspects } from "@src/utils/constants";

/**
 * Logic for the **Armor Gear** item type — wearable protective equipment.
 *
 * Armor Gear represents physical armor worn by a character: chainmail, leather
 * jerkins, plate cuirasses, helmets, shields, and similar protective equipment.
 * Each piece of armor covers specific body locations, categorized as
 * **flexible** or **rigid** coverage.
 *
 * Protection values (`protectionBase`) are stored directly on the armor.
 *
 * @typeParam TData - The ArmorGear data interface.
 */
export class ArmorGearLogic<
    TData extends ArmorGearData = ArmorGearData,
> extends GearLogic<TData> {
    protection!: {
        blunt: ValueModifier;
        edged: ValueModifier;
        piercing: ValueModifier;
        fire: ValueModifier;
    };
    traits!: StrictObject<string>;

    /* --------------------------------------------- */
    /* Array update helpers                          */
    /* --------------------------------------------- */

    /** Build an `update()` payload that adds a location to flexible coverage. */
    addFlexibleLocationUpdate(location: string): PlainObject {
        const canonical = this.data.locations.flexible;
        if (canonical.includes(location)) return {};
        return {
            "system.locations.flexible": [...canonical, location],
        };
    }

    /** Build an `update()` payload that removes a location from flexible coverage. */
    removeFlexibleLocationUpdate(location: string): PlainObject {
        return {
            "system.locations.flexible": this.data.locations.flexible.filter(
                (l) => l !== location,
            ),
        };
    }

    /** Build an `update()` payload that adds a location to rigid coverage. */
    addRigidLocationUpdate(location: string): PlainObject {
        const canonical = this.data.locations.rigid;
        if (canonical.includes(location)) return {};
        return {
            "system.locations.rigid": [...canonical, location],
        };
    }

    /** Build an `update()` payload that removes a location from rigid coverage. */
    removeRigidLocationUpdate(location: string): PlainObject {
        return {
            "system.locations.rigid": this.data.locations.rigid.filter(
                (l) => l !== location,
            ),
        };
    }

    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(): void {
        super.initialize();
        this.protection = {
            blunt: new ValueModifier({}, { parent: this }),
            edged: new ValueModifier({}, { parent: this }),
            piercing: new ValueModifier({}, { parent: this }),
            fire: new ValueModifier({}, { parent: this }),
        };
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
    /** Base damage reduction per impact aspect */
    protectionBase: {
        blunt: number;
        edged: number;
        piercing: number;
        fire: number;
    };
    /** Encumbrance value of the armor */
    encumbrance: number;
}
