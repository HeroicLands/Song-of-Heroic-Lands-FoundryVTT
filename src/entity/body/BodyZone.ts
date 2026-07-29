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

import type { BodyStructure } from "@src/entity/body/BodyStructure";
import type { BodyPart } from "@src/entity/body/BodyPart";
import type { BodyLocation } from "@src/entity/body/BodyLocation";
import type { Rng } from "@src/entity/random/Rng";
import { entity } from "@src/entity/registry";
import { registerEntity } from "@src/entity/entityRegistry";
import { weightedRandom } from "@src/entity/body/weighted-random";
import { defaultRng } from "@src/entity/random/createRng";
import { isA } from "@src/utils/constants";
import { SohlEntity } from "../SohlEntity";

/**
 * A broad anatomical region grouping one or more {@link BodyPart | body parts}
 * — e.g. "Head" (holding the head part), "Arms" (holding the left and right
 * arms), "Legs".
 *
 * Zones are the **first stage of hit determination**. Each zone owns a
 * contiguous run of *zone numbers* sized by its {@link BodyZone.Data.probWeight},
 * allocated in persisted order across the whole body — so a body whose zones
 * weigh 3 / 5 / 2 hands out `1–3`, `4–8`, `9–10`. A single roll against
 * {@link sohl.entity.body.BodyStructure.maxZoneNumber} therefore selects a
 * zone; the part and location draws follow inside it.
 *
 * **Persistence:** zones are stored in the flat `body.structure.zones` array.
 * A zone does *not* nest its parts — parts declare their owner via
 * {@link sohl.entity.body.BodyPart.Data.bodyZoneCode}, and
 * {@link sohl.entity.body.BodyStructure} assembles the hierarchy at
 * construction.
 *
 * **Lifecycle:** Rebuilt from persisted schema data on every preparation
 * cycle. May be mutated during the lifecycle (e.g., modifiers applied by
 * active effects), but mutations are not persisted — they are recomputed
 * on the next cycle.
 */
export class BodyZone extends SohlEntity {
    /** Unique zone identifier within the body structure (e.g. `"arms"`). */
    readonly shortcode: string;
    /** Display name of this zone (falls back to the shortcode). */
    readonly name: string;
    /**
     * The contiguous run of zone numbers this zone answers to, e.g.
     * `[4, 5, 6, 7, 8]`. Sized by the persisted {@link BodyZone.Data.probWeight}
     * and allocated at construction. Empty when the zone has no weight (it can
     * never be rolled).
     *
     * The weight is deliberately **not** wrapped in a `ValueModifier`: a zone's
     * numbers are positional — changing one zone's weight shifts every later
     * zone's run — so the allocation has to come from the persisted value alone.
     * An active effect that could move the ranges mid-cycle would desync every
     * zone above it.
     */
    readonly zoneNumbers: number[];
    /** Body parts belonging to this zone, in persisted order. */
    readonly parts: BodyPart[];
    /** Back-reference to the owning {@link BodyStructure}. */
    readonly structure: BodyStructure;
    /** Zero-based index of this zone within the flat `structure.zones` array. */
    readonly index: number;

    /**
     * Builds a single body zone from its persisted data and constructs the
     * child parts handed to it by {@link BodyStructure}.
     *
     * @param data - Persisted zone data.
     * @param options - Construction options
     * @param options.parent - Owning {@link sohl.document.actor.logic.BeingLogic} (the body's owner) for this zone.
     * @param options.structure - Owning {@link BodyStructure} for this zone.
     * @param options.index - Zero-based index of this zone within the flat `zones` array.
     * @param options.startZoneNumber - The first zone number allocated to this zone.
     * @param options.parts - This zone's parts, each paired with its flat `parts` index.
     * @param options.locations - Every location in the body, each paired with its flat `locations` index.
     * @throws If required fields are missing from `data` or `options`.
     */
    constructor(data: BodyZone.Data, options: BodyZone.Options) {
        if (!isA(options.parent, "SohlLogic")) {
            throw new Error("Requires a Logic parent");
        }
        if (!options.structure) {
            throw new Error("BodyZone requires a structure");
        }
        if (options.index === undefined) {
            throw new Error("BodyZone requires an index");
        }
        if (!data.shortcode) {
            throw new Error("BodyZone requires a shortcode in data");
        }
        super(data, options);
        this.shortcode = data.shortcode;
        this.name = data.name || data.shortcode;
        const weight = Math.max(0, Math.trunc(data.probWeight ?? 0));
        this.zoneNumbers = Array.from(
            { length: weight },
            (_, i) => options.startZoneNumber + i,
        );
        this.index = options.index;
        this.structure = options.structure;
        this.parts = options.parts.map(
            ({ data: partData, index }) =>
                new entity.BodyPart(partData, {
                    parent: this.parent,
                    zone: this,
                    index,
                    locations: options.locations.filter(
                        (l) => l.data.bodyPartCode === partData.shortcode,
                    ),
                }),
        );
    }

    /**
     * The dot-notation path prefix for Foundry `update()` calls targeting this
     * zone's persisted fields, e.g. `"system.body.structure.zones.1"`.
     */
    get updatePath(): string {
        return `system.body.structure.zones.${this.index}`;
    }

    /** Every hit location beneath this zone, across all of its parts. */
    get locations(): BodyLocation[] {
        return this.parts.flatMap((p) => p.locations);
    }

    /**
     * Whether the given zone number falls within this zone's allocated run.
     *
     * @param zoneNumber - The rolled zone number.
     * @returns `true` when this zone owns that number.
     */
    ownsZoneNumber(zoneNumber: number): boolean {
        return this.zoneNumbers.includes(zoneNumber);
    }

    /**
     * Find a part in this zone by shortcode, or undefined if not found.
     * @param shortcode - Shortcode of the part to find.
     * @returns The matching part, or undefined if none matches.
     */
    getPartByCode(shortcode: string): BodyPart | undefined {
        return this.parts.find((part) => part.shortcode === shortcode);
    }

    /**
     * Find a part by its position **within this zone**, or undefined if out of
     * range. Note this is the zone-relative position, not the part's
     * {@link BodyPart.index} into the flat `parts` array.
     * @param position - Zero-based position of the part within this zone.
     * @returns The part at that position, or undefined if out of range.
     */
    getPartByPosition(position: number): BodyPart | undefined {
        return this.parts[position];
    }

    /**
     * Select a random part within this zone, weighted by each part's
     * {@link BodyPart.probWeight}.
     * @param rng - The random source; defaults to the shared {@link sohl.random}
     *   singleton. Inject a seeded generator to make selection reproducible.
     * @returns A randomly selected part.
     * @throws If the zone holds no parts.
     */
    getRandomPart(rng: Rng = defaultRng()): BodyPart {
        return weightedRandom(this.parts, rng);
    }

    /**
     * Build an `update()` payload that appends a new part to this zone,
     * stamping it with this zone's shortcode. The part lands at the end of the
     * flat `parts` array — and so at the end of this zone's parts.
     *
     * @param partData - Persisted data for the part to append; its
     *   `bodyZoneCode` is overwritten with this zone's shortcode.
     * @returns A complete-array `update()` payload appending the part.
     */
    addPartUpdate(partData: BodyPart.Data): PlainObject {
        return this.structure.addPartUpdate({
            ...partData,
            bodyZoneCode: this.shortcode,
        });
    }

    /**
     * Build an `update()` payload that removes a part of this zone by
     * shortcode, cascading to that part's hit locations.
     *
     * @param shortcode - Shortcode of the part to remove.
     * @returns A complete-array `update()` payload with the part and its
     *   locations removed, or `{}` when this zone has no such part.
     */
    removePartUpdate(shortcode: string): PlainObject {
        if (!this.getPartByCode(shortcode)) return {};
        return this.structure.removePartUpdate(shortcode);
    }
}

export namespace BodyZone {
    /** Kind tag used by the kind registry and serialization. */
    export const Kind: string = "BodyZone";

    /** Persisted data shape for a body zone. */
    export interface Data extends SohlEntity.Data {
        /** Unique zone identifier within the body structure. */
        shortcode: string;
        /** Display name of the zone (e.g. "Arms"); falls back to the shortcode. */
        name?: string;
        /**
         * How many zone numbers this zone claims; sizes its run of
         * {@link BodyZone.zoneNumbers}. `0` makes the zone unrollable. Read
         * straight off the persisted data — never modifier-wrapped, since the
         * runs are positional across all zones.
         */
        probWeight: number;
    }

    /**
     * A persisted child record paired with its index in the flat
     * `body.structure` array it lives in. Threaded down from
     * {@link BodyStructure} so every entity knows the flat index its update
     * helpers must address.
     *
     * @typeParam T - The persisted child data shape.
     */
    export interface Indexed<T> {
        /** The persisted child data. */
        data: T;
        /** The child's zero-based index in its flat structure array. */
        index: number;
    }

    /** Construction options for a {@link BodyZone} instance. */
    export interface Options extends SohlEntity.Options {
        /** Owning body structure (supplies actor and body-owner logic). */
        structure: BodyStructure;
        /** Zero-based index of this zone within the flat `zones` array. */
        index: number;
        /** The first zone number allocated to this zone. */
        startZoneNumber: number;
        /** This zone's parts, each paired with its flat `parts` index. */
        parts: Indexed<BodyPart.Data>[];
        /** Every location in the body, each paired with its flat `locations` index. */
        locations: Indexed<BodyLocation.Data>[];
    }
}
registerEntity("BodyZone", BodyZone);
