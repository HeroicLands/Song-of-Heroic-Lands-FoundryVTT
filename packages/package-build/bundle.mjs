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
 * The code bundle, and the one way a manifest can disagree with it.
 *
 * A package that ships behavior declares its entry point in the manifest, and
 * **which key it uses decides how the browser parses the file**:
 *
 * - Under `"esmodules"` the file is an ES module. Every top-level `const`,
 *   `let`, `class` and `function` is module-scoped — private to the bundle,
 *   colliding with nothing.
 * - Under `"scripts"` the file is a *classic script*. Those same declarations
 *   become **global lexical bindings**, and one whose name matches a
 *   non-configurable own property of `window` throws
 *   `SyntaxError: Identifier 'x' has already been declared` at **parse time** —
 *   before a single line of the package runs.
 *
 * That is not hypothetical. A bundle that inlines `@codemirror/view` carries
 * `const chrome`, and `style-mod` carries `const top`; `window.chrome` is
 * `configurable: false` and `window.top` is `[Unforgeable]`, so under
 * `"scripts"` either one bricks the whole package on load. Shipping `"scripts"`
 * is exactly how SoHL v0.8.0 broke. A minified bundle escapes it only by
 * renaming the identifiers, which is luck rather than a property.
 *
 * So the check is not "is the manifest key right" — it is **does the manifest
 * agree with the file it points at**. Declared as a module, the bundle must
 * parse as one. Declared as a script, it must declare *nothing* at top level.
 * That second invariant is list-free: it needs no catalogue of browser globals
 * and holds whatever identifiers a future dependency introduces.
 *
 * The rules are pure functions over source text. Reading the stage is the
 * caller's job.
 *
 * @module
 */

import { parse } from "acorn";

/**
 * The names a top-level statement would declare in global scope.
 *
 * Only declaration forms matter: an expression statement or a call declares
 * nothing. Destructuring patterns are walked, so `const { a, b } = …` reports
 * both names — a bundler emits those routinely, and missing them would let the
 * check pass a bundle that does collide.
 *
 * @param {object} node - A top-level `Program.body` entry.
 * @returns {string[]} Declared identifier names, empty when it declares none.
 */
export function declaredGlobals(node) {
    /**
     * @param {any} pattern - A binding pattern.
     * @param {string[]} out - Names collected so far.
     * @returns {string[]} `out`.
     */
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

/**
 * How a manifest declares an entry file.
 *
 * @param {object} manifest - The parsed manifest.
 * @param {string} entry - The entry file's name, as the manifest spells it.
 * @returns {"esmodules"|"scripts"|"both"|"neither"} Where it is declared.
 */
export function entryDeclaration(manifest, entry) {
    const asModule = (manifest?.esmodules ?? []).includes(entry);
    const asScript = (manifest?.scripts ?? []).includes(entry);
    if (asModule && asScript) return "both";
    if (asModule) return "esmodules";
    if (asScript) return "scripts";
    return "neither";
}

/**
 * Every top-level declaration a source would create in global scope.
 *
 * Parses as a **classic script**, which is the only parse under which the
 * question means anything.
 *
 * @param {string} source - The bundle's source text.
 * @returns {Array<{name: string, line: number, kind: string}>} The declarations.
 * @throws {SyntaxError} When the source does not parse as a script.
 */
export function globalDeclarations(source) {
    const program = parse(source, {
        ecmaVersion: "latest",
        sourceType: "script",
        locations: true,
    });
    const found = [];
    for (const node of program.body) {
        for (const name of declaredGlobals(node)) {
            found.push({ name, line: node.loc.start.line, kind: node.type });
        }
    }
    return found;
}

/**
 * Check that a manifest and the bundle it points at agree.
 *
 * @param {object} opts
 * @param {object} opts.manifest - The parsed manifest.
 * @param {string} opts.source - The bundle's source text.
 * @param {string} opts.entry - The entry file's name, as the manifest spells it.
 * @param {string} [opts.manifestName] - What to call the manifest in a message.
 * @returns {{findings: Array<{line?: number, severity: "error", message: string}>,
 *   declaredAs: "esmodules"|"scripts"|"both"|"neither"}} The findings, empty
 *   when the two agree, and how the entry was declared.
 */
export function checkBundleLoading({
    manifest,
    source,
    entry,
    manifestName = "the manifest",
}) {
    const declaredAs = entryDeclaration(manifest, entry);

    if (declaredAs === "both") {
        return {
            declaredAs,
            findings: [
                {
                    severity: "error",
                    message:
                        `${manifestName} lists ${entry} under both "esmodules" and ` +
                        `"scripts", so Foundry would load the bundle twice. List it ` +
                        `under "esmodules" only.`,
                },
            ],
        };
    }

    if (declaredAs === "neither") {
        return {
            declaredAs,
            findings: [
                {
                    severity: "error",
                    message:
                        `${manifestName} declares ${entry} under neither "esmodules" ` +
                        `nor "scripts", so Foundry would never load it. List it under ` +
                        `"esmodules".`,
                },
            ],
        };
    }

    if (declaredAs === "esmodules") {
        // Declared a module, so it must be one. A bundle that only parses as a
        // script would fail at load with a message about whichever `import`
        // statement came first, naming nothing about the manifest.
        try {
            parse(source, { ecmaVersion: "latest", sourceType: "module" });
        } catch (err) {
            return {
                declaredAs,
                findings: [
                    {
                        severity: "error",
                        message:
                            `${entry} is declared under "esmodules" but does not ` +
                            `parse as an ES module: ${err.message}`,
                    },
                ],
            };
        }
        return { declaredAs, findings: [] };
    }

    // Declared a classic script: every top-level declaration becomes global.
    let globals;
    try {
        globals = globalDeclarations(source);
    } catch (err) {
        return {
            declaredAs,
            findings: [
                {
                    severity: "error",
                    message:
                        `${entry} is declared under "scripts" but does not parse ` +
                        `as a classic script: ${err.message}`,
                },
            ],
        };
    }

    return {
        declaredAs,
        findings: globals.map(({ name, line, kind }) => ({
            line,
            severity: "error",
            message:
                `${kind} \`${name}\` is declared at global scope; under ` +
                `"scripts" that is a global lexical binding, and one colliding ` +
                `with a non-configurable window property throws at parse time ` +
                `and breaks the whole package`,
        })),
    };
}
