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

import { entity } from "@src/entity/registry";
import { registerEntity } from "@src/entity/entityRegistry";
import type { LineageLogic } from "@src/document/item/logic/LineageLogic";
import type { BodyPart } from "@src/entity/body/BodyPart";
import { BodyLocation } from "@src/entity/body/BodyLocation";
import { weightedRandom } from "@src/entity/body/weighted-random";
import { SohlEntity } from "../SohlEntity";
import { isA, ITEM_KIND } from "@src/utils/constants";

/**
 * The complete anatomical structure of a Being — all body parts, their
 * hit locations, and the adjacency relationships between parts.
 *
 * Constructed from persisted data during {@link LineageLogic.initialize}.
 * Provides weighted random selection for hit location determination and
 * adjacency queries for mechanics like bleeding spread or cascading injuries.
 *
 * The adjacency matrix is a list of pairs: `[["Head", "Thorax"], ...]`
 * where each pair means those two parts are adjacent (bidirectional).
 *
 * **Lifecycle:** This object is rebuilt from persisted schema data on every
 * preparation cycle. It may be mutated during the lifecycle (e.g., active
 * effects adding ValueModifier deltas to protection values), but those
 * changes are not persisted — they are recomputed on the next cycle.
 * To persist changes, modify the underlying DataModel fields directly
 * (via form submission or `document.update()`).
 */
export class BodyStructure extends SohlEntity {
    /** All body parts, in persisted order; index matches {@link BodyPart.index}. */
    readonly parts: BodyPart[];
    /**
     * Bidirectional adjacency matrix: a list of `[partCodeA, partCodeB]` pairs,
     * each meaning those two parts are adjacent. Drives drift in
     * {@link getRandomPart} and queries via {@link getAdjacentParts} / {@link hasEdge}.
     */
    readonly adjacent: string[][];

    /**
     * Builds the domain body structure, wrapping each persisted part in a
     * {@link BodyPart} and copying the adjacency pairs.
     *
     * @param data - Persisted body-structure data
     * @param data.parts - The persisted body parts array
     * @param data.adjacent - The persisted adjacency pairs array
     * @param options - Construction options
     * @param options.parent - The parent {@link LineageLogic} for this structure
     * @throws If required fields are missing from `data` or `options`.
     */
    constructor(data: BodyStructure.Data, options: BodyStructure.Options) {
        if (!isA(options.parent, ITEM_KIND.LINEAGE)) {
            throw new Error("Requires a Lineage parent");
        }
        if (!data.parts || !Array.isArray(data.parts)) {
            throw new Error(
                "BodyStructure requires a 'parts' array in its data",
            );
        }
        if (!data.adjacent || !Array.isArray(data.adjacent)) {
            throw new Error(
                "BodyStructure requires an 'adjacent' array in its data",
            );
        }
        super(data, options);
        this.parts = data.parts.map(
            (d, i) =>
                new entity.BodyPart(d, {
                    parent: this.parent,
                    bodyStructure: this,
                    index: i,
                }),
        );
        this.adjacent = data.adjacent.map((pair) => [...pair]);
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
     * Find a part by its zero-based index, or undefined if out of range.
     *
     * @param index - The zero-based index into the parts array.
     * @returns The part at that index, or `undefined` if out of range.
     */
    getPartByIndex(index: number): BodyPart | undefined {
        return this.parts[index];
    }

    /**
     * Get all parts adjacent to the given part, based on the adjacency
     * matrix. Adjacency is bidirectional — if `["head", "thorax"]` is
     * in the matrix, then head is adjacent to thorax and vice versa.
     *
     * @param partCode - The shortcode of the part whose neighbors to find.
     * @returns The parts adjacent to the given part.
     */
    getAdjacentParts(partCode: string): BodyPart[] {
        const adjacentCodes = new Set<string>();
        for (const pair of this.adjacent) {
            if (pair.includes(partCode)) {
                for (const code of pair) {
                    if (code !== partCode) adjacentCodes.add(code);
                }
            }
        }
        return this.parts.filter((p) => adjacentCodes.has(p.shortcode));
    }

    /**
     * Get all locations from all parts as a flat array.
     *
     * @returns Every location across all parts.
     */
    getAllLocations(): BodyLocation[] {
        return this.parts.flatMap((p) => p.locations);
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

    /**
     * Select a random body part.
     *
     * Without parameters, uses pure weighted random selection across all parts.
     *
     * With a `target` parameter, simulates aimed strikes with spread drift:
     * 1. Roll a random number from 1 to `spread`.
     * 2. If the roll ≤ the current part's `probWeight`, that part is hit.
     * 3. Otherwise, reduce `spread` by the part's `probWeight`, pick a
     *    random adjacent part, and repeat from step 2.
     * 4. If the current part has no (unvisited) adjacent parts, fall back
     *    to pure weighted random selection.
     *
     * This models the idea that a more accurate attack is more likely to
     * hit the intended target, while a less accurate one drifts along the
     * adjacency graph to neighboring body parts.
     *
     * @param target - Optional aimed-strike parameters; omit for pure weighted
     *   selection.
     * @param target.targetPart - The intended part to aim at.
     * @param target.spread - The accuracy spread driving adjacency drift.
     * @returns The selected body part.
     */
    getRandomPart(target?: { targetPart: BodyPart; spread: number }): BodyPart {
        if (!target) {
            return weightedRandom(this.parts);
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

            // Roll 1..remainingSpread; hit if roll <= probWeight
            const roll = Math.ceil(Math.random() * remainingSpread);
            if (roll <= currentPart.probWeight.effective) {
                return currentPart;
            }

            // Miss — reduce spread and drift to an adjacent part
            remainingSpread -= currentPart.probWeight.effective;
            const adjacentParts = this.getAdjacentParts(
                currentPart.shortcode,
            ).filter((p) => !visited.has(p.shortcode));

            if (adjacentParts.length === 0) {
                // No unvisited adjacent parts remain — hit current part
                return currentPart;
            }

            currentPart = weightedRandom(adjacentParts);
        }
    }

    /**
     * Select a random location using two-step weighted selection:
     * first pick a part (optionally with aimed targeting), then pick
     * a location within that part (weighted).
     *
     * @param target - Optional aimed-strike parameters; omit for pure weighted
     *   selection.
     * @param target.targetPart - The intended part to aim at.
     * @param target.spread - The accuracy spread driving adjacency drift.
     * @returns The selected body location.
     */
    getRandomLocation(target?: {
        targetPart: BodyPart;
        spread: number;
    }): BodyLocation {
        return this.getRandomPart(target).getRandomLocation();
    }

    /**
     * Build an `update()` payload that appends a new part to the
     * persisted body structure. Sources the current array from the
     * canonical DataModel data, not from the (possibly mutated)
     * domain objects.
     *
     * @param partData - The persisted data for the part to append.
     * @returns An `update()` payload appending the part.
     */
    addPartUpdate(partData: BodyPart.Data): PlainObject {
        const canonical = this.parent.data.bodyStructure.parts;
        return {
            "system.bodyStructure.parts": [...canonical, partData],
        };
    }

    /**
     * Build an `update()` payload that removes a part by shortcode from
     * the persisted body structure. Sources the current array from
     * the canonical DataModel data.
     *
     * @param shortcode - The shortcode of the part to remove.
     * @returns An `update()` payload with the part removed.
     */
    removePartUpdate(shortcode: string): PlainObject {
        const canonical: BodyPart.Data[] = this.parent.data.bodyStructure.parts;
        return {
            "system.bodyStructure.parts": canonical.filter(
                (p) => p.shortcode !== shortcode,
            ),
        };
    }

    /**
     * Build an `update()` payload that sets fields on one or more parts,
     * addressed by index, by rewriting the **entire** `parts` array.
     *
     * Never write a single array element by index (`parts.${i}.field`):
     * Foundry expands the dotted key to `{ parts: { i: {…} } }` and rebuilds
     * the array field from that sparse map, **truncating it and default-filling
     * every other element** — silently destroying every part but the one
     * touched (issue #247). Sourcing the full canonical array and replacing the
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
        const canonical: BodyPart.Data[] = this.parent.data.bodyStructure.parts;
        const byIndex = new Map(
            updates
                .filter((u) => u.index >= 0 && u.index < canonical.length)
                .map((u) => [u.index, u.changes]),
        );
        if (!byIndex.size) return {};
        return {
            "system.bodyStructure.parts": canonical.map((p, i) =>
                byIndex.has(i) ? { ...p, ...byIndex.get(i) } : p,
            ),
        };
    }

    /**
     * Check whether an adjacency edge exists between two parts.
     * Order does not matter — edges are bidirectional.
     *
     * @param partA - The shortcode of the first part.
     * @param partB - The shortcode of the second part.
     * @returns `true` if the two parts are adjacent.
     */
    hasEdge(partA: string, partB: string): boolean {
        return this.adjacent.some(
            (pair) =>
                pair.includes(partA) && pair.includes(partB) && partA !== partB,
        );
    }

    /**
     * Build an `update()` payload that adds an adjacency edge between
     * two parts. If the edge already exists (in either order), returns
     * the array unchanged. Sources from canonical DataModel data.
     *
     * @param partA - The shortcode of the first part.
     * @param partB - The shortcode of the second part.
     * @returns An `update()` payload adding the edge (unchanged if it exists).
     */
    addEdgeUpdate(partA: string, partB: string): PlainObject {
        const canonical: string[][] = this.parent.data.bodyStructure.adjacent;
        const exists = canonical.some(
            (pair) => pair.includes(partA) && pair.includes(partB),
        );
        return {
            "system.bodyStructure.adjacent":
                exists ? canonical : [...canonical, [partA, partB]],
        };
    }

    /**
     * Build an `update()` payload that removes an adjacency edge between
     * two parts. Matches regardless of order — `["A", "B"]` and
     * `["B", "A"]` are the same edge. Sources from canonical DataModel data.
     *
     * @param partA - The shortcode of the first part.
     * @param partB - The shortcode of the second part.
     * @returns An `update()` payload with the edge removed.
     */
    removeEdgeUpdate(partA: string, partB: string): PlainObject {
        const canonical: string[][] = this.parent.data.bodyStructure.adjacent;
        return {
            "system.bodyStructure.adjacent": canonical.filter(
                (pair) => !(pair.includes(partA) && pair.includes(partB)),
            ),
        };
    }
}

export namespace BodyStructure {
    /** Kind tag used by the kind registry and serialization. */
    export const Kind: string = "BodyStructure";

    /** Persisted data shape for a complete body structure. */
    export interface Data extends SohlEntity.Data {
        /** Persisted body parts, in order. */
        parts: BodyPart.Data[];
        /** Bidirectional adjacency pairs of part shortcodes. */
        adjacent: string[][];
    }

    /** Construction options for a {@link BodyStructure} instance; inherits all {@link SohlEntity.Options}. */
    export interface Options extends SohlEntity.Options {}
}
registerEntity("BodyStructure", BodyStructure);
