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
 * Default item artwork, keyed by item `type` — the single source of truth for
 * both the compendium builder (the items pack compiler, at build time) and the
 * runtime `SohlItem.getDefaultArtwork` override (fresh, ad-hoc-created items).
 *
 * Foundry's `Item.DEFAULT_ICON` is the white `icons/svg/item-bag.svg`, which is
 * invisible on the light Manuscript sheet and does not adapt to theme; every
 * SoHL item type instead defaults to a themed `systems/sohl/assets/icons/**`
 * SVG here (dark ink in light mode, cream in dark, via the build-time
 * adaptive-fill injection in `utils/svg-theme.mjs`).
 *
 * This module is deliberately **plain ESM** — no TypeScript, no `@src` aliases,
 * no Foundry — precisely so the plain-`node` pack scripts *and* the bundled TS
 * runtime can both import it. A `.ts` module could not be required by the build
 * scripts (they run under bare `node`, without the bundler that resolves the
 * `@src` alias and strips types). Keeping one map here is what prevents the
 * build-time and runtime defaults from drifting apart (issue #932 was exactly
 * that drift: the builder had a default, runtime did not).
 *
 * It lives in this package rather than in the system's `src/` tree because the
 * pack pipeline is installed as a dependency (#1501): a relative path out of
 * the package would resolve to garbage once the pipeline runs from
 * `node_modules`. The runtime imports it back through the package's
 * `./sohl/default-item-art` entry point, so there is still exactly one map
 * (#1510). Injecting the map through configuration instead would re-open #932,
 * because the two sides would once more be free to disagree.
 *
 * Paths are fully resolved (`systems/sohl/...`) — the served path both layers
 * need. If a new item type is added, add its default here.
 */
export const DEFAULT_ITEM_ART = {
    affiliation: "systems/sohl/assets/icons/noun/shield.svg",
    affliction: "systems/sohl/assets/icons/other/sick.svg",
    armorgear: "systems/sohl/assets/icons/game-icons/lorc/breastplate.svg",
    attribute: "systems/sohl/assets/icons/other/charm.svg",
    concoctiongear: "systems/sohl/assets/icons/game-icons/badges/flask.svg",
    containergear: "systems/sohl/assets/icons/other/sack.svg",
    miscgear: "systems/sohl/assets/icons/other/question-mark.svg",
    mystery: "systems/sohl/assets/icons/other/sparkles.svg",
    mysticalability: "systems/sohl/assets/icons/other/hand-sparkles.svg",
    projectilegear: "systems/sohl/assets/icons/noun/arrow.svg",
    skill: "systems/sohl/assets/icons/other/head-gear.svg",
    trauma: "systems/sohl/assets/icons/other/injury.svg",
    weapongear: "systems/sohl/assets/icons/other/sword.svg",
};

/**
 * The default art path for an item `type`, or throw when the type is unknown —
 * the build's fail-fast contract, so an unrecognized type is never silently
 * defaulted (aborting the pack build rather than shipping a mismatched icon).
 *
 * Runtime callers that must tolerate unknown or `base`-typed items should read
 * {@link DEFAULT_ITEM_ART} directly and fall back to Foundry's default instead
 * of calling this — see `SohlItem.getDefaultArtwork`.
 *
 * @param {string} type - the item type.
 * @returns {string} the default image path for that type.
 */
export function defaultItemArt(type) {
    if (!(type in DEFAULT_ITEM_ART)) {
        throw new Error(
            `No default art for item type "${type}" — add one to @heroiclands/content-build/sohl/default-item-art`,
        );
    }
    // The map's inferred type has no index signature — deliberately, so callers
    // reading it directly get the precise key set. The `in` guard above has
    // already proved this key is present.
    return /** @type {Record<string, string>} */ (DEFAULT_ITEM_ART)[type];
}
