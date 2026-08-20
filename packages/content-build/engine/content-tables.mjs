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
 * Generated content tables — Obsidian **Dataview** `TABLE` queries.
 *
 * A catalog table (every cloth armour, every animal's abilities) is data that
 * already lives in the frontmatter of the notes it describes. Authoring such a
 * table by hand duplicates that data and guarantees drift, so a content body
 * instead declares what it wants tabulated, in a fenced `dataview` block:
 *
 * ```dataview
 * TABLE WITHOUT ID
 *   link(file.path, name.full) AS "Name",
 *   sohl.weight AS "Weight"
 * WHERE type = "armorgear" and sohl.material = "Cloth"
 * SORT name.full ASC
 * ```
 *
 * The content notes live in an **Obsidian vault**, where that block is rendered
 * live by the Dataview plugin. At build time this module renders the same query
 * against the same frontmatter and replaces the block with a markdown table, so
 * an author sees in Obsidian what the build ships. Both content builds run it —
 * the pack compilers (Foundry journals/items/actors) and the knowledgebase — so
 * one authored query yields the same table in the vault, in Foundry, and on the
 * knowledgebase.
 *
 * The emitted table is **markdown**, not HTML, and it is expanded *before*
 * wikilink resolution: a cell may therefore carry `[[type/shortcode|Text]]`,
 * which each build then resolves into its own flavour of link (a Foundry
 * `@UUID` enricher, or a KB href). That is what `link(file.path, …)` compiles
 * to — a link to the row's own note.
 *
 * Only the subset of Dataview the content actually uses is supported, and
 * anything outside it is a **build error** rather than a silently empty table;
 * see `kb/dev-docs/reference/content-tables.md` for the supported grammar.
 *
 * Plain ESM with no Foundry, no filesystem, and no dependencies, so it is
 * unit-testable — see `packages/content-build/tests/content-tables.test.ts`.
 */

/**
 * One content note as a content build hands it to the expander: its parsed
 * frontmatter plus its path below the content root, which backs the `file.*`
 * fields.
 *
 * @typedef {{fm: Record<string, any>, path?: string}} ContentTableDoc
 */

// The fence syntax is stated once, in `code-fences.mjs`, so the scanner that
// *skips* code and the one that expands a `dataview` block cannot disagree
// about where a block begins and ends (#1505).
import { FENCE_LINE } from "./code-fences.mjs";

/** What a cell shows when its expression resolves to nothing. */
const EMPTY_CELL = "—";

/* ------------------------------------------------------------------------ */
/*  Tokenizer                                                               */
/* ------------------------------------------------------------------------ */

/**
 * A field path is one or more dot-joined segments. Hyphens are part of a
 * segment (frontmatter keys may carry them) — the grammar has no arithmetic, so
 * a hyphen between word characters is never an operator.
 */
const IDENT = /[A-Za-z_][A-Za-z0-9_-]*(?:\.[A-Za-z_][A-Za-z0-9_-]*)*/y;
const NUMBER = /\d+(?:\.\d+)?/y;
const TAG = /#[A-Za-z0-9_/-]+/y;
const OPERATORS = ["!=", ">=", "<=", "==", "=", ">", "<", "!", "-"];
const PUNCTUATION = ["(", ")", "[", "]", ","];

/**
 * Split a query into tokens.
 *
 * @param {string} source
 * @returns {Array<{kind: string, value: any, text: string, start: number,
 *   end: number}>} Always terminated by a single `eof` token.
 * @throws {Error} On an unterminated string or a character the grammar has no
 *   meaning for.
 */
function tokenize(source) {
    const tokens = [];
    let i = 0;
    while (i < source.length) {
        const ch = source[i];
        if (/\s/.test(ch)) {
            i++;
            continue;
        }
        const start = i;
        if (ch === '"' || ch === "'") {
            let value = "";
            i++;
            while (i < source.length && source[i] !== ch) {
                if (source[i] === "\\" && i + 1 < source.length) {
                    value += source[++i];
                } else {
                    value += source[i];
                }
                i++;
            }
            if (i >= source.length) {
                throw new Error(`unterminated string starting at "${ch}"`);
            }
            i++; // closing quote
            tokens.push({
                kind: "string",
                value,
                text: source.slice(start, i),
                start,
                end: i,
            });
            continue;
        }
        NUMBER.lastIndex = i;
        const num = NUMBER.exec(source);
        if (num) {
            i = NUMBER.lastIndex;
            tokens.push({
                kind: "number",
                value: Number(num[0]),
                text: num[0],
                start,
                end: i,
            });
            continue;
        }
        TAG.lastIndex = i;
        const tag = TAG.exec(source);
        if (tag) {
            i = TAG.lastIndex;
            tokens.push({
                kind: "tag",
                value: tag[0],
                text: tag[0],
                start,
                end: i,
            });
            continue;
        }
        IDENT.lastIndex = i;
        const ident = IDENT.exec(source);
        if (ident) {
            i = IDENT.lastIndex;
            tokens.push({
                kind: "ident",
                value: ident[0],
                text: ident[0],
                start,
                end: i,
            });
            continue;
        }
        const op = OPERATORS.find((o) => source.startsWith(o, i));
        if (op) {
            i += op.length;
            tokens.push({ kind: "op", value: op, text: op, start, end: i });
            continue;
        }
        if (PUNCTUATION.includes(ch)) {
            i++;
            tokens.push({ kind: "punct", value: ch, text: ch, start, end: i });
            continue;
        }
        throw new Error(`unexpected character "${ch}"`);
    }
    tokens.push({
        kind: "eof",
        value: "",
        text: "",
        start: source.length,
        end: source.length,
    });
    return tokens;
}

/* ------------------------------------------------------------------------ */
/*  Clause splitting                                                        */
/* ------------------------------------------------------------------------ */

/**
 * The clauses this expander understands, in the order a query must write them.
 * The rank is what lets a **field** share a clause keyword's name: `SORT sort
 * ASC` (the vault sorts traits on a frontmatter `sort` field) reads the second
 * `sort` as a field, because a clause may only be followed by one of *higher*
 * rank.
 */
const CLAUSE_RANK = { TABLE: 0, FROM: 1, WHERE: 2, SORT: 3, LIMIT: 4 };

/** Query types and data commands that are recognised only to be refused. */
const UNSUPPORTED_CLAUSES = new Set([
    "LIST",
    "TASK",
    "CALENDAR",
    "GROUP",
    "FLATTEN",
]);

/**
 * Group a query's tokens by clause.
 *
 * @param {Array<object>} tokens - From {@link tokenize}.
 * @returns {Map<string, Array<object>>} Clause name → its tokens (the keyword
 *   itself excluded).
 * @throws {Error} When the query is not a `TABLE`, or uses a clause this
 *   expander does not implement.
 */
function splitClauses(tokens) {
    const clauses = new Map();
    let current = null;
    let rank = -1;
    let depth = 0;
    for (let i = 0; i < tokens.length - 1; i++) {
        const token = tokens[i];
        if (token.kind === "punct") {
            if (token.value === "(" || token.value === "[") depth++;
            else if (token.value === ")" || token.value === "]") depth--;
        }
        const word =
            token.kind === "ident" ? token.value.toUpperCase() : undefined;
        if (depth === 0 && word && UNSUPPORTED_CLAUSES.has(word)) {
            // `GROUP BY` is two words; report it the way an author wrote it.
            const label =
                (
                    word === "GROUP" &&
                    tokens[i + 1]?.value?.toUpperCase?.() === "BY"
                ) ?
                    "GROUP BY"
                :   word;
            if (current === null) {
                throw new Error(
                    `only TABLE queries are supported; this block is a ${label} query`,
                );
            }
            throw new Error(`the ${label} clause is not supported`);
        }
        if (depth === 0 && word && word in CLAUSE_RANK) {
            const next = CLAUSE_RANK[word];
            if (next > rank) {
                if (current === null && word !== "TABLE") {
                    throw new Error(
                        `only TABLE queries are supported; this block starts with ${word}`,
                    );
                }
                current = word;
                rank = next;
                clauses.set(word, []);
                continue;
            }
        }
        if (current === null) {
            throw new Error(
                `only TABLE queries are supported; expected TABLE, got "${token.text}"`,
            );
        }
        clauses.get(current).push(token);
    }
    if (!clauses.has("TABLE")) {
        throw new Error("only TABLE queries are supported; found no TABLE");
    }
    return clauses;
}

/* ------------------------------------------------------------------------ */
/*  Expression parser                                                       */
/* ------------------------------------------------------------------------ */

/** The functions a query may call, with their arity range. */
const FUNCTIONS = {
    link: [1, 2],
    contains: [2, 2],
    icontains: [2, 2],
    econtains: [2, 2],
    startswith: [2, 2],
    endswith: [2, 2],
    lower: [1, 1],
    upper: [1, 1],
    length: [1, 1],
    default: [2, 2],
    number: [1, 1],
    string: [1, 1],
    join: [1, 2],
    regexmatch: [2, 2],
    regextest: [2, 2],
};

const KEYWORD_LITERALS = { true: true, false: false, null: null };

/**
 * A recursive-descent parser over one clause's tokens. Each `parse*` method
 * implements one precedence level, loosest first.
 */
class ExprParser {
    /**
     * @param {Array<object>} tokens - The clause's tokens.
     * @param {string} source - The whole query, for slicing expression text.
     */
    constructor(tokens, source) {
        this.tokens = tokens;
        this.source = source;
        this.pos = 0;
    }

    /** The token about to be consumed. */
    peek(offset = 0) {
        return (
            this.tokens[this.pos + offset] ?? {
                kind: "eof",
                value: "",
                text: "",
                start: 0,
                end: 0,
            }
        );
    }

    /** Consume and return the next token. */
    next() {
        return this.tokens[this.pos++] ?? this.peek();
    }

    /** Is the next token this operator/punctuation? */
    at(value) {
        const t = this.peek();
        return (
            (t.kind === "op" || t.kind === "punct") && t.value === String(value)
        );
    }

    /** Is the next token this (case-insensitive) bare word? */
    atWord(word) {
        const t = this.peek();
        return (
            t.kind === "ident" && t.value.toLowerCase() === word.toLowerCase()
        );
    }

    /** Consume the next token if it matches; report otherwise. */
    expect(value) {
        if (!this.at(value)) {
            throw new Error(
                `expected "${value}", got "${this.peek().text || "end of query"}"`,
            );
        }
        return this.next();
    }

    /** Have all this clause's tokens been consumed? */
    get done() {
        return this.pos >= this.tokens.length;
    }

    /** `a or b` */
    parseExpression() {
        let left = this.parseAnd();
        while (this.atWord("or")) {
            this.next();
            left = { kind: "logical", op: "or", left, right: this.parseAnd() };
        }
        return left;
    }

    /** `a and b` */
    parseAnd() {
        let left = this.parseNot();
        while (this.atWord("and")) {
            this.next();
            left = { kind: "logical", op: "and", left, right: this.parseNot() };
        }
        return left;
    }

    /** `not a` / `!a` */
    parseNot() {
        if (this.atWord("not") || this.at("!")) {
            this.next();
            return { kind: "not", operand: this.parseNot() };
        }
        return this.parseComparison();
    }

    /** `a = b`, `a != b`, `a > b`, … — non-associative. */
    parseComparison() {
        const left = this.parseUnary();
        const t = this.peek();
        if (
            t.kind === "op" &&
            ["=", "==", "!=", ">", ">=", "<", "<="].includes(t.value)
        ) {
            this.next();
            return {
                kind: "compare",
                op: t.value === "==" ? "=" : t.value,
                left,
                right: this.parseUnary(),
            };
        }
        return left;
    }

    /** `-1` */
    parseUnary() {
        if (this.at("-")) {
            this.next();
            return { kind: "negate", operand: this.parseUnary() };
        }
        return this.parsePrimary();
    }

    /**
     * A primary, followed by any `["key"]` / `[0]` index accesses — the form a
     * query needs for a frontmatter key that is not a bare word
     * (`this["name.full"]`).
     */
    parsePrimary() {
        let node = this.parseAtom();
        while (this.at("[")) {
            this.next();
            const key = this.parseExpression();
            this.expect("]");
            // `this["name.full"]` and `sohl["subType"]` are just longer field
            // paths; folding them at parse time keeps the dotted-key precedence
            // that plain `sohl.subType` gets.
            if (
                key.kind === "literal" &&
                typeof key.value === "string" &&
                (node.kind === "field" || node.kind === "self")
            ) {
                node = {
                    ...node,
                    path: node.path ? `${node.path}.${key.value}` : key.value,
                };
            } else {
                node = { kind: "index", target: node, key };
            }
        }
        return node;
    }

    /** A literal, a list, a parenthesised expression, a call, or a field. */
    parseAtom() {
        const t = this.next();
        if (t.kind === "string") return { kind: "literal", value: t.value };
        if (t.kind === "number") return { kind: "literal", value: t.value };
        if (t.kind === "tag") return { kind: "literal", value: t.value };
        if (t.kind === "punct" && t.value === "(") {
            const inner = this.parseExpression();
            this.expect(")");
            return inner;
        }
        if (t.kind === "punct" && t.value === "[") {
            const items = [];
            if (!this.at("]")) {
                do {
                    items.push(this.parseExpression());
                } while (this.at(",") && this.next());
            }
            this.expect("]");
            return { kind: "list", items };
        }
        if (t.kind === "ident") {
            const lowered = t.value.toLowerCase();
            if (lowered in KEYWORD_LITERALS && !this.at("(")) {
                return { kind: "literal", value: KEYWORD_LITERALS[lowered] };
            }
            // `this` is the note *containing* the query, not the row — the same
            // meaning Dataview gives it.
            if (lowered === "this" || lowered.startsWith("this.")) {
                return { kind: "self", path: t.value.slice("this".length + 1) };
            }
            if (this.at("(")) {
                const name = lowered;
                if (!(name in FUNCTIONS)) {
                    throw new Error(`unknown function "${t.value}()"`);
                }
                this.expect("(");
                const args = [];
                if (!this.at(")")) {
                    do {
                        args.push(this.parseExpression());
                    } while (this.at(",") && this.next());
                }
                this.expect(")");
                const [min, max] = FUNCTIONS[name];
                if (args.length < min || args.length > max) {
                    throw new Error(
                        `${name}() takes ${min === max ? min : `${min}–${max}`} argument(s), got ${args.length}`,
                    );
                }
                return { kind: "call", name, args };
            }
            return { kind: "field", path: t.value };
        }
        throw new Error(
            `unexpected "${t.text || "end of query"}" in expression`,
        );
    }

    /**
     * Parse one expression and return it with the exact source text it spanned
     * — which is a column's header when the query writes no `AS`.
     */
    parseExpressionWithText() {
        const from = this.peek().start;
        const expr = this.parseExpression();
        const to = this.tokens[this.pos - 1]?.end ?? from;
        return { expr, text: this.source.slice(from, to).trim() };
    }
}

/* ------------------------------------------------------------------------ */
/*  Query parsing                                                           */
/* ------------------------------------------------------------------------ */

/**
 * Parse one `dataview` block's query.
 *
 * @param {string} source - The query text (fences already stripped).
 * @returns {{columns: Array<{header: string, expr: object}>, from: object|null,
 *   where: object|null, sort: Array<{expr: object, descending: boolean}>,
 *   limit: number|null}}
 * @throws {Error} When the query is not a supported `TABLE` query — the message
 *   names the offending clause, column, or token.
 */
export function parseDataviewQuery(source) {
    const text = String(source ?? "");
    const clauses = splitClauses(tokenize(text));

    /* --- TABLE: an optional WITHOUT ID, then the column list --- */
    const tableTokens = clauses.get("TABLE");
    const parser = new ExprParser(tableTokens, text);
    let withoutId = false;
    if (parser.atWord("without")) {
        parser.next();
        if (!parser.atWord("id")) {
            throw new Error(
                `expected "WITHOUT ID", got "WITHOUT ${parser.peek().text}"`,
            );
        }
        parser.next();
        withoutId = true;
    }
    const columns = [];
    if (!withoutId) {
        // Dataview's implicit first column: a link to the row's own note.
        columns.push({
            header: "File",
            expr: { kind: "field", path: "file.link" },
        });
    }
    while (!parser.done) {
        const { expr, text: exprText } = parser.parseExpressionWithText();
        let header = exprText;
        if (parser.atWord("as")) {
            parser.next();
            const label = parser.next();
            if (label.kind !== "string" && label.kind !== "ident") {
                throw new Error(
                    `expected a column name after AS, got "${label.text || "end of query"}"`,
                );
            }
            header = String(label.value);
        }
        columns.push({ header, expr });
        if (parser.done) break;
        parser.expect(",");
    }
    if (columns.length === 0) {
        throw new Error("a TABLE needs at least one column");
    }

    /* --- FROM --- */
    let from = null;
    if (clauses.has("FROM")) {
        const fromParser = new ExprParser(clauses.get("FROM"), text);
        from = fromParser.parseExpression();
        if (!fromParser.done) {
            throw new Error(
                `unexpected "${fromParser.peek().text}" in the FROM clause`,
            );
        }
    }

    /* --- WHERE --- */
    let where = null;
    if (clauses.has("WHERE")) {
        const whereParser = new ExprParser(clauses.get("WHERE"), text);
        where = whereParser.parseExpression();
        if (!whereParser.done) {
            throw new Error(
                `unexpected "${whereParser.peek().text}" in the WHERE clause`,
            );
        }
    }

    /* --- SORT --- */
    const sort = [];
    if (clauses.has("SORT")) {
        const sortParser = new ExprParser(clauses.get("SORT"), text);
        while (!sortParser.done) {
            const expr = sortParser.parseExpression();
            let descending = false;
            if (sortParser.atWord("desc") || sortParser.atWord("descending")) {
                sortParser.next();
                descending = true;
            } else if (
                sortParser.atWord("asc") ||
                sortParser.atWord("ascending")
            ) {
                sortParser.next();
            }
            sort.push({ expr, descending });
            if (sortParser.done) break;
            sortParser.expect(",");
        }
    }

    /* --- LIMIT --- */
    let limit = null;
    if (clauses.has("LIMIT")) {
        const tokens = clauses.get("LIMIT");
        if (tokens.length !== 1 || tokens[0].kind !== "number") {
            throw new Error("LIMIT takes a single number");
        }
        limit = tokens[0].value;
    }

    return { columns, from, where, sort, limit };
}

/* ------------------------------------------------------------------------ */
/*  Values                                                                  */
/* ------------------------------------------------------------------------ */

/** A resolved link to a content note, which a cell renders as a wikilink. */
const makeLink = (display) => ({ __link: true, display: String(display) });

const isLink = (v) => Boolean(v) && typeof v === "object" && v.__link === true;

const isEmpty = (v) =>
    v == null || v === "" || (Array.isArray(v) && v.length === 0);

/** Dataview treats an absent, empty, zero, or false value as false. */
const truthy = (v) => {
    if (isEmpty(v)) return false;
    if (typeof v === "number") return v !== 0;
    return v !== false;
};

/**
 * The note's tags as Dataview exposes them: each frontmatter tag with a leading
 * `#`, and — for `file.tags` — every parent of a nested tag as well, so
 * `#gear/tools` also matches `#gear`.
 *
 * @param {ContentTableDoc} doc
 * @param {boolean} withParents
 * @returns {string[]}
 */
function tagsOf(doc, withParents) {
    const raw = doc.fm?.tags ?? doc.fm?.tag ?? [];
    const list = Array.isArray(raw) ? raw : [raw];
    const out = [];
    for (const entry of list) {
        if (entry == null || entry === "") continue;
        const tag = String(entry).startsWith("#") ? String(entry) : `#${entry}`;
        out.push(tag);
        if (!withParents) continue;
        const segments = tag.slice(1).split("/");
        for (let i = 1; i < segments.length; i++) {
            out.push(`#${segments.slice(0, i).join("/")}`);
        }
    }
    return [...new Set(out)];
}

/** The `file.*` fields a query may read, in Dataview's spelling. */
const FILE_FIELDS = {
    path: (doc) => doc.path ?? null,
    name: (doc) => (doc.path ?? "").split("/").pop().replace(/\.md$/i, ""),
    folder: (doc) => {
        const at = (doc.path ?? "").lastIndexOf("/");
        return at === -1 ? "" : doc.path.slice(0, at);
    },
    ext: (doc) => (doc.path ?? "").match(/\.([^./]+)$/)?.[1] ?? null,
    link: (doc) => makeLink(FILE_FIELDS.name(doc)),
    tags: (doc) => tagsOf(doc, true),
    etags: (doc) => tagsOf(doc, false),
};

/**
 * Resolve a dotted path against a content note. `file.*` names the note's place
 * in the tree; everything else reads frontmatter, preferring a literal dotted
 * key before walking the segments (the same precedence the pack compilers'
 * `getFrontmatter` uses) — so **any** frontmatter property is addressable,
 * however deeply nested.
 *
 * @param {ContentTableDoc} doc
 * @param {string} path
 * @returns {unknown} `null` when the note has no such field.
 * @throws {Error} On an unknown `file.*` field, which would otherwise read as a
 *   table that silently matches nothing.
 */
export function resolveField(doc, path) {
    if (path === "file") return null;
    if (path.startsWith("file.")) {
        const key = path.slice("file.".length);
        if (!(key in FILE_FIELDS)) {
            throw new Error(
                `unknown field "file.${key}" (known: ${Object.keys(FILE_FIELDS).join(", ")})`,
            );
        }
        return FILE_FIELDS[key](doc);
    }
    let current = doc.fm;
    if (current && typeof current === "object" && path in current) {
        return current[path] ?? null;
    }
    for (const segment of path.split(".")) {
        if (current == null || typeof current !== "object") return null;
        current = current[segment];
    }
    return current ?? null;
}

/** Render a value as the plain text a comparison or a cell works with. */
function asText(value) {
    if (value == null) return "";
    if (isLink(value)) return value.display;
    if (Array.isArray(value)) return value.map(asText).join(", ");
    return String(value);
}

/**
 * Dataview equality: same numbers, same strings (case-sensitively), same list
 * elements. Anything else — including a value compared against a missing field
 * — is unequal.
 */
function looseEquals(a, b) {
    if (a == null || b == null) return a == null && b == null;
    if (Array.isArray(a) && Array.isArray(b)) {
        return a.length === b.length && a.every((v, i) => looseEquals(v, b[i]));
    }
    if (typeof a === "number" || typeof b === "number") {
        const na = Number(a);
        const nb = Number(b);
        if (Number.isFinite(na) && Number.isFinite(nb)) return na === nb;
    }
    if (typeof a === "boolean" || typeof b === "boolean") return a === b;
    return asText(a) === asText(b);
}

/**
 * Order two values: numerically where both are numbers, else as text. Text
 * collates **case-insensitively** — "Horn, Hunting" belongs beside "Horn,
 * fanfare", not before it — with the cased text breaking an exact tie so the
 * order is still total. Note this is ordering only: `=` stays case-sensitive,
 * as Dataview's does.
 */
function compareValues(a, b) {
    const aEmpty = isEmpty(a);
    const bEmpty = isEmpty(b);
    if (aEmpty || bEmpty) {
        return (
            aEmpty === bEmpty ? 0
            : aEmpty ? 1
            : -1
        );
    }
    const na = Number(a);
    const nb = Number(b);
    if (
        typeof a !== "boolean" &&
        typeof b !== "boolean" &&
        Number.isFinite(na) &&
        Number.isFinite(nb)
    ) {
        return na - nb;
    }
    const sa = asText(a);
    const sb = asText(b);
    const la = sa.toLowerCase();
    const lb = sb.toLowerCase();
    if (la !== lb) return la < lb ? -1 : 1;
    return (
        sa < sb ? -1
        : sa > sb ? 1
        : 0
    );
}

/**
 * Dataview's `contains` family, which recurses into a list: `contains(list, v)`
 * holds when **any** element contains `v`, which is why
 * `contains(file.tags, "cooking")` matches the tag `#cooking`.
 *
 * @param {unknown} haystack
 * @param {unknown} needle
 * @param {"loose"|"insensitive"|"exact"} mode
 * @returns {boolean}
 */
function containsValue(haystack, needle, mode) {
    if (haystack == null) return false;
    if (Array.isArray(haystack)) {
        return haystack.some((v) =>
            mode === "exact" ?
                looseEquals(v, needle)
            :   containsValue(v, needle, mode),
        );
    }
    if (typeof haystack === "object" && !isLink(haystack)) {
        return Object.keys(haystack).some((k) =>
            mode === "insensitive" ?
                k.toLowerCase() === asText(needle).toLowerCase()
            :   k === asText(needle),
        );
    }
    const hay = asText(haystack);
    const pin = asText(needle);
    if (mode === "exact") return hay === pin;
    if (mode === "insensitive") {
        return hay.toLowerCase().includes(pin.toLowerCase());
    }
    return hay.includes(pin);
}

/** Compile a Dataview regex argument, anchored for `regexmatch`. */
function toRegExp(pattern, anchored) {
    const body = asText(pattern);
    return new RegExp(anchored ? `^(?:${body})$` : body);
}

/** The implementations behind {@link FUNCTIONS}. */
const CALLS = {
    link: (args) =>
        makeLink(args.length > 1 && !isEmpty(args[1]) ? asText(args[1]) : ""),
    contains: ([a, b]) => containsValue(a, b, "loose"),
    icontains: ([a, b]) => containsValue(a, b, "insensitive"),
    econtains: ([a, b]) => containsValue(a, b, "exact"),
    startswith: ([a, b]) => asText(a).startsWith(asText(b)),
    endswith: ([a, b]) => asText(a).endsWith(asText(b)),
    lower: ([a]) => (a == null ? null : asText(a).toLowerCase()),
    upper: ([a]) => (a == null ? null : asText(a).toUpperCase()),
    length: ([a]) =>
        a == null ? 0
        : Array.isArray(a) ? a.length
        : typeof a === "object" ? Object.keys(a).length
        : asText(a).length,
    default: ([a, b]) => (isEmpty(a) ? b : a),
    number: ([a]) => {
        const n = Number(asText(a));
        return Number.isFinite(n) ? n : null;
    },
    string: ([a]) => asText(a),
    join: ([a, sep]) =>
        (Array.isArray(a) ? a : [a])
            .filter((v) => !isEmpty(v))
            .map(asText)
            .join(sep === undefined ? ", " : asText(sep)),
    regexmatch: ([pattern, value]) =>
        toRegExp(pattern, true).test(asText(value)),
    regextest: ([pattern, value]) =>
        toRegExp(pattern, false).test(asText(value)),
};

/**
 * Evaluate one parsed expression against a note.
 *
 * @param {object} node - From {@link parseDataviewQuery}.
 * @param {ContentTableDoc} doc - The row being rendered.
 * @param {ContentTableDoc} [self] - The note *containing* the query, which is
 *   what `this` reads; absent means every `this.…` resolves to nothing.
 * @returns {unknown}
 */
export function evaluate(node, doc, self) {
    switch (node.kind) {
        case "literal":
            return node.value;
        case "list":
            return node.items.map((item) => evaluate(item, doc, self));
        case "field":
            return resolveField(doc, node.path);
        case "self":
            return self && node.path ? resolveField(self, node.path) : null;
        case "index": {
            const target = evaluate(node.target, doc, self);
            const key = evaluate(node.key, doc, self);
            if (target == null) return null;
            if (Array.isArray(target)) {
                const at = Number(key);
                return Number.isInteger(at) ? (target[at] ?? null) : null;
            }
            if (typeof target === "object") {
                return target[asText(key)] ?? null;
            }
            return null;
        }
        case "logical": {
            const left = truthy(evaluate(node.left, doc, self));
            if (node.op === "and") {
                return left && truthy(evaluate(node.right, doc, self));
            }
            return left || truthy(evaluate(node.right, doc, self));
        }
        case "not":
            return !truthy(evaluate(node.operand, doc, self));
        case "negate": {
            const n = Number(asText(evaluate(node.operand, doc, self)));
            return Number.isFinite(n) ? -n : null;
        }
        case "compare": {
            const left = evaluate(node.left, doc, self);
            const right = evaluate(node.right, doc, self);
            if (node.op === "=") return looseEquals(left, right);
            if (node.op === "!=") return !looseEquals(left, right);
            if (left == null || right == null) return false;
            const order = compareValues(left, right);
            return (
                node.op === ">" ? order > 0
                : node.op === ">=" ? order >= 0
                : node.op === "<" ? order < 0
                : order <= 0
            );
        }
        case "call": {
            const args = node.args.map((arg) => evaluate(arg, doc, self));
            if (node.name === "link") {
                // The display text defaults to the note's own file name.
                const display =
                    node.args.length > 1 && !isEmpty(args[1]) ?
                        asText(args[1])
                    :   FILE_FIELDS.name(doc);
                return makeLink(display);
            }
            return CALLS[node.name](args);
        }
        default:
            throw new Error(`cannot evaluate a ${node.kind} expression`);
    }
}

/* ------------------------------------------------------------------------ */
/*  FROM sources                                                            */
/* ------------------------------------------------------------------------ */

/**
 * Does a note satisfy a `FROM` source? A quoted string names a folder (or a
 * single note) and includes everything below it; a `#tag` matches the note's
 * tags. `and`, `or`, `not`/`!` and parentheses combine them.
 *
 * @param {object} node
 * @param {ContentTableDoc} doc
 * @returns {boolean}
 */
function matchesSource(node, doc) {
    switch (node.kind) {
        case "logical": {
            const left = matchesSource(node.left, doc);
            return node.op === "and" ?
                    left && matchesSource(node.right, doc)
                :   left || matchesSource(node.right, doc);
        }
        case "not":
            return !matchesSource(node.operand, doc);
        case "literal": {
            const value = String(node.value ?? "");
            if (value.startsWith("#")) {
                return tagsOf(doc, true).includes(value);
            }
            const folder = value.replace(/\/+$/, "");
            const path = doc.path ?? "";
            if (folder === "" || folder === "/") return true;
            return (
                path === folder ||
                path === `${folder}.md` ||
                path.startsWith(`${folder}/`)
            );
        }
        default:
            throw new Error(
                "a FROM clause takes folder strings and #tags, combined with and/or/not",
            );
    }
}

/* ------------------------------------------------------------------------ */
/*  Selection                                                               */
/* ------------------------------------------------------------------------ */

/**
 * The notes a query selects, in the order its `SORT` keys give. With no `SORT`
 * the notes keep content-path order, and the note path (then its id) breaks any
 * remaining tie, so the emitted table is byte-stable across builds regardless
 * of directory-walk order.
 *
 * @param {object} spec - From {@link parseDataviewQuery}.
 * @param {Array<ContentTableDoc>} docs
 * @param {ContentTableDoc} [self] - The note containing the query (`this`).
 * @returns {Array<ContentTableDoc>} The matching notes, sorted and limited.
 */
export function selectRows(spec, docs, self) {
    const matched = docs.filter((doc) => {
        if (spec.from && !matchesSource(spec.from, doc)) return false;
        return spec.where === null || truthy(evaluate(spec.where, doc, self));
    });
    matched.sort((a, b) => {
        for (const { expr, descending } of spec.sort) {
            const order = compareValues(
                evaluate(expr, a, self),
                evaluate(expr, b, self),
            );
            if (order !== 0) return descending ? -order : order;
        }
        const byPath = compareValues(a.path, b.path);
        return byPath !== 0 ? byPath : compareValues(a.fm?.id, b.fm?.id);
    });
    return spec.limit === null ? matched : matched.slice(0, spec.limit);
}

/* ------------------------------------------------------------------------ */
/*  Rendering                                                               */
/* ------------------------------------------------------------------------ */

/** Escape the characters that would break out of a markdown table cell. */
const escapeCell = (text) =>
    text.replace(/\|/g, "\\|").replace(/[\r\n]+/g, " ");

/**
 * Render one evaluated value as table text.
 *
 * @throws {Error} When the value is an object — almost always a truncated path
 *   (`sohl.protection` for `sohl.protection.blunt`), which would otherwise ship
 *   as `[object Object]`.
 */
function formatValue(value, header) {
    if (isEmpty(value)) return EMPTY_CELL;
    if (Array.isArray(value)) {
        return escapeCell(value.map(asText).join(", "));
    }
    if (typeof value === "object" && !isLink(value)) {
        throw new Error(`column "${header}" resolves to an object`);
    }
    if (typeof value === "boolean") return value ? "yes" : "no";
    return escapeCell(asText(value));
}

/**
 * Build the markdown table for one query.
 *
 * A `link(…)` cell — and the implicit `File` column — is emitted as a wikilink
 * to the row's own note, which the caller's wikilink pass resolves; a note the
 * caller reports as unlinkable (no shortcode, or a content directory that
 * compiles into no pack) degrades to plain text. A column is right-aligned when
 * every value it shows is numeric.
 *
 * @param {object} spec - From {@link parseDataviewQuery}.
 * @param {Array<ContentTableDoc>} rows - From {@link selectRows}.
 * @param {(doc: ContentTableDoc) => boolean} linkable - Can this note be linked to?
 * @param {ContentTableDoc} [self] - The note containing the query (`this`).
 * @returns {string} The markdown table (no trailing newline).
 */
export function renderContentTable(spec, rows, linkable, self) {
    const cells = rows.map((doc) =>
        spec.columns.map((column) => {
            const value = evaluate(column.expr, doc, self);
            if (!isLink(value)) return formatValue(value, column.header);
            const display =
                value.display || asText(FILE_FIELDS.name(doc)) || EMPTY_CELL;
            const text = escapeCell(display);
            if (!linkable(doc)) return text;
            // A wikilink's own separator is a literal `|`, written `\|` inside a
            // table cell; the resolvers unescape it before splitting, so the
            // display text itself must not carry one.
            const label = text.replace(/\\?\|/g, "/");
            return `[[${doc.fm.type}/${doc.fm.shortcode}\\|${label}]]`;
        }),
    );

    const align = spec.columns.map((_column, i) => {
        const shown = cells
            .map((row) => row[i])
            .filter((c) => c !== EMPTY_CELL);
        const numeric =
            shown.length > 0 &&
            shown.every((c) => Number.isFinite(Number(c)) && c.trim() !== "");
        return numeric ? "---:" : "---";
    });

    const line = (values) => `| ${values.join(" | ")} |`;
    return [
        line(spec.columns.map((c) => escapeCell(c.header))),
        line(align),
        ...cells.map(line),
    ].join("\n");
}

/* ------------------------------------------------------------------------ */
/*  Expansion                                                               */
/* ------------------------------------------------------------------------ */

/**
 * Expand every fenced `dataview` block in a markdown body.
 *
 * A block that cannot be honoured — malformed or unsupported — is left in the
 * body verbatim and reported in `errors`, so the failure is visible in the
 * output as well as on the console. Every other code fence, and every code
 * span, is left alone (that is how the syntax is documented).
 *
 * A query that matches **no** note is not an error: it renders as an empty
 * table (headers only), which is what the author already sees in Obsidian, and
 * a category with no content yet is a normal state of the corpus rather than a
 * broken build.
 *
 * @param {string} markdown - The note body, frontmatter already stripped.
 * @param {object} ctx
 * @param {Array<ContentTableDoc>} ctx.docs - The searchable universe: every
 *   content note the caller considers in scope.
 * @param {(doc: ContentTableDoc) => boolean} [ctx.linkable] - Whether a note can
 *   be linked to from a cell; defaults to never.
 * @param {string} [ctx.source] - The note being expanded, for error reports.
 * @param {ContentTableDoc} [ctx.self] - The note being expanded, as a searchable
 *   doc: what a query's `this` reads.
 * @returns {{markdown: string, errors: Array<{source: string, directive: string,
 *   reason: string}>}}
 */
export function expandContentTables(
    markdown,
    { docs = [], linkable = () => false, source = "", self = undefined } = {},
) {
    const errors = [];
    const lines = String(markdown ?? "").split("\n");
    const out = [];
    for (let i = 0; i < lines.length; i++) {
        const opening = FENCE_LINE.exec(lines[i]);
        if (!opening) {
            out.push(lines[i]);
            continue;
        }
        const [, indent, marker, info] = opening;
        // Find this fence's closing line: the same marker character, at least
        // as long, with nothing after it.
        let close = i + 1;
        const closer = new RegExp(
            `^[ \\t]*${marker[0]}{${marker.length},}[ \\t]*$`,
        );
        while (close < lines.length && !closer.test(lines[close])) close++;
        const isQuery = /^dataview\b/i.test(info.trim());
        const block = lines.slice(i, Math.min(close + 1, lines.length));
        if (!isQuery || close >= lines.length) {
            out.push(...block);
            i = close;
            continue;
        }
        const query = lines.slice(i + 1, close).join("\n");
        let table;
        try {
            const spec = parseDataviewQuery(query);
            const rows = selectRows(spec, docs, self);
            table = renderContentTable(spec, rows, linkable, self);
        } catch (err) {
            errors.push({
                source,
                directive: block.join("\n"),
                reason: err.message,
            });
            out.push(...block);
            i = close;
            continue;
        }
        // A markdown table must be its own block: keep one blank line on each
        // side of it, without inventing a leading or trailing one.
        if (out.length > 0 && out[out.length - 1].trim() !== "") out.push("");
        out.push(...table.split("\n").map((row) => `${indent}${row}`));
        if (close + 1 < lines.length && lines[close + 1].trim() !== "") {
            out.push("");
        }
        i = close;
    }
    return { markdown: out.join("\n"), errors };
}
