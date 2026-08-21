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
 * Generate `kb/dev-docs/content-creator/item-frontmatter.md` — the per-type
 * authoring reference for item notes.
 *
 * **Generated, because the alternative drifts.** Items are the overwhelming
 * majority of what this repository compiles — 1,230 of 1,362 documents when the
 * page was first written — and a hand-written table across thirteen types, each
 * with a shape, a default and a requiredness, would be wrong within a release
 * with nothing to catch it (#1574). That is the failure #1501 spent fifteen
 * issues eliminating, and re-introducing it as prose would be a poor trade.
 *
 * **The generator is not here.** The rendering lives in
 * `@heroiclands/content-build`, because the declarations it reads are the
 * `fields` on each `itemBuilders` entry and *every* consuming repository has
 * those — a module defining an item type of its own documents it with the same
 * command rather than asking this repository to do it (content-build#22). What
 * belongs here is only this repository's framing: which page, under which
 * title, linking to which siblings.
 *
 * Run via `npm run docs:item-fields`; `npm run lint` runs this with `--check`
 * and fails when the committed page is stale — the same contract as
 * `docs:catalog` / `lint:type-catalog`.
 *
 * The result is run through Prettier so the page satisfies the generator and
 * `prettier --check` at once (see {@link formatGenerated}).
 */

import fs from "fs";
import path from "path";

import { renderItemFieldReference } from "@heroiclands/content-build/engine/field-reference";

import { formatGenerated } from "./format-generated.mjs";
import { reportDiagnostic } from "./lint-diagnostics.mjs";

const DOC = path.resolve("kb/dev-docs/content-creator/item-frontmatter.md");

/**
 * This repository's framing for the page: the "See also" line the section's
 * pages carry, and the orientation a reader needs before the tables start.
 *
 * @type {string[]}
 */
const PREAMBLE = [
    "See also: [The Authoring Workflow](authoring-workflow.md), " +
        "[Actor Notes](actor-notes.md), " +
        "[Asset Conventions](asset-conventions.md)",
    "",
    "Every item note carries the frontmatter envelope described in " +
        "[The Authoring Workflow](authoring-workflow.md) — `name.full`, " +
        "`type`, `shortcode`, `package`, `id`, and the required " +
        "`sohl.archetype`. This page covers what each **type** adds to that: " +
        "the fields under its `sohl:` block, and nothing else.",
    "",
    "The tables are rendered from the declaration that *builds* each " +
        "document, not from a description of it, so a field listed here is a " +
        "field the compiler reads and a field absent here is one it ignores. " +
        "An unrecognised `sohl:` key is silently dropped, so a typo shows up " +
        "as a missing value rather than an error — check the spelling here " +
        "first.",
];

/**
 * Render the page.
 *
 * Pure apart from reading the resolved content-build configuration: it returns
 * the markdown and writes nothing, so `--check` can compare without a
 * temporary file.
 *
 * @returns {Promise<string>} The page, formatted as Prettier would write it.
 */
export async function buildItemFieldsDoc() {
    const md = renderItemFieldReference({
        title: "Item Note Frontmatter",
        preamble: PREAMBLE,
        generatedBy:
            "`npm run docs:item-fields` (utils/build-item-fields-doc.mjs)",
    });
    return formatGenerated(`${md}\n`, DOC);
}

const rel = path.relative(process.cwd(), DOC);
const expected = await buildItemFieldsDoc();

if (process.argv.includes("--check")) {
    const current = fs.existsSync(DOC) ? fs.readFileSync(DOC, "utf8") : "";
    if (current !== expected) {
        // Staleness is a property of the whole generated file, so there is no
        // line to name.
        reportDiagnostic({
            file: rel,
            severity: "error",
            message:
                "out of date with the item-field declarations — run " +
                "`npm run docs:item-fields` and commit the regenerated file",
        });
        process.exit(1);
    }
    console.log(`✓ ${rel} is up to date.`);
} else {
    fs.mkdirSync(path.dirname(DOC), { recursive: true });
    fs.writeFileSync(DOC, expected);
    console.log(`✅ Generated ${rel}.`);
}
