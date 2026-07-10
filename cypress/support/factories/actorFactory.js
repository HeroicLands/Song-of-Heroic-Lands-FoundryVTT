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
 * `shortcode` is the one required, non-blank field — `(type, shortcode)` is the
 * world-unique actor key — so it is derived from the name when a spec omits it.
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

/** Monotonic per-run counter making every auto-derived shortcode unique. */
let shortcodeSeq = 0;

/**
 * @param {string} kind - one of {@link ACTOR_KINDS}; defaults to `"being"`.
 * @param {object} [overrides] - `{ name?, system?, ...rest }` merged over defaults.
 * @returns {{name: string, type: string, system: object}} create payload.
 */
export function actorFactory(kind = "being", overrides = {}) {
    const { name, system, ...rest } = overrides;
    const finalName = name ?? `${kind} actor`;
    const finalSystem = { ...(system ?? {}) };
    // `(type, shortcode)` is a required, world-unique actor key. When a spec
    // doesn't set a shortcode, derive a unique one from the name (or the kind)
    // plus a counter, so same-kind actors never collide. Specs that assert on a
    // specific shortcode set it explicitly (which wins here).
    if (!finalSystem.shortcode) {
        const slug = finalName.toLowerCase().replace(/[^a-z0-9]+/g, "") || kind;
        finalSystem.shortcode = `${slug}${++shortcodeSeq}`;
    }
    return {
        name: finalName,
        type: kind,
        system: finalSystem,
        ...rest,
    };
}
