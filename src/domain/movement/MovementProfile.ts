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

import type { LineageLogic } from "@src/document/item/logic/LineageLogic";
import { ValueModifier } from "@src/domain/modifier/ValueModifier";

/**
 * A movement profile for a specific medium (terrestrial, aquatic, aerial,
 * subterranean). Each Being can have multiple profiles — one per medium
 * they can move through.
 *
 * Each profile tracks base speeds (tactical per combat round, in feet;
 * strategic per 4-hour watch, in leagues) and a set of factors that
 * modify the effective speed (terrain, encumbrance, injuries, etc.).
 *
 * **Units:** `feetPerRound` is in feet (battle scale, ~5–10 ft per grid).
 * `leaguesPerWatch` is in leagues (1 league ≈ 3 miles ≈ 4828 m), one
 * watch = 4 hours, six watches per day. Foundry scenes declare their
 * own grid units; conversion happens at the scene boundary, not in this
 * data.
 *
 * **Lifecycle:** Rebuilt from persisted schema data on every preparation
 * cycle. May be mutated during the lifecycle (e.g., encumbrance or injury
 * effects modifying speed values), but mutations are not persisted — they
 * are recomputed on the next cycle.
 */
export class MovementProfile {
    readonly medium: string;
    feetPerRound: ValueModifier;
    leaguesPerWatch: ValueModifier;
    disabled: boolean;
    readonly factors: MovementProfile.Factor[];
    readonly lineageLogic: LineageLogic;
    /** Zero-based index of this profile within the Being's movementProfiles array. */
    readonly index: number;

    constructor(
        data: MovementProfile.Data,
        lineageLogic: LineageLogic,
        index: number,
    ) {
        this.medium = data.medium;
        this.feetPerRound = new ValueModifier(
            {},
            { parent: lineageLogic },
        ).setBase(data.feetPerRound);
        this.leaguesPerWatch = new ValueModifier(
            {},
            { parent: lineageLogic },
        ).setBase(data.leaguesPerWatch);
        this.disabled = data.disabled;
        this.factors = data.factors.map((f) => ({ ...f }));
        this.lineageLogic = lineageLogic;
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
            this.lineageLogic.data.movementProfiles[this.index].factors;
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
            this.lineageLogic.data.movementProfiles[this.index].factors;
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
        lineageLogic: LineageLogic,
        profileData: MovementProfile.Data,
    ): PlainObject {
        const canonical = lineageLogic.data.movementProfiles;
        return {
            "system.movementProfiles": [...canonical, profileData],
        };
    }

    /**
     * Build an `update()` payload that removes a movement profile by medium.
     * Sources the current array from the canonical DataModel data.
     */
    static removeProfileUpdate(
        lineageLogic: LineageLogic,
        medium: string,
    ): PlainObject {
        const canonical = lineageLogic.data.movementProfiles;
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
        /** Tactical speed in feet per combat round. */
        feetPerRound: number;
        /** Strategic speed in leagues per 4-hour watch (1 league ≈ 3 miles). */
        leaguesPerWatch: number;
        disabled: boolean;
        factors: Factor[];
    }
}
