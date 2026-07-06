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

import { SohlItemBaseLogic, type SohlItemData } from "./SohlItemBaseLogic";
import { StrikeModeBase } from "@src/entity/strikemode/StrikeModeBase";
import { MeleeStrikeMode } from "@src/entity/strikemode/MeleeStrikeMode";
import { MissileStrikeMode } from "@src/entity/strikemode/MissileStrikeMode";
import {
    ACTION_SUBTYPE,
    ITEM_KIND,
    SOHL_ACTION_SCOPE,
    SOHL_CONTEXT_MENU_SORT_GROUP,
    STRIKE_MODE_TYPE,
} from "@src/utils/constants";
import { SohlAction } from "@src/entity/action/SohlAction";
import type { SohlActionContext } from "@src/entity/action/SohlActionContext";
import type { CombatResult } from "@src/entity/result/CombatResult";
import { fvttActiveCombatantForActor } from "@src/core/FoundryHelpers";

/**
 * A specialized combat maneuver or fighting style not tied to a specific
 * weapon.
 *
 * Combat techniques represent trained maneuvers: grappling, disarming,
 * tripping, shield bashing, unarmed strikes, and other specialized
 * techniques. Unlike weapon-based strike modes, these belong directly
 * to a Being rather than being nested inside a weapon.
 *
 * Each combat technique has one or more {@link StrikeModeBase | strike modes}
 * (typically melee, but possibly missile for creature abilities like
 * tail-flung quills). Each strike mode carries its own attack, impact,
 * and defense modifiers.
 *
 * @typeParam TData - The CombatTechnique data interface.
 */
export class CombatTechniqueLogic<
    TData extends CombatTechniqueData = CombatTechniqueData,
> extends SohlItemBaseLogic<TData> {
    /** The runtime strike-mode instance, built from persisted data. */
    strikeMode!: StrikeModeBase;

    /**
     * The runtime strike-mode instance as an array. For a combat technique,
     * this is always a single-element array containing {@link strikeMode}.
     * @returns An array containing the single {@link strikeMode} instance.
     */
    get strikeModes(): StrikeModeBase[] {
        return [this.strikeMode];
    }

    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(): void {
        super.initialize();
        const d = this.data.strikeMode;
        this.strikeMode =
            d.type === STRIKE_MODE_TYPE.MELEE ?
                new MeleeStrikeMode(d as MeleeStrikeMode.Data, this, this.id)
            :   new MissileStrikeMode(
                    d as MissileStrikeMode.Data,
                    this,
                    this.id,
                );
    }

    /** @inheritdoc */
    override evaluate(): void {
        super.evaluate();
        // A melee technique's reach is its base length plus the wielder's
        // lineage reach (0 for a non-Being or no lineage).
        if (this.strikeMode instanceof MeleeStrikeMode) {
            const lineageReach =
                this.actorLogic?.logicTypes[ITEM_KIND.LINEAGE][0]?.reach
                    .effective ?? 0;
            this.strikeMode.reach.add("SOHL.INFO.Reach", "Size", lineageReach);
        }
    }

    /** @inheritdoc */
    override finalize(): void {
        super.finalize();
    }
}

/**
 * @remarks The shape of `system` on a `combattechnique` item — i.e. `item.system` (equivalently `item.logic.data`) when `item.type === "combattechnique"`. The backing DataModel implements this interface.
 */
export interface CombatTechniqueData<
    TLogic extends CombatTechniqueLogic<CombatTechniqueData> =
        CombatTechniqueLogic<any>,
> extends SohlItemData<TLogic> {
    /**
     * The combat technique's grouping, such as "Karate", "Pugalistics", etc.
     * Used to group related techniques together.
     */
    group: string;

    /**
     * Persisted strike-mode payload — a discriminated union over melee /
     * missile shapes. The runtime domain instance (with modifier wrappers)
     * is obtained via `CombatTechniqueDataModel.strikeModeInstance`.
     */
    strikeMode: MeleeStrikeMode.Data | MissileStrikeMode.Data;

    /**
     * The runtime strike-mode instance as an array. For a combat technique,
     * this is always a single-element array containing {@link strikeMode}.
     * @returns An array containing the single {@link strikeMode} instance.
     */
    get strikeModes(): StrikeModeBase[];
}
