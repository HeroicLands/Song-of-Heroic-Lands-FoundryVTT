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

import { fvttIsActiveGM } from "@src/core/FoundryHelpers";
import { fireSohlTrigger } from "@src/entity/event/event-trigger";
import {
    buildRegionTriggerContext,
    CURATED_REGION_EVENTS,
} from "@src/entity/event/region-triggers";

/**
 * **The scene-region → event-queue bridge** (issue #593): a Foundry v14
 * `RegionBehaviorType` a GM drops onto a scene region to opt it into SoHL
 * triggering. Registered as the `trigger` RegionBehavior subtype; Foundry
 * auto-generates its config sheet from this schema.
 *
 * This is the GM opt-in surface for the "automation only at a human's behest"
 * posture — nothing happens until a GM places the behavior on a region and
 * picks which events it forwards. When a curated event fires, the behavior:
 *
 * 1. forwards the event into SoHL's queue via
 *    {@link sohl.entity.event.fireSohlTrigger}, so any actor/item subscription
 *    on that trigger reacts (predicate-scoped to a region or character); and
 * 2. if the GM authored an `actionName`, **offers** that action to the entering
 *    token's actor — an owner-gated `[Perform]` reminder (the crypt-Fear-test
 *    archetype). The queue reminds; the human performs.
 *
 * **Dispatch once.** Foundry delivers a region event to the behavior on *every*
 * connected client (the triggering client plus a socket broadcast), so the
 * whole forward is gated to the active GM — the trigger dispatches exactly once,
 * not once per client. The entering token is resolved to its actor here, at the
 * Foundry boundary; the logic layer sees only the resolved UUIDs.
 */
export class SohlRegionTriggerBehavior extends foundry.data.regionBehaviors
    .RegionBehaviorType<any> {
    /** @inheritDoc */
    static override readonly LOCALIZATION_PREFIXES = [
        "SOHL.RegionBehavior.trigger",
        "BEHAVIOR.TYPES.base",
    ];

    /**
     * Schema: which curated events to forward, and the optional action to offer
     * the entering actor.
     * @returns The Foundry data schema for the behavior.
     */
    static override defineSchema(): foundry.data.fields.DataSchema {
        const fields = foundry.data.fields;
        return {
            // Restrict the multi-select to SoHL's curated region events (enter /
            // exit / turn-start-end / round-start-end). Foundry's continuous and
            // view-dependent streams are excluded (see region-triggers.ts).
            events: (
                this as unknown as {
                    _createEventsField(opts: {
                        events: string[];
                        initial: string[];
                    }): foundry.data.fields.DataField;
                }
            )._createEventsField({
                events: [...CURATED_REGION_EVENTS],
                initial: ["tokenEnter"],
            }),
            // The action to OFFER on the entering token's actor when a forwarded
            // event fires. Blank = forward-only (fire the trigger for
            // subscriptions, but author no region-scoped offer).
            actionName: new fields.StringField({
                required: false,
                blank: true,
                initial: "",
                label: "SOHL.RegionBehavior.trigger.FIELDS.actionName.label",
                hint: "SOHL.RegionBehavior.trigger.FIELDS.actionName.hint",
            }),
        };
    }

    /**
     * Handle a Foundry region event: forward the curated ones into the SoHL
     * queue, gated to the active GM so dispatch happens exactly once.
     *
     * @param event - The Foundry region event (`event.data.token` is the token
     *   that entered/exited/acted).
     */
    protected override async _handleRegionEvent(event: any): Promise<void> {
        // Dispatch once: the behavior runs on every client; only the active GM
        // forwards into the queue (fire is GM-gated too, but gating here also
        // avoids per-client ActiveEffect-registry refreshes and offers).
        if (!fvttIsActiveGM()) return;

        const token = event?.data?.token;
        const ctx = buildRegionTriggerContext({
            eventName: event?.name,
            regionUuid: this.region?.uuid,
            regionId: this.region?.id ?? undefined,
            regionName: this.region?.name ?? undefined,
            tokenUuid: token?.uuid,
            actorUuid: token?.actor?.uuid,
            sceneUuid: this.scene?.uuid,
        });
        if (!ctx) return; // an excluded/unknown event

        // (1) Forward to subscriptions + the ActiveEffect registry.
        await fireSohlTrigger(ctx);

        // (2) Region-authored offer to the entering actor's owner (consent).
        const actionName = (this as unknown as { actionName?: string })
            .actionName;
        if (actionName && ctx.actorUuid) {
            await sohl.events.offer(ctx.actorUuid, actionName, ctx);
        }
    }
}
