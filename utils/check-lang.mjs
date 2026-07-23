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
 * CI guard: every localization file must survive `foundry.utils.expandObject`,
 * which Foundry runs on each translation file as it loads it
 * (`Localization#loadTranslationFile`). That turns the flat, dot-keyed JSON into
 * a nested object — and it **throws** when one key is a strict dotted-prefix of
 * another (e.g. `"SOHL.Trauma.Pall"` as a string alongside
 * `"SOHL.Trauma.Pall.Note.Resist"`: it cannot create a `Note` property on the
 * string `"The Pall"`). Foundry catches that throw and discards the **entire**
 * file, so a single colliding pair silently drops *all* of SoHL's translations
 * and every `SOHL.*` / `TYPES.*` string renders as its raw key (issue #636).
 *
 * A key must therefore be either a leaf **or** a branch, never both. This runs as
 * a `lint:*` step so the build fails fast — before the type-check and test steps —
 * with a crisp signal, rather than surfacing only as a downstream test failure.
 *
 * Scans every `lang/*.json`; writes nothing. Prints each offending
 * `prefix`/`leaf` pair and exits non-zero (failing CI) on any collision.
 *
 * Usage:
 *   npm run lint:lang         // node utils/check-lang.mjs
 *   node utils/check-lang.mjs // direct invocation (no args)
 */
import { readFileSync } from "node:fs";
import { globSync } from "glob";

/**
 * Return every `[prefixKey, leafKey]` pair where `prefixKey` is a strict dotted
 * prefix of `leafKey` and both are present as keys — the exact shape that makes
 * `foundry.utils.expandObject` throw.
 *
 * @param {Record<string, unknown>} json - The parsed, flat localization object.
 * @returns {[string, string][]} The colliding `[prefix, leaf]` pairs.
 */
function findPrefixCollisions(json) {
    const keys = Object.keys(json);
    const keySet = new Set(keys);
    const collisions = [];
    for (const key of keys) {
        const parts = key.split(".");
        for (let i = 1; i < parts.length; i++) {
            const prefix = parts.slice(0, i).join(".");
            if (keySet.has(prefix)) collisions.push([prefix, key]);
        }
    }
    return collisions;
}

const files = globSync("lang/*.json");
if (!files.length) {
    console.error("check-lang: no lang/*.json files found.");
    process.exit(1);
}

let total = 0;
for (const file of files.sort()) {
    let json;
    try {
        json = JSON.parse(readFileSync(file, "utf8"));
    } catch (err) {
        console.error(`check-lang: ${file} is not valid JSON: ${err.message}`);
        process.exit(1);
    }
    const collisions = findPrefixCollisions(json);
    if (collisions.length) {
        total += collisions.length;
        console.error(
            `\ncheck-lang: ${collisions.length} dotted-prefix key collision(s) in ${file}:\n`,
        );
        for (const [prefix, leaf] of collisions) {
            console.error(
                `  "${prefix}" is a leaf but also a prefix of "${leaf}"`,
            );
        }
    }
}

if (total) {
    console.error(
        "\nfoundry.utils.expandObject throws on these, and Foundry then drops the " +
            "whole\ntranslation file (issue #636). Make each key a leaf OR a branch, " +
            "never both.\n",
    );
    process.exit(1);
}
console.log(
    `check-lang: ${files.length} localization file(s) are expandObject-safe.`,
);
