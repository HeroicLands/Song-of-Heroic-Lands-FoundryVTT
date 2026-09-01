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
 * The localization keys only this repository's own conventions can find.
 *
 * `package-build lang coverage` knows everything Foundry-shaped —
 * `{{localize}}`, `game.i18n.localize` / `format`, keys in string and template
 * literals, a DataModel's `LOCALIZATION_PREFIXES` and the `FIELDS.*.label` /
 * `.hint` keys Foundry mints off one. What it cannot know is a rule a single
 * package invented, so it calls a module named in
 * `packageBuild.lang.references` and merges what that module returns.
 *
 * SoHL has exactly one such rule. `defineType(prefix, def, labelKeys?)`
 * (`src/utils/constants.ts`) turns a `{ KEY: value }` map into localization
 * keys `` `${prefix}.${seg}` ``, where `seg` is the **value** when that value
 * is a plain identifier string (no `.` or `:`) and the **key** otherwise. A
 * third argument maps a member to an *existing* label key it borrows instead of
 * minting one under `prefix` (#1352); those members contribute the borrowed key.
 *
 * A bundle's labels are only *required* to exist when its `labels` / `choices`
 * is actually **consumed** — destructured into a binding that is used, or read
 * as `<result>.labels` / `.choices`. Many enums destructure only `kind` /
 * `values` and localize their entries through a dynamic
 * `` `${prefix}.${value}` `` instead; the shared scan already vouches for those
 * through the template literal's shape, and the bundle's generated label keys
 * are a byproduct that need no entry in `lang/en.json`.
 *
 * The rule is read from the TypeScript AST rather than the text, for the reason
 * the shared scan gives: a key named in a JSDoc `@example` is documentation, so
 * requiring it to exist would fail the build on prose and counting it as a
 * reference would let a comment keep a dead key alive.
 *
 * Pure: source text in, a reference set out. Discovery, I/O and reporting stay
 * with `package-build`.
 *
 * @module
 */

import ts from "typescript";

/**
 * One place a key is referenced, and how firmly — the shape
 * `package-build lang coverage` reads back.
 *
 * Restated here rather than imported: `coverage.mjs` is not on the package's
 * export map, so its typedef has no importable path, and a contributor that
 * could not state its own return type would be typed as `object`.
 *
 * @typedef {object} KeyReference
 * @property {string} key - The localization key, in full.
 * @property {string} file - Where it is referenced, relative to the repository
 *   root.
 * @property {number} [line] - 1-based line of the generating call.
 * @property {boolean} [exact] - When true the key must be declared verbatim,
 *   even if keys sit beneath it.
 * @property {string} [origin] - The verb phrase naming how the key is
 *   referenced, for the message.
 */

/**
 * A finding a contributor could not resolve.
 *
 * @typedef {object} CoverageFinding
 * @property {string} file - Path the finding is about.
 * @property {number} [line] - 1-based line, when known.
 * @property {"error"|"warning"} severity - How it should be treated.
 * @property {string} message - What is wrong, in one sentence.
 */

/**
 * Everything one scan learned about how a package addresses localization.
 *
 * @typedef {object} ReferenceSet
 * @property {KeyReference[]} keys - Concrete keys, each at its site.
 * @property {string[]} namespaces - Prefixes whose leaves are never named.
 * @property {string[]} patterns - Key shapes, `*` standing for one segment.
 * @property {CoverageFinding[]} findings - What could not be resolved.
 */

/**
 * Unwrap `x as T` / `x satisfies T` / `(x)` to the underlying expression.
 *
 * @param {ts.Node|undefined} node - The node to unwrap.
 * @returns {ts.Node|undefined} The expression it wraps, or the node itself.
 */
function unwrap(node) {
    while (
        node &&
        (ts.isAsExpression(node) ||
            ts.isSatisfiesExpression(node) ||
            ts.isParenthesizedExpression(node))
    ) {
        node = node.expression;
    }
    return node;
}

/**
 * Whether a node is a string whose `.text` is the whole literal.
 *
 * @param {ts.Node|undefined} node - The node.
 * @returns {boolean} True for a string literal or a substitution-free template.
 */
function isStr(node) {
    return Boolean(node && (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)));
}

/**
 * The `labelKey` rule from `constants.ts`: a value that is a plain identifier
 * names the segment, and anything else falls back to the member's key.
 *
 * @param {string} key - The member's key in the definition object.
 * @param {ts.Node|undefined} valueNode - Its value.
 * @returns {string} The segment appended to the bundle's prefix.
 */
function segmentFor(key, valueNode) {
    const value = unwrap(valueNode);
    if (isStr(value) && !/[.:]/.test(value.text)) return value.text;
    return key;
}

/**
 * Every same-file `const NAME = { … }`, so a definition passed by name
 * (`defineType("TYPES.Actor", ACTOR_DM_DEF)`) resolves to its object literal.
 *
 * @param {ts.SourceFile} sourceFile - The parsed file.
 * @returns {Map<string, ts.ObjectLiteralExpression>} Name → object literal.
 */
function constObjectsOf(sourceFile) {
    const objects = new Map();
    const visit = (node) => {
        if (ts.isVariableStatement(node)) {
            for (const declaration of node.declarationList.declarations) {
                if (!ts.isIdentifier(declaration.name)) continue;
                const init = unwrap(declaration.initializer);
                if (init && ts.isObjectLiteralExpression(init)) {
                    objects.set(declaration.name.text, init);
                }
            }
        }
        ts.forEachChild(node, visit);
    };
    visit(sourceFile);
    return objects;
}

/**
 * The member → borrowed-key map a `defineType` call's third argument declares.
 *
 * @param {ts.Node|undefined} node - The third argument, already unwrapped.
 * @param {Map<string, ts.ObjectLiteralExpression>} constObjects - Same-file
 *   object literals, for an argument passed by name.
 * @returns {Map<string, string>} Member key → the existing key it borrows.
 */
function overridesOf(node, constObjects) {
    const overrides = new Map();
    let object = node;
    if (object && ts.isIdentifier(object)) {
        object = constObjects.get(object.text) ?? undefined;
    }
    if (!object || !ts.isObjectLiteralExpression(object)) return overrides;

    /**
     * Record one `member: "SOHL.…"` assignment.
     *
     * @param {ts.ObjectLiteralElementLike} property - The property.
     * @returns {void}
     */
    const record = (property) => {
        if (!ts.isPropertyAssignment(property)) return;
        const name = property.name;
        if (!ts.isIdentifier(name) && !isStr(name)) return;
        const value = unwrap(property.initializer);
        if (isStr(value)) overrides.set(name.text, value.text);
    };

    for (const property of object.properties) {
        if (ts.isSpreadAssignment(property)) {
            let spread = unwrap(property.expression);
            if (spread && ts.isIdentifier(spread)) {
                spread = constObjects.get(spread.text) ?? undefined;
            }
            if (spread && ts.isObjectLiteralExpression(spread)) {
                for (const inner of spread.properties) record(inner);
            }
            continue;
        }
        record(property);
    }
    return overrides;
}

/**
 * The keys one `defineType` definition object mints.
 *
 * @param {ts.ObjectLiteralExpression} definition - The definition object.
 * @param {string} prefix - The bundle's key prefix.
 * @param {Map<string, string>} overrides - Borrowed keys, by member.
 * @returns {string[]} The keys, in declaration order.
 */
function keysOf(definition, prefix, overrides) {
    const keys = [];
    for (const property of definition.properties) {
        let member;
        if (ts.isShorthandPropertyAssignment(property)) {
            member = property.name.text;
        } else if (ts.isPropertyAssignment(property)) {
            const name = property.name;
            if (ts.isIdentifier(name) || isStr(name)) member = name.text;
        }
        // A spread, a computed name or a method contributes no member key.
        if (member == null) continue;

        const borrowed = overrides.get(member);
        if (borrowed) {
            keys.push(borrowed);
            continue;
        }
        const segment =
            ts.isPropertyAssignment(property) ? segmentFor(member, property.initializer) : member;
        keys.push(`${prefix}.${segment}`);
    }
    return keys;
}

/**
 * How a `defineType` call's result is taken apart at its declaration site.
 *
 * @param {ts.CallExpression} call - The call.
 * @param {ts.SourceFile} sourceFile - The file it sits in.
 * @returns {{bindings: string[], resultVar: string|null}} The names bound from
 *   `labels` / `choices`, and the whole result's variable name when it is bound
 *   as one.
 */
function consumersOf(call, sourceFile) {
    let parent = call.parent;
    while (
        parent &&
        (ts.isAsExpression(parent) ||
            ts.isSatisfiesExpression(parent) ||
            ts.isParenthesizedExpression(parent))
    ) {
        parent = parent.parent;
    }
    if (!parent || !ts.isVariableDeclaration(parent)) {
        return { bindings: [], resultVar: null };
    }
    if (ts.isObjectBindingPattern(parent.name)) {
        const bindings = [];
        for (const element of parent.name.elements) {
            const from = (element.propertyName ?? element.name).getText(sourceFile);
            if (from === "labels" || from === "choices") {
                bindings.push(element.name.getText(sourceFile));
            }
        }
        return { bindings, resultVar: null };
    }
    if (ts.isIdentifier(parent.name)) {
        return { bindings: [], resultVar: parent.name.text };
    }
    return { bindings: [], resultVar: null };
}

/**
 * Contribute the keys SoHL's own conventions generate.
 *
 * Consumption is resolved across the **whole** scanned tree rather than per
 * file: a bundle declared in `constants.ts` is normally consumed somewhere
 * else, so a per-file answer would call every bundle a byproduct.
 *
 * @param {object} context - What `package-build lang coverage` supplies.
 * @param {{path: string, text: string}[]} context.files - The scanned sources,
 *   already read, so this sees exactly the text the built-in scan saw.
 * @returns {ReferenceSet} The reference set.
 */
export function references({ files }) {
    /** @type {KeyReference[]} */
    const keys = [];
    /** @type {string[]} */
    const namespaces = [];
    /** @type {CoverageFinding[]} */
    const findings = [];

    /** One resolved `defineType` call, pending the consumption verdict. */
    const bundles = [];
    /** Identifier text → how many times it occurs anywhere in the tree. */
    const identifierUses = new Map();
    /** Objects read as `x.labels` / `x.choices` anywhere in the tree. */
    const labelsChoicesReads = new Set();

    for (const { path: file, text } of files) {
        // `.mjs` carries no `defineType` call — the helper is TypeScript — and
        // parsing it here would only duplicate the shared scan.
        if (!file.endsWith(".ts")) continue;

        const sourceFile = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
        const lineOf = (node) => sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
        const constObjects = constObjectsOf(sourceFile);

        const visit = (node) => {
            if (
                ts.isCallExpression(node) &&
                ts.isIdentifier(node.expression) &&
                node.expression.text === "defineType"
            ) {
                const first = unwrap(node.arguments[0]);
                const prefix = isStr(first) ? first.text : undefined;
                // The prefix names a family; its leaves are the generated keys
                // below, so it is never a key in its own right.
                if (prefix) namespaces.push(prefix);

                let definition = unwrap(node.arguments[1]);
                if (definition && ts.isIdentifier(definition)) {
                    definition = constObjects.get(definition.text) ?? undefined;
                }
                if (!prefix || !definition || !ts.isObjectLiteralExpression(definition)) {
                    findings.push({
                        file,
                        line: lineOf(node),
                        severity: "warning",
                        message:
                            "defineType call is not statically resolvable: " +
                            (prefix ? "unresolved def" : "non-literal prefix"),
                    });
                } else {
                    bundles.push({
                        keys: keysOf(
                            definition,
                            prefix,
                            overridesOf(unwrap(node.arguments[2]), constObjects),
                        ),
                        ...consumersOf(node, sourceFile),
                        file,
                        line: lineOf(node),
                    });
                }
            }

            if (ts.isIdentifier(node)) {
                identifierUses.set(node.text, (identifierUses.get(node.text) ?? 0) + 1);
            }
            if (
                ts.isPropertyAccessExpression(node) &&
                (node.name.text === "labels" || node.name.text === "choices") &&
                ts.isIdentifier(node.expression)
            ) {
                labelsChoicesReads.add(node.expression.text);
            }

            ts.forEachChild(node, visit);
        };
        visit(sourceFile);
    }

    for (const bundle of bundles) {
        // A binding is used when it occurs beyond its own declaration; an
        // unrenamed `labels` / `choices` binding is used by definition, since
        // naming it is already the point.
        const consumed =
            bundle.bindings.some(
                (name) =>
                    name === "labels" || name === "choices" || (identifierUses.get(name) ?? 0) > 1,
            ) || Boolean(bundle.resultVar && labelsChoicesReads.has(bundle.resultVar));
        if (!consumed) continue;
        for (const key of bundle.keys) {
            keys.push({
                key,
                file: bundle.file,
                line: bundle.line,
                // Minted whole, so a key sitting beneath it does not vouch for
                // it the way an ordinary textual reference to a family would.
                exact: true,
                origin: "defineType generates",
            });
        }
    }

    return { keys, namespaces, patterns: [], findings };
}
