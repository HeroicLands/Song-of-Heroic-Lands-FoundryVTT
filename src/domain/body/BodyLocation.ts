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

import type { ImpactAspect } from "@src/utils/constants";

/**
 * A specific hit location within a {@link BodyPart} — e.g., "Skull",
 * "Upper Left Arm", "Abdomen".
 *
 * Each location tracks its probability weight for random hit selection,
 * natural protection values per {@link ImpactAspect}, and injury-related
 * thresholds (bleeding severity, amputation modifier, shock value).
 *
 * Constructed from persisted data during the Being's lifecycle and used
 * by the combat resolution pipeline for hit location determination and
 * damage calculation.
 */
export class BodyLocation {
    readonly name: string;
    readonly isFumble: boolean;
    readonly isStumble: boolean;
    readonly bleedingSevThreshold: number;
    readonly amputateModifier: number;
    readonly shockValue: number;
    readonly probWeight: number;
    readonly protectionBase: BodyLocation.ProtectionMap;

    constructor(data: BodyLocation.Data) {
        this.name = data.name;
        this.isFumble = data.isFumble;
        this.isStumble = data.isStumble;
        this.bleedingSevThreshold = data.bleedingSevThreshold;
        this.amputateModifier = data.amputateModifier;
        this.shockValue = data.shockValue;
        this.probWeight = data.probWeight;
        this.protectionBase = { ...data.protectionBase };
    }

    /**
     * Get the natural protection value for a given impact aspect.
     * Returns 0 if the aspect is not present.
     */
    getProtection(aspect: ImpactAspect): number {
        return this.protectionBase[aspect] ?? 0;
    }

    toJSON(): BodyLocation.Data {
        return {
            name: this.name,
            isFumble: this.isFumble,
            isStumble: this.isStumble,
            bleedingSevThreshold: this.bleedingSevThreshold,
            amputateModifier: this.amputateModifier,
            shockValue: this.shockValue,
            probWeight: this.probWeight,
            protectionBase: { ...this.protectionBase },
        };
    }
}

export namespace BodyLocation {
    /** Natural protection values keyed by impact aspect. */
    export type ProtectionMap = Record<string, number>;

    /** Persisted data shape for a body location. */
    export interface Data {
        name: string;
        isFumble: boolean;
        isStumble: boolean;
        bleedingSevThreshold: number;
        amputateModifier: number;
        shockValue: number;
        probWeight: number;
        protectionBase: ProtectionMap;
    }
}
