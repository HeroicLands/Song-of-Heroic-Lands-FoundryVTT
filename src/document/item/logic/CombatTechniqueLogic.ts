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

import { SohlItemBaseLogic, SohlItemData } from "../foundry/SohlItem";
import { MeleeStrikeMode } from "@src/domain/strikemode/MeleeStrikeMode";
import { MissileStrikeMode } from "@src/domain/strikemode/MissileStrikeMode";

/**
 * Logic for the **Combat Technique** item type — a specialized combat
 * maneuver or fighting style not tied to a specific weapon.
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

export interface CombatTechniqueData<
    TLogic extends CombatTechniqueLogic<CombatTechniqueData> =
        CombatTechniqueLogic<any>,
> extends SohlItemData<TLogic> {
    // The combat technique's grouping, such as "Karate", "Pugalistics", etc. Used to
    // group related techniques together.
    group: string;

    /**
     * Persisted strike-mode payload — a discriminated union over melee /
     * missile shapes. The runtime domain instance (with modifier wrappers)
     * is obtained via `CombatTechniqueDataModel.strikeModeInstance`.
     */
    strikeMode: MeleeStrikeMode.Data | MissileStrikeMode.Data;
}
