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

import { BodyPart } from "@src/domain/body/BodyPart";
import { BodyLocation } from "@src/domain/body/BodyLocation";
import { weightedRandom } from "@src/domain/body/weighted-random";

/**
 * The complete anatomical structure of a Being — all body parts, their
 * hit locations, and the adjacency relationships between parts.
 *
 * `BodyStructure` is a domain value object constructed from persisted data
 * during {@link BeingLogic.initialize}. It provides weighted random
 * selection for hit location determination and adjacency queries for
 * mechanics like bleeding spread or cascading injuries.
 *
 * The adjacency matrix is a list of pairs: `[["Head", "Thorax"], ...]`
 * where each pair means those two parts are adjacent (bidirectional).
 */
export class BodyStructure {
    readonly parts: BodyPart[];
    readonly adjacent: string[][];

    constructor(data: BodyStructure.Data) {
        this.parts = data.parts.map((d) => new BodyPart(d));
        this.adjacent = data.adjacent.map((pair) => [...pair]);
    }

    /** Find a part by name, or undefined if not found. */
    getPart(name: string): BodyPart | undefined {
        return this.parts.find((p) => p.name === name);
    }

    /**
     * Get all parts adjacent to the named part, based on the adjacency
     * matrix. Adjacency is bidirectional — if `["Head", "Thorax"]` is
     * in the matrix, then Head is adjacent to Thorax and vice versa.
     */
    getAdjacentParts(partName: string): BodyPart[] {
        const adjacentNames = new Set<string>();
        for (const pair of this.adjacent) {
            const idx = pair.indexOf(partName);
            if (idx >= 0) {
                for (const name of pair) {
                    if (name !== partName) adjacentNames.add(name);
                }
            }
        }
        return this.parts.filter((p) => adjacentNames.has(p.name));
    }

    /** Get all locations from all parts as a flat array. */
    getAllLocations(): BodyLocation[] {
        return this.parts.flatMap((p) => p.locations);
    }

    /**
     * Select a random part, weighted by each part's
     * {@link BodyPart.probWeight}.
     */
    getRandomPart(): BodyPart {
        return weightedRandom(this.parts);
    }

    /**
     * Select a random location using two-step weighted selection:
     * first pick a part (weighted), then pick a location within
     * that part (weighted).
     */
    getRandomLocation(): BodyLocation {
        return this.getRandomPart().getRandomLocation();
    }

    toJSON(): BodyStructure.Data {
        return {
            parts: this.parts.map((p) => p.toJSON()),
            adjacent: this.adjacent.map((pair) => [...pair]),
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
