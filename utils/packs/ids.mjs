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
 * Deterministic document ids, derived by hashing rather than stored.
 *
 * Several pack-build passes must agree on an id without being able to see each
 * other's output — the items pass and the journals pass on an item doc's entry
 * id, a section link and the page it addresses on that page's id. They agree by
 * deriving the id from the same inputs, so the derivation has to be reachable
 * from every one of them.
 *
 * That is why this is its own module and not part of `helpers.mjs`: link
 * resolution needs it, and `helpers.mjs` imports the link resolver. A leaf with
 * no local imports can be depended on from anywhere without a cycle.
 */

import crypto from "crypto";

/**
 * Stable 16-char hex id derived from `${namespace}:${value}`. Use for deriving
 * page ids from heading text when no explicit id is supplied.
 *
 * @param {string} namespace - Keeps unrelated derivations from colliding.
 * @param {string} value - The input the id is a function of.
 * @returns {string} A 16-character hexadecimal Foundry id.
 */
export function makeId(namespace, value) {
    return crypto
        .createHash("sha1")
        .update(`${namespace}:${value}`)
        .digest("hex")
        .slice(0, 16);
}
