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
import { ITEM_KIND, STRIKE_MODE_TYPE } from "@src/utils/constants";
import { ValueModifier } from "@src/domain/modifier/ValueModifier";
import { StrikeModeBase } from "@src/domain/strikemode/StrikeModeBase";
import { MeleeStrikeMode } from "@src/domain/strikemode/MeleeStrikeMode";
import { MissileStrikeMode } from "@src/domain/strikemode/MissileStrikeMode";
import type { LineageLogic } from "@src/document/item/logic/LineageLogic";

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
    /** Weapon encumbrance. */
    encumbrance!: ValueModifier;
    heft!: ValueModifier;

    /* --------------------------------------------- */
    /* Strike mode update helpers                    */
    /* --------------------------------------------- */

    /**
     * Build an `update()` payload that adds a strike mode under a new id.
     *
     * @param strikeMode - The strike mode data to add.
     * @param id - Optional id; a fresh `randomID()` is generated when omitted.
     * @throws If a strike mode with the same id already exists on this weapon.
     */
    addStrikeModeUpdate(
        strikeMode: StrikeModeBase.Data,
        id: string = foundry.utils.randomID(),
    ): PlainObject {
        if (this.data.strikeModes[id]) {
            throw new Error(
                `Strike mode with id "${id}" already exists on this weapon.`,
            );
        }
        return { [`system.strikeModes.${id}`]: strikeMode };
    }

    /**
     * Build an `update()` payload that removes a strike mode by id, using
     * Foundry's `-=` deletion key syntax for object fields.
     */
    removeStrikeModeUpdate(id: string): PlainObject {
        return { [`system.strikeModes.-=${id}`]: null };
    }

    /**
     * Build an `update()` payload that applies a partial update to a single
     * strike mode, leaving other strike modes untouched.
     *
     * @param id - The id of the strike mode to update.
     * @param partial - The fields to change on that strike mode.
     */
    updateStrikeModeUpdate(
        id: string,
        partial: Partial<StrikeModeBase.Data>,
    ): PlainObject {
        const update: PlainObject = {};
        for (const [key, value] of Object.entries(partial)) {
            update[`system.strikeModes.${id}.${key}`] = value;
        }
        return update;
    }

    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(): void {
        super.initialize();
        this.encumbrance = new ValueModifier({}, { parent: this }).setBase(
            this.data.encumbrance,
        );
        this.strikeModes = Object.entries(this.data.strikeModes ?? {}).map(
            ([id, d]) =>
                d.type === STRIKE_MODE_TYPE.MELEE ?
                    new MeleeStrikeMode(d as MeleeStrikeMode.Data, this, id)
                :   new MissileStrikeMode(
                        d as MissileStrikeMode.Data,
                        this,
                        id,
                    ),
        );
    }

    /** @inheritdoc */
    override evaluate(): void {
        super.evaluate();
        // A melee mode's reach is its weapon length (the reach base) plus the
        // wielder's lineage reach. A non-Being wielder (or none) has no
        // lineage, so reach stays at length alone.
        const lineageReach =
            ((this.actor?.itemTypes as any)?.[ITEM_KIND.LINEAGE]?.[0]
                ?.logic as LineageLogic | undefined)?.reach.effective ?? 0;
        for (const sm of this.strikeModes) {
            if (sm instanceof MeleeStrikeMode) {
                sm.reach.add("SOHL.INFO.Reach", "Size", lineageReach);
            }
        }
    }

    /** @inheritdoc */
    override finalize(): void {
        super.finalize();
    }
}

export interface WeaponGearData<
    TLogic extends WeaponGearLogic<WeaponGearData> = WeaponGearLogic<any>,
> extends GearData<TLogic> {
    /** Encumbrance value of the weapon */
    encumbrance: number;
    /** Heft of the weapon */
    heftBase: number;
    /** Persisted strike modes, keyed by Foundry-style id. */
    strikeModes: StrictObject<StrikeModeBase.Data>;
}
