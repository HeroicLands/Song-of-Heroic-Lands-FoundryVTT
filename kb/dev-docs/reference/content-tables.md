# Generated Content Tables

See also: [Shortcode Integrity](./shortcode-integrity.md), [System Development](../contributing/system-development.md)

A catalog table — every cloth armour, every animal's attributes, every trauma of a
category — is data that already lives in the frontmatter of the notes it describes.
Authoring such a table by hand duplicates that data and guarantees drift: the item's
weight changes, the table does not, and nothing in the build notices.

A content body therefore declares **what it wants tabulated** and the build fills in
the rows:

```text
(@Table search=[type:armorgear, sohl.material:Cloth]
        columns=[Name:name.full, Weight:sohl.weight, B:sohl.protection.blunt])
```

One authored directive produces the table in **both** content builds — the Foundry
compendium packs and the knowledgebase — because both run the same expander
(`utils/content-tables.mjs`).

## Syntax

A directive is `(@Table …)` with `key=value` options; it may span several lines. Its
text may not contain a closing parenthesis (that is what ends it). Directives inside
code fences and code spans are left alone, which is how this page shows them.

| Option    | Required | Meaning                                                           |
| --------- | -------- | ----------------------------------------------------------------- |
| `search`  | yes      | The notes to tabulate. Terms are **AND**-ed.                      |
| `columns` | yes      | `Header:frontmatter.path`, in the order the columns appear.       |
| `sort`    | no       | Sort keys; `-path` sorts descending. Defaults to the first column. |
| `link`    | no       | Which column links to the row's own note. Defaults to the first column; `link=none` turns linking off. |

`:` and `=` are interchangeable as the separator inside `search` and `columns`
(`path:Creatures/**` and `path=Creatures/**` are the same term).

## Search terms

Each term is `frontmatter.path:value`, and **every** term must hold for a note to
appear. The path is a dotted frontmatter path (`sohl.protection.blunt`), plus three
synthetic keys describing where the note is filed:

| Key      | Value                                                                  |
| -------- | ---------------------------------------------------------------------- |
| `path`   | The note's location below `assets/content/` — `Creatures/Animal/Aurochs.md` |
| `tld`    | Its top-level content directory — `Creatures`                          |
| `folder` | Its immediate folder — `Animal`                                        |

Values match case-insensitively, and a term matches an array-valued field when **any**
element matches (so `tags:animal` selects every note tagged `animal`). The forms are:

| Form              | Matches                                                    |
| ----------------- | ---------------------------------------------------------- |
| `type:armorgear`  | exactly that value                                         |
| `sohl.material:Cloth\|Mail` | any of the `\|`-separated values                  |
| `sohl.material:!Cloth` | anything **but** that value (the `!` may precede a list) |
| `shortcode:*`     | the field is present and non-empty                         |
| `shortcode:!*`    | the field is absent or empty                               |
| `path:Creatures/Animal/*.md` | a **glob** (any value containing `*` or `?`)    |

### Globs

Any search value carrying `*` or `?` is a glob, which is how a `path:` term selects a
part of the content tree:

| Pattern                      | Selects                                                    |
| ---------------------------- | ---------------------------------------------------------- |
| `Creatures/Animal/*.md`      | the notes filed **directly** in that directory — `*` does not cross a `/` |
| `Creatures/**`               | everything below `Creatures/`, at any depth                |
| `Creatures/Animal/`          | the same, in shorthand — a trailing `/` means `/**`        |
| `**/Aurochs.md`              | that note wherever it is filed (`**/` also matches zero directories) |

A bare `*` is the presence test above, not a glob, so `shortcode:*` holds for a
path-shaped value too.

## Columns and cells

A column is `Header:frontmatter.path`. Values render as follows:

- absent or empty → an em dash (`—`);
- an array → its elements, comma-separated;
- a boolean → `yes` / `no`;
- an **object** → a build error. A path resolving to an object is almost always
  truncated (`sohl.protection` for `sohl.protection.blunt`), and would otherwise ship
  as `[object Object]`.

A column whose every shown value is numeric is right-aligned; `|` and newlines in a
value are escaped so a cell cannot break out of the table.

Rows are sorted by the `sort` keys — numerically where both values are numbers,
otherwise as text, with empty values last — and ties break on the note id, so a table
emits identically on every build.

### Linking a row to its note

The `link` column is emitted as a `[[type/shortcode|Name]]` wikilink to the row's own
note, which each build then resolves the way it resolves any other wikilink: into a `@UUID` enricher for
Foundry, and into a site href for the knowledgebase. The same directive therefore
yields a clickable catalog in both places.

A note the build cannot address that way — one carrying no `type` or no `shortcode` —
renders as plain text rather than shipping a literal `[[…]]` into a journal.

## Scope and failure

A table searches only notes of the **source note's own `package`**, so a SoHL page
never tabulates setting-package content, and vice versa.

A directive that cannot be honoured — malformed, naming an unknown option, or matching
no note at all — is a **build error**, and the directive is left in the body verbatim
so the failure is visible in the output as well as on the console. In the pack build
the note fails to compile; in the knowledgebase build the run exits non-zero. A table
never silently ships empty.

## Where it runs

Expansion happens **before** wikilink resolution, in all four content compilers:
`utils/packs/journals.mjs`, `utils/packs/items.mjs`, `utils/packs/actors.mjs`, and
`utils/build-kb-content.mjs`. That ordering is what lets a generated cell contain a
wikilink. The expander itself is dependency-free ESM and is unit-tested in
`tests/build/content-tables.test.ts`.
