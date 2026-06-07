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

/** The TokenDocument fields the token selector reads. */
export interface TokenActorRef {
    /** Whether the token's data is linked to its world actor. */
    actorLink: boolean;
    /** The id of the world actor the token represents, if any. */
    actorId: string | null;
}

/**
 * Select the tokens of the active scene that represent a given actor.
 *
 * - A **synthetic** (token) actor is represented by exactly the single token it
 *   is embedded in. Pass that token as `embeddedToken`; it is returned only when
 *   it is actually present in `sceneTokens` (i.e. it belongs to the active
 *   scene), otherwise the result is empty.
 * - A **world** (linked) actor is represented by every linked token on the
 *   active scene whose `actorId` matches. Pass `embeddedToken` as `null`.
 *
 * @param sceneTokens The active scene's token documents.
 * @param actorId The world actor's id (used only for the linked case).
 * @param embeddedToken The synthetic actor's own token, or `null` for a world actor.
 * @returns The matching tokens (empty array when none match).
 */
export function selectActorTokens<T extends TokenActorRef>(
    sceneTokens: readonly T[],
    actorId: string,
    embeddedToken: T | null,
): T[] {
    if (embeddedToken) {
        return sceneTokens.includes(embeddedToken) ? [embeddedToken] : [];
    }
    return sceneTokens.filter((t) => t.actorLink && t.actorId === actorId);
}

/** The Combatant field the combatant selector reads. */
export interface CombatantTokenRef {
    /** The id of the token this combatant represents, if any. */
    tokenId: string | null;
}

/**
 * The first combatant whose token is one of an actor's tokens.
 *
 * Scans `combatants` in order and returns the first whose `tokenId` is in
 * `tokenIds`, or `null` when none match. Combatants with a `null` tokenId are
 * skipped.
 *
 * @param combatants The combat's combatants, in turn order.
 * @param tokenIds The ids of the actor's tokens (see {@link selectActorTokens}).
 * @returns The first matching combatant, or `null`.
 */
export function selectActorCombatant<T extends CombatantTokenRef>(
    combatants: readonly T[],
    tokenIds: ReadonlySet<string>,
): T | null {
    for (const c of combatants) {
        if (c.tokenId !== null && tokenIds.has(c.tokenId)) return c;
    }
    return null;
}
