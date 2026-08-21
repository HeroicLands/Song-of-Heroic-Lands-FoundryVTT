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
 * CI guard: `system.json` must load `sohl.js` the way Vite built it.
 *
 * Vite emits the bundle as an **ES module**, so `system.json` has to list it
 * under `"esmodules"`. Listing it under `"scripts"` instead makes Foundry load
 * it as a *classic script*, and the two disagreeing is a latent, total failure:
 *
 * - In a module, every top-level `const`/`let`/`class` is **module-scoped** —
 *   private to the bundle, colliding with nothing.
 * - In a classic script, those same declarations become **global lexical**
 *   bindings. One whose name matches a *non-configurable* own property of
 *   `window` throws `SyntaxError: Identifier 'x' has already been declared` at
 *   **parse time**, before a single line of the system runs.
 *
 * That is not hypothetical. The bundle inlines `@codemirror/view` (for the
 * SafeExpression editor), which declares `const chrome`, and `style-mod`, which
 * declares `const top`. `window.chrome` is `configurable: false` and
 * `window.top` is `[Unforgeable]`, so under `"scripts"` each one bricks the
 * entire system on load. (Foundry's own CodeMirror build escapes this only
 * because it is minified, which renames the identifiers; ours is deliberately
 * unminified.) Shipping `"scripts"` is exactly how v0.8.0 broke.
 *
 * So this check reads the generated `build/stage/system.json` and:
 *
 * - fails if `sohl.js` is not declared at all, or is declared under both keys;
 * - if declared under `"esmodules"` — the correct configuration — confirms the
 *   bundle really does parse as a module;
 * - if declared under `"scripts"`, parses the bundle exactly as a browser would
 *   (acorn, `sourceType: "script"`) and fails on **any** top-level declaration.
 *   That invariant is list-free: it needs no catalogue of browser globals, and
 *   holds no matter which identifiers a future dependency introduces.
 *
 * Reads `build/stage/system.json` and `build/stage/sohl.js`; writes nothing.
 * Exits non-zero (failing CI) on any violation.
 *
 * Usage:
 *   npm run lint:bundle-globals         // node utils/check-bundle-globals.mjs
 *   node utils/check-bundle-globals.mjs // direct invocation (no args)
 */
import { existsSync, readFileSync } from "node:fs";
import { reportDiagnostic } from "./lint-diagnostics.mjs";
import { resolve } from "node:path";
import { argv } from "node:process";
import { fileURLToPath } from "node:url";
import { parse } from "acorn";

const STAGE = resolve("build/stage");
const BUNDLE = resolve(STAGE, "sohl.js");
const MANIFEST = resolve(STAGE, "system.json");
const ENTRY = "sohl.js";

/**
 * Collect the names a top-level statement would declare in global scope.
 *
 * Only declaration forms matter: expression statements and calls declare
 * nothing. Destructuring patterns are walked, so `const { a, b } = …` reports
 * both names.
 *
 * @param {import("acorn").Statement} node A top-level `Program.body` entry.
 * @returns {string[]} Declared identifier names (empty if the node declares none).
 */
export function declaredGlobals(node) {
    /** @param {any} pattern @param {string[]} out */
    function namesIn(pattern, out) {
        if (!pattern) return out;
        switch (pattern.type) {
            case "Identifier":
                out.push(pattern.name);
                break;
            case "ObjectPattern":
                for (const p of pattern.properties)
                    namesIn(
                        p.type === "RestElement" ? p.argument : p.value,
                        out,
                    );
                break;
            case "ArrayPattern":
                for (const e of pattern.elements) namesIn(e, out);
                break;
            case "AssignmentPattern":
                namesIn(pattern.left, out);
                break;
            case "RestElement":
                namesIn(pattern.argument, out);
                break;
        }
        return out;
    }

    switch (node.type) {
        case "VariableDeclaration": {
            const out = [];
            for (const d of node.declarations) namesIn(d.id, out);
            return out;
        }
        case "FunctionDeclaration":
        case "ClassDeclaration":
            return node.id ? [node.id.name] : [];
        default:
            return [];
    }
}

/** Run the check against the built stage. @returns {number} Process exit code. */
function main() {
    for (const [label, path] of [
        ["system.json", MANIFEST],
        ["sohl.js", BUNDLE],
    ]) {
        if (!existsSync(path)) {
            console.error(
                `❌ ${path} not found. Run 'npm run build:system build:code' before this check.`,
            );
            return 1;
        }
        void label;
    }

    const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
    const asModule = (manifest.esmodules ?? []).includes(ENTRY);
    const asScript = (manifest.scripts ?? []).includes(ENTRY);

    if (asModule && asScript) {
        console.error(
            `❌ system.json lists ${ENTRY} under BOTH "esmodules" and "scripts".\n` +
                `   Foundry would load the bundle twice. List it under "esmodules" only.`,
        );
        return 1;
    }
    if (!asModule && !asScript) {
        console.error(
            `❌ system.json declares ${ENTRY} under neither "esmodules" nor "scripts".\n` +
                `   Foundry would never load the system. List it under "esmodules".`,
        );
        return 1;
    }

    const source = readFileSync(BUNDLE, "utf8");
    const sourceType = asModule ? "module" : "script";

    let program;
    try {
        program = parse(source, {
            ecmaVersion: "latest",
            sourceType,
            locations: true,
        });
    } catch (err) {
        console.error(
            `❌ build/stage/sohl.js does not parse as a ${sourceType}: ${err.message}`,
        );
        return 1;
    }

    if (asModule) {
        console.log(
            `✅ system.json loads ${ENTRY} as an ES module — every top-level\n` +
                `   declaration is module-scoped and cannot collide with a browser global.`,
        );
        return 0;
    }

    // Loaded as a classic script: every top-level declaration is global.
    const violations = [];
    for (const node of program.body) {
        for (const name of declaredGlobals(node)) {
            violations.push({
                name,
                line: node.loc.start.line,
                kind: node.type,
            });
        }
    }

    if (violations.length) {
        console.error(
            `❌ system.json loads ${ENTRY} under "scripts" (a classic script), and the\n` +
                `   bundle declares ${violations.length} name(s) at global scope. Any one of them\n` +
                `   colliding with a non-configurable window property (e.g. 'chrome', 'top')\n` +
                `   throws "Identifier 'x' has already been declared" at parse time and breaks\n` +
                `   the entire system.\n` +
                `   Fix: list ${ENTRY} under "esmodules" in assets/templates/system.template.json\n` +
                `   (Vite builds it as an ES module — see 'build.lib.formats' in vite.config.ts).\n`,
        );
        for (const v of violations.slice(0, 25)) {
            reportDiagnostic({
                file: "sohl.js",
                line: v.line,
                severity: "error",
                message: `${v.kind} \`${v.name}\` is declared at global scope`,
            });
        }
        if (violations.length > 25) {
            console.error(`   … and ${violations.length - 25} more.`);
        }
        return 1;
    }

    console.log(
        `✅ ${ENTRY} is loaded as a classic script but declares nothing at global scope.`,
    );
    return 0;
}

// Only run when invoked as a script — importing this module (the unit test does,
// to exercise `declaredGlobals`) must not run the check or exit the process.
if (argv[1] && resolve(argv[1]) === fileURLToPath(import.meta.url)) {
    process.exit(main());
}
