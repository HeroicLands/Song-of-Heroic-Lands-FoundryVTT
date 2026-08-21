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
 * What a shippable Foundry localization file must satisfy.
 *
 * Every HeroicLands package ships `lang/*.json` and declares it under
 * `languages` in its manifest, so every package can break it the same ways —
 * and each way fails **silently**, which is what makes a shared guard worth
 * more than a shared convention:
 *
 * - **Not an object.** Foundry hands the parsed file to
 *   `foundry.utils.expandObject`, which expects a record. A file that parses
 *   but is an array yields index-keyed entries and localizes nothing.
 *   `sohl-kethira-basic/lang/en.json` is authored as `[ "KEY": "value", … ]` —
 *   an array wrapping object pairs — and has never loaded.
 * - **A dotted-prefix collision.** When one key is a strict dotted prefix of
 *   another (`"SOHL.Trauma.Pall"` beside `"SOHL.Trauma.Pall.Note.Resist"`),
 *   `expandObject` **throws**: it cannot create a `Note` property on the string
 *   `"The Pall"`. Foundry catches that throw and discards the **entire** file,
 *   so one colliding pair drops every translation in it and each string renders
 *   as its raw key (#636). A key must be a leaf **or** a branch, never both.
 * - **A Handlebars placeholder.** Foundry interpolates with `format()` and
 *   SINGLE braces, so a `{{…}}` value renders literally unless some call site
 *   happens to hand it to a Handlebars pass (#1353).
 * - **Data baked into a key segment.** A segment carrying anything but
 *   `[A-Za-z0-9_-]` is a path or a UUID in a key, and a dotted payload is how
 *   the collision above gets in (#636, #1351).
 *
 * Every function here is pure — it takes source text and returns findings, and
 * touches no filesystem and emits nothing. The caller owns discovery and
 * reporting, which is what lets one rule set serve a `lint` script, a build
 * step and a unit test without any of them agreeing on I/O.
 *
 * @module
 */

import { positionOf } from "./text.mjs";

/**
 * A single finding, in the fields the shared diagnostic format takes.
 *
 * `file` is deliberately absent: these functions are handed source text, not a
 * path, so the caller — which knows where the text came from — supplies it.
 *
 * @typedef {object} LangFinding
 * @property {number} [line] - 1-based line, omitted when it cannot be
 *   established honestly.
 * @property {number} [column] - 1-based column, omitted likewise.
 * @property {"error"|"warning"} severity - How the finding should be treated.
 * @property {string} message - What is wrong, in one sentence.
 */

/** Key segments may carry only these characters. */
const SEGMENT = /^[A-Za-z0-9_-]*$/;

/**
 * Every `[prefixKey, leafKey]` pair where `prefixKey` is a strict dotted prefix
 * of `leafKey` and both are present as keys — the exact shape that makes
 * `foundry.utils.expandObject` throw.
 *
 * @param {Record<string, unknown>} json - The parsed, flat localization object.
 * @returns {[string, string][]} The colliding `[prefix, leaf]` pairs.
 */
export function findPrefixCollisions(json) {
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

/**
 * Whether a parsed value is a plain record Foundry can expand.
 *
 * An array is the case worth naming: it is valid JSON, it survives
 * `Object.entries`, and it therefore passes every other rule here while
 * localizing nothing.
 *
 * @param {unknown} value - The parsed top-level value.
 * @returns {boolean} True when the value is a non-null, non-array object.
 */
function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Validate one localization file's source text.
 *
 * Findings are returned in file order where a position is known, so a caller
 * that prints them walks the file top to bottom.
 *
 * @param {string} raw - The file's contents.
 * @returns {LangFinding[]} Every finding, empty when the file is shippable.
 */
export function validateLangSource(raw) {
    let json;
    try {
        json = JSON.parse(raw);
    } catch (err) {
        // Nothing further can be said about a file that does not parse, and
        // guessing at its intended shape would only bury this finding.
        return [
            { severity: "error", message: `not valid JSON: ${err.message}` },
        ];
    }

    if (!isRecord(json)) {
        const shape = Array.isArray(json) ? "an array" : `a ${typeof json}`;
        return [
            {
                severity: "error",
                message:
                    `top level is ${shape}; a localization file must be a JSON ` +
                    "object, or Foundry expands it to nothing",
            },
        ];
    }

    const findings = [];
    /**
     * Where a key is declared in the file.
     *
     * @param {string} key - The localization key.
     * @returns {{line?: number, column?: number}} Spreadable position fields.
     */
    const at = (key) => positionOf(raw, `"${key}"`);

    for (const [key, value] of Object.entries(json)) {
        if (typeof value !== "string") continue;

        if (/\{\{|\}\}/.test(value)) {
            findings.push({
                ...at(key),
                severity: "error",
                message:
                    `"${key}" uses Handlebars double braces; Foundry ` +
                    "placeholders are single-braced {camelCase}",
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
            findings.push({
                ...at(key),
                severity: "error",
                message: `"${key}" has an unbalanced brace`,
            });
        }
    }

    for (const key of Object.keys(json)) {
        const bad = key.split(".").filter((seg) => !SEGMENT.test(seg));
        if (bad.length) {
            findings.push({
                ...at(key),
                severity: "error",
                message:
                    `"${key}" has a segment outside [A-Za-z0-9_-]: ` +
                    `${bad.map((b) => `"${b}"`).join(", ")}`,
            });
        }
    }

    for (const [prefix, leaf] of findPrefixCollisions(json)) {
        findings.push({
            ...at(prefix),
            severity: "error",
            message: `"${prefix}" is a leaf but also a prefix of "${leaf}"`,
        });
    }

    return findings;
}
