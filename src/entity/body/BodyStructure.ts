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

import { entity } from "@src/entity/registry";
import { registerEntity } from "@src/entity/entityRegistry";
import type { BodyPart } from "@src/entity/body/BodyPart";
import type { BodyLocation } from "@src/entity/body/BodyLocation";
import type { BodyZone } from "@src/entity/body/BodyZone";
import { weightedRandom } from "@src/entity/body/weighted-random";
import {
    moveArrayElement,
    moveGroupedElement,
} from "@src/entity/body/body-structure-edit";
import type { Rng } from "@src/entity/random/Rng";
import { defaultRng } from "@src/entity/random/createRng";
import { SohlEntity } from "../SohlEntity";
import { isA, BASE_INJURY_THRESHOLDS } from "@src/utils/constants";
import type { BodyRole } from "@src/utils/constants";

/**
 * The complete anatomical structure of a Being — its zones, body parts, and
 * hit locations.
 *
 * **Storage is flat; the hierarchy is derived.** The persisted data holds three
 * sibling arrays — {@link BodyStructure.Data.zones | zones},
 * {@link BodyStructure.Data.parts | parts}, and
 * {@link BodyStructure.Data.locations | locations} — where each child names its
 * parent by shortcode (`bodyZoneCode` / `bodyPartCode`). The constructor
 * assembles them into the Zone → Part → Location tree exposed by
 * {@link BodyStructure.zones}. Flat storage keeps every `update()` a
 * single whole-array write (see {@link setPartFieldsUpdate}) instead of
 * the nested rewrite a tree would force.
 *
 * Every entity's `index` is its position in its **flat** array, so
 * `structure.parts[i].index === i` and each `updatePath` is a plain two-segment
 * path. Position *within* a parent is the child's relative order in the flat
 * array.
 *
 * **Hit determination** runs top down: each zone owns a contiguous run of zone
 * numbers sized by its weight — contiguous and gap-free across the body, so
 * they run `1..`{@link maxZoneNumber} — and one roll against that range picks a
 * zone ({@link getRandomZone}), then a weighted part inside it, then a weighted
 * location.
 *
 * **Lifecycle:** This object is rebuilt from persisted schema data on every
 * preparation cycle. It may be mutated during the lifecycle (e.g., active
 * effects adding ValueModifier deltas to protection values), but those
 * changes are not persisted — they are recomputed on the next cycle.
 * To persist changes, modify the underlying DataModel fields directly
 * (via form submission or `document.update()`).
 */
export class BodyStructure extends SohlEntity {
    /** All body zones, in persisted order — the root of the derived hierarchy. */
    readonly zones: BodyZone[];
    /**
     * Every body part reachable in the hierarchy, ordered by its index into the
     * flat `parts` array (so `parts[i].index === i` for a body with no
     * {@link orphanedParts}).
     */
    readonly parts: BodyPart[];
    /**
     * Every hit location reachable in the hierarchy, ordered by its index into
     * the flat `locations` array.
     */
    readonly locations: BodyLocation[];
    /**
     * Persisted parts whose `bodyZoneCode` names no existing zone. They are
     * absent from the hierarchy but preserved in storage, so a mis-typed zone
     * code loses nothing — fix the code and the part reappears.
     */
    readonly orphanedParts: readonly BodyPart.Data[];
    /**
     * Persisted locations whose `bodyPartCode` names no reachable part. As with
     * {@link orphanedParts}, they stay in storage and out of the hierarchy.
     */
    readonly orphanedLocations: readonly BodyLocation.Data[];

    /**
     * Builds the domain body structure, assembling the three flat persisted
     * arrays into the Zone → Part → Location hierarchy and allocating each
     * zone its run of zone numbers.
     *
     * @param data - Persisted body-structure data
     * @param data.zones - The persisted body zones array
     * @param data.parts - The persisted body parts array
     * @param data.locations - The persisted hit locations array
     * @param options - Construction options
     * @param options.parent - The owning {@link sohl.document.actor.logic.BeingLogic} (the body's owner) for this structure
     * @throws If required fields are missing from `data` or `options`.
     */
    constructor(data: BodyStructure.Data, options: BodyStructure.Options) {
        if (!isA(options.parent, "SohlLogic")) {
            throw new Error("Requires a Logic parent");
        }
        for (const key of ["zones", "parts", "locations"] as const) {
            if (!data[key] || !Array.isArray(data[key])) {
                throw new Error(
                    `BodyStructure requires a '${key}' array in its data`,
                );
            }
        }
        super(data, options);

        // Pair every persisted child with its flat index up front, so each
        // entity is handed the index its update helpers must address.
        const indexedParts = data.parts.map((d, index) => ({ data: d, index }));
        const indexedLocations = data.locations.map((d, index) => ({
            data: d,
            index,
        }));

        // Zone numbers are allocated in persisted zone order: a body weighing
        // 3 / 5 / 2 hands out 1–3, 4–8, 9–10.
        let nextZoneNumber = 1;
        this.zones = data.zones.map((zoneData, index) => {
            const zone = new entity.BodyZone(zoneData, {
                parent: this.parent,
                structure: this,
                index,
                startZoneNumber: nextZoneNumber,
                parts: indexedParts.filter(
                    (p) => p.data.bodyZoneCode === zoneData.shortcode,
                ),
                locations: indexedLocations,
            });
            nextZoneNumber += zone.zoneNumbers.length;
            return zone;
        });

        const byIndex = <T extends { index: number }>(a: T, b: T): number =>
            a.index - b.index;
        this.parts = this.zones.flatMap((z) => z.parts).sort(byIndex);
        this.locations = this.parts.flatMap((p) => p.locations).sort(byIndex);

        const liveParts = new Set(this.parts.map((p) => p.index));
        const liveLocations = new Set(this.locations.map((l) => l.index));
        this.orphanedParts = indexedParts
            .filter((p) => !liveParts.has(p.index))
            .map((p) => p.data);
        this.orphanedLocations = indexedLocations
            .filter((l) => !liveLocations.has(l.index))
            .map((l) => l.data);
    }

    /**
     * The struck-creature injury-level thresholds, scaled by the owning being's
     * `bodyScale`. Falls back to the human {@link BASE_INJURY_THRESHOLDS} when the
     * being has not derived a table yet (e.g. before its evaluate phase). Used
     * by `injuryLevelFromImpact` so an absolute impact reads size-correct.
     */
    get injuryTable(): readonly number[] {
        return (
            (this.parent as unknown as { injuryTable?: readonly number[] })
                .injuryTable ?? BASE_INJURY_THRESHOLDS
        );
    }

    /**
     * The highest zone number on this body — the `N` of the `1..N` run.
     *
     * Zone numbers are handed out in persisted zone order, each zone taking a
     * contiguous block sized by its `probWeight`, so across the whole body they
     * are **contiguous, unique, gap-free, and monotonically increasing by 1
     * from 1**. That makes this both the sum of every zone's weight and the
     * upper bound of the zone roll — they are the same number by construction.
     * A zero-weight zone claims no numbers and does not interrupt the run.
     *
     * `0` for a body with no weighted zones (an incorporeal being), which makes
     * {@link getRandomZone} return `undefined`.
     */
    get maxZoneNumber(): number {
        return this.zones.reduce((sum, z) => sum + z.zoneNumbers.length, 0);
    }

    /* -------------------------------------------- */
    /*  Lookups                                      */
    /* -------------------------------------------- */

    /**
     * Find a zone by shortcode, or undefined if not found.
     *
     * @param shortcode - The zone shortcode to look up.
     * @returns The matching zone, or `undefined` if none exists.
     */
    getZoneByCode(shortcode: string): BodyZone | undefined {
        return this.zones.find((z) => z.shortcode === shortcode);
    }

    /**
     * Find a zone by its index into the flat `zones` array.
     *
     * @param index - The zero-based index into the zones array.
     * @returns The zone at that index, or `undefined` if out of range.
     */
    getZoneByIndex(index: number): BodyZone | undefined {
        return this.zones.find((z) => z.index === index);
    }

    /**
     * Find the zone owning a given zone number (as rolled against
     * {@link maxZoneNumber}).
     *
     * Because the runs are contiguous and gap-free, every integer in
     * `1..maxZoneNumber` resolves to exactly one zone. Anything else — `0` or
     * below, above {@link maxZoneNumber}, or a non-integer — is not a zone
     * number on this body and yields `undefined`.
     *
     * @param zoneNumber - The rolled zone number, `1`-based.
     * @returns The zone owning that number, or `undefined` when the body has no
     *   such zone number.
     */
    getZoneByNumber(zoneNumber: number): BodyZone | undefined {
        return this.zones.find((z) => z.ownsZoneNumber(zoneNumber));
    }

    /**
     * Find a part by shortcode, or undefined if not found.
     *
     * @param shortcode - The body part shortcode to look up.
     * @returns The matching part, or `undefined` if none exists.
     */
    getPartByCode(shortcode: string): BodyPart | undefined {
        return this.parts.find((p) => p.shortcode === shortcode);
    }

    /**
     * Find a part by its index into the flat `parts` array.
     *
     * @param index - The zero-based index into the parts array.
     * @returns The part at that index, or `undefined` if out of range.
     */
    getPartByIndex(index: number): BodyPart | undefined {
        return this.parts.find((p) => p.index === index);
    }

    /**
     * Find a hit location by shortcode. Location shortcodes are unique across
     * the whole body, not merely within their part.
     *
     * @param shortcode - The location shortcode to look up.
     * @returns The matching location, or `undefined` if none exists.
     */
    getLocationByCode(shortcode: string): BodyLocation | undefined {
        return this.locations.find((l) => l.shortcode === shortcode);
    }

    /**
     * Find a hit location by its index into the flat `locations` array.
     *
     * @param index - The zero-based index into the locations array.
     * @returns The location at that index, or `undefined` if out of range.
     */
    getLocationByIndex(index: number): BodyLocation | undefined {
        return this.locations.find((l) => l.index === index);
    }

    /**
     * Get all locations from all parts as a flat array.
     *
     * @returns Every location across all parts, in persisted order.
     */
    getAllLocations(): BodyLocation[] {
        return [...this.locations];
    }

    /**
     * Every body part carrying the given {@link sohl.utils.BODY_ROLE} — e.g.
     * all `VITAL` parts. A part can hold several roles, so a part is included
     * when its {@link BodyPart.roles} contains `role`.
     *
     * @param role - The body-role to filter by (a `BODY_ROLE` value).
     * @returns The parts with that role, in persisted order (empty if none).
     */
    getPartsByRole(role: BodyRole | string): BodyPart[] {
        return this.parts.filter((p) => p.roles.includes(role));
    }

    /**
     * The parts a strike drifts to when it misses `partCode` — the nearest ring
     * of anatomy; adjacency is implied by the zone tree.
     *
     * The nearest ring is the part's own **zone siblings**; when those are
     * exhausted the search widens one zone at a time by index distance (both
     * directions at once, so a zone's two neighbours rank equally). Only the
     * closest non-empty ring is returned, drifting exactly one adjacency step.
     *
     * @param partCode - The shortcode of the part being drifted away from.
     * @param exclude - Shortcodes already visited, skipped at every ring.
     * @returns The nearest ring of candidate parts, or empty when none remain.
     */
    getNeighborParts(
        partCode: string,
        exclude: ReadonlySet<string> = new Set(),
    ): BodyPart[] {
        const part = this.getPartByCode(partCode);
        if (!part) return [];
        const eligible = (p: BodyPart): boolean =>
            p.shortcode !== partCode && !exclude.has(p.shortcode);

        const siblings = part.zone.parts.filter(eligible);
        if (siblings.length) return siblings;

        const home = this.zones.indexOf(part.zone);
        const reach = Math.max(home, this.zones.length - 1 - home);
        for (let distance = 1; distance <= reach; distance++) {
            const ring = [
                this.zones[home - distance],
                this.zones[home + distance],
            ]
                .filter((z): z is BodyZone => z !== undefined)
                .flatMap((z) => z.parts)
                .filter(eligible);
            if (ring.length) return ring;
        }
        return [];
    }

    /**
     * The number of item-holding limbs currently gripping the item with the
     * given id. A limb counts only if it both {@link BodyPart.canHoldItem | can
     * hold an item} and holds that specific item. Used to decide whether a
     * held weapon's strike modes are available (a mode needs at least its
     * `minParts` limbs).
     *
     * @param itemId - The id of the held item to count grips for.
     * @returns The number of limbs currently gripping that item.
     */
    limbsHolding(itemId: string): number {
        return this.parts.filter(
            (p) => p.canHoldItem && p.heldItem?.id === itemId,
        ).length;
    }

    /* -------------------------------------------- */
    /*  Random selection                             */
    /* -------------------------------------------- */

    /**
     * Roll a zone number in `1..`{@link maxZoneNumber} and return the zone
     * owning it. Zones with no weight own no numbers and can never be rolled.
     *
     * @param rng - The random source; defaults to the shared {@link sohl.random}
     *   singleton. Inject a seeded generator for a deterministic draw.
     * @returns The selected zone, or `undefined` when the body has no weighted
     *   zones.
     */
    getRandomZone(rng: Rng = defaultRng()): BodyZone | undefined {
        const total = this.maxZoneNumber;
        if (total <= 0) return undefined;
        return this.getZoneByNumber(Math.ceil(rng.float() * total));
    }

    /**
     * Roll a zone the way {@link getRandomZone} does, but over only those zones
     * that actually hold a part — each drawn with probability
     * `weight / (sum of the occupied zones' weights)`.
     *
     * A weighted zone with no parts is unhittable, so including it would leak
     * its share of the roll into a body-wide fallback and skew every other
     * zone's true frequency. Restricting the draw keeps
     * `P(part) = P(zone) x P(part | zone)` exact for any authored body.
     *
     * @param rng - The random source; defaults to the shared {@link sohl.random}
     *   singleton.
     * @returns The selected zone, or `undefined` when no weighted zone holds a
     *   part.
     */
    getRandomOccupiedZone(rng: Rng = defaultRng()): BodyZone | undefined {
        const eligible = this.zones.filter(
            (z) => z.zoneNumbers.length > 0 && z.parts.length > 0,
        );
        const total = eligible.reduce(
            (sum, z) => sum + z.zoneNumbers.length,
            0,
        );
        if (total <= 0) return undefined;
        let roll = rng.float() * total;
        for (const zone of eligible) {
            roll -= zone.zoneNumbers.length;
            if (roll <= 0) return zone;
        }
        return eligible[eligible.length - 1];
    }

    /**
     * Select a random body part with the given {@link sohl.utils.BODY_ROLE},
     * weighted by each candidate's `probWeight` (via {@link weightedRandom}).
     * Used to pick an unaimed target — e.g. a random `VITAL` part for the
     * Resolve Injury flow when no body part is specified.
     *
     * @param role - The body-role to draw from (a `BODY_ROLE` value).
     * @param rng - The random source; defaults to the shared {@link sohl.random}
     *   singleton. Inject a seeded generator for a deterministic draw.
     * @returns A random part with that role, or `undefined` when none exists.
     */
    getRandomPartByRole(
        role: BodyRole | string,
        rng: Rng = defaultRng(),
    ): BodyPart | undefined {
        const candidates = this.getPartsByRole(role);
        if (candidates.length === 0) return undefined;
        return weightedRandom(candidates, rng);
    }

    /**
     * Select a random body part.
     *
     * Without parameters, hit determination runs top down and is weighted at
     * every tier: roll a zone weighted by its `probWeight`
     * ({@link getRandomOccupiedZone}), then draw a part inside it weighted by
     * {@link BodyPart.probWeight}. So
     * `P(part) = P(zone) x P(part | zone)`, and with the location draw that
     * follows in {@link getRandomLocation}, each tier's odds are that entry's
     * weight over the sum of its siblings' weights.
     *
     * With a `target` parameter, simulates aimed strikes with spread drift:
     * 1. Roll a random number from 1 to `spread`.
     * 2. If the roll ≤ the current part's `probWeight`, that part is hit.
     * 3. Otherwise, reduce `spread` by the part's `probWeight`, pick a
     *    random part from the nearest ring of {@link getNeighborParts}, and
     *    repeat from step 2.
     * 4. If no unvisited neighbour remains, the current part is hit.
     *
     * This models the idea that a more accurate attack is more likely to
     * hit the intended target, while a less accurate one drifts outward
     * through the zone tree to neighbouring anatomy.
     *
     * @param target - Optional aimed-strike parameters; omit for pure weighted
     *   selection.
     * @param target.targetPart - The intended part to aim at.
     * @param target.spread - The accuracy spread driving drift.
     * @param rng - The random source; defaults to the shared {@link sohl.random}
     *   singleton. Inject a seeded generator to force a hit location
     *   deterministically end to end.
     * @returns The selected body part.
     * @throws If the body has no parts at all.
     */
    getRandomPart(
        target?: { targetPart: BodyPart; spread: number },
        rng: Rng = defaultRng(),
    ): BodyPart {
        if (!target) {
            const zone = this.getRandomOccupiedZone(rng);
            if (zone) return zone.getRandomPart(rng);
            // No weighted zone holds a part (an unweighted or half-authored
            // body); fall back to a body-wide draw so a part still comes out.
            return weightedRandom(this.parts, rng);
        }

        let currentPart = target.targetPart;
        let remainingSpread = target.spread;
        const visited = new Set<string>();

        while (true) {
            visited.add(currentPart.shortcode);

            // If spread <= probWeight, this part is always hit
            if (remainingSpread <= currentPart.probWeight.effective) {
                return currentPart;
            }

            // Roll 1..remainingSpread; hit if roll <= probWeight. `ceil(float() *
            // spread)` reproduces the former Math.random distribution exactly
            // (including fractional spread), now from the seedable stream.
            const roll = Math.ceil(rng.float() * remainingSpread);
            if (roll <= currentPart.probWeight.effective) {
                return currentPart;
            }

            // Miss — reduce spread and drift outward through the zone tree
            remainingSpread -= currentPart.probWeight.effective;
            const neighbors = this.getNeighborParts(
                currentPart.shortcode,
                visited,
            );

            if (neighbors.length === 0) {
                // Nowhere left to drift — hit current part
                return currentPart;
            }

            currentPart = weightedRandom(neighbors, rng);
        }
    }

    /**
     * Select a random location using the full top-down draw: pick a part
     * (optionally with aimed targeting), then pick a location within that
     * part (weighted).
     *
     * @param target - Optional aimed-strike parameters; omit for pure weighted
     *   selection.
     * @param target.targetPart - The intended part to aim at.
     * @param target.spread - The accuracy spread driving drift.
     * Unaimed, the composite odds of any one location are
     * `(zone weight / total zone weight) x (part weight / its zone's part weights)
     * x (location weight / its part's location weights)`.
     *
     * @param rng - The random source; defaults to the shared {@link sohl.random}
     *   singleton. Inject a seeded generator to force a hit location
     *   deterministically end to end (zone, part, and location all draw from it).
     * @returns The selected body location.
     */
    getRandomLocation(
        target?: {
            targetPart: BodyPart;
            spread: number;
        },
        rng: Rng = defaultRng(),
    ): BodyLocation {
        return this.getRandomPart(target, rng).getRandomLocation(rng);
    }

    /* -------------------------------------------- */
    /*  Update payloads — zones                      */
    /* -------------------------------------------- */

    /**
     * Build an `update()` payload that appends a new zone to the persisted
     * structure. Sources the current array from the canonical DataModel data,
     * not from the (possibly mutated) domain objects.
     *
     * @param zoneData - The persisted data for the zone to append.
     * @returns A complete-array `update()` payload appending the zone.
     */
    addZoneUpdate(zoneData: BodyZone.Data): PlainObject {
        return {
            "system.body.structure.zones": [...this.#canonicalZones, zoneData],
        };
    }

    /**
     * Build an `update()` payload that removes a zone by shortcode, **cascading
     * to every part in that zone and every location on those parts** — a zone
     * is never removed out from under its descendants.
     *
     * @param shortcode - The shortcode of the zone to remove.
     * @returns A complete-array `update()` payload spanning all three arrays.
     */
    removeZoneUpdate(shortcode: string): PlainObject {
        const doomedParts = new Set(
            this.#canonicalParts
                .filter((p) => p.bodyZoneCode === shortcode)
                .map((p) => p.shortcode),
        );
        return {
            "system.body.structure.zones": this.#canonicalZones.filter(
                (z) => z.shortcode !== shortcode,
            ),
            "system.body.structure.parts": this.#canonicalParts.filter(
                (p) => p.bodyZoneCode !== shortcode,
            ),
            "system.body.structure.locations": this.#canonicalLocations.filter(
                (l) => !doomedParts.has(l.bodyPartCode),
            ),
        };
    }

    /**
     * Build an `update()` payload that relocates a zone within the persisted
     * `zones` array (drag-to-sort). Zones have no `sort` field — their order
     * *is* their array order, and it determines zone-number allocation — so
     * reordering rewrites the whole array.
     *
     * @param fromIndex - The zone's current index.
     * @param toIndex - The destination index.
     * @returns A complete-array `update()` payload with the zone relocated.
     */
    moveZoneUpdate(fromIndex: number, toIndex: number): PlainObject {
        return {
            "system.body.structure.zones": moveArrayElement(
                this.#canonicalZones,
                fromIndex,
                toIndex,
            ),
        };
    }

    /**
     * Build an `update()` payload that sets fields on one or more zones,
     * addressed by flat index, by rewriting the **entire** `zones` array.
     *
     * @param updates - One `{ index, changes }` per zone to modify; `changes`
     *   is a partial of that zone's persisted fields. Out-of-range indices are
     *   ignored.
     * @returns A complete-array `update()` payload, or `{}` if nothing applies.
     */
    setZoneFieldsUpdate(
        updates: { index: number; changes: Partial<BodyZone.Data> }[],
    ): PlainObject {
        return this.#setFieldsUpdate("zones", this.#canonicalZones, updates);
    }

    /* -------------------------------------------- */
    /*  Update payloads — parts                      */
    /* -------------------------------------------- */

    /**
     * Build an `update()` payload that appends a new part to the persisted
     * body structure. The part's own `bodyZoneCode` decides which zone it joins;
     * prefer {@link sohl.entity.body.BodyZone.addPartUpdate} to stamp it
     * automatically.
     *
     * @param partData - The persisted data for the part to append.
     * @returns A complete-array `update()` payload appending the part.
     */
    addPartUpdate(partData: BodyPart.Data): PlainObject {
        return {
            "system.body.structure.parts": [...this.#canonicalParts, partData],
        };
    }

    /**
     * Build an `update()` payload that removes a part by shortcode, **cascading
     * to every hit location on that part**.
     *
     * @param shortcode - The shortcode of the part to remove.
     * @returns A complete-array `update()` payload spanning parts and locations.
     */
    removePartUpdate(shortcode: string): PlainObject {
        return {
            "system.body.structure.parts": this.#canonicalParts.filter(
                (p) => p.shortcode !== shortcode,
            ),
            "system.body.structure.locations": this.#canonicalLocations.filter(
                (l) => l.bodyPartCode !== shortcode,
            ),
        };
    }

    /**
     * Build an `update()` payload that moves a part — either reordering it
     * within its zone or re-parenting it to another zone — by rewriting the
     * whole flat `parts` array. Parts have no `sort` field; their position
     * within a zone is their relative order among that zone's members.
     *
     * @param fromIndex - The part's current index into the flat `parts` array.
     * @param toZoneCode - Shortcode of the destination zone (its current zone
     *   for a plain reorder).
     * @param toPosition - Target position among the destination zone's parts;
     *   past the end appends.
     * @returns A complete-array `update()` payload with the part relocated.
     */
    movePartUpdate(
        fromIndex: number,
        toZoneCode: string,
        toPosition: number,
    ): PlainObject {
        return {
            "system.body.structure.parts": moveGroupedElement(
                this.#canonicalParts,
                fromIndex,
                toZoneCode,
                toPosition,
                (p) => p.bodyZoneCode,
                (p, bodyZoneCode) => ({ ...p, bodyZoneCode }),
            ),
        };
    }

    /**
     * Build an `update()` payload that sets fields on one or more parts,
     * addressed by flat index, by rewriting the **entire** `parts` array.
     *
     * Never write a single array element by index (`parts.${i}.field`):
     * Foundry expands the dotted key to `{ parts: { i: {…} } }` and rebuilds
     * the array field from that sparse map, **truncating it and default-filling
     * every other element** — silently destroying every part but the one
     * touched. Sourcing the full canonical array and replacing the
     * target element(s) makes the write a complete-array replacement, which
     * Foundry applies faithfully.
     *
     * @param updates - One `{ index, changes }` per part to modify; `changes`
     *   is a partial of that part's persisted fields. Out-of-range indices are
     *   ignored.
     * @returns A complete-array `update()` payload, or `{}` if nothing applies.
     */
    setPartFieldsUpdate(
        updates: { index: number; changes: Partial<BodyPart.Data> }[],
    ): PlainObject {
        return this.#setFieldsUpdate("parts", this.#canonicalParts, updates);
    }

    /* -------------------------------------------- */
    /*  Update payloads — locations                  */
    /* -------------------------------------------- */

    /**
     * Build an `update()` payload that appends a new hit location to the
     * persisted body structure. The location's own `bodyPartCode` decides which
     * part it joins; prefer {@link sohl.entity.body.BodyPart.addLocationUpdate}
     * to stamp it automatically.
     *
     * @param locationData - The persisted data for the location to append.
     * @returns A complete-array `update()` payload appending the location.
     */
    addLocationUpdate(locationData: BodyLocation.Data): PlainObject {
        return {
            "system.body.structure.locations": [
                ...this.#canonicalLocations,
                locationData,
            ],
        };
    }

    /**
     * Build an `update()` payload that removes a hit location by shortcode.
     * Location shortcodes are unique body-wide, so no part context is needed.
     *
     * @param shortcode - The shortcode of the location to remove.
     * @returns A complete-array `update()` payload with the location removed.
     */
    removeLocationUpdate(shortcode: string): PlainObject {
        return {
            "system.body.structure.locations": this.#canonicalLocations.filter(
                (l) => l.shortcode !== shortcode,
            ),
        };
    }

    /**
     * Build an `update()` payload that moves a hit location — either reordering
     * it within its part or relocating it to another part — by rewriting the
     * whole flat `locations` array.
     *
     * @param fromIndex - The location's current index into the flat `locations`
     *   array.
     * @param toPartCode - Shortcode of the destination part (its current part
     *   for a plain reorder).
     * @param toPosition - Target position among the destination part's
     *   locations; past the end appends.
     * @returns A complete-array `update()` payload with the location moved.
     */
    moveLocationUpdate(
        fromIndex: number,
        toPartCode: string,
        toPosition: number,
    ): PlainObject {
        return {
            "system.body.structure.locations": moveGroupedElement(
                this.#canonicalLocations,
                fromIndex,
                toPartCode,
                toPosition,
                (l) => l.bodyPartCode,
                (l, bodyPartCode) => ({ ...l, bodyPartCode }),
            ),
        };
    }

    /**
     * Build an `update()` payload that sets fields on one or more hit
     * locations, addressed by flat index, by rewriting the **entire**
     * `locations` array. See {@link setPartFieldsUpdate} for why the write is
     * never a by-index one.
     *
     * @param updates - One `{ index, changes }` per location to modify;
     *   `changes` is a partial of that location's persisted fields.
     *   Out-of-range indices are ignored.
     * @returns A complete-array `update()` payload, or `{}` if nothing applies.
     */
    setLocationFieldsUpdate(
        updates: { index: number; changes: Partial<BodyLocation.Data> }[],
    ): PlainObject {
        return this.#setFieldsUpdate(
            "locations",
            this.#canonicalLocations,
            updates,
        );
    }

    /* -------------------------------------------- */
    /*  Update payloads — re-parenting after rename  */
    /* -------------------------------------------- */

    /**
     * Build an `update()` payload that re-points every part naming `oldCode` as
     * its zone to `newCode`. Merge this with the zone's own field update when a
     * zone's shortcode changes — otherwise its parts are orphaned, since a
     * child's link is the parent's shortcode, not its index.
     *
     * The two payloads touch different arrays, so they merge by spread:
     * `{ ...setZoneFieldsUpdate(…), ...repointPartsUpdate(old, new) }`.
     *
     * @param oldCode - The zone shortcode the parts currently name.
     * @param newCode - The zone's new shortcode.
     * @returns A complete-array `update()` payload, or `{}` when the code is
     *   unchanged or no part references it.
     */
    repointPartsUpdate(oldCode: string, newCode: string): PlainObject {
        if (oldCode === newCode) return {};
        const canonical = this.#canonicalParts;
        if (!canonical.some((p) => p.bodyZoneCode === oldCode)) return {};
        return {
            "system.body.structure.parts": canonical.map((p) =>
                p.bodyZoneCode === oldCode ?
                    { ...p, bodyZoneCode: newCode }
                :   p,
            ),
        };
    }

    /**
     * Build an `update()` payload that re-points every location naming
     * `oldCode` as its part to `newCode`. Merge this with the part's own field
     * update when a part's shortcode changes, for the same reason as
     * {@link repointPartsUpdate}.
     *
     * @param oldCode - The part shortcode the locations currently name.
     * @param newCode - The part's new shortcode.
     * @returns A complete-array `update()` payload, or `{}` when the code is
     *   unchanged or no location references it.
     */
    repointLocationsUpdate(oldCode: string, newCode: string): PlainObject {
        if (oldCode === newCode) return {};
        const canonical = this.#canonicalLocations;
        if (!canonical.some((l) => l.bodyPartCode === oldCode)) return {};
        return {
            "system.body.structure.locations": canonical.map((l) =>
                l.bodyPartCode === oldCode ?
                    { ...l, bodyPartCode: newCode }
                :   l,
            ),
        };
    }

    /* -------------------------------------------- */
    /*  Internals                                    */
    /* -------------------------------------------- */

    /** The canonical persisted `zones` array, straight off the DataModel. */
    get #canonicalZones(): BodyZone.Data[] {
        return this.parent.data.body.structure.zones;
    }

    /** The canonical persisted `parts` array, straight off the DataModel. */
    get #canonicalParts(): BodyPart.Data[] {
        return this.parent.data.body.structure.parts;
    }

    /** The canonical persisted `locations` array, straight off the DataModel. */
    get #canonicalLocations(): BodyLocation.Data[] {
        return this.parent.data.body.structure.locations;
    }

    /**
     * Shared whole-array field merge behind the three `set*FieldsUpdate`
     * helpers: replace the addressed elements in a copy of the canonical array
     * and write the entire array back.
     *
     * @typeParam T - The persisted element shape.
     * @param field - The `body.structure` array being written.
     * @param canonical - That array's canonical contents.
     * @param updates - One `{ index, changes }` per element; out-of-range ignored.
     * @returns A complete-array `update()` payload, or `{}` if nothing applies.
     */
    #setFieldsUpdate<T>(
        field: "zones" | "parts" | "locations",
        canonical: T[],
        updates: { index: number; changes: Partial<T> }[],
    ): PlainObject {
        const byIndex = new Map(
            updates
                .filter((u) => u.index >= 0 && u.index < canonical.length)
                .map((u) => [u.index, u.changes]),
        );
        if (!byIndex.size) return {};
        return {
            [`system.body.structure.${field}`]: canonical.map((el, i) =>
                byIndex.has(i) ? { ...el, ...byIndex.get(i) } : el,
            ),
        };
    }
}

export namespace BodyStructure {
    /** Kind tag used by the kind registry and serialization. */
    export const Kind: string = "BodyStructure";

    /**
     * Persisted data shape for a complete body structure — three flat arrays,
     * assembled into a hierarchy by the {@link BodyStructure} constructor.
     */
    export interface Data extends SohlEntity.Data {
        /** Persisted body zones, in order; their order sets zone-number runs. */
        zones: BodyZone.Data[];
        /** Persisted body parts, in order; each names its zone by shortcode. */
        parts: BodyPart.Data[];
        /** Persisted hit locations, in order; each names its part by shortcode. */
        locations: BodyLocation.Data[];
    }

    /** Construction options for a {@link BodyStructure} instance; inherits all {@link SohlEntity.Options}. */
    export interface Options extends SohlEntity.Options {}
}
registerEntity("BodyStructure", BodyStructure);
