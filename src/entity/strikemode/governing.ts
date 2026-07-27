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
 * Governing mastery level (#755) — the pure, Foundry-free derivation of a strike
 * mode's Atk/Blk/CX rolls from the mastery level of the skill that governs it.
 *
 * A strike mode's own `attack`/`block`/`counterstrike` modifiers carry only its
 * flat Atk/Blk/CX deltas; the mastery level that makes them non-zero comes from
 * the governing skill. Both wielders of strike modes fold it in the same way:
 * a **weapon** (`WeaponGearLogic`) resolves the governing skill from each strike
 * mode's `assocSkillCode`, and a **combat technique** (`SkillLogic`) uses its own
 * mastery level (or an `assocSkillCode` override). The owning logic decides
 * *which* mastery level governs; this helper applies it.
 */

import { MeleeStrikeMode } from "@src/entity/strikemode/MeleeStrikeMode";
import type { StrikeModeBase } from "@src/entity/strikemode/StrikeModeBase";
import type { MasteryLevelModifier } from "@src/entity/modifier/MasteryLevelModifier";

/**
 * Fold a governing mastery level into a strike mode's combat rolls. The
 * `governing` modifier's base and its labeled deltas are merged into the strike
 * mode's `attack` (and, for a {@link MeleeStrikeMode}, its `block` and
 * `counterstrike`) via `addVM({ includeBase: true })`, so the strike mode's own
 * flat modifiers layer on top with the full derivation intact. A disabled
 * governing mastery level disables the derived rolls.
 *
 * @param sm - The strike mode whose combat rolls to drive.
 * @param governing - The governing skill's mastery-level modifier.
 */
export function applyGoverningMasteryLevel(
    sm: StrikeModeBase,
    governing: MasteryLevelModifier,
): void {
    const derived: MasteryLevelModifier[] = [sm.attack];
    if (sm instanceof MeleeStrikeMode) {
        derived.push(sm.defense.block, sm.defense.counterstrike);
    }
    for (const mod of derived) {
        mod.addVM(governing, { includeBase: true });
        if (governing.disabled) mod.disabled = governing.disabled;
    }
}
