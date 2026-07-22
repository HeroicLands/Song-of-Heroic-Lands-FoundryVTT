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
 * **Scene-region trigger vocabulary** (issue #593) — the curated set of Foundry
 * v14 scene-region events SoHL bridges into its {@link SohlEventQueue | event
 * queue}, and the SoHL trigger names they arrive under.
 *
 * Region events are the archetypal **event-driven** trigger: their timing is a
 * function of player movement, so there is no `fireAt` and
 * {@link sohl.entity.event.SohlEventQueue.nextFireTime | nextFireTime} is
 * `undefined` by design (the queryable temporal fact is the *last* occurrence,
 * `system.lastRun` — see the Event Queue reference). This module is the pure,
 * Foundry-free half: the map is data, and the bridge that consumes it (a SoHL
 * `RegionBehaviorType` subtype) lives in the Foundry layer.
 *
 * **Curation.** Foundry fires a much richer event set than SoHL exposes.
 * Continuous / view-dependent streams (`tokenMove*`, `tokenAnimate*`) would
 * flood the queue, and the behavior-lifecycle / boundary events
 * (`behavior*`, `regionBoundary`) are internal plumbing, not player-facing
 * moments — all are deliberately {@link EXCLUDED_REGION_EVENTS | excluded}. The
 * exposed set is the discrete, meaningful events: a token entering/exiting a
 * region, and a token taking its combat turn/round while inside one.
 *
 * @module RegionTriggers
 */

/** Names of the curated scene-region SoHL triggers. */
export type SohlRegionTriggerName =
    | "regionTokenEnter"
    | "regionTokenExit"
    | "regionTokenTurnStart"
    | "regionTokenTurnEnd"
    | "regionTokenRoundStart"
    | "regionTokenRoundEnd";

/**
 * The curated Foundry region-event → SoHL trigger-name map. The keys are the
 * `CONST.REGION_EVENTS` string values SoHL forwards; every other region event
 * is {@link EXCLUDED_REGION_EVENTS | excluded}.
 */
export const REGION_EVENT_TO_TRIGGER: Readonly<
    Record<string, SohlRegionTriggerName>
> = {
    tokenEnter: "regionTokenEnter",
    tokenExit: "regionTokenExit",
    tokenTurnStart: "regionTokenTurnStart",
    tokenTurnEnd: "regionTokenTurnEnd",
    tokenRoundStart: "regionTokenRoundStart",
    tokenRoundEnd: "regionTokenRoundEnd",
} as const;

/** The Foundry region-event names SoHL forwards (the keys of the map). */
export const CURATED_REGION_EVENTS: readonly string[] = Object.keys(
    REGION_EVENT_TO_TRIGGER,
);

/**
 * Region events SoHL deliberately does **not** forward, and why:
 * - `tokenMoveIn` / `tokenMoveOut` / `tokenMoveWithin` — fire on every
 *   coordinate change; `tokenMoveWithin` in particular is a continuous stream
 *   that would flood the queue. Use enter/exit for the discrete crossings.
 * - `tokenAnimateIn` / `tokenAnimateOut` — view-dependent (only fire on the
 *   *viewed* scene), so they are unreliable for headless GM dispatch.
 * - `regionBoundary` — the region's own shape/elevation changed, not a
 *   character-facing moment.
 * - `behaviorActivated` / `behaviorDeactivated` / `behaviorViewed` /
 *   `behaviorUnviewed` — RegionBehavior lifecycle plumbing, not gameplay.
 */
export const EXCLUDED_REGION_EVENTS: readonly string[] = [
    "tokenMoveIn",
    "tokenMoveOut",
    "tokenMoveWithin",
    "tokenAnimateIn",
    "tokenAnimateOut",
    "regionBoundary",
    "behaviorActivated",
    "behaviorDeactivated",
    "behaviorViewed",
    "behaviorUnviewed",
];

/**
 * The SoHL trigger name for a Foundry region event, or `undefined` when the
 * event is not in the curated set (excluded or unknown).
 *
 * @param eventName - A `CONST.REGION_EVENTS` value (e.g. `"tokenEnter"`).
 * @returns The SoHL trigger name, or `undefined` if not forwarded.
 */
export function regionTriggerForEvent(
    eventName: string,
): SohlRegionTriggerName | undefined {
    return REGION_EVENT_TO_TRIGGER[eventName];
}

/**
 * The resolved Foundry region/token/scene identifiers the bridge hands to
 * {@link buildRegionTriggerContext} — the Foundry objects are reduced to UUIDs
 * and names at the boundary so the trigger-shaping logic stays Foundry-free.
 */
export interface RegionEventInput {
    /** The Foundry `CONST.REGION_EVENTS` value. */
    eventName: string;
    /** UUID of the region the event fired on. */
    regionUuid?: string;
    /** The region's id. */
    regionId?: string;
    /** The region's display name. */
    regionName?: string;
    /** UUID of the token that entered/exited/acted. */
    tokenUuid?: string;
    /** UUID of that token's actor, if any. */
    actorUuid?: string;
    /** UUID of the scene the region belongs to. */
    sceneUuid?: string;
}

/**
 * Build the {@link sohl.entity.event.SohlTriggerContext} for a Foundry region
 * event, or `undefined` when the event is not curated (the caller then does
 * nothing). Pure: the RegionBehavior bridge resolves the Foundry region/token
 * objects to UUIDs and names at the boundary and hands them here, so the
 * trigger-shaping logic stays Foundry-free and unit-testable.
 *
 * Absent identifiers normalize to `""`; `actorUuid` stays `undefined` when the
 * token has no actor (a predicate can then distinguish "no character").
 *
 * @param params - The region event name and resolved identifiers.
 * @returns The region trigger context, or `undefined` if the event is excluded.
 */
export function buildRegionTriggerContext(params: RegionEventInput):
    | {
          /** The SoHL region trigger name. */
          name: SohlRegionTriggerName;
          /** UUID of the region the event fired on. */
          regionUuid: string;
          /** The region's id (for predicate scoping to one region). */
          regionId: string;
          /** The region's display name. */
          regionName: string;
          /** UUID of the token that entered/exited/acted. */
          tokenUuid: string;
          /** UUID of that token's actor, when it has one. */
          actorUuid?: string;
          /** UUID of the scene the region belongs to. */
          sceneUuid: string;
      }
    | undefined {
    const name = regionTriggerForEvent(params.eventName);
    if (!name) return undefined;
    return {
        name,
        regionUuid: params.regionUuid ?? "",
        regionId: params.regionId ?? "",
        regionName: params.regionName ?? "",
        tokenUuid: params.tokenUuid ?? "",
        actorUuid: params.actorUuid || undefined,
        sceneUuid: params.sceneUuid ?? "",
    };
}

/**
 * The curated region triggers paired with their i18n labels, for registering
 * with Foundry's `CONFIG.ActiveEffect.expiryEvents` via
 * {@link sohl.entity.event.registerSohlTrigger} at system init (so they appear
 * in the effect-config duration→expiry dropdown).
 */
export const SOHL_REGION_TRIGGERS: readonly {
    /** The SoHL trigger name. */
    name: SohlRegionTriggerName;
    /** The i18n key shown in the effect-config UI. */
    label: string;
}[] = [
    { name: "regionTokenEnter", label: "SOHL.Trigger.regionTokenEnter" },
    { name: "regionTokenExit", label: "SOHL.Trigger.regionTokenExit" },
    {
        name: "regionTokenTurnStart",
        label: "SOHL.Trigger.regionTokenTurnStart",
    },
    { name: "regionTokenTurnEnd", label: "SOHL.Trigger.regionTokenTurnEnd" },
    {
        name: "regionTokenRoundStart",
        label: "SOHL.Trigger.regionTokenRoundStart",
    },
    {
        name: "regionTokenRoundEnd",
        label: "SOHL.Trigger.regionTokenRoundEnd",
    },
];
