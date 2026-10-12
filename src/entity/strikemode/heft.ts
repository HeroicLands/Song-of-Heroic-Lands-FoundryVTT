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

/** Inputs to the melee Heft rule; listedHeft excludes grip adjustments. */
export interface HeftInputs {
    /** Wielder's effective Strength. */
    strength: number;
    /** The strike mode's unadjusted Heft. */
    listedHeft: number;
    /** Whether two usable hands wield the mode. */
    twoHanded: boolean;
    /** Whether the grip uses only the non-primary side. */
    offHand: boolean;
    /** Shields are exempt from the off-hand Heft increase. */
    shield: boolean;
    /** The melee mode is swung rather than thrust. */
    swung: boolean;
}

/**
 * Resolve grip-adjusted Heft, attack/defense penalty, and two-handed impact.
 * Two-handed relief never lowers the threshold for the impact bonus.
 * @param input - Strength, listed Heft, grip and mode properties.
 * @returns The effective Heft, nonpositive mastery penalty and impact bonus.
 */
export function resolveHeft(input: HeftInputs): {
    effectiveHeft: number;
    penalty: number;
    impactBonus: number;
} {
    const effectiveHeft =
        input.listedHeft +
        (input.twoHanded ? -5
        : input.offHand && !input.shield ? 5
        : 0);
    return {
        effectiveHeft,
        penalty: 5 * Math.min(0, input.strength - effectiveHeft),
        impactBonus: Number(input.twoHanded && input.swung && input.strength >= input.listedHeft),
    };
}
