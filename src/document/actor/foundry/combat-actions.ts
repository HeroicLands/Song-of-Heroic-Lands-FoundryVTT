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

import type { MasteryLevelModifier } from "@src/domain/modifier/MasteryLevelModifier";

export type StrikeModeTestKind = "attack" | "block" | "counterstrike";

interface ActorLike {
    items: { get: (id: string) => any };
}

/**
 * Resolve the MasteryLevelModifier for a given strike-mode test on an actor.
 *
 * Pure function — does not touch the DOM or Foundry globals — so it can be
 * unit-tested. The Being sheet's click handler uses this to convert the
 * data attributes on the Combat tab into a runnable mastery test.
 *
 * @param actor   Anything with an `items.get(id)` accessor (a SohlActor at runtime).
 * @param itemId  ID of the item carrying the strike mode (weapon or combat technique).
 * @param smId    ID of the strike mode within that item.
 * @param testKind Which roll to fetch: attack, block, or counterstrike.
 * @returns The modifier, or `null` if any lookup step failed (missing item,
 *          missing strike mode, or the kind isn't valid on this mode — e.g.
 *          block on a missile mode).
 */
export function resolveStrikeModeML(
    actor: ActorLike,
    itemId: string,
    smId: string,
    testKind: StrikeModeTestKind,
): MasteryLevelModifier | null {
    const item = actor.items.get(itemId);
    if (!item) return null;
    const strikeModes = item.logic?.strikeModes;
    if (!Array.isArray(strikeModes)) return null;
    const sm = strikeModes.find((m: any) => m.id === smId);
    if (!sm) return null;
    if (testKind === "attack") return sm.attack ?? null;
    if (testKind === "block") return sm.defense?.block ?? null;
    if (testKind === "counterstrike") return sm.defense?.counterstrike ?? null;
    return null;
}
