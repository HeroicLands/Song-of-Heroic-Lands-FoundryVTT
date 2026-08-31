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
 * Publishes this system's `system` field sets, so a content build can check
 * what it emits against what a document will actually receive
 * (HeroicLands/package-build#60).
 *
 * Foundry discards an unknown `system` key when a document is constructed, and
 * says nothing: the value is absent at load while the build that wrote it
 * reported success. `mysticalability` emitted `assocMysteryCode` for a whole
 * release that way, and `sohl-kethira-basic` authors `affiliation.subType` on
 * all 21 of its deities against a version that does not define it. Both
 * compiled clean; both were found by set-subtracting compiled documents'
 * `system` keys against `defineSchema()` **by hand**.
 *
 * A content build cannot do that comparison because `defineSchema()` lives
 * here, in TypeScript, behind Foundry's field classes. So this system publishes
 * the field sets as data and the build reads them — the same shape the link
 * manifest already uses for addresses, rather than a build reaching into a
 * sibling checkout.
 *
 * ## Read from the source, not from a running Foundry
 *
 * A DataModel's schema is only introspectable inside Foundry: `defineSchema()`
 * returns `new StringField(...)` and friends, which do not exist in Node. So
 * this reads the TypeScript, as `build-type-catalog.mjs` and
 * `lang-references.mjs` already do — the AST rather than a regex, because the
 * shapes it has to follow are structural:
 *
 * - **A registry, not a directory walk.** `ITEM_DM_DEF` and `ACTOR_DM_DEF` in
 *   `sohl-config.ts` are the canonical subtype → DataModel maps. Walking
 *   `*DataModel.ts` instead would publish schemas for classes nothing
 *   registers, and would silently miss one whose filename does not match.
 * - **`defineSchema()` usually delegates.** Every model here is
 *   `static override defineSchema() { return defineXDataSchema(); }`, so the
 *   returned identifier is followed to the function that builds the literal.
 * - **Schemas inherit by spread.** `...SohlItemDataModel.defineSchema()` and
 *   `...defineSohlDataSchema()` are how `notes`, `docHtml` and the rest reach
 *   every subtype. Those fields are recorded as **inherited**, apart from the
 *   subtype's **own**, because the two answer different questions: a builder
 *   must not emit a field nothing declares *anywhere*, but it is not expected
 *   to fill the system's own inherited machinery.
 * - **`SchemaField` nests.** `charges: new SchemaField({ value, max })` is
 *   recorded as `charges`, `charges.value` and `charges.max`, because a builder
 *   may write the whole object or the leaves.
 *
 * ## Generated, and checked
 *
 * `npm run schema` writes it; `npm run lint:schema` fails when the committed
 * copy disagrees with what the source would produce now. Same shape as
 * `lint:icon-legend` and `lint:type-catalog`, and for the same reason: a
 * generated file nothing checks drifts from its generator silently, and this
 * one is consumed by other repositories.
 *
 * @module
 */

import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

import { formatGenerated } from "./format-generated.mjs";

const ROOT = path.resolve(".");
const CONFIG = path.join(ROOT, "src/core/foundry/sohl-config.ts");
const OUT = path.join(ROOT, "schema.json");

/** The artifact shape package-build reads. Bump both together. */
const SCHEMA_ARTIFACT_VERSION = 1;

/** Parse one TypeScript file into an AST. */
function parse(file) {
    return ts.createSourceFile(
        file,
        fs.readFileSync(file, "utf8"),
        ts.ScriptTarget.Latest,
        true,
    );
}

/**
 * The `subtype: ClassName` entries of a registry object literal.
 *
 * @param {ts.SourceFile} src - The parsed `sohl-config.ts`.
 * @param {string} name - `ITEM_DM_DEF` or `ACTOR_DM_DEF`.
 * @returns {Map<string, string>} Subtype to DataModel class name.
 */
function registryOf(src, name) {
    const out = new Map();
    const visit = (node) => {
        if (
            ts.isVariableDeclaration(node) &&
            ts.isIdentifier(node.name) &&
            node.name.text === name &&
            node.initializer
        ) {
            // `{...} satisfies ItemDMMap` wraps the literal.
            let init = node.initializer;
            if (ts.isSatisfiesExpression?.(init) || ts.isAsExpression(init)) {
                init = init.expression;
            }
            if (ts.isObjectLiteralExpression(init)) {
                for (const p of init.properties) {
                    if (
                        ts.isPropertyAssignment(p) &&
                        ts.isIdentifier(p.initializer)
                    ) {
                        out.set(propName(p.name), p.initializer.text);
                    }
                }
            }
        }
        ts.forEachChild(node, visit);
    };
    visit(src);
    return out;
}

/** A property name, whether written bare, quoted or computed-as-literal. */
function propName(name) {
    if (ts.isIdentifier(name)) return name.text;
    if (ts.isStringLiteral(name)) return name.text;
    return name.getText();
}

/**
 * Where an imported name comes from, resolved to a file on disk.
 *
 * @param {ts.SourceFile} src - The importing file.
 * @param {string} name - The imported binding.
 * @returns {string|null} An absolute path, or `null` when not imported.
 */
function importSourceOf(src, name) {
    let found = null;
    ts.forEachChild(src, (node) => {
        if (found || !ts.isImportDeclaration(node)) return;
        const bindings = node.importClause?.namedBindings;
        if (!bindings || !ts.isNamedImports(bindings)) return;
        if (!bindings.elements.some((e) => e.name.text === name)) return;
        const spec = node.moduleSpecifier;
        if (!ts.isStringLiteral(spec)) return;
        found = resolveSpecifier(path.dirname(src.fileName), spec.text);
    });
    return found;
}

/**
 * The `tsconfig.json` path aliases, read rather than restated.
 *
 * `sohl-config.ts` imports every DataModel through `@src/...`, so a resolver
 * that understood only relative specifiers found none of them. Reading the
 * mapping from `tsconfig.json` means adding an alias there does not silently
 * make a subtype unreadable here.
 *
 * @returns {[string, string][]} Prefix to directory, longest prefix first.
 */
function pathAliases() {
    // Parsed as plain JSON, deliberately. `tsconfig.json` *permits* comments,
    // and this one has none — while it is full of `"@src/*"` path strings, so a
    // regex stripping `/* … */` eats from the slash-star inside `"@types/*"` to
    // the next one and corrupts the file it was meant to clean. If comments
    // ever appear here, reach for a JSONC parser rather than a regex.
    const json = JSON.parse(
        fs.readFileSync(path.join(ROOT, "tsconfig.json"), "utf8"),
    );
    const paths = json.compilerOptions?.paths ?? {};
    return Object.entries(paths)
        .map(([alias, [target]]) => [
            alias.replace(/\*$/, ""),
            path.resolve(ROOT, String(target).replace(/\*$/, "")),
        ])
        .sort((a, b) => b[0].length - a[0].length);
}

const ALIASES = pathAliases();

/** Resolve an import specifier — relative or aliased — to a `.ts` file. */
function resolveSpecifier(fromDir, spec) {
    let base = null;
    if (spec.startsWith(".")) {
        base = path.resolve(fromDir, spec.replace(/\.(m?js|ts)$/, ""));
    } else {
        for (const [prefix, dir] of ALIASES) {
            if (!spec.startsWith(prefix)) continue;
            base = path.join(dir, spec.slice(prefix.length));
            break;
        }
    }
    if (!base) return null;
    for (const candidate of [`${base}.ts`, path.join(base, "index.ts")]) {
        if (fs.existsSync(candidate)) return candidate;
    }
    return null;
}

/**
 * The object literal a schema-defining expression ends at.
 *
 * `defineSchema()` returns a call to a named function in the same file, so the
 * identifier is followed once. Returning the literal directly is handled too.
 *
 * @param {ts.SourceFile} src - The file being read.
 * @param {string} fnName - The function to resolve.
 * @returns {ts.ObjectLiteralExpression|null} The literal it returns.
 */
function literalReturnedBy(src, fnName) {
    let literal = null;
    const visit = (node) => {
        if (literal) return;
        const isTarget =
            (ts.isFunctionDeclaration(node) && node.name?.text === fnName) ||
            (ts.isVariableDeclaration(node) &&
                ts.isIdentifier(node.name) &&
                node.name.text === fnName);
        if (isTarget) {
            const body =
                ts.isFunctionDeclaration(node) ? node.body
                : node.initializer && ts.isArrowFunction(node.initializer) ?
                    node.initializer.body
                :   null;
            if (body) literal = returnedLiteral(body);
        }
        ts.forEachChild(node, visit);
    };
    visit(src);
    return literal;
}

/** The object literal a function body returns, if it returns one directly. */
function returnedLiteral(body) {
    if (ts.isObjectLiteralExpression(body)) return body;
    let found = null;
    const visit = (node) => {
        if (found) return;
        if (ts.isReturnStatement(node) && node.expression) {
            const e = node.expression;
            if (ts.isObjectLiteralExpression(e)) found = e;
        }
        ts.forEachChild(node, visit);
    };
    visit(body);
    return found;
}

/**
 * The schema literal a DataModel class defines, and the file it lives in.
 *
 * @param {string} file - The class's source file.
 * @param {string} className - The DataModel class.
 * @returns {{src: ts.SourceFile, literal: ts.ObjectLiteralExpression}|null}
 */
function schemaLiteralOf(file, className) {
    const src = parse(file);
    let literal = null;
    const visit = (node) => {
        if (literal) return;
        if (ts.isClassDeclaration(node) && node.name?.text === className) {
            for (const member of node.members) {
                if (
                    !ts.isMethodDeclaration(member) ||
                    propName(member.name) !== "defineSchema" ||
                    !member.body
                ) {
                    continue;
                }
                const direct = returnedLiteral(member.body);
                if (direct) {
                    literal = direct;
                    return;
                }
                // `return defineXDataSchema();` — follow it.
                let call = null;
                ts.forEachChild(member.body, (s) => {
                    if (
                        ts.isReturnStatement(s) &&
                        s.expression &&
                        ts.isCallExpression(s.expression) &&
                        ts.isIdentifier(s.expression.expression)
                    ) {
                        call = s.expression.expression.text;
                    }
                });
                if (call) literal = literalReturnedBy(src, call);
                return;
            }
        }
        ts.forEachChild(node, visit);
    };
    visit(src);
    return literal ? { src, literal } : null;
}

/**
 * Every field path an object literal declares, and what it spreads.
 *
 * @param {ts.SourceFile} src - The file the literal lives in.
 * @param {ts.ObjectLiteralExpression} literal - The schema literal.
 * @returns {{own: string[], spreads: {kind: string, name: string}[]}}
 */
function readLiteral(src, literal) {
    const own = [];
    const spreads = [];
    for (const p of literal.properties) {
        if (ts.isSpreadAssignment(p)) {
            const e = p.expression;
            // `...defineSohlItemDataSchema()`
            if (ts.isCallExpression(e) && ts.isIdentifier(e.expression)) {
                spreads.push({ kind: "local", name: e.expression.text });
            }
            // `...SohlItemDataModel.defineSchema()`
            else if (
                ts.isCallExpression(e) &&
                ts.isPropertyAccessExpression(e.expression) &&
                ts.isIdentifier(e.expression.expression)
            ) {
                spreads.push({
                    kind: "class",
                    name: e.expression.expression.text,
                });
            }
            continue;
        }
        if (!ts.isPropertyAssignment(p)) continue;
        const key = propName(p.name);
        own.push(key);
        // `new SchemaField({ … })` nests; record the leaves beneath it too.
        for (const child of nestedKeysOf(p.initializer)) {
            own.push(`${key}.${child}`);
        }
    }
    return { own, spreads };
}

/** The keys of a `new SchemaField({ … })`, one level, recursively dotted. */
function nestedKeysOf(expr) {
    if (
        !ts.isNewExpression(expr) ||
        !ts.isIdentifier(expr.expression) ||
        expr.expression.text !== "SchemaField"
    ) {
        return [];
    }
    const arg = expr.arguments?.[0];
    if (!arg || !ts.isObjectLiteralExpression(arg)) return [];
    const out = [];
    for (const p of arg.properties) {
        if (!ts.isPropertyAssignment(p)) continue;
        const key = propName(p.name);
        out.push(key);
        for (const child of nestedKeysOf(p.initializer)) {
            out.push(`${key}.${child}`);
        }
    }
    return out;
}

/**
 * Resolve one subtype's schema into own and inherited field paths.
 *
 * @param {ts.SourceFile} configSrc - The parsed registry file.
 * @param {string} className - The DataModel class.
 * @returns {{own: string[], inherited: string[]}}
 */
function fieldsFor(configSrc, className) {
    const file = importSourceOf(configSrc, className);
    if (!file) {
        throw new Error(
            `${className} is registered in ${path.relative(ROOT, CONFIG)} but ` +
                `is not imported there, so its schema cannot be located.`,
        );
    }
    const found = schemaLiteralOf(file, className);
    if (!found) {
        throw new Error(
            `${className} (${path.relative(ROOT, file)}) declares no ` +
                `defineSchema() this reader can follow.`,
        );
    }

    const own = [];
    const inherited = [];
    const seen = new Set();

    /** Walk a literal, attributing its fields to `into`. */
    const walk = (src, literal, into) => {
        const { own: fields, spreads } = readLiteral(src, literal);
        into.push(...fields);
        for (const spread of spreads) {
            const key = `${src.fileName}:${spread.kind}:${spread.name}`;
            if (seen.has(key)) continue;
            seen.add(key);

            if (spread.kind === "local") {
                const lit = literalReturnedBy(src, spread.name);
                // A local spread inside the subtype's own definition is still
                // the parent's contribution — `defineSohlItemDataSchema()` is
                // where `notes` and `docHtml` come from — so it lands in
                // `inherited` whichever file it is written in.
                if (lit) walk(src, lit, inherited);
                continue;
            }
            const parentFile = importSourceOf(src, spread.name);
            if (!parentFile) continue;
            const parent = schemaLiteralOf(parentFile, spread.name);
            if (parent) walk(parent.src, parent.literal, inherited);
        }
    };

    walk(found.src, found.literal, own);
    const ownSet = new Set(own);
    return {
        own: [...ownSet].sort(),
        inherited: [...new Set(inherited)].filter((f) => !ownSet.has(f)).sort(),
    };
}

/** Build the artifact from source. */
function buildArtifact() {
    const configSrc = parse(CONFIG);
    const pkg = JSON.parse(
        fs.readFileSync(path.join(ROOT, "package.json"), "utf8"),
    );

    const documents = {};
    for (const [docType, registry] of [
        ["Item", "ITEM_DM_DEF"],
        ["Actor", "ACTOR_DM_DEF"],
    ]) {
        const map = registryOf(configSrc, registry);
        if (!map.size) {
            throw new Error(
                `${registry} not found in ${path.relative(ROOT, CONFIG)} — the ` +
                    `registry is what says which subtypes exist, so an empty ` +
                    `read would publish a schema that silently covers nothing.`,
            );
        }
        documents[docType] = {};
        for (const [subtype, className] of [...map].sort()) {
            documents[docType][subtype] = fieldsFor(configSrc, className);
        }
    }

    return {
        version: SCHEMA_ARTIFACT_VERSION,
        system: pkg.name,
        systemVersion: pkg.version,
        documents,
    };
}

const artifact = buildArtifact();
// Formatted the way every other generated file here is, so that
// `lint:format` and `lint:schema` cannot disagree about the same bytes — the
// first run of this wrote valid JSON that Prettier then reformatted, leaving
// the two checks each demanding what the other forbade.
const text = await formatGenerated(JSON.stringify(artifact), OUT);

if (process.argv.includes("--check")) {
    const current = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8") : null;
    if (current !== text) {
        console.error(
            `check-schema: ${path.relative(ROOT, OUT)} does not match what ` +
                `src/ would produce — regenerate with \`npm run schema\`.`,
        );
        process.exit(1);
    }
    const counts = Object.entries(artifact.documents).map(
        ([k, v]) => `${Object.keys(v).length} ${k}`,
    );
    console.log(`check-schema: up to date (${counts.join(", ")} subtypes).`);
} else {
    fs.writeFileSync(OUT, text, "utf8");
    const counts = Object.entries(artifact.documents).map(
        ([k, v]) => `${Object.keys(v).length} ${k}`,
    );
    console.log(
        `Wrote ${path.relative(ROOT, OUT)} for ${artifact.system} ` +
            `${artifact.systemVersion} (${counts.join(", ")} subtypes).`,
    );
}
