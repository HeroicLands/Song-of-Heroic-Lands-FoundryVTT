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

import { ITEM_KIND } from "@src/utils/constants";
import type { LineageLogic } from "@src/document/item/logic/LineageLogic";
import type { SohlItem } from "@src/document/item/foundry/SohlItem";
import type { SohlActor } from "@src/document/actor/foundry/SohlActor";

/**
 * The effective base melee reach (feet) for an actor, sourced from its
 * `Lineage` item. Used when computing a melee strike mode's reach during
 * the evaluate phase.
 *
 * Lineage is a Being-only concept; any other actor (Structure, Vehicle, …)
 * — or none at all — has no lineage, in which case this is a no-op that
 * returns 0, so reach falls back to weapon length alone. It is not an error
 * for a non-Being to lack (or even carry an inert) lineage.
 *
 * Kept Foundry-free (the document imports are type-only) so it can be
 * unit-tested without loading the document layer.
 */
export function actorLineageReach(
    actor: SohlActor | null | undefined,
): number {
    const lineageItem: SohlItem | undefined = actor?.items.find(
        (i: any) => i.type === ITEM_KIND.LINEAGE,
    );
    const lineageLogic = lineageItem?.logic as LineageLogic | undefined;
    return lineageLogic?.reach.effective ?? 0;
}
