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

/**
 * Actor create-payload factory.
 *
 * Produces a minimal-but-valid `{ name, type, system }` for `Actor.create`.
 * SoHL DataModels set every field's `initial` explicitly, so a bare `system: {}`
 * validates for all actor kinds; specs override only the fields they assert on.
 * Naming/tagging is applied by the `cy.createActor` command, not here.
 */

/** The five registered actor kinds (`ACTOR_KIND`). */
export const ACTOR_KINDS = [
    "being",
    "assembly",
    "cohort",
    "structure",
    "vehicle",
];

/**
 * @param {string} kind - one of {@link ACTOR_KINDS}; defaults to `"being"`.
 * @param {object} [overrides] - `{ name?, system?, ...rest }` merged over defaults.
 * @returns {{name: string, type: string, system: object}} create payload.
 */
export function actorFactory(kind = "being", overrides = {}) {
    const { name, system, ...rest } = overrides;
    return {
        name: name ?? `${kind} actor`,
        type: kind,
        system: { ...(system ?? {}) },
        ...rest,
    };
}
