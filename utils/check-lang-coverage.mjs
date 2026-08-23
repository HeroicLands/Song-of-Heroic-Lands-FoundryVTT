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
 * CI guard: every localization key the system references must exist in
 * `lang/en.json`, and (advisory) every key in `lang/en.json` should be referenced.
 *
 * Keys are gathered statically from two families of reference:
 *
 *  1. **`defineType(prefix, def, labelKeys?)`-generated keys.** `defineType`
 *     (`src/utils/constants.ts`) turns a `{ KEY: value }` map into localization keys
 *     `` `${prefix}.${seg}` ``, where `seg` is the **value** when it is a plain
 *     identifier string (no `.`/`:`) and the **key** otherwise. That rule is
 *     reproduced here from the TypeScript AST, resolving both inline object literals
 *     and a def passed as a same-file `const` (e.g.
 *     `defineType("TYPES.Actor", ACTOR_DM_DEF)`). A `defineType` bundle's labels are
 *     only treated as referenced when its `labels`/`choices` is actually
 *     **consumed** — destructured into a binding that is used, or accessed as
 *     `<result>.labels` / `.choices`. Many enums destructure only `kind`/`values`
 *     and localize their entries through a dynamic `` `${prefix}.${value}` `` instead
 *     (family 2); their auto-generated label keys are a byproduct and are not
 *     required to exist.
 *
 *  2. **Concrete `SOHL.*` / `TYPES.*` string literals** in `src/**` (`.ts`/`.mjs`)
 *     and Handlebars templates — `localize("SOHL.…")`, type-label configs,
 *     `disabledReason = "SOHL.…"`, `{{localize "SOHL.…"}}`, etc. References are read
 *     from the **AST** for `.ts`, so comments (e.g. JSDoc `@example` keys) are
 *     ignored. A key referenced only through a template literal
 *     (`` `SOHL.Actor.${kind}` ``) contributes its static **head** as a *namespace
 *     prefix*, not a concrete key — this is the common dynamic pattern.
 *
 * Two kinds of reference are deliberately **not** treated as concrete keys, because
 * they are namespaces whose leaves Foundry auto-localizes or which are built
 * dynamically: `defineType` prefixes, and every string in a DataModel's
 * `LOCALIZATION_PREFIXES` array.
 *
 * **Errors (fail CI):**
 *   - a generated key from a **consumed** `defineType` bundle missing from en.json;
 *   - a concrete referenced key missing from en.json (and not a namespace/dynamic
 *     prefix).
 *
 * **Warnings (advisory, never fail):**
 *   - en.json keys that appear unreferenced.
 *
 * Usage:
 *   node utils/check-lang-coverage.mjs            // check (used by `npm run lint`)
 *   node utils/check-lang-coverage.mjs --unused   // also list the unused keys
 *   node utils/check-lang-coverage.mjs --absent   // also list the byproduct sets
 */
import { readFileSync } from "node:fs";
import {
    emitDiagnostic,
    positionOfLiteral,
} from "@heroiclands/content-build/engine/diagnostics";
import { globSync } from "glob";
import ts from "typescript";

const SHOW_UNUSED = process.argv.includes("--unused");
const SHOW_ABSENT = process.argv.includes("--absent");
const I18N_ROOTS = ["SOHL", "TYPES", "TYPE"];
const TOKEN_RE = /^(?:SOHL|TYPES|TYPE)\.[A-Za-z0-9_]+(?:\.[A-Za-z0-9_]+)*$/;
// Not preceded by a word char or dot, so `TYPES.base` is not matched inside
// `BEHAVIOR.TYPES.base` (a Foundry-core prefix, not a SoHL key).
const TOKEN_SCAN_RE =
    /(?<![A-Za-z0-9_.])(?:SOHL|TYPES|TYPE)\.[A-Za-z0-9_]+(?:\.[A-Za-z0-9_]+)*/g;

const LANG_FILE = "lang/en.json";
// Kept so an unreferenced key can be reported at its own line in the file the
// fix is made in (#1668).
const langRaw = readFileSync(LANG_FILE, "utf8");
const en = JSON.parse(langRaw);
const enKeys = new Set(Object.keys(en));

// ---------------------------------------------------------------------------
// Shared AST helpers
// ---------------------------------------------------------------------------

/** Unwrap `x as T` / `x satisfies T` / `(x)` to the underlying expression. */
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

const isStr = (n) =>
    n && (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n));

// ---------------------------------------------------------------------------
// Accumulators
// ---------------------------------------------------------------------------
const generated = new Map(); // key -> Set(file)  (from CONSUMED defineType bundles)
const concreteRefs = new Map(); // key -> Set(file)   (real leaf-key references)
const namespacePrefixes = new Set(); // defineType prefixes + LOCALIZATION_PREFIXES
const dynamicPrefixes = new Set(); // static heads of `SOHL.X.${…}` templates
// Whole-template *shapes*: `SOHL.Calendar.Vylarian.Month.${i}.label` becomes
// /^SOHL\.Calendar\.Vylarian\.Month\.[^.]+\.label$/, which vouches for exactly
// the keys that construction can build. Matching on the head instead (the old
// behaviour) let a single `SOHL.${x}…` vouch for the entire file, which is why
// `--unused` always reported zero (#1354).
const dynamicShapes = new Set();

/**
 * Turn a template literal's source text into the key shape it can produce.
 *
 * Substitution happens **before** escaping: escaping `$` first leaves `\$\{i\}`,
 * which the placeholder pattern can no longer match, and every shape silently
 * matches nothing.
 *
 * @param {string} literal - Template-literal text, e.g. "SOHL.X.${k}.label".
 * @returns {RegExp|null} The shape, or `null` when there is nothing to expand.
 */
function shapeOf(literal) {
    if (!literal.includes("${")) return null;
    const SENTINEL = "\u0000";
    const body = literal
        .replace(/\$\{[^}]*\}/g, SENTINEL)
        .replace(/[.*+?^$()|[\]\\]/g, "\\$&")
        .split(SENTINEL)
        .join("[^.]+");
    return new RegExp(`^${body}$`);
}
const unresolvedDefs = []; // { file, line, reason }

// Consumption tracking: a defineType bundle's generated label keys are only
// "referenced" when its `labels`/`choices` is destructured into a used binding,
// or accessed as `<result>.labels` / `.choices`.
const defineTypeMetas = []; // { prefix, keys[], bindings[], resultVar, file }
const identUses = new Map(); // identifier text -> occurrence count (all .ts)
const labelsChoicesAccessObjs = new Set(); // objects of `x.labels` / `x.choices`

/** The `labelKey` rule from constants.ts: value-identifier → value, else key. */
function segFor(key, valueNode) {
    const v = unwrap(valueNode);
    if (isStr(v) && !/[.:]/.test(v.text)) return v.text;
    return key;
}

/** Static head of a template literal (`SOHL.Actor.` → `SOHL.Actor`), or null. */
function templateHeadPrefix(head) {
    // Trim the trailing partial segment after the last dot; a head like
    // "SOHL.Actor." yields "SOHL.Actor", "SOHL." yields "SOHL".
    const text = head.replace(/[A-Za-z0-9_]*$/, "").replace(/\.$/, "");
    return (
            text &&
                I18N_ROOTS.some((r) => text === r || text.startsWith(r + "."))
        ) ?
            text
        :   null;
}

const tsFiles = globSync("src/**/*.ts");
for (const file of tsFiles) {
    const src = readFileSync(file, "utf8");
    const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true);
    const lineOf = (n) =>
        sf.getLineAndCharacterOfPosition(n.getStart()).line + 1;

    // Pass 1: same-file `const NAME = { … }` object literals (for identifier defs).
    const constObjects = new Map();
    const collectConsts = (node) => {
        if (ts.isVariableStatement(node)) {
            for (const d of node.declarationList.declarations) {
                if (ts.isIdentifier(d.name) && d.initializer) {
                    const init = unwrap(d.initializer);
                    if (init && ts.isObjectLiteralExpression(init))
                        constObjects.set(d.name.text, init);
                }
            }
        }
        ts.forEachChild(node, collectConsts);
    };
    collectConsts(sf);

    const addRef = (key) => {
        if (!concreteRefs.has(key)) concreteRefs.set(key, new Set());
        concreteRefs.get(key).add(file);
    };

    /** The `labels`/`choices` bindings + result var of `const … = defineType(…)`. */
    const consumersOf = (callNode) => {
        let p = callNode.parent;
        while (
            p &&
            (ts.isAsExpression(p) ||
                ts.isSatisfiesExpression(p) ||
                ts.isParenthesizedExpression(p))
        )
            p = p.parent;
        if (p && ts.isVariableDeclaration(p)) {
            if (ts.isObjectBindingPattern(p.name)) {
                const bindings = [];
                for (const el of p.name.elements) {
                    const from = (el.propertyName ?? el.name).getText(sf);
                    if (from === "labels" || from === "choices")
                        bindings.push(el.name.getText(sf));
                }
                return { bindings, resultVar: null };
            }
            if (ts.isIdentifier(p.name))
                return { bindings: [], resultVar: p.name.text };
        }
        return { bindings: [], resultVar: null };
    };

    const visit = (node) => {
        // -- defineType(prefix, def) --------------------------------------
        if (
            ts.isCallExpression(node) &&
            ts.isIdentifier(node.expression) &&
            node.expression.text === "defineType"
        ) {
            const p = unwrap(node.arguments[0]);
            const prefix = isStr(p) ? p.text : undefined;
            if (prefix) namespacePrefixes.add(prefix);
            let defObj = unwrap(node.arguments[1]);
            if (defObj && ts.isIdentifier(defObj))
                defObj = constObjects.get(defObj.text) ?? null;
            if (!prefix || !defObj || !ts.isObjectLiteralExpression(defObj)) {
                unresolvedDefs.push({
                    file,
                    line: lineOf(node),
                    reason: !prefix ? "non-literal prefix" : "unresolved def",
                });
            } else {
                // A third argument maps member → an *existing* label key it
                // borrows instead of minting one under `prefix` (#1352). Those
                // members contribute the borrowed key, not a generated one.
                const overrides = new Map();
                let ovObj = unwrap(node.arguments[2]);
                if (ovObj && ts.isIdentifier(ovObj))
                    ovObj = constObjects.get(ovObj.text) ?? null;
                if (ovObj && ts.isObjectLiteralExpression(ovObj)) {
                    for (const prop of ovObj.properties) {
                        if (ts.isSpreadAssignment(prop)) {
                            let spread = unwrap(prop.expression);
                            if (spread && ts.isIdentifier(spread))
                                spread = constObjects.get(spread.text) ?? null;
                            if (
                                spread &&
                                ts.isObjectLiteralExpression(spread)
                            ) {
                                for (const sp of spread.properties) {
                                    if (!ts.isPropertyAssignment(sp)) continue;
                                    const n = sp.name;
                                    if (!ts.isIdentifier(n) && !isStr(n))
                                        continue;
                                    const v = unwrap(sp.initializer);
                                    if (isStr(v)) overrides.set(n.text, v.text);
                                }
                            }
                            continue;
                        }
                        if (!ts.isPropertyAssignment(prop)) continue;
                        const n = prop.name;
                        if (!ts.isIdentifier(n) && !isStr(n)) continue;
                        const v = unwrap(prop.initializer);
                        if (isStr(v)) overrides.set(n.text, v.text);
                    }
                }
                const keys = [];
                for (const prop of defObj.properties) {
                    let key;
                    if (ts.isShorthandPropertyAssignment(prop))
                        key = prop.name.text;
                    else if (ts.isPropertyAssignment(prop)) {
                        const n = prop.name;
                        if (ts.isIdentifier(n) || isStr(n)) key = n.text;
                    }
                    if (key == null) continue; // spread / computed / method
                    const borrowed = overrides.get(key);
                    if (borrowed) {
                        keys.push(borrowed);
                        continue;
                    }
                    const seg =
                        ts.isPropertyAssignment(prop) ?
                            segFor(key, prop.initializer)
                        :   key;
                    keys.push(`${prefix}.${seg}`);
                }
                const { bindings, resultVar } = consumersOf(node);
                defineTypeMetas.push({
                    prefix,
                    keys,
                    bindings,
                    resultVar,
                    file,
                });
            }
        }

        // -- identifier usage counts + `x.labels` / `x.choices` access -----
        if (ts.isIdentifier(node))
            identUses.set(node.text, (identUses.get(node.text) ?? 0) + 1);
        if (
            ts.isPropertyAccessExpression(node) &&
            (node.name.text === "labels" || node.name.text === "choices") &&
            ts.isIdentifier(node.expression)
        ) {
            labelsChoicesAccessObjs.add(node.expression.text);
        }

        // -- LOCALIZATION_PREFIXES = ["SOHL.X", …] ------------------------
        if (
            (ts.isPropertyDeclaration(node) || ts.isPropertyAssignment(node)) &&
            node.name &&
            node.name.getText(sf).replace(/["']/g, "") ===
                "LOCALIZATION_PREFIXES" &&
            node.initializer &&
            ts.isArrayLiteralExpression(unwrap(node.initializer))
        ) {
            for (const el of unwrap(node.initializer).elements)
                if (isStr(el)) namespacePrefixes.add(el.text);
        }

        // -- concrete string-literal key references -----------------------
        if (isStr(node) && TOKEN_RE.test(node.text)) addRef(node.text);

        // -- template literals: static head is a dynamic namespace prefix --
        // A template literal's *text* is not a string-literal node, so concrete
        // keys inside inline HTML (`{{localize "SOHL.X.y"}}` in a helper's
        // markup) are invisible to the scan above — read them out explicitly.
        if (
            ts.isNoSubstitutionTemplateLiteral(node) ||
            ts.isTemplateExpression(node)
        ) {
            // Scan each literal chunk separately: joining them would glue a
            // token across a `${…}` boundary and invent a key that is not there
            // (`SOHL.X.Action.` + `Test`).
            const chunks =
                ts.isNoSubstitutionTemplateLiteral(node) ?
                    [node.text]
                :   [
                        node.head.text,
                        ...node.templateSpans.map((sp) => sp.literal.text),
                    ];
            for (const chunk of chunks)
                for (const m of chunk.matchAll(TOKEN_SCAN_RE))
                    if (TOKEN_RE.test(m[0])) addRef(m[0]);
        }

        if (ts.isTemplateExpression(node)) {
            const pre = templateHeadPrefix(node.head.text);
            if (pre) dynamicPrefixes.add(pre);
            // Reconstruct the literal's shape: head + `${…}` + each span's text.
            let lit = node.head.text;
            for (const span of node.templateSpans)
                lit += "${}" + span.literal.text;
            if (pre) {
                const shape = shapeOf(lit);
                if (shape) dynamicShapes.add(shape);
            }
        }

        ts.forEachChild(node, visit);
    };
    visit(sf);
}

// ---------------------------------------------------------------------------
// Resolve defineType consumption → populate `generated` (required label keys)
// ---------------------------------------------------------------------------
// A binding is "used" if it appears beyond its own declaration occurrence.
// An unrenamed `labels`/`choices` binding, or a `<result>.labels`/`.choices`
// access, also counts as consumed.
const unconsumedSets = []; // { prefix, keys } — labels are a byproduct here
for (const meta of defineTypeMetas) {
    const consumed =
        meta.bindings.some(
            (b) =>
                b === "labels" ||
                b === "choices" ||
                (identUses.get(b) ?? 0) > 1,
        ) ||
        (meta.resultVar && labelsChoicesAccessObjs.has(meta.resultVar));
    if (consumed) {
        for (const k of meta.keys) {
            if (!generated.has(k)) generated.set(k, new Set());
            generated.get(k).add(meta.file);
        }
    } else if (meta.keys.length) {
        unconsumedSets.push({ prefix: meta.prefix, keys: meta.keys });
    }
}

// ---------------------------------------------------------------------------
// Non-.ts references (templates, plain .mjs): text scan
// ---------------------------------------------------------------------------
for (const g of ["src/**/*.hbs", "src/**/*.mjs", "templates/**/*.hbs"]) {
    for (const file of globSync(g)) {
        const src = readFileSync(file, "utf8");
        let m;
        while ((m = TOKEN_SCAN_RE.exec(src))) {
            const token = m[0];
            const rest = src.slice(m.index + token.length);
            if (/^(\$\{|\.\$\{|\s*\+)/.test(rest)) {
                dynamicPrefixes.add(token.replace(/\.[A-Za-z0-9_]*$/, ""));
                // Recover the whole literal so its shape, not just its head,
                // decides what it vouches for.
                const lit = /^[^`]*/.exec(rest)?.[0] ?? "";
                const shape = shapeOf(token + lit);
                if (shape) dynamicShapes.add(shape);
            } else {
                if (!concreteRefs.has(token))
                    concreteRefs.set(token, new Set());
                concreteRefs.get(token).add(file);
            }
        }
    }
}

// ---------------------------------------------------------------------------
// Analysis
// ---------------------------------------------------------------------------
const isNamespace = (t) => {
    if (namespacePrefixes.has(t) || dynamicPrefixes.has(t)) return true;
    // Referenced token that is itself only a prefix of existing en keys.
    const p = t + ".";
    for (const e of enKeys) if (e.startsWith(p)) return true;
    return false;
};

// Generated keys from CONSUMED bundles that are missing from en.json — all real
// gaps (an unconsumed bundle's byproduct labels never reach `generated`).
const genMissing = [...generated.keys()].filter((k) => !enKeys.has(k)).sort();

// Concrete references missing from en.json (excluding namespaces).
const refMissing = [...concreteRefs.keys()]
    .filter((t) => !enKeys.has(t))
    .filter((t) => !generated.has(t))
    .filter((t) => !isNamespace(t))
    .sort();

// Unused en.json keys. A key is used when it is generated by a *consumed*
// `defineType` bundle, referenced verbatim, produced by a dynamic construction's
// shape, or is a field label/hint Foundry auto-localizes off a declared
// `LOCALIZATION_PREFIXES` entry. Nothing else vouches for it — in particular a
// namespace prefix does **not** vouch for every key beneath it (#1354).
const FIELD_SHAPES = [...namespacePrefixes].map(
    (p) =>
        new RegExp(
            `^${p.replace(/[.*+?^$()|[\]\\]/g, "\\$&")}\\.FIELDS\\.[A-Za-z0-9_.]+\\.(label|hint)$`,
        ),
);
/**
 * Keys kept despite having no statically visible reference, each with the reason
 * no scan can see it. Entries are **prefixes**; add one only when the key is
 * genuinely reachable — the honest fix for an unreferenced key is to delete it.
 *
 * Format: `[prefix, reason]`. The reason is prose a reviewer can check.
 */
const RETAINED = [
    [
        "SOHL.Gear.Action.",
        "Intrinsic action titles built as `${titlePrefix}.${shortcode}` — the prefix is a parameter, so no scan can resolve it.",
    ],
    [
        "SOHL.Skill.Action.",
        "As above (defineImproveSdrActions is called with the kind's prefix).",
    ],
    ["SOHL.MysticalAbility.Action.", "As above."],
    ["SOHL.Affliction.Action.", "As above."],
    [
        "SOHL.ContextMenu.SortGroup.",
        "The action ledger localizes the Group column by concatenating the enum value onto this prefix in a template.",
    ],
    [
        "SOHL.Being.StumbleTest.",
        "keepControlTable resolves `<prefix>.<SuccessLevel>.label|description` from a success level computed at runtime.",
    ],
    ["SOHL.Being.FumbleTest.", "As above."],
    [
        "SOHL.AttackResult.TacticalAdvantage.action",
        "Resolved from the stored tactical-advantage value, not named in source.",
    ],
];
const isRetained = (k) => RETAINED.some(([p]) => k === p || k.startsWith(p));

const isUsed = (k) => {
    if (generated.has(k) || concreteRefs.has(k)) return true;
    for (const rx of dynamicShapes) if (rx.test(k)) return true;
    for (const rx of FIELD_SHAPES) if (rx.test(k)) return true;
    return false;
};
const unused = [...enKeys]
    .filter((k) => I18N_ROOTS.some((r) => k === r || k.startsWith(r + ".")))
    .filter((k) => !isUsed(k) && !isRetained(k))
    .sort();

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
console.log(
    `check-lang-coverage: ${enKeys.size} en.json keys · ` +
        `${generated.size} defineType-generated · ` +
        `${concreteRefs.size} concrete refs · ` +
        `${namespacePrefixes.size + dynamicPrefixes.size} namespace/dynamic prefixes`,
);

let errors = genMissing.length + refMissing.length;

if (genMissing.length) {
    console.error(
        `\n✖ ${genMissing.length} defineType-generated key(s) missing from en.json:`,
    );
    // One finding per site that generates the key, so each names the file to
    // open rather than listing them in parentheses (#1668).
    for (const k of genMissing)
        for (const file of generated.get(k))
            emitDiagnostic({
                file,
                severity: "error",
                message: `defineType generates "${k}", which en.json does not declare`,
            });
}
if (refMissing.length) {
    console.error(
        `\n✖ ${refMissing.length} referenced key(s) missing from en.json:`,
    );
    for (const k of refMissing)
        for (const file of concreteRefs.get(k))
            emitDiagnostic({
                file,
                ...positionOfLiteral(readFileSync(file, "utf8"), k),
                severity: "error",
                message: `references "${k}", which en.json does not declare`,
            });
}

if (unconsumedSets.length && SHOW_ABSENT) {
    console.warn(
        `\nℹ ${unconsumedSets.length} defineType set(s) whose labels are a byproduct ` +
            `(kind/values only — no en.json entries needed):`,
    );
    for (const s of unconsumedSets.sort((a, b) =>
        a.prefix.localeCompare(b.prefix),
    ))
        console.warn(`   ${s.prefix}  (${s.keys.length} keys)`);
}

if (unresolvedDefs.length) {
    console.warn(
        `\n⚠ ${unresolvedDefs.length} defineType call(s) not statically resolvable:`,
    );
    for (const u of unresolvedDefs)
        emitDiagnostic({
            file: u.file,
            line: u.line,
            severity: "warning",
            message: `defineType call is not statically resolvable: ${u.reason}`,
        });
}

if (unused.length) {
    errors += unused.length;
    console.error(`\n✖ ${unused.length} en.json key(s) are unreferenced:`);
    const shown = SHOW_UNUSED ? unused : unused.slice(0, 20);
    // The key is declared in en.json — that file and line is where the fix
    // is made, so that is what the finding names.
    for (const k of shown)
        emitDiagnostic({
            file: LANG_FILE,
            ...positionOfLiteral(langRaw, `"${k}"`),
            severity: "error",
            message: `key "${k}" is unreferenced`,
        });
    if (!SHOW_UNUSED && unused.length > shown.length)
        console.error(`   … run with --unused to list all ${unused.length}`);
    console.error(
        "\n   Delete them, or — if one is reachable only through a *variable*\n" +
            "   prefix (`${titlePrefix}.${shortcode}`) or read by Foundry itself\n" +
            "   (TYPES.*) — record it in RETAINED below with the reason.",
    );
}

if (errors) {
    console.error(`\ncheck-lang-coverage: ${errors} problem(s) — see above.`);
    process.exit(1);
}
console.log("\ncheck-lang-coverage: all referenced keys are present. ✓");
