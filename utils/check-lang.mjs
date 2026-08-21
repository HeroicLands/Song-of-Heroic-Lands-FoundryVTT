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
import { reportDiagnostic, positionOf } from "./lint-diagnostics.mjs";
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
    // Kept so a finding about a key can be reported at the key's own line and
    // column, rather than at the file (#1668).
    const raw = readFileSync(file, "utf8");
    try {
        json = JSON.parse(raw);
    } catch (err) {
        reportDiagnostic({
            file,
            severity: "error",
            message: `not valid JSON: ${err.message}`,
        });
        process.exit(1);
    }
    /**
     * Where a key is declared in the file.
     *
     * @param {string} key - The localization key.
     * @returns {{line?: number, column?: number}} Spreadable position fields.
     */
    const at = (key) => positionOf(raw, `"${key}"`);
    // -- placeholder syntax ------------------------------------------------
    // Foundry interpolates with `format()` and SINGLE braces. A `{{…}}` value
    // renders literally unless some call site happens to hand it to a
    // Handlebars pass — which is the rule-#10 pattern, not a placeholder (#1353).
    for (const [key, value] of Object.entries(json)) {
        if (typeof value !== "string") continue;
        if (/\{\{|\}\}/.test(value)) {
            total++;
            reportDiagnostic({
                file,
                ...at(key),
                severity: "error",
                message: `"${key}" uses Handlebars double braces; Foundry placeholders are single-braced {camelCase}`,
            });
        }
        const braces = value.split("").reduce(
            (n, c) =>
                n +
                (c === "{" ? 1
                : c === "}" ? -1
                : 0),
            0,
        );
        if (braces !== 0) {
            total++;
            reportDiagnostic({
                file,
                ...at(key),
                severity: "error",
                message: `"${key}" has an unbalanced brace`,
            });
        }
    }

    // -- key-segment charset -----------------------------------------------
    // A segment carrying anything but [A-Za-z0-9_] is data baked into a key —
    // a path, a UUID — and a dotted payload is how the expandObject collision
    // above gets in (#636, #1351).
    for (const key of Object.keys(json)) {
        const bad = key
            .split(".")
            .filter((seg) => !/^[A-Za-z0-9_-]*$/.test(seg));
        if (bad.length) {
            total++;
            reportDiagnostic({
                file,
                ...at(key),
                severity: "error",
                message:
                    `"${key}" has a segment outside [A-Za-z0-9_-]: ` +
                    `${bad.map((b) => `"${b}"`).join(", ")}`,
            });
        }
    }

    const collisions = findPrefixCollisions(json);
    if (collisions.length) {
        total += collisions.length;
        console.error(
            `\ncheck-lang: ${collisions.length} dotted-prefix key collision(s) in ${file}:\n`,
        );
        for (const [prefix, leaf] of collisions) {
            reportDiagnostic({
                file,
                ...at(prefix),
                severity: "error",
                message: `"${prefix}" is a leaf but also a prefix of "${leaf}"`,
            });
        }
    }
}

if (total) {
    console.error(
        "\nA dotted-prefix collision makes foundry.utils.expandObject throw, and " +
            "Foundry\nthen drops the whole translation file (issue #636). Make each " +
            "key a leaf OR a\nbranch, never both. See kb/dev-docs/reference/" +
            "localization-keys.md for the\nplaceholder and key-segment rules.\n",
    );
    process.exit(1);
}
console.log(
    `check-lang: ${files.length} localization file(s) are expandObject-safe.`,
);
