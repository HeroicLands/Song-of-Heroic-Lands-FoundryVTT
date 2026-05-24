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

import { fvttIsActiveGM } from "@src/core/FoundryHelpers";
import type { SohlEventQueue } from "@src/core/SohlEventQueue";

/**
 * Translates Foundry's built-in lifecycle hooks into SoHL trigger
 * dispatches.
 *
 * **This is the only module permitted to call `Hooks.on(...)` for SoHL
 * trigger dispatch.** Keeping all hook wiring in one place satisfies
 * CLAUDE.md rule #7 (logic layer stays Foundry-free) and ensures that
 * adding a new built-in trigger means editing one file.
 *
 * SoHL does NOT re-fire `ActiveEffect.registry.refresh(...)` for built-in
 * triggers — Foundry's own code already calls the registry next to its
 * hook calls (verified in `client/helpers/time.mjs` and
 * `client/documents/combat.mjs`). Dual-dispatching the built-ins would
 * expire effects twice. Custom triggers dispatched via
 * `fireSohlTrigger(ctx)` handle the dual call themselves.
 *
 * @module SohlHookBridge
 */

interface PriorCombatState {
    round: number;
    turn: number;
    combatantId: string | null;
}

/**
 * Wire Foundry lifecycle hooks to dispatch onto the SoHL event queue.
 * Call once during system init.
 */
export function wireSohlHookBridge(queue: SohlEventQueue): void {
    const priorByCombat = new WeakMap<object, PriorCombatState>();

    function snapshotPrior(combat: any): PriorCombatState {
        return {
            round: combat?.round ?? 0,
            turn: combat?.turn ?? 0,
            combatantId: combat?.combatant?.id ?? null,
        };
    }

    Hooks.on(
        "updateWorldTime" as any,
        async (
            worldTime: number,
            dt: number,
            options?: object,
            userId?: string,
        ) => {
            if (!fvttIsActiveGM()) return;
            await queue.fire({
                name: "updateWorldTime",
                worldTime,
                dt,
                options,
                userId,
            });
        },
    );

    Hooks.on("combatStart" as any, async (combat: any) => {
        priorByCombat.set(combat, snapshotPrior(combat));
        if (!fvttIsActiveGM()) return;
        await queue.fire({ name: "combatStart", combat });
    });

    Hooks.on("deleteCombat" as any, async (combat: any) => {
        priorByCombat.delete(combat);
        if (!fvttIsActiveGM()) return;
        await queue.fire({ name: "combatEnd", combat });
    });

    Hooks.on(
        "combatRound" as any,
        async (combat: any, updateData: any, _options: any) => {
            const prior =
                priorByCombat.get(combat) ?? snapshotPrior(combat);
            const newRound = updateData?.round ?? combat.round;
            priorByCombat.set(combat, snapshotPrior(combat));

            if (!fvttIsActiveGM()) return;
            await queue.fire({
                name: "roundEnd",
                combat,
                round: prior.round,
                skipped: false,
            });
            await queue.fire({
                name: "roundStart",
                combat,
                round: newRound,
                skipped: false,
            });
        },
    );

    Hooks.on(
        "combatTurn" as any,
        async (combat: any, updateData: any, _options: any) => {
            const prior =
                priorByCombat.get(combat) ?? snapshotPrior(combat);
            const newRound = updateData?.round ?? combat.round;
            const newTurn = updateData?.turn ?? combat.turn;
            const newCombatant = combat.combatant;
            const priorCombatant =
                prior.combatantId != null ?
                    combat.combatants?.get?.(prior.combatantId) ?? null
                :   null;
            priorByCombat.set(combat, snapshotPrior(combat));

            if (!fvttIsActiveGM()) return;
            if (priorCombatant) {
                await queue.fire({
                    name: "turnEnd",
                    combat,
                    combatant: priorCombatant,
                    turn: prior.turn,
                    round: prior.round,
                    skipped: false,
                });
            }
            if (newCombatant) {
                await queue.fire({
                    name: "turnStart",
                    combat,
                    combatant: newCombatant,
                    turn: newTurn,
                    round: newRound,
                    skipped: false,
                });
            }
        },
    );
}
