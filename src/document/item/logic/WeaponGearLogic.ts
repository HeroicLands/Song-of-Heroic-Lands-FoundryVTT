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
import { defineType, ITEM_KIND, STRIKE_MODE_TYPE } from "@src/utils/constants";
import type { ValueModifier } from "@src/entity/modifier/ValueModifier";
import { StrikeModeBase } from "@src/entity/strikemode/StrikeModeBase";
import { MeleeStrikeMode } from "@src/entity/strikemode/MeleeStrikeMode";
import type { MissileStrikeMode } from "@src/entity/strikemode/MissileStrikeMode";
import type { CombatResult } from "@src/entity/result/CombatResult";
import { fvttActiveCombatantForActor } from "@src/core/FoundryHelpers";
import { AutomatedCombat } from "@src/document/combatant/logic/SohlCombatantLogic";

/**
 * A weapon that can be wielded in combat.
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
    /** Weapon encumbrance */
    encumbrance!: ValueModifier;
    /** Weapon heft */
    heft!: ValueModifier;

    /* --------------------------------------------- */
    /* Strike mode helpers                           */
    /* --------------------------------------------- */

    /**
     * Build an `update()` payload that adds a strike mode under a new id.
     *
     * @param strikeMode - The strike mode data to add.
     * @param id - Optional id; a fresh `randomID()` is generated when omitted.
     * @returns An `update()` payload writing the strike mode under `system.strikeModes.<id>`.
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
     *
     * @param id - The id of the strike mode to remove.
     * @returns An `update()` payload deleting `system.strikeModes.<id>`.
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
     * @returns An `update()` payload writing each changed field under `system.strikeModes.<id>`.
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
        this.encumbrance = new entity.ValueModifier(this).setBase(
            this.data.encumbranceBase,
        );
        this.heft = new entity.ValueModifier(this).setBase(this.data.heftBase);
        this.strikeModes = Object.entries(this.data.strikeModes ?? {}).map(
            ([id, d]) =>
                d.type === STRIKE_MODE_TYPE.MELEE ?
                    new entity.MeleeStrikeMode(
                        d as MeleeStrikeMode.Data,
                        this,
                        id,
                    )
                :   new entity.MissileStrikeMode(
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
        // wielder's corpus reach. A non-Being wielder (or none) has no
        // corpus, so reach stays at length alone.
        const corpusReach =
            this.actorLogic?.logicTypes[ITEM_KIND.CORPUS][0]?.reach.effective ??
            0;
        for (const sm of this.strikeModes) {
            if (sm instanceof MeleeStrikeMode) {
                sm.reach.add("SOHL.INFO.Reach", "Size", corpusReach);
            }
        }
    }

    /** @inheritdoc */
    override finalize(): void {
        super.finalize();
    }
}

/**
 * Persisted data backing {@link WeaponGearLogic}.
 *
 * @typeParam TLogic - The logic class that consumes this data.
 * @remarks The shape of `system` on a `weapongear` item — i.e. `item.system` (equivalently `item.logic.data`) when `item.type === "weapongear"`. The backing DataModel implements this interface.
 */
export interface WeaponGearData<
    TLogic extends WeaponGearLogic<WeaponGearData> = WeaponGearLogic<any>,
> extends GearData<TLogic> {
    /** Encumbrance value of the weapon */
    encumbranceBase: number;
    /** Heft of the weapon */
    heftBase: number;
    /** Persisted strike modes, keyed by Foundry-style id. */
    strikeModes: StrictObject<StrikeModeBase.Data>;
}
