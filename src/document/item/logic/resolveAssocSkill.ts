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
import type { SkillLogic } from "@src/document/item/logic/SkillLogic";

/**
 * Resolve the skill governing an item or strike mode from its associated-skill
 * shortcode (`assocSkillCode`).
 *
 * Several entities carry an `assocSkillCode` and need the mastery level of the
 * named skill: a weapon's and a combat technique's strike modes (Atk/Blk/CX), a
 * mystical ability, and a mystery. They all resolve it the same way — look the
 * skill up on the wielding actor by shortcode — so that lookup lives here once.
 *
 * The result is `undefined` when the actor is unknown, the code is blank, or no
 * skill with that shortcode is embedded on the actor. Returning `undefined`
 * rather than an unchecked `getItemLogic(...) as SkillLogic` keeps callers
 * honest: a blank or unmatched code must not masquerade as a present skill.
 *
 * @param actorLogic - The wielding actor's logic (the lookup scope), or `null`/`undefined`.
 * @param assocSkillCode - The associated skill's shortcode, possibly blank/`undefined`.
 * @returns The matching {@link SkillLogic}, or `undefined` if none resolves.
 */
export function resolveAssocSkill(
    actorLogic: SohlActorLogic<any> | null | undefined,
    assocSkillCode: string | undefined,
): SkillLogic | undefined {
    if (!actorLogic || !assocSkillCode) return undefined;
    return actorLogic.getItemLogic(assocSkillCode, ITEM_KIND.SKILL) as
        | SkillLogic
        | undefined;
}
