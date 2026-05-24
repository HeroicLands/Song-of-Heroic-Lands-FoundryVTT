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

/**
 * SoHL trigger taxonomy.
 *
 * The trigger vocabulary is intentionally identical to Foundry's
 * `CONFIG.ActiveEffect.expiryEvents` registry so that an Active Effect
 * with `duration.expiry === "turnStart"` and a SoHL subscription on
 * `"turnStart"` are responding to the same moment, in the same shape,
 * with the same data.
 *
 * Built-in trigger names and their context payloads mirror the calls
 * Foundry itself makes to `ActiveEffect.registry.refresh(name, ctx)`
 * (see `client/helpers/time.mjs` and `client/documents/combat.mjs` in
 * the Foundry source).
 *
 * Two dispatchers exist (Foundry's `ActiveEffect.registry` and SoHL's
 * `SohlEventQueue`), but there is **one taxonomy**.
 *
 * @module SohlEventTrigger
 */

/** Names of the seven built-in SoHL triggers. */
export type SohlBuiltinTriggerName =
    | "updateWorldTime"
    | "combatStart"
    | "combatEnd"
    | "roundStart"
    | "roundEnd"
    | "turnStart"
    | "turnEnd";

/** Ordered list of built-in trigger names, useful for iteration. */
export const SOHL_BUILTIN_TRIGGERS: readonly SohlBuiltinTriggerName[] = [
    "updateWorldTime",
    "combatStart",
    "combatEnd",
    "roundStart",
    "roundEnd",
    "turnStart",
    "turnEnd",
] as const;

/**
 * Discriminated union of all built-in trigger context shapes.
 *
 * Custom triggers registered via {@link registerSohlTrigger} fall
 * under the open-ended `{ name: string; ... }` branch.
 */
export type SohlTriggerContext =
    | {
          name: "updateWorldTime";
          worldTime: number;
          dt: number;
          options?: object;
          userId?: string;
      }
    | { name: "combatStart"; combat: any }
    | { name: "combatEnd"; combat: any }
    | { name: "roundStart"; combat: any; round: number; skipped: boolean }
    | { name: "roundEnd"; combat: any; round: number; skipped: boolean }
    | {
          name: "turnStart";
          combat: any;
          combatant: any;
          turn: number;
          round: number;
          skipped: boolean;
      }
    | {
          name: "turnEnd";
          combat: any;
          combatant: any;
          turn: number;
          round: number;
          skipped: boolean;
      }
    | { name: string; [key: string]: unknown };

/**
 * Register a custom trigger name with Foundry's expiry-event registry.
 *
 * Effect-config sheets read `CONFIG.ActiveEffect.expiryEvents` to populate
 * the duration→expiry dropdown, so a custom SoHL trigger must be added
 * there for system authors to pick it from the UI.
 *
 * SoHL's event queue does not maintain a name allowlist — it dispatches
 * whatever trigger context is passed to {@link fireSohlTrigger} — so this
 * function exists solely to keep Foundry's registry and SoHL's vocabulary
 * in sync. Call once during system init.
 *
 * @param name - Trigger identifier, e.g. `"sohlInjuryHealed"`
 * @param label - i18n key (or literal string) shown in the effect-config UI
 */
export function registerSohlTrigger(name: string, label: string): void {
    const cfg = (CONFIG as any)?.ActiveEffect;
    if (!cfg) return;
    cfg.expiryEvents ??= {};
    cfg.expiryEvents[name] = label;
}

/**
 * Fire a custom trigger through both SoHL's event queue and Foundry's
 * `ActiveEffect.registry`. Use this instead of calling either dispatcher
 * directly so the two stay in sync.
 *
 * Built-in triggers are dispatched by `SohlHookBridge` for SoHL's queue
 * only — Foundry's own code already calls `registry.refresh(...)` next to
 * the hook calls (verified in `client/helpers/time.mjs` and
 * `client/documents/combat.mjs`), so dual-dispatching the built-ins would
 * fire effects twice. `fireSohlTrigger` is for **custom** triggers fired
 * by SoHL system code.
 *
 * @param ctx - Trigger context. `ctx.name` is the trigger identifier.
 */
export async function fireSohlTrigger(ctx: SohlTriggerContext): Promise<void> {
    const queue = (globalThis as any).sohl?.events;
    if (queue?.fire) await queue.fire(ctx);

    const registry = (ActiveEffect as any)?.registry;
    if (registry?.refresh) await registry.refresh(ctx.name, ctx);
}
