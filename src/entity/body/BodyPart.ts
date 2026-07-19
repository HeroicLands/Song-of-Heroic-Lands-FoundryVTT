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
import type { BodyStructure } from "@src/entity/body/BodyStructure";
import type { BodyLocation } from "@src/entity/body/BodyLocation";
import { weightedRandom } from "@src/entity/body/weighted-random";
import type { SohlItem } from "@src/document/item/foundry/SohlItem";
import { BODY_ROLE, isA } from "@src/utils/constants";
import type { ValueModifier } from "@src/entity/modifier/ValueModifier";
import { SohlEntity } from "../SohlEntity";

/**
 * A body part containing one or more {@link BodyLocation | hit locations} —
 * e.g., "Head" (containing Skull, Face), "Left Arm" (containing Upper Arm,
 * Elbow, Forearm, Hand).
 *
 * Each part is tagged with one or more `BodyRole`s describing which
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
export class BodyPart extends SohlEntity {
    /** Unique part identifier within the body structure (e.g. `"larm"`). */
    readonly shortcode: string;
    /** Display name of this part (falls back to the shortcode). */
    readonly name: string;
    /** Functional roles this part fulfills; see BodyRole in constants. */
    readonly roles: string[];
    /** Whether this part is a limb capable of gripping an item. */
    readonly canHoldItem: boolean;
    /** The item currently held by this part, resolved from `heldItemId`, or undefined. */
    readonly heldItem?: SohlItem;
    /** Selection weight for this part in random hit-location rolls. */
    readonly probWeight: ValueModifier;
    /**
     * Manually-set permanent impairment for this part — a non-positive floor
     * the derived impairment can never be milder than (`0` = none).
     */
    readonly permanentImpairment: number;
    /**
     * Manually-set flag marking this part permanently unusable (a withered or
     * fully-amputated limb). Unlike permanent impairment, this makes the part
     * unusable regardless of tier.
     */
    readonly permanentlyUnusable: boolean;
    /** Hit locations contained within this part. */
    readonly locations: BodyLocation[];
    /** Back-reference to the owning {@link BodyStructure}. */
    readonly structure: BodyStructure;
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
     * Whether this part is **critical** for overall health — it holds a VITAL or
     * CORE role. Critical parts drive the harsher health-ceiling column (#470).
     */
    get isCritical(): boolean {
        return this.roles.some(
            (r) => r === BODY_ROLE.VITAL || r === BODY_ROLE.CORE,
        );
    }

    /**
     * Builds a single body part from its persisted data, resolving its held
     * item and probability weight and constructing its child locations.
     *
     * @param data - Persisted part data.
     * @param options - Construction options
     * @param options.parent - Owning {@link sohl.document.actor.logic.BeingLogic} (the body's owner) for this part.
     * @param options.structure - Owning {@link BodyStructure} for this part.
     * @param options.index - Zero-based index of this part within {@link BodyStructure.parts}.
     * @throws If required fields are missing from `data` or `options`.
     */
    constructor(data: BodyPart.Data, options: BodyPart.Options) {
        if (!isA(options.parent, "SohlLogic")) {
            throw new Error("Requires a Logic parent");
        }
        if (!options.structure) {
            throw new Error("BodyPart requires a structure");
        }
        if (options.index === undefined) {
            throw new Error("BodyPart requires an index");
        }
        super(data, options);
        this.shortcode = data.shortcode;
        this.name = data.name || data.shortcode;
        this.roles = [...data.roles];
        this.canHoldItem = data.canHoldItem;
        this.heldItem =
            data.heldItemId ?
                ((this.parent.actor?.items.get<SohlItem>(data.heldItemId) as
                    | SohlItem
                    | undefined) ?? undefined)
            :   undefined;
        this.probWeight = new entity.ValueModifier(this.parent).setBase(
            data.probWeight,
        );
        this.permanentImpairment = Math.min(0, data.permanentImpairment ?? 0);
        this.permanentlyUnusable = data.permanentlyUnusable ?? false;
        this.index = options.index;
        this.structure = options.structure;
        this.locations = data.locations.map(
            (d, i) =>
                new entity.BodyLocation(d, {
                    parent: this.parent,
                    bodyPart: this,
                    index: i,
                }),
        );
    }

    /**
     * The dot-notation path prefix for Foundry `update()` calls targeting
     * this part's persisted fields, e.g. `"system.body.structure.parts.2"`.
     */
    get updatePath(): string {
        return `system.body.structure.parts.${this.index}`;
    }

    /**
     * Find a location by shortcode, or undefined if not found.
     * @param shortcode - Shortcode of the location to find.
     * @returns The matching location, or undefined if none matches.
     */
    getLocationByCode(shortcode: string): BodyLocation | undefined {
        return this.locations.find((loc) => loc.shortcode === shortcode);
    }

    /**
     * Find a location by its zero-based index, or undefined if out of range.
     * @param index - Zero-based index of the location within this part.
     * @returns The location at that index, or undefined if out of range.
     */
    getLocationByIndex(index: number): BodyLocation | undefined {
        return this.locations[index];
    }

    /**
     * Select a random location within this part, weighted by each
     * location's {@link BodyLocation.probWeight}.
     * @returns A randomly selected location.
     */
    getRandomLocation(): BodyLocation {
        return weightedRandom(this.locations);
    }

    /**
     * Build an `update()` payload that appends a new location to this
     * part's persisted locations array. Sources the current array from
     * the canonical DataModel data, not from the (possibly mutated)
     * domain objects.
     * @param locationData - Persisted data for the location to append.
     * @returns An update payload appending the location to this part.
     */
    addLocationUpdate(locationData: BodyLocation.Data): PlainObject {
        const canonical: BodyLocation.Data[] =
            this.structure.parent.data.body.structure.parts[this.index]
                .locations;
        // Full-array write — a partial `parts.${index}.locations` update
        // corrupts the whole parts array (#247). See setPartFieldsUpdate.
        return this.structure.setPartFieldsUpdate([
            {
                index: this.index,
                changes: { locations: [...canonical, locationData] },
            },
        ]);
    }

    /**
     * Build an `update()` payload that removes a location by shortcode from
     * this part's persisted locations array. Sources the current array
     * from the canonical DataModel data.
     * @param shortcode - Shortcode of the location to remove.
     * @returns An update payload with the location filtered out of this part.
     */
    removeLocationUpdate(shortcode: string): PlainObject {
        const canonical: BodyLocation.Data[] =
            this.structure.parent.data.body.structure.parts[this.index]
                .locations;
        // Full-array write — a partial `parts.${index}.locations` update
        // corrupts the whole parts array (#247). See setPartFieldsUpdate.
        return this.structure.setPartFieldsUpdate([
            {
                index: this.index,
                changes: {
                    locations: canonical.filter(
                        (l: BodyLocation.Data) => l.shortcode !== shortcode,
                    ),
                },
            },
        ]);
    }
}

export namespace BodyPart {
    /** Kind tag used by the kind registry and serialization. */
    export const Kind: string = "BodyPart";

    /** Persisted data shape for a body part. */
    export interface Data extends SohlEntity.Data {
        /** Unique part identifier within the body structure. */
        shortcode: string;
        /** Display name of the part (e.g. "Head"); falls back to the shortcode. */
        name?: string;
        /** Functional roles this part fulfills (BodyRole values). */
        roles: string[];
        /** Manually-set permanent impairment floor (non-positive; `0` = none). */
        permanentImpairment?: number;
        /** Whether the part is permanently unusable (withered/amputated). */
        permanentlyUnusable?: boolean;
        /** Whether this part can grip a held item. */
        canHoldItem: boolean;
        /** Id of the item this part is holding, or null if empty. */
        heldItemId: string | null;
        /** Base selection weight for random hit-location rolls. */
        probWeight: number;
        /** Persisted hit locations within this part. */
        locations: BodyLocation.Data[];
    }

    /** Construction options for a {@link BodyPart} instance. */
    export interface Options extends SohlEntity.Options {
        /** Owning body structure (supplies actor and body-owner logic). */
        structure: BodyStructure;
        /** Zero-based index of this part within {@link BodyStructure.parts}. */
        index: number;
    }
}
registerEntity("BodyPart", BodyPart);
