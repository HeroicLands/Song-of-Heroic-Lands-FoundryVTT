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

/** Impairment magnitudes and tier boundaries. */
const SERIOUS_IMPAIRMENT = -10;
const MINOR_IMPAIRMENT = -5;

/** Permanent-impairment step per completed 20-day band, and its floor. */
const PERMANENT_IMPAIRMENT_PER_BAND = -5;
const PERMANENT_IMPAIRMENT_BAND_DAYS = 20;
const PERMANENT_IMPAIRMENT_FLOOR = -25;

/**
 * The **permanent impairment** an eligible wound leaves, scaled by how long it
 * took to heal (Injury rules — Permanent Impairment): `< 20 days → none`, then
 * −5 per completed 20-day band (`20–39 → −5`, `40–59 → −10`, … `80–99 → −20`),
 * floored at `−25` for `100+` days. Only wounds flagged
 * {@link sohl.document.item.logic.TraumaData.permanentImpairmentEligible} (set by
 * the Treatment Test, #553) accrue it.
 *
 * @param daysToHeal - Days from wounding to the injury reaching level 0.
 * @returns The permanent impairment as a non-positive number (`0` when none).
 */
export function permanentImpairmentFor(daysToHeal: number): number {
    if (daysToHeal < PERMANENT_IMPAIRMENT_BAND_DAYS) return 0;
    const bands = Math.floor(daysToHeal / PERMANENT_IMPAIRMENT_BAND_DAYS);
    return Math.max(
        PERMANENT_IMPAIRMENT_FLOOR,
        bands * PERMANENT_IMPAIRMENT_PER_BAND,
    );
}

/**
 * Whether a test **auto-Critically-Fails** because it requires a body part the
 * actor cannot use (#568): the governing skill/attribute lists (in its
 * `impairedByRoles`) at least one body-part role that is currently
 * {@link BodyPartImpairment.usable | unusable}.
 *
 * A test with no impaired-by roles, or an actor with no unusable roles, never
 * auto-fails on this basis.
 *
 * @param impairedByRoles - The body-part roles the test depends on.
 * @param unusableRoles - The roles of every currently-unusable body part.
 * @returns `true` when the test requires an unusable part.
 */
export function testAutoCriticallyFails(
    impairedByRoles: readonly string[] | undefined,
    unusableRoles: ReadonlySet<string>,
): boolean {
    if (!impairedByRoles?.length || unusableRoles.size === 0) return false;
    return impairedByRoles.some((role) => unusableRoles.has(role));
}

/**
 * A body part's impairment **tier**, by magnitude (#470): `none` (0), `minor`
 * (−1…−5), `serious` (−6…−10), `grievous` (≤ −11). Injuries reach at most
 * `serious` (a grievous injury makes the part *unusable* rather than adding a
 * number); the `grievous` tier is only reached via permanent impairment.
 */
export const BODY_PART_TIER = {
    NONE: "none",
    MINOR: "minor",
    SERIOUS: "serious",
    GRIEVOUS: "grievous",
} as const;

/** A body part's impairment tier. */
export type BodyPartTier = (typeof BODY_PART_TIER)[keyof typeof BODY_PART_TIER];

/**
 * Display status bucket for the header grid's color coding: `none` (white),
 * `minor` (−5, yellow), `major` (−10 or worse, blue), `unusable` (black).
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
     * Impairment penalty as a non-positive number (`0` when none). The worst
     * (most negative) of the permanent impairment and each current injury.
     */
    impairment: number;
    /**
     * Whether the part can still be used. `false` when it has a **grievous
     * injury** or is flagged `permanentlyUnusable`. Permanent *impairment*
     * (however severe) never makes a part unusable.
     */
    usable: boolean;
    /** Impairment tier by magnitude (drives the health ceiling, #470). */
    tier: BodyPartTier;
    /** Display status bucket for the header grid (#464). */
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
 * Tier a non-positive impairment magnitude.
 * @param impairment - The part's impairment (`≤ 0`).
 * @returns The impairment tier.
 */
function tierOf(impairment: number): BodyPartTier {
    if (impairment === 0) return BODY_PART_TIER.NONE;
    if (impairment >= MINOR_IMPAIRMENT) return BODY_PART_TIER.MINOR; // −1…−5
    if (impairment >= SERIOUS_IMPAIRMENT) return BODY_PART_TIER.SERIOUS; // −6…−10
    return BODY_PART_TIER.GRIEVOUS; // ≤ −11
}

/**
 * Derive a body part's impairment from the injuries on its hit locations, its
 * permanent impairment, and a permanent-unusable flag.
 *
 * Impairment is the **worst (most negative) of** {permanent impairment, each
 * current injury} — never additive. A serious injury contributes −10, a minor
 * (slow-healing, HR ≤ 5) −5; a **grievous** injury contributes no number but
 * makes the part **unusable**. Permanent impairment tiers the part (a −20 arm is
 * `grievous` tier) but never unuses it — only a grievous injury or the
 * `permanentlyUnusable` flag does.
 *
 * @param locationShortcodes - The shortcodes of the part's hit locations.
 * @param injuries - Active injuries (any location); those not on this part are ignored.
 * @param permanentImpairment - A non-positive permanent impairment (default `0`).
 * @param permanentlyUnusable - Whether the part is permanently unusable (default `false`).
 * @returns The part's impairment, tier, usable flag, and grid status.
 */
export function bodyPartImpairment(
    locationShortcodes: readonly string[],
    injuries: readonly LocationInjury[],
    permanentImpairment = 0,
    permanentlyUnusable = false,
): BodyPartImpairment {
    const locs = new Set(locationShortcodes);
    let grievousInjury = false;
    let impairment = 0;

    for (const injury of injuries) {
        if (!locs.has(injury.locationShortcode) || injury.level <= 0) continue;
        if (injury.level >= GRIEVOUS_MIN) {
            grievousInjury = true; // unusable — no numeric impairment
        } else if (injury.level >= SERIOUS_MIN) {
            impairment = Math.min(impairment, SERIOUS_IMPAIRMENT);
        } else if (
            injury.level === MINOR_LEVEL &&
            injury.healingRate <= MINOR_IMPAIRING_HR_MAX
        ) {
            impairment = Math.min(impairment, MINOR_IMPAIRMENT);
        }
    }

    // Worst-of: permanent impairment and injuries do not stack.
    impairment = Math.min(impairment, Math.min(0, permanentImpairment));

    const usable = !grievousInjury && !permanentlyUnusable;
    const tier = tierOf(impairment);

    const status: BodyPartStatus =
        !usable ? BODY_PART_STATUS.UNUSABLE
        : tier === BODY_PART_TIER.SERIOUS || tier === BODY_PART_TIER.GRIEVOUS ?
            BODY_PART_STATUS.MAJOR
        : tier === BODY_PART_TIER.MINOR ? BODY_PART_STATUS.MINOR
        : BODY_PART_STATUS.NONE;

    return { impairment, usable, tier, status };
}
