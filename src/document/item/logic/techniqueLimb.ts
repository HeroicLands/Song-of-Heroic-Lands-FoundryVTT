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
 * Gating a combat technique on the limb that performs it.
 *
 * The rule is Foundry-free and lives in
 * {@link sohl.entity.body.resolvePerformingLimbs}; this module is the thin
 * document-layer wiring that gathers what it needs — the wielder's body, the
 * technique's roles, how many limbs its mode occupies, and the wielder's
 * dominant side — and disables the technique's rolls with the reason when the
 * body has no limb to spare.
 *
 * **The technique is disabled, not removed.** A missing option reads as a bug,
 * and the constraint is worth stating: a character holding a sword and a shield
 * sees the grab with "no free hand" against it, which also says what to do about
 * it. Both the attack and the two defences are disabled, because a technique
 * nobody can perform cannot block or counterstrike either.
 *
 * It runs in the **finalize** phase: the body's parts learn they are unusable or
 * held fast during the Being's earlier phases, so an earlier read would gate
 * against a body that had not yet been told what was wrong with it.
 */

import { getActorBody } from "@src/document/actor/logic/BodyLogic";
import { MeleeStrikeMode } from "@src/entity/strikemode/MeleeStrikeMode";
import type { StrikeModeBase } from "@src/entity/strikemode/StrikeModeBase";
import { resolvePerformingLimbs, type PerformingLimbs } from "@src/entity/body/performingLimb";
import type { BodySide } from "@src/utils/constants";

/** The subset of a combat-technique skill's logic this wiring reads. */
interface TechniqueCarrier {
    /** The technique's own strike mode, absent on a skill that is not a technique. */
    strikeMode?: StrikeModeBase;
    /** The wielder's logic, when the item is owned. */
    actorLogic?: unknown;
    /**
     * The skill's persisted data, read for the roles the technique is performed
     * with. `impairedByRoles` is declared on the DataModel rather than on the
     * `SkillData` interface, so it is narrowed at the read as its other readers
     * narrow it.
     */
    data?: unknown;
}

/**
 * Which limbs perform an owned combat technique, and why none is available.
 *
 * @param logic - The combat-technique skill's logic.
 * @returns The resolved limbs, or `undefined` when the question does not
 *   arise — an unowned technique, a wielder with no body, or a technique
 *   declaring no role to perform it with.
 */
export function techniquePerformingLimbs(logic: TechniqueCarrier): PerformingLimbs | undefined {
    const sm = logic.strikeMode;
    if (!sm) return undefined;
    const structure = getActorBody(logic.actorLogic)?.structure;
    if (!structure) return undefined;
    const roles = (logic.data as { impairedByRoles?: string[] } | undefined)?.impairedByRoles ?? [];
    if (roles.length === 0) return undefined;
    return resolvePerformingLimbs({
        structure,
        roles,
        minParts: sm.minParts,
        dominantSide: (logic.actorLogic as { dominantSide?: BodySide } | undefined)?.dominantSide,
    });
}

/**
 * Disable an owned combat technique's rolls while the wielder has no limb free
 * to perform it with, naming the reason.
 *
 * A no-op for a technique the wielder can perform, and for one the question does
 * not arise for. Idempotent — the reason is restated rather than compounded, so
 * it is safe in a repeated lifecycle phase.
 *
 * @param logic - The combat-technique skill's logic, modified in place.
 */
export function applyTechniqueLimbGate(logic: TechniqueCarrier): void {
    const sm = logic.strikeMode;
    if (!sm) return;
    const resolved = techniquePerformingLimbs(logic);
    if (!resolved?.disabledReason) return;

    sm.attack.disabledReason = resolved.disabledReason;
    if (sm instanceof MeleeStrikeMode) {
        sm.defense.block.disabledReason = resolved.disabledReason;
        sm.defense.counterstrike.disabledReason = resolved.disabledReason;
    }
}
