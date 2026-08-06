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
 * The pure aggregation behind a Cohort's **Shared Gear** tab (issue #76).
 *
 * A cohort owns nothing. What it displays is the gear its *members* carry and
 * have marked as shared with it — the item stays on the carrying actor (its
 * custodian), and the cohort view never duplicates, moves, or edits it. These
 * helpers do the matching and row assembly with no Foundry and no document
 * lookups; {@link sohl.document.actor.logic.CohortLogic} supplies the resolved
 * members and this cohort's own reference keys.
 */

/**
 * A cohort member, paired with the gear it carries — the input to
 * {@link collectSharedGear}.
 *
 * @typeParam TGear - The carried gear representation (a gear logic in
 *   production, a plain stub in tests).
 */
export interface SharedGearCarrier<TGear> {
    /** The member actor's display name, shown in the "Carried By" column. */
    name: string;
    /** The member actor's UUID — the row's stable handle on its custodian. */
    uuid: string;
    /** Every gear item the member carries, shared or not. */
    gear: readonly TGear[];
}

/**
 * One row of the Shared Gear tab: a gear item plus the member carrying it.
 *
 * @typeParam TGear - The gear representation carried through from
 *   {@link SharedGearCarrier}.
 */
export interface SharedGearEntry<TGear> {
    /** The shared gear item. */
    gear: TGear;
    /** Display name of the member actor that carries it. */
    carrierName: string;
    /** UUID of the member actor that carries it. */
    carrierUuid: string;
}

/**
 * The minimal shape {@link collectSharedGear} reads off a gear item: its name
 * (for row ordering) and the cohort references it is shared with.
 */
export interface SharedGearCandidate {
    /** The gear item's name. */
    name: string;
    /** The gear item's persisted data. */
    data: {
        /** The cohort references this item is shared with. */
        sharedWithCohortIds?: readonly string[];
    };
}

/**
 * Whether a gear item's sharing list names the given cohort.
 *
 * A sharing entry is a **cohort reference** — the cohort's `system.shortcode`,
 * its document id, or its UUID — so authors can key sharing by the stable,
 * human-written shortcode (the same seam the Members list uses for
 * `shortcodeOrUuid`) without breaking lists that already hold ids. Matching is
 * exact; an empty or absent reference on either side never matches.
 *
 * @param sharedWithCohortIds - The gear item's sharing list.
 * @param cohortRefs - Every reference identifying one cohort (see
 *   {@link sohl.document.actor.logic.CohortLogic.sharingRefs}).
 * @returns `true` when any sharing entry names that cohort.
 */
export function isSharedWithCohort(
    sharedWithCohortIds: readonly string[] | undefined,
    cohortRefs: readonly string[],
): boolean {
    if (!sharedWithCohortIds?.length || !cohortRefs.length) return false;
    const refs = new Set(cohortRefs.filter((r) => !!r));
    return sharedWithCohortIds.some((id) => !!id && refs.has(id));
}

/**
 * Gather every gear item the cohort's members have shared with it.
 *
 * Rows are ordered by carrier name, then by item name, so the ledger reads as a
 * per-member grouping without the display having to group it. Nothing is
 * summed: a total weight across separate carriers describes no one's load, so
 * the tab reports none (see the Shared Gear template).
 *
 * @typeParam TGear - The carried gear representation.
 * @param carriers - The cohort's resolved members and the gear each carries.
 * @param cohortRefs - Every reference identifying this cohort.
 * @returns One entry per shared item, ordered by carrier then item name.
 */
export function collectSharedGear<TGear extends SharedGearCandidate>(
    carriers: readonly SharedGearCarrier<TGear>[],
    cohortRefs: readonly string[],
): SharedGearEntry<TGear>[] {
    const entries: SharedGearEntry<TGear>[] = [];
    for (const carrier of carriers) {
        for (const gear of carrier.gear) {
            if (!isSharedWithCohort(gear.data?.sharedWithCohortIds, cohortRefs))
                continue;
            entries.push({
                gear,
                carrierName: carrier.name,
                carrierUuid: carrier.uuid,
            });
        }
    }
    return entries.sort(
        (a, b) =>
            a.carrierName.localeCompare(b.carrierName) ||
            a.gear.name.localeCompare(b.gear.name),
    );
}
