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

import {
    StrikeModeLogic,
    StrikeModeData,
} from "@src/document/item/logic/StrikeModeLogic";
import type { ProjectileGearSubType } from "@src/utils/constants";

/**
 * Logic for the **Missile Weapon Strike Mode** item type — a way of attacking
 * at range with a projectile weapon.
 *
 * Missile strike modes represent ranged attack patterns: shooting a bow,
 * firing a crossbow, hurling a javelin, or slinging a stone. They are
 * typically nested inside {@link WeaponGearLogic | Weapon Gear}.
 *
 * Each missile strike mode references a {@link MissileWeaponStrikeModeData.projectileType | projectile type}
 * that determines which {@link ProjectileGearLogic | Projectile Gear} items
 * are compatible ammunition. The projectile's impact values combine with
 * the weapon's base values during attack resolution.
 *
 * Inherits attack, impact, associated skill, and durability tracking from
 * {@link StrikeModeLogic}.
 *
 * @typeParam TData - The MissileWeaponStrikeMode data interface.
 */
export class MissileWeaponStrikeModeLogic<
    TData extends MissileWeaponStrikeModeData = MissileWeaponStrikeModeData,
> extends StrikeModeLogic<TData> {
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

export interface MissileWeaponStrikeModeData<
    TLogic extends MissileWeaponStrikeModeLogic<MissileWeaponStrikeModeData> =
        MissileWeaponStrikeModeLogic<any>,
> extends StrikeModeData<TLogic> {
    /** Type of ammunition used by this strike mode */
    projectileType: ProjectileGearSubType;
}
