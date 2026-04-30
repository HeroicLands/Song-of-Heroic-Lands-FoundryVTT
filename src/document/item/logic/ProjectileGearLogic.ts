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
import { ImpactAspect, ProjectileGearSubType } from "@src/utils/constants";

/**
 * Logic for the **Projectile Gear** item type — ammunition for ranged weapons.
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

export interface ProjectileGearData<
    TLogic extends ProjectileGearLogic<ProjectileGearData> =
        ProjectileGearLogic<any>,
> extends GearData<TLogic> {
    /** Projectile category (Arrow, Bolt, Bullet, etc.) */
    subType: ProjectileGearSubType;
    /** Base damage characteristics: dice, modifier, and aspect */
    impactBase: {
        overrideDice: boolean;
        overrideModifier: boolean;
        numDice: number;
        die: number;
        modifier: number;
        aspect: ImpactAspect;
    };
}
