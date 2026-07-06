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
import { ImpactModifier } from "@src/entity/modifier/ImpactModifier";
import { ImpactAspect, ProjectileGearSubType } from "@src/utils/constants";

/**
 * Ammunition for ranged weapons.
 *
 * Projectile Gear represents arrows, bolts, sling stones, throwing axes, and
 * other objects launched by missile weapon strike modes. Each projectile defines its own **impact** characteristics
 * (damage dice, modifier, and aspect), which combine with the weapon's base
 * values during attack resolution.
 *
 * Projectiles are categorized by {@link ProjectileGearData.subType | subType}
 * (matching the weapon's `projectileType`) and have a **shortName** for
 * compact display. Quantity tracking (from {@link GearLogic}) represents
 * the number of projectiles remaining.
 *
 * @typeParam TData - The ProjectileGear data interface.
 */
export class ProjectileGearLogic<
    TData extends ProjectileGearData = ProjectileGearData,
> extends GearLogic<TData> {
    /**
     * The projectile's impact (damage) as an {@link ImpactModifier}, synthesized
     * from {@link ProjectileGearData.impactBase}.
     */
    impact!: ImpactModifier;

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

/**
 * Persisted data backing {@link ProjectileGearLogic}.
 *
 * @typeParam TLogic - The logic class that consumes this data.
 * @remarks The shape of `system` on a `projectilegear` item — i.e. `item.system` (equivalently `item.logic.data`) when `item.type === "projectilegear"`. The backing DataModel implements this interface.
 */
export interface ProjectileGearData<
    TLogic extends ProjectileGearLogic<ProjectileGearData> =
        ProjectileGearLogic<any>,
> extends GearData<TLogic> {
    /** Projectile category (Arrow, Bolt, Bullet, etc.) */
    subType: ProjectileGearSubType;
    /** Base damage characteristics: dice, modifier, and aspect */
    impactBase: {
        /** When `true`, the projectile's dice override the weapon's dice rather than combining with them. */
        overrideDice: boolean;
        /** When `true`, the projectile's modifier overrides the weapon's modifier rather than combining with it. */
        overrideModifier: boolean;
        /** Number of impact dice. */
        numDice: number;
        /** Number of sides on each impact die. */
        die: number;
        /** Flat modifier added to the impact roll. */
        modifier: number;
        /** Damage aspect (e.g. blunt, edged, piercing) of the impact. */
        aspect: ImpactAspect;
    };
}
