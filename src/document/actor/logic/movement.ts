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

import { MOVEMENT_MEDIUM, type MovementMedium } from "@src/utils/constants";

/**
 * A single per-medium movement profile persisted on an actor. Bundles the
 * actor's speeds in one {@link MovementMedium} with the {@link sohl.entity.expr.SafeExpression}s
 * (stored as source strings) that turn carried weight into encumbrance and shift
 * it by strength.
 *
 * @remarks Movement is a universal actor capability: every actor carries
 * `currentMoveMedium` + `movementProfiles` on the base actor schema, and the
 * base actor logic ({@link sohl.document.actor.logic.SohlActorBaseLogic}) selects
 * the active profile. Only some actor kinds (Beings) derive the `strMod` /
 * `encumbrance` expressions; for the rest those default to a no-op `"0"`.
 */
export interface MovementProfile {
    /** The movement medium this profile describes. */
    medium: MovementMedium;
    /** Tactical move (feet per combat round) in this medium. */
    feetPerRound: number;
    /** Overland travel speed (leagues per watch) in this medium. */
    leaguesPerWatch: number;
    /** `SafeExpression` source of carried weight (`wt`) → encumbrance units. */
    encumbrance: string;
    /** `SafeExpression` source of strength (`str`) → encumbrance shift. */
    strMod: string;
    /** Whether this movement profile is disabled. */
    disabled: boolean;
}

/**
 * The single canonical **no-movement** profile for {@link MOVEMENT_MEDIUM.NONE}
 * — a disabled profile with zero speeds representing an actor that cannot move
 * at all (e.g. a Structure).
 *
 * Actors never author a `NONE` entry in their {@link SohlActorData.movementProfiles};
 * this shared constant stands in for it, so every non-mover need not define its
 * own. It also doubles as the fallback when an actor's `currentMoveMedium` names
 * no configured profile (movement in a medium the actor lacks).
 */
export const NONE_MOVE_PROFILE: MovementProfile = {
    medium: MOVEMENT_MEDIUM.NONE,
    feetPerRound: 0,
    leaguesPerWatch: 0,
    encumbrance: "0",
    strMod: "0",
    disabled: true,
};

/**
 * Select the active movement profile for an actor by its current medium.
 *
 * {@link MOVEMENT_MEDIUM.NONE} always resolves to the shared
 * {@link NONE_MOVE_PROFILE} (actors never author a `NONE` profile). Any other
 * medium selects the matching authored profile, or falls back to a fresh
 * {@link NONE_MOVE_PROFILE} copy when the actor has no profile for it.
 *
 * @param profiles - The actor's persisted per-medium movement profiles.
 * @param currentMoveMedium - The medium the actor is currently moving in.
 * @returns The active {@link MovementProfile}.
 */
export function selectMoveProfile(
    profiles: MovementProfile[] | undefined,
    currentMoveMedium: MovementMedium,
): MovementProfile {
    if (currentMoveMedium === MOVEMENT_MEDIUM.NONE) {
        return { ...NONE_MOVE_PROFILE };
    }
    return (
        profiles?.find((profile) => profile.medium === currentMoveMedium) ?? {
            ...NONE_MOVE_PROFILE,
        }
    );
}
