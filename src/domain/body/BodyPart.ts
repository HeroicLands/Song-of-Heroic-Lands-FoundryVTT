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
import { BodyLocation } from "@src/domain/body/BodyLocation";
import { weightedRandom } from "@src/domain/body/WeightedRandom";
import { SohlItem } from "@src/document/item/foundry/SohlItem";
import { ITEM_KIND, TRAIT_INTENSITY } from "@src/utils/constants";
import { ValueModifier } from "@src/domain/modifier/ValueModifier";

/**
 * A body part containing one or more {@link BodyLocation | hit locations} —
 * e.g., "Head" (containing Skull, Face), "Left Arm" (containing Upper Arm,
 * Elbow, Forearm, Hand).
 *
 * Each part tracks which skills and attributes are affected by injuries to
 * this part, whether it affects mobility, whether it can hold an item
 * (e.g., a hand), and its probability weight for random part selection.
 *
 * **Lifecycle:** Rebuilt from persisted schema data on every preparation
 * cycle. May be mutated during the lifecycle (e.g., modifiers applied by
 * active effects), but mutations are not persisted — they are recomputed
 * on the next cycle.
 */
export class BodyPart {
    readonly shortcode: string;
    readonly affectedSkills: SohlItem[];
    readonly affectedAttributes: SohlItem[];
    readonly affectsMobility: boolean;
    readonly canHoldItem: boolean;
    readonly heldItem: SohlItem | null;
    readonly probWeight: ValueModifier;
    readonly locations: BodyLocation[];
    readonly bodyStructure: BodyStructure;
    /** Zero-based index of this part within {@link BodyStructure.parts}. */
    readonly index: number;

    constructor(
        data: BodyPart.Data,
        bodyStructure: BodyStructure,
        index: number,
    ) {
        const actor = bodyStructure.beingLogic.actor;
        this.shortcode = data.shortcode;
        this.affectedSkills = data.affectedSkillCodes.reduce((skills, code) => {
            const item = actor?.items.find(
                (it) =>
                    it.type === ITEM_KIND.SKILL && it.system.shortcode === code,
            );
            if (item) {
                skills.push(item);
            } else {
                sohl.log.warn(
                    `Skill with shortcode "${code}" not found for actor "${actor?.name}"`,
                );
            }
            return skills;
        }, [] as SohlItem[]);
        this.affectedAttributes = data.affectedAttributeCodes.reduce(
            (attributes, code) => {
                const item = actor?.items.find(
                    (it) =>
                        it.type === ITEM_KIND.TRAIT &&
                        it.system.intensity === TRAIT_INTENSITY.ATTRIBUTE &&
                        it.system.shortcode === code,
                );
                if (item) {
                    attributes.push(item);
                } else {
                    sohl.log.warn(
                        `Attribute with shortcode "${code}" not found for actor "${actor?.name}"`,
                    );
                }
                return attributes;
            },
            [] as SohlItem[],
        );
        this.affectsMobility = data.affectsMobility;
        this.canHoldItem = data.canHoldItem;
        this.heldItem =
            data.heldItemId ?
                actor?.items.get<SohlItem>(data.heldItemId) || null
            :   null;
        this.probWeight = new ValueModifier(
            {},
            { parent: bodyStructure.beingLogic },
        ).setBase(data.probWeight);
        this.index = index;
        this.bodyStructure = bodyStructure;
        this.locations = data.locations.map(
            (d, i) => new BodyLocation(d, this, i),
        );
    }

    /**
     * The dot-notation path prefix for Foundry `update()` calls targeting
     * this part's persisted fields, e.g. `"system.bodyStructure.parts.2"`.
     */
    get updatePath(): string {
        return `system.bodyStructure.parts.${this.index}`;
    }

    /** Find a location by shortcode, or undefined if not found. */
    getLocationByCode(shortcode: string): BodyLocation | undefined {
        return this.locations.find((loc) => loc.shortcode === shortcode);
    }

    /** Find a location by its zero-based index, or undefined if out of range. */
    getLocationByIndex(index: number): BodyLocation | undefined {
        return this.locations[index];
    }

    /**
     * Select a random location within this part, weighted by each
     * location's {@link BodyLocation.probWeight}.
     */
    getRandomLocation(): BodyLocation {
        return weightedRandom(this.locations);
    }

    /**
     * Build an `update()` payload that appends a new location to this
     * part's persisted locations array. Sources the current array from
     * the canonical DataModel data, not from the (possibly mutated)
     * domain objects.
     */
    addLocationUpdate(locationData: BodyLocation.Data): PlainObject {
        const canonical =
            this.bodyStructure.beingLogic.data.bodyStructure.parts[this.index]
                .locations;
        return {
            [`${this.updatePath}.locations`]: [...canonical, locationData],
        };
    }

    /**
     * Build an `update()` payload that removes a location by shortcode from
     * this part's persisted locations array. Sources the current array
     * from the canonical DataModel data.
     */
    removeLocationUpdate(shortcode: string): PlainObject {
        const canonical =
            this.bodyStructure.beingLogic.data.bodyStructure.parts[this.index]
                .locations;
        return {
            [`${this.updatePath}.locations`]: canonical.filter(
                (l) => l.shortcode !== shortcode,
            ),
        };
    }
}

export namespace BodyPart {
    /** Persisted data shape for a body part. */
    export interface Data {
        shortcode: string;
        affectedSkillCodes: string[];
        affectedAttributeCodes: string[];
        affectsMobility: boolean;
        canHoldItem: boolean;
        heldItemId: string | null;
        probWeight: number;
        locations: BodyLocation.Data[];
    }
}
