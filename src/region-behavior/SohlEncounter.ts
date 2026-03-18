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

import { ACTOR_KIND } from "@src/utils/constants";
import { handleCohortDrop } from "../sohl";

/** The event kind used by encounter check scheduling. */
const ENCOUNTER_EVENT_KIND = "encounterCheck";

/** Location kind for spawn placement. */
const LOCATION_KIND = {
    EXACT: "exact",
    IN_REGION: "in_region",
} as const;

/**
 * A region behavior representing a potential encounter within a scene region.
 *
 * An encounter ties a **cohort** (a group of creatures or NPCs) to a region
 * and periodically checks whether the encounter triggers based on probability,
 * cooldown, and maximum trigger limits.
 *
 * ## Scheduling Model
 *
 * Encounters use the {@link SohlEventQueue} to schedule periodic checks.
 * Check times are aligned to multiples of the `trigger.interval` value
 * (e.g., every 4 hours of world time), not relative to when the encounter
 * was created. This ensures consistent, predictable timing across all
 * encounters.
 *
 * When a check fires:
 * 1. If the encounter is disabled or has reached its max triggers, stop.
 * 2. If the cooldown hasn't elapsed since the last occurrence, skip and
 *    schedule the next check (safety guard for stale queue state).
 * 3. Roll against `trigger.probability` — if the roll succeeds, the
 *    encounter triggers: `trigger.count` increments, `trigger.lastOccured`
 *    is updated, and the cohort would be spawned.
 * 4. If triggered, the next check is scheduled at the first interval
 *    boundary after `time + cooldown`, avoiding wasted checks during
 *    the cooldown period. If not triggered, the next check is at the
 *    next regular interval boundary.
 *
 * ## Trigger Properties
 *
 * - **max** — Maximum number of times this encounter can trigger (0 = unlimited).
 * - **count** — How many times it has triggered so far.
 * - **cooldown** — Minimum seconds between successful triggers.
 * - **interval** — Seconds between encounter checks, aligned to world time
 *   (e.g., 14400 = every 4 hours). Checks occur when `worldTime % interval === 0`.
 * - **lastOccured** — World time of the most recent successful trigger.
 * - **probability** — Chance of triggering on each check (0–1).
 */
export class SohlEncounter<
    SubType extends RegionBehavior.SubType = RegionBehavior.SubType,
> extends RegionBehavior<SubType> {
    /**
     * Handle a timed event from the SoHL event queue.
     *
     * For encounter checks, evaluates whether the encounter triggers
     * based on the current state, then schedules the next check.
     */
    async handleSohlEvent(
        kind: string,
        time: number,
        _payload?: Record<string, unknown>,
    ): Promise<void> {
        if (kind !== ENCOUNTER_EVENT_KIND) {
            console.warn(
                `SoHL | SohlEncounter ${this.name} received unknown event kind "${kind}"`,
            );
            return;
        }

        const data = this.system as SohlEncounterDataModel;
        const { trigger } = data;

        // Don't process if disabled
        if (data.disabled) return;

        // Don't process if max reached (0 = unlimited)
        if (trigger.max > 0 && trigger.count >= trigger.max) return;

        // Check cooldown: skip if not enough time has passed since last occurrence
        if (
            trigger.lastOccured > 0 &&
            time - trigger.lastOccured < trigger.cooldown
        ) {
            // Schedule next check and return
            SohlEncounter.scheduleNextCheck(this, time);
            return;
        }

        // Roll against probability
        const roll = Math.random();
        const triggered = roll <= trigger.probability;

        if (triggered) {
            await this.update({
                "system.trigger.count": trigger.count + 1,
                "system.trigger.lastOccured": time,
            } as any);

            // Spawn the cohort
            await this._spawnCohort();

            console.log(
                `SoHL | Encounter "${this.name}" triggered (roll ${roll.toFixed(3)} <= ${trigger.probability})`,
            );

            // Schedule next check after cooldown expires — skip to the
            // first interval boundary at or after time + cooldown
            SohlEncounter.scheduleNextCheck(this, time + trigger.cooldown);
        } else {
            // Not triggered — schedule at the next regular interval
            SohlEncounter.scheduleNextCheck(this, time);
        }
    }

    /**
     * Resolve the drop point for spawning, based on the location config.
     *
     * - `"exact"`: Uses the configured x/y coordinates.
     * - `"in_region"`: Picks a random point inside the parent region by
     *   sampling within the region's bounding box until a point inside
     *   the polygon is found.
     *
     * @returns {x, y} in canvas coordinates, or null if no valid point found
     */
    private _getDropPoint(): { x: number; y: number } | null {
        const data = this.system as SohlEncounterDataModel;
        const { location } = data;

        if (location.kind === LOCATION_KIND.EXACT) {
            return { x: location.x, y: location.y };
        }

        // in_region: get a random point within the parent region
        const region = this.parent as any;
        if (!region?.bounds) return null;

        const bounds = region.bounds;
        const maxAttempts = 100;
        for (let i = 0; i < maxAttempts; i++) {
            const x = bounds.x + Math.random() * bounds.width;
            const y = bounds.y + Math.random() * bounds.height;
            if (region.testPoint?.({ x, y })) {
                return { x, y };
            }
        }

        // Fallback: center of bounds
        return {
            x: bounds.x + bounds.width / 2,
            y: bounds.y + bounds.height / 2,
        };
    }

    /**
     * Spawn the cohort associated with this encounter.
     *
     * Resolves the cohort actor, determines the drop point from the
     * location config, and delegates to {@link handleCohortDrop} which
     * shows the GM a dialog to choose group or individual placement.
     */
    private async _spawnCohort(): Promise<void> {
        const data = this.system as SohlEncounterDataModel;
        const cohortActor = game.actors?.get(data.cohort.id) as any;
        if (!cohortActor) {
            console.warn(
                `SoHL | Encounter "${this.name}": cohort actor ${data.cohort.id} not found`,
            );
            return;
        }

        if (cohortActor.type !== ACTOR_KIND.COHORT) {
            console.warn(
                `SoHL | Encounter "${this.name}": actor ${data.cohort.id} is not a Cohort`,
            );
            return;
        }

        const dropPoint = this._getDropPoint();
        if (!dropPoint) {
            console.warn(
                `SoHL | Encounter "${this.name}": could not determine spawn location`,
            );
            return;
        }

        await handleCohortDrop(cohortActor, {
            x: dropPoint.x,
            y: dropPoint.y,
        });
    }

    /**
     * Calculate the next check time aligned to the interval boundary
     * and register it with the event queue.
     *
     * Check times are aligned to `worldTime % interval === 0` boundaries.
     * For example, with a 4-hour (14400s) interval, checks occur at
     * worldTime 0, 14400, 28800, etc.
     *
     * @param encounter - The encounter document
     * @param currentTime - The current or just-processed event time
     */
    static scheduleNextCheck(
        encounter: SohlEncounter,
        currentTime: number,
    ): void {
        const data = encounter.system as SohlEncounterDataModel;
        const { trigger } = data;

        // Don't schedule if disabled or max reached
        if (data.disabled) return;
        if (trigger.max > 0 && trigger.count >= trigger.max) return;

        const interval = trigger.interval;
        if (interval <= 0) return;

        // Next time that is a multiple of interval and strictly after currentTime
        const nextTime = (Math.floor(currentTime / interval) + 1) * interval;

        sohl.events.registerEvent(
            encounter.uuid,
            ENCOUNTER_EVENT_KIND,
            nextTime,
        );
    }

    /**
     * Register the initial encounter check event when the document is
     * prepared. Called during the Foundry document lifecycle.
     */
    override prepareData(): void {
        super.prepareData();
        const data = this.system as SohlEncounterDataModel;

        // Only schedule if not disabled, not maxed out, and has a valid interval
        if (data.disabled) return;
        if (data.trigger.max > 0 && data.trigger.count >= data.trigger.max)
            return;
        if (data.trigger.interval <= 0) return;

        SohlEncounter.scheduleNextCheck(this, game.time.worldTime);
    }
}

function defineSohlEncounterDataSchema(): foundry.data.fields.DataSchema {
    return {
        /** The cohort that appears when this encounter triggers. */
        cohort: new foundry.data.fields.SchemaField({
            /** Document ID of the cohort actor. */
            id: new foundry.data.fields.DocumentIdField({
                required: true,
            }),
            /** Display name override (null = use the cohort's own name). */
            name: new foundry.data.fields.StringField({
                nullable: true,
                initial: null,
            }),
            /** Whether the spawned token is linked to the world actor. */
            isLinked: new foundry.data.fields.BooleanField({
                initial: false,
            }),
        }),
        /** Trigger conditions and state. */
        trigger: new foundry.data.fields.SchemaField({
            /** Maximum number of times this encounter can trigger (0 = unlimited). */
            max: new foundry.data.fields.NumberField({
                integer: true,
                initial: 0,
                min: 0,
            }),
            /** Number of times this encounter has triggered so far. */
            count: new foundry.data.fields.NumberField({
                integer: true,
                initial: 0,
                min: 0,
            }),
            /** Minimum seconds between successful triggers. */
            cooldown: new foundry.data.fields.NumberField({
                integer: true,
                initial: 1,
                min: 1,
            }),
            /** Seconds between encounter checks, aligned to world time boundaries. */
            interval: new foundry.data.fields.NumberField({
                integer: true,
                initial: 14400, // 4 hours
                min: 1,
            }),
            /** World time (seconds) of the most recent successful trigger. */
            lastOccured: new foundry.data.fields.NumberField({
                integer: true,
                initial: 0,
                min: 0,
            }),
            /** Probability of triggering on each check (0 = never, 1 = always). */
            probability: new foundry.data.fields.NumberField({
                initial: 1,
                min: 0,
                max: 1,
            }),
        }),
        /** Where to place the spawned cohort token(s). */
        location: new foundry.data.fields.SchemaField({
            /** Placement mode: "exact" for fixed coordinates, "in_region" for random within region. */
            kind: new foundry.data.fields.StringField({
                initial: LOCATION_KIND.IN_REGION,
                choices: Object.values(LOCATION_KIND),
                required: true,
            }),
            /** X coordinate (canvas pixels), used when kind is "exact". */
            x: new foundry.data.fields.NumberField({
                integer: true,
                initial: 0,
                min: 0,
            }),
            /** Y coordinate (canvas pixels), used when kind is "exact". */
            y: new foundry.data.fields.NumberField({
                integer: true,
                initial: 0,
                min: 0,
            }),
        }),
        /** Whether this encounter is currently active. */
        disabled: new foundry.data.fields.BooleanField({
            initial: false,
        }),
    };
}

type SohlEncounterDataSchema = ReturnType<typeof defineSohlEncounterDataSchema>;

/**
 * Data model for the SoHL Encounter region behavior.
 *
 * Stores the cohort reference, trigger state, and scheduling configuration.
 * See {@link SohlEncounter} for the behavior logic.
 */
export class SohlEncounterDataModel<
    TSchema extends foundry.data.fields.DataSchema = SohlEncounterDataSchema,
> extends foundry.abstract.TypeDataModel<TSchema, SohlEncounter> {
    static override readonly LOCALIZATION_PREFIXES = ["SOHL.Encounter"];
    static readonly kind = "sohlencounter";

    /** The cohort actor to spawn when the encounter triggers. */
    cohort!: { id: string; name: string | null; isLinked: boolean };

    /** Trigger conditions, limits, and scheduling state. */
    trigger!: {
        /** Maximum triggers allowed (0 = unlimited). */
        max: number;
        /** Number of times triggered so far. */
        count: number;
        /** Minimum seconds between successful triggers. */
        cooldown: number;
        /** Seconds between encounter checks. */
        interval: number;
        /** World time of the most recent successful trigger. */
        lastOccured: number;
        /** Probability of triggering per check (0–1). */
        probability: number;
    };

    /** Where to place the spawned cohort token(s). */
    location!: {
        /** "exact" for fixed coordinates, "in_region" for random within region. */
        kind: string;
        /** X coordinate (canvas pixels), used when kind is "exact". */
        x: number;
        /** Y coordinate (canvas pixels), used when kind is "exact". */
        y: number;
    };

    /** Whether this encounter is disabled. */
    disabled!: boolean;

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineSohlEncounterDataSchema();
    }
}

/**
 * Configuration sheet for SoHL Encounter region behaviors.
 *
 * Extends the base behavior config with encounter-specific fields:
 * cohort selection, trigger limits, cooldown, and probability.
 */
export class SohlEncounterConfig
    extends foundry.applications.sheets.RegionBehaviorConfig
{
    static override DEFAULT_OPTIONS = {
        classes: ["sohl", "encounter-config"],
    };

    static override PARTS: Record<string, any> = {
        form: {
            template:
                "systems/sohl/templates/region-behavior/encounter-config.hbs",
            scrollable: [""],
        },
        footer: {
            template: "templates/generic/form-footer.hbs",
        },
    };

    override async _prepareContext(options: any): Promise<any> {
        const context = await super._prepareContext(options);
        const dataModel = this.document.system as SohlEncounterDataModel;
        return Object.assign(context, {
            cohort: dataModel.cohort,
            trigger: dataModel.trigger,
            location: dataModel.location,
            disabled: dataModel.disabled,
        });
    }
}
