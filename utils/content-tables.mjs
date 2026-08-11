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
 * Generated content tables — the `(@Table …)` directive.
 *
 * A catalog table (every cloth armour, every animal's abilities) is data that
 * already lives in the frontmatter of the notes it describes. Authoring such a
 * table by hand duplicates that data and guarantees drift, so a content body
 * instead declares what it wants tabulated:
 *
 *   `(@Table search=[type:armorgear, sohl.material:Cloth]
 *            columns=[Name:name.full, Weight:sohl.weight, B:sohl.protection.blunt])`
 *
 * At build time the directive is replaced with a markdown table whose rows are
 * the matching notes. Both content builds run it — the pack compilers (Foundry
 * journals/items/actors) and the knowledgebase — so one authored directive
 * yields the same table in Foundry and on the KB.
 *
 * The emitted table is **markdown**, not HTML, and it is expanded *before*
 * wikilink resolution: a cell may therefore carry `[[type/shortcode|Text]]`,
 * which each build then resolves into its own flavour of link (a Foundry
 * `@UUID` enricher, or a KB href). Linking the row's own document is the
 * default for the first column.
 *
 * Plain ESM with no Foundry, no filesystem, and no dependencies, so it is
 * unit-testable — see `tests/build/content-tables.test.ts`.
 */

/**
 * One content note as a content build hands it to the expander: its parsed
 * frontmatter plus where it sits in the tree.
 *
 * @typedef {{fm: Record<string, any>, path?: string, tld?: string,
 *   folder?: string}} ContentTableDoc
 */

/**
 * A whole directive, capturing its option text. The body cannot contain a
 * closing parenthesis (that is what ends it); it may span lines.
 */
const DIRECTIVE_RE = /\(@Table\b([^)]*)\)/g;

/** `key=[a, b]` or `key=value` inside a directive body. */
const OPTION_RE = /([A-Za-z][\w-]*)\s*=\s*(\[[^\]]*\]|\S+)/g;

/** Code fences and code spans, which the expander must not look inside. */
const CODE_RE = /```[\s\S]*?```|~~~[\s\S]*?~~~|``[^`]*``|`[^`]*`/g;

/** What a cell shows when its path resolves to nothing. */
const EMPTY_CELL = "—";

const KNOWN_OPTIONS = new Set(["search", "columns", "sort", "link"]);

/**
 * Split one `key:value` / `key=value` entry at whichever separator comes first.
 * A frontmatter path never contains either character, and a content path never
 * contains a colon, so the first occurrence is always the separator.
 */
function splitEntry(entry) {
    const at = entry.search(/[:=]/);
    return at === -1 ?
            { key: "", value: "" }
        :   {
                key: entry.slice(0, at).trim(),
                value: entry.slice(at + 1).trim(),
            };
}

/** Splits `[a, b, c]` (or a bare value) into trimmed, non-empty entries. */
function splitList(raw) {
    const inner =
        raw.startsWith("[") && raw.endsWith("]") ? raw.slice(1, -1) : raw;
    return inner
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
}

/**
 * Parse one `(@Table …)` directive into its specification.
 *
 * @param {string} raw - The directive text, parentheses included.
 * @returns {{search: Array<{path: string, negate: boolean, values: string[]}>,
 *   columns: Array<{header: string, path: string}>,
 *   sort: Array<{path: string, descending: boolean}>,
 *   link: string|null}}
 * @throws {Error} When the directive is malformed — the message names the
 *   offending option, column, or search term.
 */
export function parseTableDirective(raw) {
    const body = raw.replace(/^\(@Table\b/, "").replace(/\)$/, "");
    const options = new Map();
    for (const [, key, value] of body.matchAll(OPTION_RE)) {
        if (!KNOWN_OPTIONS.has(key)) {
            throw new Error(
                `unknown option "${key}" (expected search, columns, sort, or link)`,
            );
        }
        options.set(key, value);
    }

    const columns = splitList(options.get("columns") ?? "").map((entry) => {
        const { key: header, value: path } = splitEntry(entry);
        if (!header || !path) {
            throw new Error(
                `column "${entry}" must be written Header:frontmatter.path`,
            );
        }
        return { header, path };
    });
    if (columns.length === 0) {
        throw new Error(
            `a table requires a "columns" list, e.g. columns=[Name:name.full]`,
        );
    }

    const searchRaw = splitList(options.get("search") ?? "");
    if (searchRaw.length === 0) {
        throw new Error(
            `a table requires a "search" list, e.g. search=[type:armorgear]`,
        );
    }
    const search = searchRaw.map((entry) => {
        const { key: path, value } = splitEntry(entry);
        let rest = value;
        if (!path || !rest) {
            throw new Error(
                `search term "${entry}" must be written frontmatter.path:value`,
            );
        }
        const negate = rest.startsWith("!");
        if (negate) rest = rest.slice(1).trim();
        const values = rest
            .split("|")
            .map((v) => v.trim().toLowerCase())
            .filter(Boolean);
        if (values.length === 0) {
            throw new Error(
                `search term "${entry}" must be written frontmatter.path:value`,
            );
        }
        return { path, negate, values };
    });

    const sortRaw = splitList(options.get("sort") ?? "");
    const sort = (sortRaw.length ? sortRaw : [columns[0].path]).map((entry) => {
        const descending = entry.startsWith("-");
        return {
            path: (descending ? entry.slice(1) : entry).trim(),
            descending,
        };
    });

    let link = columns[0].header;
    if (options.has("link")) {
        const [wanted = ""] = splitList(options.get("link"));
        if (wanted.toLowerCase() === "none") {
            link = null;
        } else {
            const hit = columns.find(
                (c) => c.header.toLowerCase() === wanted.toLowerCase(),
            );
            if (!hit) {
                throw new Error(
                    `link="${wanted}" names no column of this table`,
                );
            }
            link = hit.header;
        }
    }

    return { search, columns, sort, link };
}

/**
 * Resolve a dotted path against a content note. `path`, `tld`, and `folder` are
 * synthetic paths naming the note's place in the content tree — `path` being its
 * location below `assets/content/` (`Creatures/Animal/Aurochs.md`), which a
 * search term globs. Everything else reads the note's frontmatter, preferring a
 * literal dotted key before walking the segments (the same precedence the pack
 * compilers' `getFrontmatter` uses).
 *
 * @param {ContentTableDoc} doc
 * @param {string} path
 * @returns {unknown}
 */
export function resolveDocPath(doc, path) {
    if (path === "path") return doc.path;
    if (path === "tld") return doc.tld;
    if (path === "folder") return doc.folder;
    let current = doc.fm;
    if (current && typeof current === "object" && path in current) {
        return current[path];
    }
    for (const segment of path.split(".")) {
        if (current == null || typeof current !== "object") return undefined;
        current = current[segment];
    }
    return current;
}

const norm = (v) => String(v).trim().toLowerCase();

const isEmpty = (v) =>
    v == null || v === "" || (Array.isArray(v) && v.length === 0);

/**
 * A search value is a glob when it carries a wildcard — or ends in `/`, the
 * shorthand for "this directory and everything under it".
 */
const isGlob = (value) => /[*?]/.test(value) || value.endsWith("/");

const globCache = new Map();

/**
 * Compile a glob into an anchored regular expression.
 *
 * `*` and `?` stop at a `/`, so `Armor/*.md` selects the notes filed directly
 * in `Armor/`; `**` crosses directories, so `Armor/**` selects everything below
 * it at any depth. A trailing `/` is shorthand for `/**` ("this directory and
 * everything under it"), and `**​/` also matches zero directories, so
 * `**​/Aurochs.md` finds the note wherever it is filed.
 */
function globToRegExp(glob) {
    const cached = globCache.get(glob);
    if (cached) return cached;
    const pattern = glob.endsWith("/") ? `${glob}**` : glob;
    let out = "";
    for (let i = 0; i < pattern.length; i++) {
        const ch = pattern[i];
        if (ch === "*" && pattern[i + 1] === "*") {
            if (pattern[i + 2] === "/") {
                out += "(?:[\\s\\S]*\\/)?";
                i += 2;
            } else {
                out += "[\\s\\S]*";
                i += 1;
            }
        } else if (ch === "*") {
            out += "[^/]*";
        } else if (ch === "?") {
            out += "[^/]";
        } else {
            out += ch.replace(/[.+^${}()|[\]\\/]/g, "\\$&");
        }
    }
    const re = new RegExp(`^${out}$`);
    globCache.set(glob, re);
    return re;
}

/** Does a single resolved value satisfy any of a term's values? */
const valueMatches = (value, values) =>
    values.some((v) =>
        isGlob(v) ? globToRegExp(v).test(norm(value)) : v === norm(value),
    );

/** Does one note satisfy one search term? */
function matchesTerm(doc, { path, negate, values }) {
    const value = resolveDocPath(doc, path);
    let hit;
    if (values.length === 1 && values[0] === "*") {
        // Bare `*` is presence, not a glob: it must hold for a path-shaped
        // value too, which `[^/]*` would reject.
        hit = !isEmpty(value);
    } else if (isEmpty(value)) {
        hit = false;
    } else if (Array.isArray(value)) {
        hit = value.some((v) => valueMatches(v, values));
    } else {
        hit = valueMatches(value, values);
    }
    return negate ? !hit : hit;
}

/** Order two raw values: numbers numerically, everything else as text; empties last. */
function compareValues(a, b) {
    const aEmpty = isEmpty(a);
    const bEmpty = isEmpty(b);
    if (aEmpty || bEmpty)
        return (
            aEmpty === bEmpty ? 0
            : aEmpty ? 1
            : -1
        );
    const na = Number(a);
    const nb = Number(b);
    if (Number.isFinite(na) && Number.isFinite(nb)) return na - nb;
    const sa = norm(a);
    const sb = norm(b);
    return (
        sa < sb ? -1
        : sa > sb ? 1
        : 0
    );
}

/**
 * The notes a table's search selects, in the order its `sort` keys give. The
 * note id breaks any remaining tie so the emitted table is byte-stable across
 * builds regardless of directory-walk order.
 *
 * @param {object} spec - From {@link parseTableDirective}.
 * @param {Array<ContentTableDoc>} docs
 * @returns {Array<object>} The matching notes, sorted.
 */
export function selectDocs(spec, docs) {
    const matched = docs.filter((doc) =>
        spec.search.every((term) => matchesTerm(doc, term)),
    );
    return matched.sort((a, b) => {
        for (const { path, descending } of spec.sort) {
            const order = compareValues(
                resolveDocPath(a, path),
                resolveDocPath(b, path),
            );
            if (order !== 0) return descending ? -order : order;
        }
        return compareValues(a.fm?.id, b.fm?.id);
    });
}

/** Escape the characters that would break out of a markdown table cell. */
const escapeCell = (text) =>
    text.replace(/\|/g, "\\|").replace(/[\r\n]+/g, " ");

/**
 * Render one cell's value as table text.
 *
 * @throws {Error} When the path resolves to an object — almost always a
 *   truncated path (`sohl.protection` for `sohl.protection.blunt`), which would
 *   otherwise ship as `[object Object]`.
 */
function formatValue(value, column) {
    if (isEmpty(value)) return EMPTY_CELL;
    if (Array.isArray(value)) {
        return escapeCell(value.map((v) => String(v)).join(", "));
    }
    if (typeof value === "object") {
        throw new Error(
            `column "${column.header}" path "${column.path}" resolves to an object`,
        );
    }
    if (typeof value === "boolean") return value ? "yes" : "no";
    return escapeCell(String(value));
}

/**
 * Build the markdown table for one directive.
 *
 * The `link` column is emitted as a wikilink to the row's own note, which the
 * caller's wikilink pass resolves; a note the caller reports as unlinkable
 * (no shortcode, or a content directory that compiles into no pack) degrades to
 * plain text. A column is right-aligned when every value it shows is numeric.
 *
 * @param {object} spec - From {@link parseTableDirective}.
 * @param {Array<object>} rows - From {@link selectDocs}.
 * @param {(doc: ContentTableDoc) => boolean} linkable - Can this note be linked to?
 * @returns {string} The markdown table (no trailing newline).
 */
export function renderContentTable(spec, rows, linkable) {
    const cells = rows.map((doc) =>
        spec.columns.map((column) => {
            const text = formatValue(resolveDocPath(doc, column.path), column);
            if (
                column.header !== spec.link ||
                text === EMPTY_CELL ||
                !linkable(doc)
            ) {
                return text;
            }
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

/** Stash code fences and spans behind NUL sentinels, which markdown never contains. */
function protectCode(body, transform) {
    const stash = [];
    const masked = body.replace(
        CODE_RE,
        (m) => `\u0000${stash.push(m) - 1}\u0000`,
    );
    return transform(masked).replace(
        /\u0000(\d+)\u0000/g,
        (_m, i) => stash[Number(i)],
    );
}

/** Blank-line padding so an emitted table is its own markdown block. */
function padding(before, after) {
    const lead =
        !before || /\n[ \t]*\n[ \t]*$/.test(before) ? ""
        : /\n[ \t]*$/.test(before) ? "\n"
        : "\n\n";
    const tail =
        !after || /^[ \t]*\n[ \t]*\n/.test(after) ? ""
        : /^[ \t]*\n/.test(after) ? "\n"
        : "\n\n";
    return [lead, tail];
}

/**
 * Expand every `(@Table …)` directive in a markdown body.
 *
 * A directive that cannot be honoured — malformed, or matching no note — is
 * left in the body verbatim and reported in `errors`, so the failure is visible
 * in the output as well as on the console. Directives inside code fences and
 * code spans are left alone (that is how the syntax is documented).
 *
 * @param {string} markdown - The note body, frontmatter already stripped.
 * @param {object} ctx
 * @param {Array<ContentTableDoc>} ctx.docs - The searchable universe: every
 *   content note the caller considers in scope.
 * @param {(doc: ContentTableDoc) => boolean} [ctx.linkable] - Whether a note can
 *   be linked to from a cell; defaults to never.
 * @param {string} [ctx.source] - The note being expanded, for error reports.
 * @returns {{markdown: string, errors: Array<{source: string, directive: string,
 *   reason: string}>}}
 */
export function expandContentTables(
    markdown,
    { docs = [], linkable = () => false, source = "" } = {},
) {
    const errors = [];
    const out = protectCode(String(markdown ?? ""), (masked) =>
        masked.replace(DIRECTIVE_RE, (match, _body, offset, whole) => {
            let table;
            try {
                const spec = parseTableDirective(match);
                const rows = selectDocs(spec, docs);
                if (rows.length === 0) {
                    throw new Error(
                        `search [${spec.search
                            .map(
                                (t) =>
                                    `${t.path}:${t.negate ? "!" : ""}${t.values.join("|")}`,
                            )
                            .join(", ")}] matched no content notes`,
                    );
                }
                table = renderContentTable(spec, rows, linkable);
            } catch (err) {
                errors.push({ source, directive: match, reason: err.message });
                return match;
            }
            const [lead, tail] = padding(
                whole.slice(0, offset),
                whole.slice(offset + match.length),
            );
            return `${lead}${table}${tail}`;
        }),
    );
    return { markdown: out, errors };
}
