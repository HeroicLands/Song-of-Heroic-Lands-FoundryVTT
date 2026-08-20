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
 * **The resolved item-type registry** — the consuming repository's
 * `itemBuilders` table, and the type whitelist derived from its keys.
 *
 * Both are read from the one resolved configuration, so they are literally the
 * same object's keys and values: a type cannot be whitelisted for compilation
 * without the builder that compiles it, which is the guarantee #1504 exists
 * for. The Item compiler dispatches through {@link itemBuilder}, so the table a
 * consumer configured is the table its notes compile with — the whitelist and
 * the dispatch used to come from different places, and a consumer supplying its
 * own registry got the types it asked for and the builders it did not (#1563).
 *
 * **The registry itself is a consumer's, and stays a leaf.** SoHL's lives in
 * `@heroiclands/content-build/sohl/item-builders`; the consumer names it in
 * `content-build.config.mjs`. That module must never read the resolved
 * configuration — the config file imports it, so a read from there would close
 * a cycle around the config's own evaluation. Data travels *into*
 * configuration; only modules like this one, which nothing in a config file
 * imports, read back out of it.
 *
 * @module
 */

import { packConfig } from "./pack-config.mjs";

/**
 * Every content type that compiles into an item — and therefore into an item
 * doc. Read by the Item compiler to know what to claim, and by the journals
 * pass to know whose prose it is holding.
 *
 * **Derived, never authored.** These are the keys of the consuming
 * repository's `itemBuilders` registry, so the whitelist and the builder table
 * are the same list and cannot drift apart. They already had: `trait` was
 * whitelisted long after the item type was retired (#651), with no builder
 * behind it, so every `type: trait` note passed the gate and then failed to
 * compile (#1504).
 *
 * @type {ReadonlySet<string>}
 */
export const ITEM_TYPES = packConfig.itemTypes;

/**
 * The builder the consuming repository registered for an item type.
 *
 * Unreachable through the compiler — its whitelist *is* this registry's keys —
 * so a throw here means a caller invented a type. It names the type rather than
 * failing as an anonymous `is not a function` (#1504).
 *
 * @param {string} type - The note's `type` frontmatter.
 * @returns {(fm: object) => object} The builder for that type.
 * @throws {Error} When the configuration registers no builder for `type`.
 */
export function itemBuilder(type) {
    const builder = /** @type {Record<string, Function>} */ (
        packConfig.itemBuilders
    )[type];
    if (typeof builder !== "function") {
        throw new Error(
            `No builder registered for item type "${type}" — add one to the ` +
                `\`itemBuilders\` registry this repository declares in ` +
                `content-build.config.mjs, or stop declaring the type.`,
        );
    }
    return /** @type {(fm: object) => object} */ (builder);
}
