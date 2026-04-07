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

import type { BeingLogic } from "@src/document/actor/logic/BeingLogic";
import { BodyPart } from "@src/domain/body/BodyPart";
import { BodyLocation } from "@src/domain/body/BodyLocation";
import { weightedRandom } from "@src/domain/body/WeightedRandom";

/**
 * The complete anatomical structure of a Being — all body parts, their
 * hit locations, and the adjacency relationships between parts.
 *
 * Constructed from persisted data during {@link BeingLogic.initialize}.
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
export class BodyStructure {
    readonly parts: BodyPart[];
    readonly adjacent: string[][];
    readonly beingLogic: BeingLogic;

    constructor(data: BodyStructure.Data, beingLogic: BeingLogic) {
        this.beingLogic = beingLogic;
        this.parts = data.parts.map((d, i) => new BodyPart(d, this, i));
        this.adjacent = data.adjacent.map((pair) => [...pair]);
    }

    /** Find a part by shortcode, or undefined if not found. */
    getPartByCode(shortcode: string): BodyPart | undefined {
        return this.parts.find((p) => p.shortcode === shortcode);
    }

    /** Find a part by its zero-based index, or undefined if out of range. */
    getPartByIndex(index: number): BodyPart | undefined {
        return this.parts[index];
    }

    /**
     * Get all parts adjacent to the given part, based on the adjacency
     * matrix. Adjacency is bidirectional — if `["head", "thorax"]` is
     * in the matrix, then head is adjacent to thorax and vice versa.
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

    /** Get all locations from all parts as a flat array. */
    getAllLocations(): BodyLocation[] {
        return this.parts.flatMap((p) => p.locations);
    }

    /**
     * Select a random body part.
     *
     * Without parameters, uses pure weighted random selection across all parts.
     *
     * With a `target` parameter, simulates aimed strikes with accuracy drift:
     * 1. Roll a random number from 1 to `accuracy`.
     * 2. If the roll ≤ the current part's `probWeight`, that part is hit.
     * 3. Otherwise, reduce `accuracy` by the part's `probWeight`, pick a
     *    random adjacent part, and repeat from step 2.
     * 4. If the current part has no (unvisited) adjacent parts, fall back
     *    to pure weighted random selection.
     *
     * This models the idea that a more accurate attack is more likely to
     * hit the intended target, while a less accurate one drifts along the
     * adjacency graph to neighboring body parts.
     */
    getRandomPart(target?: {
        targetPart: BodyPart;
        accuracy: number;
    }): BodyPart {
        if (!target) {
            return weightedRandom(this.parts);
        }

        let currentPart = target.targetPart;
        let remainingAccuracy = target.accuracy;
        const visited = new Set<string>();

        while (true) {
            visited.add(currentPart.shortcode);

            // If accuracy <= probWeight, this part is always hit
            if (remainingAccuracy <= currentPart.probWeight.effective) {
                return currentPart;
            }

            // Roll 1..remainingAccuracy; hit if roll <= probWeight
            const roll = Math.ceil(Math.random() * remainingAccuracy);
            if (roll <= currentPart.probWeight.effective) {
                return currentPart;
            }

            // Miss — reduce accuracy and drift to an adjacent part
            remainingAccuracy -= currentPart.probWeight.effective;
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
     */
    getRandomLocation(target?: {
        targetPart: BodyPart;
        accuracy: number;
    }): BodyLocation {
        return this.getRandomPart(target).getRandomLocation();
    }

    /**
     * Build an `update()` payload that appends a new part to the
     * persisted body structure. Sources the current array from the
     * canonical DataModel data, not from the (possibly mutated)
     * domain objects.
     */
    addPartUpdate(partData: BodyPart.Data): PlainObject {
        const canonical = this.beingLogic.data.bodyStructure.parts;
        return {
            "system.bodyStructure.parts": [...canonical, partData],
        };
    }

    /**
     * Build an `update()` payload that removes a part by shortcode from
     * the persisted body structure. Sources the current array from
     * the canonical DataModel data.
     */
    removePartUpdate(shortcode: string): PlainObject {
        const canonical = this.beingLogic.data.bodyStructure.parts;
        return {
            "system.bodyStructure.parts": canonical.filter(
                (p) => p.shortcode !== shortcode,
            ),
        };
    }

    /**
     * Check whether an adjacency edge exists between two parts.
     * Order does not matter — edges are bidirectional.
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
     */
    addEdgeUpdate(partA: string, partB: string): PlainObject {
        const canonical = this.beingLogic.data.bodyStructure.adjacent;
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
     */
    removeEdgeUpdate(partA: string, partB: string): PlainObject {
        const canonical = this.beingLogic.data.bodyStructure.adjacent;
        return {
            "system.bodyStructure.adjacent": canonical.filter(
                (pair) => !(pair.includes(partA) && pair.includes(partB)),
            ),
        };
    }
}

export namespace BodyStructure {
    /** Persisted data shape for a complete body structure. */
    export interface Data {
        parts: BodyPart.Data[];
        adjacent: string[][];
    }
}
