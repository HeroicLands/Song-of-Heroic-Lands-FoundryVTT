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
 * Generates docs/reference/type-catalog.md from authoritative sources, so the
 * catalog can never drift from the code:
 *
 *   - The set of types comes from the `ACTOR_KIND` / `ITEM_KIND` enums in
 *     `src/utils/constants.ts`.
 *   - Display names come from `lang/en.json` (`TYPES.Actor.*` / `TYPES.Item.*`).
 *   - Each description is the opening summary of the matching Logic class's
 *     TSDoc comment (e.g. `ItemKind "skill"` → `SkillLogic`), so the prose lives
 *     in one place — on the class — and documenting a class documents the
 *     catalog.
 *
 * Run by `npm run docs:catalog` (and, transitively, `docs:prepare` / `docs`).
 * Do not edit the generated markdown by hand.
 */

import fs from "fs";
import path from "path";
import { globSync } from "glob";

const OUT = path.resolve("docs/reference/type-catalog.md");
const CONSTANTS = path.resolve("src/utils/constants.ts");
const EN_JSON = path.resolve("lang/en.json");

/** Extract the string values of a `defineType("<prefix>", { ... })` literal. */
function parseKindValues(source, prefix) {
    const start = source.indexOf(`defineType("${prefix}"`);
    if (start === -1) throw new Error(`defineType("${prefix}") not found`);
    // Scan from the opening "{" after the prefix to its matching "}".
    const open = source.indexOf("{", start);
    let depth = 0;
    let end = open;
    for (let i = open; i < source.length; i += 1) {
        if (source[i] === "{") depth += 1;
        else if (source[i] === "}") {
            depth -= 1;
            if (depth === 0) {
                end = i;
                break;
            }
        }
    }
    const body = source.slice(open + 1, end);
    // Each entry is `KEY: "value",` — collect the values in declaration order.
    return [...body.matchAll(/:\s*"([^"]+)"/g)].map((m) => m[1]);
}

/** First sentence of a Logic class's leading TSDoc, cleaned for a table cell. */
function describeLogic(file, className) {
    const src = fs.readFileSync(file, "utf8");
    const re = new RegExp(
        `\\/\\*\\*([\\s\\S]*?)\\*\\/\\s*(?:export\\s+)?(?:abstract\\s+)?class\\s+${className}\\b`,
    );
    const m = src.match(re);
    if (!m) return "";
    // Strip the comment's leading ` * `, then take the first paragraph.
    const text = m[1]
        .replace(/^\s*\*\s?/gm, "")
        .replace(/\r/g, "")
        .trim();
    const firstPara = text
        .split(/\n\s*\n/)[0]
        .replace(/\s+/g, " ")
        .trim();
    // First sentence only.
    let sentence = (
        firstPara.match(/^(.*?[.!?])(\s|$)/)?.[1] ?? firstPara
    ).trim();
    // Resolve {@link Target | label} / {@link Target} to plain text.
    sentence = sentence.replace(/\{@link\s+[^}|]+?\|\s*([^}]+?)\s*\}/g, "$1");
    sentence = sentence.replace(/\{@link\s+([^}]+?)\s*\}/g, "$1");
    // Capitalize and ensure terminal punctuation.
    if (sentence) sentence = sentence[0].toUpperCase() + sentence.slice(1);
    if (sentence && !/[.!?]$/.test(sentence)) sentence += ".";
    return sentence;
}

const source = fs.readFileSync(CONSTANTS, "utf8");
const en = JSON.parse(fs.readFileSync(EN_JSON, "utf8"));

const actorKinds = parseKindValues(source, "TYPES.Actor");
const itemKinds = parseKindValues(source, "TYPES.Item");

// Map a kind code to its Logic file by the naming convention:
// lower-cased class basename minus "Logic" === kind code.
function logicMap(dir) {
    const map = {};
    for (const file of globSync(`${dir}/*Logic.ts`)) {
        const className = path.basename(file, ".ts");
        const code = className.replace(/Logic$/, "").toLowerCase();
        map[code] = { file, className };
    }
    return map;
}
const actorLogic = logicMap("src/document/actor/logic");
const itemLogic = logicMap("src/document/item/logic");

const warnings = [];
function rows(kinds, kindPrefix, logic) {
    return kinds.map((code) => {
        let name = en[`${kindPrefix}.${code}`];
        if (!name) {
            warnings.push(`no ${kindPrefix} label in en.json for "${code}"`);
            name = code.charAt(0).toUpperCase() + code.slice(1);
        }
        const entry = logic[code];
        let desc = "";
        if (!entry) {
            warnings.push(`no Logic class found for kind "${code}"`);
        } else {
            desc = describeLogic(entry.file, entry.className);
            if (!desc)
                warnings.push(
                    `no TSDoc summary on ${entry.className} (kind "${code}")`,
                );
        }
        return `| ${name} | \`${code}\` | ${desc || "_(undocumented)_"} |`;
    });
}

const actorRows = rows(actorKinds, "TYPES.Actor", actorLogic);
const itemRows = rows(itemKinds, "TYPES.Item", itemLogic);

const md = `# SoHL Type Catalog

<!-- AUTO-GENERATED FILE — do not edit by hand.
     Generated by utils/build-type-catalog.mjs (npm run docs:catalog).
     Types come from ACTOR_KIND/ITEM_KIND in src/utils/constants.ts;
     names from lang/en.json; descriptions from each Logic class's TSDoc. -->

See also: [Documentation Hub](../README.md), [Architecture Overview](../concepts/architecture.md)

The canonical SoHL actor and item types. Each description is the opening line of
that type's Logic class documentation; for the full classes (DataModel, Logic,
Sheet) see **Documents → Actor** and **Documents → Item** in the API reference.

## Actors

| Type | Code | Description |
| ---- | ---- | ----------- |
${actorRows.join("\n")}

## Items

| Type | Code | Description |
| ---- | ---- | ----------- |
${itemRows.join("\n")}
`;

fs.writeFileSync(OUT, md);
console.log(
    `✅ Generated ${path.relative(process.cwd(), OUT)} ` +
        `(${actorKinds.length} actor + ${itemKinds.length} item types).`,
);
for (const w of warnings) console.warn(`⚠️  ${w}`);
