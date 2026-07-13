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
 * Drift check for the `src/` namespace barrels (the hand-written `index.ts`
 * files that form the `sohl.*` namespace tree — see the namespace-tree epic).
 *
 * Every folder that is a namespace (contains an exporting module, or a subfolder
 * that does) must have an `index.ts` that:
 *   - re-exports every sibling exporting module via `export * from "./X"`;
 *   - re-exports every namespace subfolder via `export * as sub from "./sub"`;
 *   - gives every `export * as` a leading JSDoc description comment (which
 *     becomes the namespace's doc-page prose).
 *
 * Side-effect-only modules (no top-level `export`, e.g. `sohl.ts`,
 * `automated-combat.ts`) are intentionally NOT part of any namespace and are not
 * required in a barrel. Modules tagged `@ns-exclude` — plumbing such as
 * eager-load barrels or surface builders — are likewise exempt.
 *
 * Fails (exit 1) with a list of every missing barrel / re-export / description.
 * Run as `npm run lint:ns-barrels` (part of `npm run lint`). Not run directly.
 */

import fs from "fs";
import path from "path";

const SRC = "src";

const isModuleFile = (name) =>
    name.endsWith(".ts") &&
    !name.endsWith(".d.ts") &&
    !name.endsWith(".test.ts") &&
    name !== "index.ts";

/** A module that participates in a namespace has at least one top-level export. */
const hasExport = (file) => /^export /m.test(fs.readFileSync(file, "utf8"));

/**
 * A module tagged `@ns-exclude` is plumbing (an eager-load barrel, a surface
 * builder, …), not a public namespace member — so it is exempt from its barrel.
 * A dedicated tag (not `@internal`, which appears on individual members of
 * otherwise-public files) so the exemption is deliberate and file-scoped.
 */
const isExcluded = (file) =>
    /@ns-exclude\b/.test(fs.readFileSync(file, "utf8"));

/** A file that belongs in its folder's barrel: exporting, and not `@ns-exclude`. */
const isNamespaceModule = (file) => hasExport(file) && !isExcluded(file);

/** A folder is a namespace if it holds an exporting module, or a subfolder that does. */
function needsBarrel(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    if (
        entries.some(
            (e) =>
                e.isFile() &&
                isModuleFile(e.name) &&
                isNamespaceModule(path.join(dir, e.name)),
        )
    ) {
        return true;
    }
    return entries
        .filter((e) => e.isDirectory())
        .some((e) => needsBarrel(path.join(dir, e.name)));
}

const problems = [];

function check(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const subdirs = entries
        .filter((e) => e.isDirectory() && needsBarrel(path.join(dir, e.name)))
        .map((e) => e.name);
    const modules = entries
        .filter(
            (e) =>
                e.isFile() &&
                isModuleFile(e.name) &&
                isNamespaceModule(path.join(dir, e.name)),
        )
        .map((e) => e.name.replace(/\.ts$/, ""));

    for (const s of subdirs) check(path.join(dir, s));

    const index = path.join(dir, "index.ts");
    if (!fs.existsSync(index)) {
        problems.push(`${index}: missing barrel (this folder is a namespace)`);
        return;
    }
    const src = fs.readFileSync(index, "utf8");

    // Every `export * [as X] from "./target"` — the set of re-exported targets.
    const reexported = new Set(
        [...src.matchAll(/export \* (?:as \w+ )?from "\.\/([\w-]+)"/g)].map(
            (m) => m[1],
        ),
    );
    // `export * as N from "./N"` — namespace re-exports.
    const namespaced = new Set(
        [...src.matchAll(/export \* as (\w+) from "\.\/\1"/g)].map((m) => m[1]),
    );
    // Namespace re-exports with a leading `/** ... */` description.
    const described = new Set(
        [...src.matchAll(/\/\*\*[\s\S]*?\*\/\s*export \* as (\w+) from/g)].map(
            (m) => m[1],
        ),
    );

    for (const s of subdirs) {
        if (!namespaced.has(s))
            problems.push(
                `${index}: missing \`export * as ${s} from "./${s}"\``,
            );
        else if (!described.has(s))
            problems.push(
                `${index}: namespace \`${s}\` needs a /** description */`,
            );
    }
    for (const m of modules) {
        if (!reexported.has(m))
            problems.push(`${index}: missing \`export * from "./${m}"\``);
    }
}

check(SRC);

if (problems.length) {
    console.error(
        `check-ns-barrels: ${problems.length} namespace-barrel problem(s):\n` +
            problems.map((p) => `  - ${p}`).join("\n"),
    );
    process.exit(1);
}
console.log(
    "check-ns-barrels: all namespace barrels present, complete, and described.",
);
