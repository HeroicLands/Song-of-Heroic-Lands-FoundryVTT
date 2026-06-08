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
import { BODY_ROLE } from "@src/utils/constants";
import { ValueModifier } from "@src/domain/modifier/ValueModifier";

/**
 * A body part containing one or more {@link BodyLocation | hit locations} —
 * e.g., "Head" (containing Skull, Face), "Left Arm" (containing Upper Arm,
 * Elbow, Forearm, Hand).
 *
 * Each part is tagged with one or more {@link BodyRole}s describing which
 * functional roles it fulfills (VITAL, CORE, MANIPULATOR, LOCOMOTOR). Skills
 * and attributes declare which roles impair them; injury at a part impairs
 * every skill/attribute that lists any of the part's roles. Mishap behavior
 * (fumble/stumble checks) is also role-driven; see BodyRole in constants.
 *
 * **Lifecycle:** Rebuilt from persisted schema data on every preparation
 * cycle. May be mutated during the lifecycle (e.g., modifiers applied by
 * active effects), but mutations are not persisted — they are recomputed
 * on the next cycle.
 */
export class BodyPart {
    /** Unique part identifier within the body structure (e.g. `"larm"`). */
    readonly shortcode: string;
    /** Functional roles this part fulfills; see BodyRole in constants. */
    readonly roles: string[];
    /** Whether this part is a limb capable of gripping an item. */
    readonly canHoldItem: boolean;
    /** The item currently held by this part, resolved from `heldItemId`, or null. */
    readonly heldItem: SohlItem | null;
    /** Selection weight for this part in random hit-location rolls. */
    readonly probWeight: ValueModifier;
    /** Hit locations contained within this part. */
    readonly locations: BodyLocation[];
    /** Back-reference to the owning {@link BodyStructure}. */
    readonly bodyStructure: BodyStructure;
    /** Zero-based index of this part within {@link BodyStructure.parts}. */
    readonly index: number;

    /**
     * Convenience predicate: this part affects mobility if it carries any
     * of the mobility-relevant roles (VITAL, CORE, or LOCOMOTOR). Pure
     * MANIPULATOR-tagged parts (arms, hands) don't drop a creature when
     * injured, so their injury doesn't impair mobility.
     */
    get affectsMobility(): boolean {
        return this.roles.some(
            (r) =>
                r === BODY_ROLE.VITAL ||
                r === BODY_ROLE.CORE ||
                r === BODY_ROLE.LOCOMOTOR,
        );
    }

    /**
     * @param data Persisted part data.
     * @param bodyStructure Owning body structure (supplies actor and lineage logic).
     * @param index Zero-based position within {@link BodyStructure.parts}.
     */
    constructor(
        data: BodyPart.Data,
        bodyStructure: BodyStructure,
        index: number,
    ) {
        const actor = bodyStructure.lineageLogic.actor;
        this.shortcode = data.shortcode;
        this.roles = [...data.roles];
        this.canHoldItem = data.canHoldItem;
        this.heldItem =
            data.heldItemId ?
                actor?.items.get<SohlItem>(data.heldItemId) || null
            :   null;
        this.probWeight = new ValueModifier(
            {},
            { parent: bodyStructure.lineageLogic },
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
            this.bodyStructure.lineageLogic.data.bodyStructure.parts[this.index]
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
            this.bodyStructure.lineageLogic.data.bodyStructure.parts[this.index]
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
        /** Unique part identifier within the body structure. */
        shortcode: string;
        /** Functional roles this part fulfills (BodyRole values). */
        roles: string[];
        /** Whether this part can grip a held item. */
        canHoldItem: boolean;
        /** Id of the item this part is holding, or null if empty. */
        heldItemId: string | null;
        /** Base selection weight for random hit-location rolls. */
        probWeight: number;
        /** Persisted hit locations within this part. */
        locations: BodyLocation.Data[];
    }
}
