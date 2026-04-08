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
import { STRIKE_MODE_TYPE } from "@src/utils/constants";
import { ValueModifier } from "@src/domain/modifier/ValueModifier";
import { StrikeModeBase } from "@src/domain/strikemode/StrikeModeBase";
import { MeleeStrikeMode } from "@src/domain/strikemode/MeleeStrikeMode";
import { MissileStrikeMode } from "@src/domain/strikemode/MissileStrikeMode";

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
    /** Strike mode domain objects, constructed from persisted data. */
    strikeModes!: StrikeModeBase[];
    /** Overall weapon length. */
    length!: ValueModifier;
    /** Weapon encumbrance. */
    encumbrance!: ValueModifier;

    /* --------------------------------------------- */
    /* Array update helpers                          */
    /* --------------------------------------------- */

    /** Build an `update()` payload that adds a strike mode. */
    addStrikeModeUpdate(strikeMode: StrikeModeBase.Data): PlainObject {
        return {
            "system.strikeModes": [...this.data.strikeModeData, strikeMode],
        };
    }

    /** Build an `update()` payload that removes a strike mode by mode name. */
    removeStrikeModeUpdate(mode: string): PlainObject {
        return {
            "system.strikeModes": this.data.strikeModeData.filter(
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
        this.length = new ValueModifier(
            {},
            { parent: this },
        ).setBase(this.data.lengthBase);
        this.encumbrance = new ValueModifier(
            {},
            { parent: this },
        ).setBase(this.data.encumbrance);
        this.strikeModes = (this.data.strikeModeData ?? []).map((d, i) =>
            d.type === STRIKE_MODE_TYPE.MELEE ?
                new MeleeStrikeMode(d as MeleeStrikeMode.Data, this, i)
            :   new MissileStrikeMode(d as MissileStrikeMode.Data, this, i),
        );
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

export interface WeaponGearData<
    TLogic extends WeaponGearLogic<WeaponGearData> = WeaponGearLogic<any>,
> extends GearData<TLogic> {
    /** Base reach/length of the weapon */
    lengthBase: number;
    /** Encumbrance value of the weapon */
    encumbrance: number;
    /** Persisted strike mode data (use Logic.strikeModes for domain objects) */
    strikeModeData: StrikeModeBase.Data[];
}
