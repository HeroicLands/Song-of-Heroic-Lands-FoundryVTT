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

import { entity } from "@src/entity/registry";
import { GearLogic, GearData } from "@src/document/item/logic/GearLogic";
import type { ValueModifier } from "@src/entity/modifier/ValueModifier";
import { ImpactAspects } from "@src/utils/constants";

/**
 * Wearable protective equipment.
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
    /** Per-aspect damage reduction as `ValueModifier`s, seeded from {@link ArmorGearData.protectionBase}. */
    protection!: {
        /** Protection against blunt impact. */
        blunt: ValueModifier;
        /** Protection against edged impact. */
        edged: ValueModifier;
        /** Protection against piercing impact. */
        piercing: ValueModifier;
        /** Protection against fire/heat impact. */
        fire: ValueModifier;
    };
    /** Armor encumbrance penalty as a `ValueModifier`, seeded from {@link ArmorGearData.encumbrance}. */
    encumbrance!: ValueModifier;
    /** Active-effect-driven armor traits, keyed by trait code. */
    traits!: StrictObject<string>;

    /* --------------------------------------------- */
    /* Array update helpers                          */
    /* --------------------------------------------- */

    /**
     * Build an `update()` payload that adds a location to flexible coverage.
     * @param location - Shortcode of the body location to add.
     * @returns An update payload adding the location, or an empty object if already present.
     */
    addFlexibleLocationUpdate(location: string): PlainObject {
        const canonical = this.data.locations.flexible;
        if (canonical.includes(location)) return {};
        return {
            "system.locations.flexible": [...canonical, location],
        };
    }

    /**
     * Build an `update()` payload that removes a location from flexible coverage.
     * @param location - Shortcode of the body location to remove.
     * @returns An update payload with the location filtered out of flexible coverage.
     */
    removeFlexibleLocationUpdate(location: string): PlainObject {
        return {
            "system.locations.flexible": this.data.locations.flexible.filter(
                (l) => l !== location,
            ),
        };
    }

    /**
     * Build an `update()` payload that adds a location to rigid coverage.
     * @param location - Shortcode of the body location to add.
     * @returns An update payload adding the location, or an empty object if already present.
     */
    addRigidLocationUpdate(location: string): PlainObject {
        const canonical = this.data.locations.rigid;
        if (canonical.includes(location)) return {};
        return {
            "system.locations.rigid": [...canonical, location],
        };
    }

    /**
     * Build an `update()` payload that removes a location from rigid coverage.
     * @param location - Shortcode of the body location to remove.
     * @returns An update payload with the location filtered out of rigid coverage.
     */
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
            blunt: new entity.ValueModifier(this).setBase(
                this.data.protectionBase.blunt,
            ),
            edged: new entity.ValueModifier(this).setBase(
                this.data.protectionBase.edged,
            ),
            piercing: new entity.ValueModifier(this).setBase(
                this.data.protectionBase.piercing,
            ),
            fire: new entity.ValueModifier(this).setBase(
                this.data.protectionBase.fire,
            ),
        };
        this.encumbrance = new entity.ValueModifier(
            {},
            { parent: this },
        ).setBase(this.data.encumbrance);
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

/**
 * @remarks The shape of `system` on a `armorgear` item — i.e. `item.system` (equivalently `item.logic.data`) when `item.type === "armorgear"`. The backing DataModel implements this interface.
 */
export interface ArmorGearData<
    TLogic extends ArmorGearLogic<ArmorGearData> = ArmorGearLogic<any>,
> extends GearData<TLogic> {
    /** Primary material the armor is made from */
    material: string;
    /** Body locations covered, split by flexible and rigid coverage */
    locations: {
        /** Body-location shortcodes with flexible coverage. */
        flexible: string[];
        /** Body-location shortcodes with rigid coverage. */
        rigid: string[];
    };
    /** Base damage reduction per impact aspect */
    protectionBase: {
        /** Base protection against blunt impact. */
        blunt: number;
        /** Base protection against edged impact. */
        edged: number;
        /** Base protection against piercing impact. */
        piercing: number;
        /** Base protection against fire/heat impact. */
        fire: number;
    };
    /** Encumbrance value of the armor */
    encumbrance: number;
}
