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
import { ValueModifier } from "@src/domain/modifier/ValueModifier";

/**
 * A movement profile for a specific medium (terrestrial, aquatic, aerial,
 * subterranean). Each Being can have multiple profiles — one per medium
 * they can move through.
 *
 * Each profile tracks base speeds (per round and per watch) and a set
 * of factors that modify the effective speed (terrain, encumbrance,
 * injuries, etc.).
 *
 * **Lifecycle:** Rebuilt from persisted schema data on every preparation
 * cycle. May be mutated during the lifecycle (e.g., encumbrance or injury
 * effects modifying speed values), but mutations are not persisted — they
 * are recomputed on the next cycle.
 */
export class MovementProfile {
    readonly medium: string;
    metersPerRound: ValueModifier;
    metersPerWatch: ValueModifier;
    disabled: boolean;
    readonly factors: MovementProfile.Factor[];
    readonly beingLogic: BeingLogic;
    /** Zero-based index of this profile within the Being's movementProfiles array. */
    readonly index: number;

    constructor(
        data: MovementProfile.Data,
        beingLogic: BeingLogic,
        index: number,
    ) {
        this.medium = data.medium;
        this.metersPerRound = new ValueModifier(
            {},
            { parent: beingLogic },
        ).setBase(data.metersPerRound);
        this.metersPerWatch = new ValueModifier(
            {},
            { parent: beingLogic },
        ).setBase(data.metersPerWatch);
        this.disabled = data.disabled;
        this.factors = data.factors.map((f) => ({ ...f }));
        this.beingLogic = beingLogic;
        this.index = index;
    }

    /**
     * The dot-notation path prefix for Foundry `update()` calls targeting
     * this profile's persisted fields, e.g. `"system.movementProfiles.1"`.
     */
    get updatePath(): string {
        return `system.movementProfiles.${this.index}`;
    }

    /**
     * Build an `update()` payload that adds a factor to this profile.
     * Sources from canonical DataModel data.
     */
    addFactorUpdate(factor: MovementProfile.Factor): PlainObject {
        const canonical =
            this.beingLogic.data.movementProfiles[this.index].factors;
        return {
            [`${this.updatePath}.factors`]: [...canonical, factor],
        };
    }

    /**
     * Build an `update()` payload that removes a factor by key.
     * Sources from canonical DataModel data.
     */
    removeFactorUpdate(key: string): PlainObject {
        const canonical =
            this.beingLogic.data.movementProfiles[this.index].factors;
        return {
            [`${this.updatePath}.factors`]: canonical.filter(
                (f) => f.key !== key,
            ),
        };
    }

    /** Find a profile by medium in an array of profiles. */
    static getByMedium(
        profiles: MovementProfile[],
        medium: string,
    ): MovementProfile | undefined {
        return profiles.find((p) => p.medium === medium);
    }

    /**
     * Build an `update()` payload that appends a new movement profile.
     * Sources the current array from the canonical DataModel data.
     */
    static addProfileUpdate(
        beingLogic: BeingLogic,
        profileData: MovementProfile.Data,
    ): PlainObject {
        const canonical = beingLogic.data.movementProfiles;
        return {
            "system.movementProfiles": [...canonical, profileData],
        };
    }

    /**
     * Build an `update()` payload that removes a movement profile by medium.
     * Sources the current array from the canonical DataModel data.
     */
    static removeProfileUpdate(
        beingLogic: BeingLogic,
        medium: string,
    ): PlainObject {
        const canonical = beingLogic.data.movementProfiles;
        return {
            "system.movementProfiles": canonical.filter(
                (p) => p.medium !== medium,
            ),
        };
    }
}

export namespace MovementProfile {
    /** A modifier factor applied to movement speed. */
    export interface Factor {
        scope: string;
        key: string;
        mode: string;
        textValue: string;
    }

    /** Persisted data shape for a movement profile. */
    export interface Data {
        medium: string;
        metersPerRound: number;
        metersPerWatch: number;
        disabled: boolean;
        factors: Factor[];
    }
}
