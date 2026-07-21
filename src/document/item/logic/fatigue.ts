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
 * Shared helper for inflicting **weakness fatigue** — the long-term fatigue tied
 * to lingering ailments (anaemia of blood loss, disease/infection reactions). It
 * is modeled, like all fatigue, as a `fatigue`-subtype trauma (see the Fatigue
 * system, #552); its Fatigue Levels fold into the being's Fatigue Penalty.
 */

import { fvttCreateEmbeddedItems } from "@src/core/FoundryHelpers";
import type { SohlActorLogic } from "@src/document/actor/logic/SohlActorBaseLogic";
import {
    FATIGUE_CATEGORY,
    ITEM_KIND,
    TRAUMA_SUBTYPE,
} from "@src/utils/constants";

/**
 * Inflict `levels` Fatigue Levels of **weakness** fatigue on `actorLogic` as a
 * new fatigue-subtype trauma. A no-op for a non-positive `levels` or a missing
 * actor.
 *
 * @param actorLogic - The actor logic to add the fatigue trauma to.
 * @param levels - The Fatigue Levels to inflict.
 * @param name - The display name for the fatigue trauma (e.g. its source).
 * @returns A promise that resolves once the fatigue trauma is created.
 */
export async function inflictWeaknessFatigue(
    actorLogic: SohlActorLogic<any> | null | undefined,
    levels: number,
    name: string,
): Promise<void> {
    if (levels <= 0 || !actorLogic) return;
    await fvttCreateEmbeddedItems(actorLogic, [
        {
            type: ITEM_KIND.TRAUMA,
            name,
            system: {
                subType: TRAUMA_SUBTYPE.FATIGUE,
                category: FATIGUE_CATEGORY.WEAKNESS,
                levelBase: levels,
            },
        },
    ]);
}
