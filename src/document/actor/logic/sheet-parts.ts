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

import { NONE_MOVE_PROFILE, type MovementProfile } from "@src/document/actor/logic/movement";
import { MovementMediumChoices, type MovementMedium } from "@src/utils/constants";

/**
 * The render parts every actor sheet shows, whatever its type and whatever the
 * viewer's permission: the experimental-schema banner (fenced types only), the
 * header, the tab navigation, and the Facade tab.
 *
 * Everything else is a *detail* part, withheld under limited permission.
 */
const ALWAYS_PARTS: readonly string[] = ["fencedBanner", "header", "tabs", "facade"];

/** The render part id of the fenced (experimental) schema banner. */
const FENCED_BANNER_PART_ID = "fencedBanner";

/**
 * Choose which of a sheet's declared render parts to actually render.
 *
 * ApplicationV2 renders exactly the parts named in `options.parts`, so this list
 * — not the sheet's `static PARTS` — decides what reaches the DOM. Deriving it
 * from the declared part ids means a sheet gets its tab bodies simply by
 * declaring them, rather than by also restating them in an override; forgetting
 * that second step is what left the Vehicle, Structure, and Cohort sheets
 * showing an empty panel for every tab but Facade (issue #1088).
 *
 * Declaration order is preserved, so a sheet controls part order through its
 * `PARTS` record.
 *
 * @param partIds - The sheet's declared part ids, in declaration order.
 * @param opts - What to render for.
 * @param opts.isFenced - Whether the document's type is fenced (experimental);
 *   the banner part is dropped for unfenced types.
 * @param opts.isLimited - Whether the viewer only has limited permission; the
 *   detail tabs are withheld.
 * @returns The part ids to render, in declaration order.
 */
export function resolveActorSheetParts(
    partIds: readonly string[],
    opts: { isFenced: boolean; isLimited: boolean },
): string[] {
    return partIds.filter((id) => {
        // The banner is declared by every fenced sheet but only shown when the
        // type really is fenced (issue #959).
        if (id === FENCED_BANNER_PART_ID) return opts.isFenced;
        return !opts.isLimited || ALWAYS_PARTS.includes(id);
    });
}

/** One row of the Profile tab's movement ledger. */
export interface MovementRow {
    /** The medium this row describes. */
    medium: MovementMedium;
    /** Localization key for the medium's display name. */
    label: string;
    /** Tactical move (feet per combat round) in this medium. */
    value: number;
    /** Whether this is the actor's current (starred) medium. */
    isCurrent: boolean;
}

/**
 * Build the Profile tab's movement ledger for **any** actor kind.
 *
 * Movement is a universal actor capability, so this is shared by every actor
 * sheet rather than being a Being concern. The canonical no-movement row always
 * comes first — actors never author a `NONE` profile themselves, so without it
 * a mover could never be made immobile — followed by each authored profile in
 * order. Exactly the row matching `current` is starred.
 *
 * Pure and Foundry-free.
 *
 * @param profiles - The actor's authored movement profiles.
 * @param current - The actor's current movement medium.
 * @returns One row per medium, no-movement first.
 */
export function buildMovementRows(
    profiles: readonly MovementProfile[],
    current: MovementMedium,
): MovementRow[] {
    return [NONE_MOVE_PROFILE, ...profiles].map((profile) => ({
        medium: profile.medium,
        label: MovementMediumChoices[profile.medium],
        value: profile.feetPerRound,
        isCurrent: profile.medium === current,
    }));
}
