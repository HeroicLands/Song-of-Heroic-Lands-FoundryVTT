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
type SohlTriggerContextVariant =
    | {
          /** Trigger discriminant. */
          name: "updateWorldTime";
          /** New world time, in seconds. */
          worldTime: number;
          /** Signed delta from the previous world time, in seconds. */
          dt: number;
          /** Foundry's update options for the world-time change. */
          options?: object;
          /** ID of the user who advanced the clock. */
          userId?: string;
      }
    | {
          /** Trigger discriminant. */
          name: "combatStart";
          /** The combat that started. */
          combat: any;
      }
    | {
          /** Trigger discriminant. */
          name: "combatEnd";
          /** The combat that ended. */
          combat: any;
      }
    | {
          /** Trigger discriminant. */
          name: "roundStart";
          /** The active combat. */
          combat: any;
          /** The round number that started. */
          round: number;
          /** Whether the round change was skipped (no dispatch needed). */
          skipped: boolean;
      }
    | {
          /** Trigger discriminant. */
          name: "roundEnd";
          /** The active combat. */
          combat: any;
          /** The round number that ended. */
          round: number;
          /** Whether the round change was skipped (no dispatch needed). */
          skipped: boolean;
      }
    | {
          /** Trigger discriminant. */
          name: "turnStart";
          /** The active combat. */
          combat: any;
          /** The combatant whose turn started. */
          combatant: any;
          /** The turn index that started. */
          turn: number;
          /** The current round number. */
          round: number;
          /** Whether the turn change was skipped (no dispatch needed). */
          skipped: boolean;
      }
    | {
          /** Trigger discriminant. */
          name: "turnEnd";
          /** The active combat. */
          combat: any;
          /** The combatant whose turn ended. */
          combatant: any;
          /** The turn index that ended. */
          turn: number;
          /** The current round number. */
          round: number;
          /** Whether the turn change was skipped (no dispatch needed). */
          skipped: boolean;
      }
    | ({
          /**
           * A scene-region trigger (issue #593) — a token entering/exiting a
           * region, or taking its combat turn/round inside one. Event-driven:
           * there is no `fireAt`, so `nextFireTime` is `undefined` and the
           * queryable temporal fact is `system.lastRun`. See
           * {@link sohl.entity.event.SohlRegionTriggerName}.
           */
          name:
              | "regionTokenEnter"
              | "regionTokenExit"
              | "regionTokenTurnStart"
              | "regionTokenTurnEnd"
              | "regionTokenRoundStart"
              | "regionTokenRoundEnd";
      } & SohlRegionTriggerData)
    | {
          /**
           * A scene environment change (issue #593) — the active scene's
           * darkness level changed. Event-driven, like the region triggers.
           */
          name: "sceneDarknessChange";
          /** UUID of the scene whose darkness changed. */
          sceneUuid: string;
          /** The new darkness level (0–1). */
          darkness: number;
          /** The prior darkness level (0–1), when known. */
          priorDarkness?: number;
      }
    | {
          /** Custom trigger identifier. */
          name: string;
          /** Arbitrary custom context payload. */
          [key: string]: unknown;
      };

/**
 * The context payload common to every scene-region trigger (issue #593). The
 * bridge (a SoHL `RegionBehaviorType`) resolves the entering token to its actor
 * at the Foundry boundary, so the logic layer sees only UUIDs and names — a
 * predicate can scope a subscription to a specific region (`regionId`) or a
 * specific character (`actorUuid`).
 */
export interface SohlRegionTriggerData {
    /** UUID of the region the event fired on. */
    regionUuid: string;
    /** The region's id (for predicate scoping to one region). */
    regionId: string;
    /** The region's display name. */
    regionName: string;
    /** UUID of the token that entered/exited/acted. */
    tokenUuid: string;
    /** UUID of that token's actor, when it has one (for predicate scoping). */
    actorUuid?: string;
    /** UUID of the scene the region belongs to. */
    sceneUuid: string;
}

/**
 * A trigger context as dispatched to a document. Every variant additionally
 * carries an optional `payload` — the
 * subscription's `payload`, forwarded by {@link SohlEventQueue.fire} so the
 * dispatched action can read it from `ctx.payload` (the action context's
 * `scope`).
 */
export type SohlTriggerContext = SohlTriggerContextVariant & {
    /**
     * Data attached to the subscription, forwarded to the dispatched action as
     * part of its context scope.
     */
    payload?: Record<string, unknown>;
};

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
