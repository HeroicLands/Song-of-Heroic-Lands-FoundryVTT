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
 * Prone combat effects (#562) — the pure, Foundry-free application of the prone
 * penalty to a melee strike mode.
 *
 * A prone being suffers **−20 to all melee attacks and defenses** (Prone rules,
 * `assets/content/Rules/Prone.md`). This module applies that penalty to a
 * {@link sohl.entity.strikemode.MeleeStrikeMode}'s attack and both defense
 * modifiers; the owning logic decides *when* to call it (when the wielder carries
 * the `prone` status), mirroring how body reach is folded into a melee mode.
 *
 * The remaining prone effects — Engagement-Zone, body-part-selection, and
 * Outnumbered interactions, and the quarter-Move cost to rise — live with those
 * subsystems and are not applied here.
 */

import type { MeleeStrikeMode } from "@src/entity/strikemode/MeleeStrikeMode";

/**
 * The **−20** penalty a prone being suffers to all melee attacks and defenses
 * (Prone rules).
 */
export const PRONE_MELEE_PENALTY = -20;

/**
 * Apply the prone {@link PRONE_MELEE_PENALTY} to a melee strike mode's **attack**
 * and both defenses (**Block** and **Counterstrike**).
 *
 * @param sm - The melee strike mode to penalize.
 */
export function applyProneMeleePenalty(sm: MeleeStrikeMode): void {
    sm.attack.add("SOHL.Prone", "Prone", PRONE_MELEE_PENALTY);
    sm.defense.block.add("SOHL.Prone", "Prone", PRONE_MELEE_PENALTY);
    sm.defense.counterstrike.add("SOHL.Prone", "Prone", PRONE_MELEE_PENALTY);
}
