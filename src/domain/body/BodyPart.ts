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

import { BodyLocation } from "@src/domain/body/BodyLocation";
import { weightedRandom } from "@src/domain/body/weighted-random";

/**
 * A body part containing one or more {@link BodyLocation | hit locations} —
 * e.g., "Head" (containing Skull, Face), "Left Arm" (containing Upper Arm,
 * Elbow, Forearm, Hand).
 *
 * Each part tracks which skills and attributes are affected by injuries to
 * this part, whether it affects mobility, whether it can hold an item
 * (e.g., a hand), and its probability weight for random part selection.
 *
 * Constructed from persisted data during the Being's lifecycle.
 */
export class BodyPart {
    readonly name: string;
    readonly affectedSkillCodes: string[];
    readonly affectedAttributeCodes: string[];
    readonly affectsMobility: boolean;
    readonly canHoldItem: boolean;
    heldItemId: string | null;
    readonly probWeight: number;
    readonly locations: BodyLocation[];

    constructor(data: BodyPart.Data) {
        this.name = data.name;
        this.affectedSkillCodes = [...data.affectedSkillCodes];
        this.affectedAttributeCodes = [...data.affectedAttributeCodes];
        this.affectsMobility = data.affectsMobility;
        this.canHoldItem = data.canHoldItem;
        this.heldItemId = data.heldItemId;
        this.probWeight = data.probWeight;
        this.locations = data.locations.map((d) => new BodyLocation(d));
    }

    /** Find a location by name, or undefined if not found. */
    getLocation(name: string): BodyLocation | undefined {
        return this.locations.find((loc) => loc.name === name);
    }

    /**
     * Select a random location within this part, weighted by each
     * location's {@link BodyLocation.probWeight}.
     */
    getRandomLocation(): BodyLocation {
        return weightedRandom(this.locations);
    }

    toJSON(): BodyPart.Data {
        return {
            name: this.name,
            affectedSkillCodes: [...this.affectedSkillCodes],
            affectedAttributeCodes: [...this.affectedAttributeCodes],
            affectsMobility: this.affectsMobility,
            canHoldItem: this.canHoldItem,
            heldItemId: this.heldItemId,
            probWeight: this.probWeight,
            locations: this.locations.map((loc) => loc.toJSON()),
        };
    }
}

export namespace BodyPart {
    /** Persisted data shape for a body part. */
    export interface Data {
        name: string;
        affectedSkillCodes: string[];
        affectedAttributeCodes: string[];
        affectsMobility: boolean;
        canHoldItem: boolean;
        heldItemId: string | null;
        probWeight: number;
        locations: BodyLocation.Data[];
    }
}
