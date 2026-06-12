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
import type { BeingLogic } from "@src/document/actor/logic/BeingLogic";
import type { MovementMedium } from "@src/utils/constants";
import { computeMove } from "./combatant-logic";
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

    /** The strike mode last used to attack, or `null` (combat-scoped). */
    get lastAttackMode(): StrikeModeRef | null {
        return this.data.lastAttackMode;
    }

    /** The strike mode last used to block, or `null` (combat-scoped). */
    get lastBlockMode(): StrikeModeRef | null {
        return this.data.lastBlockMode;
    }

    /**
     * Remember the strike mode just used to attack (persisted on the combatant).
     * @param itemId - The id of the item owning the strike mode.
     * @param smId - The strike mode id.
     */
    async recordAttackMode(itemId: string, smId: string): Promise<void> {
        await this.data.update({
            "system.lastAttackMode": { itemId, smId },
        });
    }

    /**
     * Remember the strike mode just used to block (persisted on the combatant).
     * @param itemId - The id of the item owning the strike mode.
     * @param smId - The strike mode id.
     */
    async recordBlockMode(itemId: string, smId: string): Promise<void> {
        await this.data.update({
            "system.lastBlockMode": { itemId, smId },
        });
    }

    /** Whether this combatant has acted this turn. */
    get didAction(): boolean {
        return this.data.didAction;
    }

    /**
     * This combatant's melee reach (feet) — the reach of its actor (the greatest
     * reach among the actor's available melee strike modes). 0 when the actor is
     * absent or is not a Being.
     */
    get reach(): number {
        return (this.actorLogic as BeingLogic | null)?.reach ?? 0;
    }

    /**
     * The computed tactical move for this combatant in the given medium,
     * accounting for the combatant's situational `moveFactor` scalar.
     * `null` when the actor has no movement model (e.g. a Vehicle).
     * @param medium - The movement medium to compute for.
     * @returns The tactical move, or `null` when unavailable.
     */
    computedMove(medium: MovementMedium): number | null {
        return computeMove(
            this.actorLogic as BeingLogic | undefined,
            medium,
            this.data.moveFactor ?? 1,
        );
    }

    /** The computed move for the combat-tracker's displayed medium. */
    get displayedMove(): number | null {
        return this.computedMove(this.data.displayedMedium as MovementMedium);
    }
}
