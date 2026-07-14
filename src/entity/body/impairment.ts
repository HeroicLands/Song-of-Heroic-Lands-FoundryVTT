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
 * Body-part impairment derivation (#464).
 *
 * A body part's impairment is the penalty applied to any use of it, caused by
 * wounds and easing as they heal. A part takes the **most serious** injury among
 * its hit locations:
 *
 * - a **grievous** injury (level ≥ 4, `G4`/`G5`) makes the part **unusable**;
 * - a **serious** injury (level 2–3, `S2`/`S3`) impairs it by **−10**;
 * - a **minor** injury (level 1, `M1`) impairs it by **−5**, but only while it is
 *   slow to heal (healing rate ≤ 5);
 *
 * and as injuries heal the part climbs back unusable → −10 → −5 → none. A
 * **permanent impairment** (a non-positive floor, e.g. an old maiming) is a
 * minimum the result can never be milder than.
 *
 * Pure and Foundry-free; consumed by the Being-sheet header grid (and, later, the
 * health derivation #463).
 */

/** Injury-level bands (the numeric {@link INJURY_LEVELS} index, 1 = `M1` … 5 = `G5`). */
const GRIEVOUS_MIN = 4;
const SERIOUS_MIN = 2;
const MINOR_LEVEL = 1;
/** A minor injury only impairs while its healing rate is at or below this. */
const MINOR_IMPAIRING_HR_MAX = 5;

/** Impairment magnitudes. */
const SERIOUS_IMPAIRMENT = -10;
const MINOR_IMPAIRMENT = -5;

/**
 * Display status bucket for a body part, driving the header grid's color coding:
 * `none` (white), `minor` (−5, yellow), `major` (−10 or worse, blue),
 * `unusable` (black).
 */
export const BODY_PART_STATUS = {
    NONE: "none",
    MINOR: "minor",
    MAJOR: "major",
    UNUSABLE: "unusable",
} as const;

/** A body part's display status. */
export type BodyPartStatus =
    (typeof BODY_PART_STATUS)[keyof typeof BODY_PART_STATUS];

/** The derived impairment of a single body part. */
export interface BodyPartImpairment {
    /**
     * Impairment penalty as a non-positive number (`0` when none). Not
     * meaningful when {@link unusable} is `true`.
     */
    impairment: number;
    /** Whether the part is unusable (a grievous injury to any of its locations). */
    unusable: boolean;
    /** Display status bucket for the header grid. */
    status: BodyPartStatus;
}

/** The minimal view of an active injury needed to derive impairment. */
export interface LocationInjury {
    /** Shortcode of the injured body location. */
    locationShortcode: string;
    /** Injury level (1 = `M1` … 5 = `G5`); `0`/`NA` means no injury. */
    level: number;
    /** Healing rate — a minor injury only impairs while this is ≤ 5. */
    healingRate: number;
}

/**
 * Derive a body part's impairment from the injuries on its hit locations,
 * honoring a permanent-impairment floor.
 *
 * @param locationShortcodes - The shortcodes of the part's hit locations.
 * @param injuries - Active injuries (any location); those not on this part are ignored.
 * @param permanentImpairment - A non-positive floor the result can never be milder than (default `0`).
 * @returns The part's impairment, unusable flag, and display status.
 */
export function bodyPartImpairment(
    locationShortcodes: readonly string[],
    injuries: readonly LocationInjury[],
    permanentImpairment = 0,
): BodyPartImpairment {
    const locs = new Set(locationShortcodes);
    let unusable = false;
    let impairment = 0;

    for (const injury of injuries) {
        if (!locs.has(injury.locationShortcode) || injury.level <= 0) continue;
        if (injury.level >= GRIEVOUS_MIN) {
            unusable = true;
        } else if (injury.level >= SERIOUS_MIN) {
            impairment = Math.min(impairment, SERIOUS_IMPAIRMENT);
        } else if (
            injury.level === MINOR_LEVEL &&
            injury.healingRate <= MINOR_IMPAIRING_HR_MAX
        ) {
            impairment = Math.min(impairment, MINOR_IMPAIRMENT);
        }
    }

    // A permanent impairment is a floor: the result is never milder than it.
    impairment = Math.min(impairment, Math.min(0, permanentImpairment));

    const status: BodyPartStatus =
        unusable ? BODY_PART_STATUS.UNUSABLE
        : impairment <= SERIOUS_IMPAIRMENT ? BODY_PART_STATUS.MAJOR
        : impairment <= MINOR_IMPAIRMENT ? BODY_PART_STATUS.MINOR
        : BODY_PART_STATUS.NONE;

    return { impairment, unusable, status };
}
