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

import { ITEM_KIND } from "@src/utils/constants";
import type { SohlActorLogic } from "@src/document/actor/logic/SohlActorBaseLogic";
import type { AffiliationLogic } from "@src/document/item/logic/AffiliationLogic";

/**
 * Resolve the faction/**Affiliation** an item draws its standing from, from its
 * associated-affiliation shortcode (`assocAffiliationCode`).
 *
 * Some Mystical Abilities are associated with a particular faction — a religion,
 * an arcane or alchemical school, an ancestor/totem/spirit — whose membership
 * confers an available area, level, circle, or capability separate from the
 * activating skill's own mastery level. That association is recorded as a
 * shortcode and resolved here by looking the Affiliation up on the same actor,
 * exactly as {@link resolveAssocSkill} resolves the activating skill.
 *
 * The result is `undefined` when the actor is unknown, the code is blank, or no
 * Affiliation with that shortcode is embedded on the actor. Returning
 * `undefined` rather than an unchecked cast keeps callers honest: a blank or
 * unmatched code must not masquerade as a present Affiliation.
 *
 * @param actorLogic - The owning actor's logic (the lookup scope), or `null`/`undefined`.
 * @param assocAffiliationCode - The associated Affiliation's shortcode, possibly blank/`undefined`.
 * @returns The matching {@link AffiliationLogic}, or `undefined` if none resolves.
 */
export function resolveAssocAffiliation(
    actorLogic: SohlActorLogic<any> | null | undefined,
    assocAffiliationCode: string | null | undefined,
): AffiliationLogic | undefined {
    if (!actorLogic || !assocAffiliationCode) return undefined;
    return actorLogic.getItemLogic(
        assocAffiliationCode,
        ITEM_KIND.AFFILIATION,
    ) as AffiliationLogic | undefined;
}
