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

/**
 * A movement profile for a specific medium (terrestrial, aquatic, aerial,
 * subterranean). Each Being can have multiple profiles — one per medium
 * they can move through.
 *
 * Each profile tracks base speeds (per round and per watch) and a set
 * of factors that modify the effective speed (terrain, encumbrance,
 * injuries, etc.).
 *
 * Constructed from persisted data during the Being's lifecycle.
 */
export class MovementProfile {
    readonly medium: string;
    metersPerRound: number;
    metersPerWatch: number;
    disabled: boolean;
    readonly factors: MovementProfile.Factor[];

    constructor(data: MovementProfile.Data) {
        this.medium = data.medium;
        this.metersPerRound = data.metersPerRound;
        this.metersPerWatch = data.metersPerWatch;
        this.disabled = data.disabled;
        this.factors = data.factors.map((f) => ({ ...f }));
    }

    toJSON(): MovementProfile.Data {
        return {
            medium: this.medium,
            metersPerRound: this.metersPerRound,
            metersPerWatch: this.metersPerWatch,
            disabled: this.disabled,
            factors: this.factors.map((f) => ({ ...f })),
        };
    }
}

export namespace MovementProfile {
    /** A modifier factor applied to movement speed. */
    export interface Factor {
        scope: string;
        key: string;
        mode: number;
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
