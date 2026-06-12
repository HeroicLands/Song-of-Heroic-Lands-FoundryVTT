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

import { SohlLogic, SohlLogicData } from "@src/core/SohlLogic";
import type { SohlCombatant, StrikeModeRef } from "./SohlCombatant";

/**
 * The Foundry-free data contract for a SoHL combatant — the
 * {@link SohlLogicData} port specialized for {@link SohlCombatant}, plus the
 * combatant's persisted combat-scoped state. Implemented by
 * `SohlCombatantDataModel`.
 */
export interface CombatantData extends SohlLogicData<SohlCombatant> {
    /** Turn-start location used to measure spaces moved this turn. */
    startLocation: { x: number; y: number; elevation: number };
    /** Whether this combatant has acted this turn. */
    didAction: boolean;
    /** GM situational multiplier on computed move (run, terrain, …). */
    moveFactor: number;
    /** Which movement medium's computed move the tracker displays. */
    displayedMedium: string;
    /** Strike mode last used to attack (`{ itemId, smId }`), or `null`. */
    lastAttackMode: StrikeModeRef | null;
    /** Strike mode last used to block (`{ itemId, smId }`), or `null`. */
    lastBlockMode: StrikeModeRef | null;
}

/**
 * Logic for a SoHL combatant — the combat-participation layer.
 *
 * @remarks
 * Holds the combatant's combat-scoped state and the rules that operate on it
 * (relational enemy/ally queries, strike-mode memory, movement, reach), reading
 * the actor's capabilities through {@link actorLogic}. Spatial queries (reach to
 * another combatant) are the one scene-coupled edge and route through the scene
 * facade. Combat participation (the automated block/dodge/counterstrike resume
 * flow) lives here as intrinsic actions, distinct from the actor's combat
 * *capability* (strike modes, reach) on the actor logic.
 */
export class CombatantLogic<
    TData extends CombatantData = CombatantData,
> extends SohlLogic<TData> {
    /** Initialize-phase hook; base combatant logic does nothing. */
    override initialize(): void {}
    /** Evaluate-phase hook; base combatant logic does nothing. */
    override evaluate(): void {}
    /** Finalize-phase hook; base combatant logic does nothing. */
    override finalize(): void {}
}
