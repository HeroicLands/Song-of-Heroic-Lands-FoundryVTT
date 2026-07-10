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
 * Item create-payload factory.
 *
 * Produces a minimal-but-valid `{ name, type, system }` for `Item.create` or
 * `actor.createEmbeddedDocuments("Item", [...])`. DataModels supply every field's
 * `initial`, so most kinds validate from a near-empty `system`; the per-kind
 * defaults below set only the handful of fields the logic layer reads for a
 * sensible default instance. Shapes mirror `tests/mocks/logicHarness.ts`.
 */

/** The 16 registered item kinds (`ITEM_KIND`). */
export const ITEM_KINDS = [
    "weapongear",
    "armorgear",
    "miscgear",
    "containergear",
    "projectilegear",
    "concoctiongear",
    "skill",
    "trait",
    "attribute",
    "affiliation",
    "affliction",
    "lineage",
    "mystery",
    "mysticalability",
    "trauma",
];

/** Kinds that extend the shared gear DataModel (carry/equip/quantity semantics). */
export const GEAR_KINDS = new Set([
    "weapongear",
    "armorgear",
    "miscgear",
    "containergear",
    "projectilegear",
    "concoctiongear",
]);

/**
 * Per-kind default `system` fragments. Kept intentionally small — only fields a
 * default instance needs to be meaningful; everything else comes from DataModel
 * `initial`s. Specs override via `overrides.system`.
 */
const KIND_DEFAULTS = {
    attribute: { scoreBase: 10 },
    skill: { masteryLevelBase: 0 },
    trait: { isNumeric: false },
    // These kinds declare a `required` field with no `initial`, so a bare create
    // fails validation — a valid document must supply it. `subType` picks the
    // first valid choice.
    concoctiongear: { quantity: 1, subType: "mundane" },
    affliction: { subType: "privation" },
    mysticalability: { subType: "shamanicrite" },
};

/** Monotonic per-run counter making every auto-derived shortcode unique. */
let shortcodeSeq = 0;

/**
 * @param {string} kind - one of {@link ITEM_KINDS}.
 * @param {object} [overrides] - `{ name?, system?, ...rest }` merged over defaults.
 * @returns {{name: string, type: string, system: object}} create payload.
 */
export function itemFactory(kind, overrides = {}) {
    const { name, system, ...rest } = overrides;
    const base =
        KIND_DEFAULTS[kind] ?? (GEAR_KINDS.has(kind) ? { quantity: 1 } : {});
    const finalName = name ?? `${kind} item`;
    const finalSystem = { ...base, ...(system ?? {}) };
    // `(type, shortcode)` is a required, unique-per-actor item key. When a spec
    // doesn't set a shortcode, derive a unique one from the name (or the kind)
    // plus a counter, so batches and same-named items never collide. Specs that
    // assert on a specific shortcode set it explicitly (which wins here).
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
