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
 * **Scene environment triggers** (issue #593) — the environmental sibling of the
 * spatial {@link sohl.entity.event.SohlRegionTriggerName | region triggers}.
 * Where a region trigger fires on *where* a token is, an environment trigger
 * fires on *what the scene is doing* — currently the scene's darkness level.
 *
 * Like the region triggers these are **event-driven** (no `fireAt`): darkness
 * falls when the GM or an Adjust-Darkness behavior changes it, so
 * {@link sohl.entity.event.SohlEventQueue.nextFireTime | nextFireTime} is
 * `undefined` by design and the queryable temporal fact is `system.lastRun`.
 *
 * The trigger is fired from `SohlHookBridge` off Foundry's `updateScene` hook
 * (a scene-level change, not a per-region event); this module is the pure,
 * Foundry-free half — the derivation from an update payload to a trigger
 * context.
 *
 * @module SceneTriggers
 */

/** The SoHL trigger name for a scene darkness-level change. */
export const SCENE_DARKNESS_TRIGGER = "sceneDarknessChange" as const;

/**
 * Build the {@link sohl.entity.event.SohlTriggerContext} for a scene darkness
 * change, or `undefined` when the `updateScene` payload did not touch the
 * darkness level (the caller then does nothing). Pure: it inspects only the
 * `changed` diff Foundry hands the hook.
 *
 * `darknessLevel` is an `AlphaField` (0–1), so a change to `0` is a real event,
 * not absence — the check is `!== undefined`, never falsy.
 *
 * @param sceneUuid - UUID of the scene that changed.
 * @param changed - The `updateScene` change diff.
 * @returns The darkness trigger context, or `undefined` if darkness is unchanged.
 */
export function buildDarknessTriggerContext(
    sceneUuid: string,
    changed:
        | {
              /** The scene's environment sub-document diff, if changed. */
              environment?: {
                  /** The new darkness level (0–1), if it changed. */
                  darknessLevel?: number;
                  [key: string]: unknown;
              };
              [key: string]: unknown;
          }
        | undefined,
):
    | {
          name: typeof SCENE_DARKNESS_TRIGGER;
          sceneUuid: string;
          darkness: number;
      }
    | undefined {
    const darkness = changed?.environment?.darknessLevel;
    if (darkness === undefined) return undefined;
    return { name: SCENE_DARKNESS_TRIGGER, sceneUuid, darkness };
}

/**
 * The environment triggers paired with their i18n labels, for registering with
 * Foundry's `CONFIG.ActiveEffect.expiryEvents` via
 * {@link sohl.entity.event.registerSohlTrigger} at system init.
 */
export const SOHL_ENVIRONMENT_TRIGGERS: readonly {
    /** The SoHL trigger name. */
    name: typeof SCENE_DARKNESS_TRIGGER;
    /** The i18n key shown in the effect-config UI. */
    label: string;
}[] = [
    {
        name: SCENE_DARKNESS_TRIGGER,
        label: "SOHL.Trigger.sceneDarknessChange",
    },
];
