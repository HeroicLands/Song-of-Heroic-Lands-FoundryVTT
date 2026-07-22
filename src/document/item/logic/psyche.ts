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
 * Psyche Stress (PSY) — the shared inflictor for **Psyche Stress Levels**
 * ([Psychological Condition](https://kb.heroiclands.org/dev/reference/randomness/)).
 *
 * Psyche Stress rarely arises on its own — it spins off another trauma (a Fear or
 * Morale critical, an Aural Shock recovery failure). Each occurrence is recorded
 * as its own **`psycond`-subtype trauma** whose `levelBase` is its PSY level. This
 * module is the create-the-trauma primitive that the trauma tests call; the PSY
 * recovery test and behavioral effects are the Psychological Condition feature
 * (#560).
 */

import { fvttCreateEmbeddedItems } from "@src/core/FoundryHelpers";
import type { SohlActorLogic } from "@src/document/actor/logic/SohlActorBaseLogic";
import { ITEM_KIND, TRAUMA_SUBTYPE } from "@src/utils/constants";

/**
 * Inflict `levels` Psyche Stress Levels on `actorLogic` as a new
 * `psycond`-subtype trauma. A no-op for a non-positive `levels` or a missing
 * actor. Each call records a **separate** psyche-stress instance, as the rules
 * require ("each instance is recorded separately").
 *
 * @param actorLogic - The actor logic to add the psyche-stress trauma to.
 * @param levels - The Psyche Stress Levels to inflict.
 * @param name - The display name for the condition (typically its source).
 * @returns A promise that resolves once the psyche-stress trauma is created.
 */
export async function inflictPsycheStress(
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
                subType: TRAUMA_SUBTYPE.PSYCHOLOGICAL_CONDITION,
                levelBase: levels,
            },
        },
    ]);
}
