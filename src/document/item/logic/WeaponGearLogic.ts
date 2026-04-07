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
import type { ImpactAspect } from "@src/utils/constants";

/**
 * Logic for the **Weapon Gear** item type — a weapon that can be wielded in combat.
 *
 * Weapon Gear represents a physical weapon: swords, axes, bows, maces, daggers,
 * and similar. The weapon itself is primarily a container; the actual attack
 * capabilities are defined by the strike modes.
 *
 * @typeParam TData - The WeaponGear data interface.
 */
export class WeaponGearLogic<
    TData extends WeaponGearData = WeaponGearData,
> extends GearLogic<TData> {
    /* --------------------------------------------- */
    /* Array update helpers                          */
    /* --------------------------------------------- */

    /** Build an `update()` payload that adds a strike mode. */
    addStrikeModeUpdate(strikeMode: WeaponGearStrikeMode): PlainObject {
        return {
            "system.strikeModes": [...this.data.strikeModes, strikeMode],
        };
    }

    /** Build an `update()` payload that removes a strike mode by mode name. */
    removeStrikeModeUpdate(mode: string): PlainObject {
        return {
            "system.strikeModes": this.data.strikeModes.filter(
                (sm) => sm.mode !== mode,
            ),
        };
    }

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

export interface WeaponGearStrikeMode {
    mode: string;
    strikeAccuracy: number;
    assocSkillCode: string;
    lengthBase: number;
    projectileType: string;
    maxVolleyMult: number;
    baseRangeBase: number;
    drawBase: number;
    impactBase: {
        numDice: number;
        die: number;
        modifier: number;
        aspect: ImpactAspect;
    };
}

export interface WeaponGearData<
    TLogic extends WeaponGearLogic<WeaponGearData> = WeaponGearLogic<any>,
> extends GearData<TLogic> {
    /** Base reach/length of the weapon */
    lengthBase: number;
    /** Encumbrance value of the weapon */
    encumbrance: number;
    /** Strike modes available for this weapon */
    strikeModes: WeaponGearStrikeMode[];
}
