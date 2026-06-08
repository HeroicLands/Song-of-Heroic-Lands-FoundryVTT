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

import type { BodyStructure } from "@src/domain/body/BodyStructure";

/**
 * A single piece of worn armor's contribution to body-location protection,
 * reduced to the plain data the aggregation needs. The Foundry layer builds
 * these from each ArmorGear's logic (`material`, `protection`, covered
 * `locations`).
 */
export interface ArmorLayer {
    /** Display material, e.g. "Mail" — used to build the location's armorType. */
    material: string;
    /** Protection this layer adds per aspect (blunt, edged, piercing, fire). */
    protection: {
        /** Protection against blunt impact. */
        blunt: number;
        /** Protection against edged impact. */
        edged: number;
        /** Protection against piercing impact. */
        piercing: number;
        /** Protection against fire/heat impact. */
        fire: number;
    };
    /** Shortcodes of locations this layer covers flexibly. */
    flexibleLocations: string[];
    /** Shortcodes of locations this layer covers rigidly. */
    rigidLocations: string[];
}

/** The impact aspects iterated when summing per-aspect armor protection. @internal */
const ASPECTS = ["blunt", "edged", "piercing", "fire"] as const;

/**
 * Aggregate worn armor onto a body's locations for the current lifecycle
 * cycle. For every location each covering layer adds its protection, a rigid
 * layer flags the location `isRigid`, and the layer's material is appended to
 * the location's `armorType`. Natural `protectionBase` is left untouched —
 * armor is tracked separately on `armorProtection`.
 *
 * Pure and Foundry-free (mutates the supplied {@link BodyStructure}'s location
 * objects, which are rebuilt each cycle). Idempotent: any prior aggregation
 * state on the locations is reset before applying the given layers.
 */
export function aggregateArmor(
    body: BodyStructure,
    layers: ArmorLayer[],
): void {
    const locations = body.getAllLocations();

    // Reset state from any prior cycle.
    for (const loc of locations) {
        loc.armorProtection = { blunt: 0, edged: 0, piercing: 0, fire: 0 };
        loc.isRigid = false;
        loc.armorType = "";
    }

    for (const layer of layers) {
        const rigid = new Set(layer.rigidLocations);
        // A location named in both lists is covered once.
        const covered = new Set([
            ...layer.flexibleLocations,
            ...layer.rigidLocations,
        ]);
        for (const code of covered) {
            const loc = locations.find((l) => l.shortcode === code);
            if (!loc) continue;
            for (const aspect of ASPECTS) {
                loc.armorProtection[aspect] += layer.protection[aspect];
            }
            if (rigid.has(code)) loc.isRigid = true;
            loc.armorType =
                loc.armorType ? `${loc.armorType}, ${layer.material}` : layer.material;
        }
    }
}
