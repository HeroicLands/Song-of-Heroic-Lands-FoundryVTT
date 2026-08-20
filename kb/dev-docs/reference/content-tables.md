# Generated Content Tables

See also: [Linking Between Content Notes](./content-links.md), [Shortcode Integrity](./shortcode-integrity.md), [System Development](../contributing/system-development.md)

A catalog table — every cloth armour, every animal's attributes, every trauma of a
category — is data that already lives in the frontmatter of the notes it describes.
Authoring such a table by hand duplicates that data and guarantees drift: the item's
weight changes, the table does not, and nothing in the build notices.

A content body therefore declares **what it wants tabulated** and the build fills in
the rows. The declaration is an ordinary [Obsidian
Dataview](https://blacksmithgu.github.io/obsidian-dataview/) `TABLE` query, in a
fenced `dataview` block:

````text
```dataview
TABLE WITHOUT ID
  link(file.path, name.full) AS "Name",
  sohl.weight AS "Weight",
  sohl.protection.blunt AS "B"
WHERE type = "armorgear" and sohl.material = "Cloth"
SORT name.full ASC
```
````

Content is authored in **`assets/content/`**, which is opened as an Obsidian vault so
the Dataview plugin renders that block live. The build renders the same query against
the same frontmatter, so one authored query yields the same table in three places: in
Obsidian while writing, in the Foundry compendium packs, and on the knowledgebase.
What the author sees is what ships.

Both content builds run the same expander (`@heroiclands/content-build/engine/content-tables`).

## Supported grammar

Only the subset below is implemented. Anything outside it is a **build error** that
names the offending clause — never a silently wrong table.

```text
TABLE [WITHOUT ID] <column> [, <column>]*
[FROM <source>]
[WHERE <expression>]
[SORT <key> [ASC|DESC] [, …]]
[LIMIT <n>]
```

Keywords are case-insensitive (`table`/`TABLE`, `as`/`AS`, `and`/`AND`). Clauses must
appear in the order above, once each — which is what lets a **frontmatter field share
a clause keyword's name**, as the traits table's `SORT sort ASC` does.

| Clause  | Meaning                                                                    |
| ------- | -------------------------------------------------------------------------- |
| `TABLE` | The columns. `WITHOUT ID` drops Dataview's implicit leading `File` column. |
| `FROM`  | Restrict to a folder (`FROM "Creatures"`) or a tag (`FROM #animal`).       |
| `WHERE` | Keep the notes the expression holds for.                                   |
| `SORT`  | Sort keys, each optionally `ASC` (default) or `DESC`.                      |
| `LIMIT` | Keep only the first _n_ rows, after sorting.                               |

`LIST`, `TASK`, and `CALENDAR` queries, and the `GROUP BY` and `FLATTEN` commands,
are refused by name.

## Columns

A column is an expression, optionally named with `AS "Header"`; without `AS`, the
expression's own text is the header. Values render as follows:

- absent or empty → an em dash (`—`);
- an array → its elements, comma-separated;
- a boolean → `yes` / `no`;
- an **object** → a build error. An expression resolving to an object is almost always
  a truncated path (`sohl.protection` for `sohl.protection.blunt`), and would otherwise
  ship as `[object Object]`.

A column whose every shown value is numeric is right-aligned; `|` and newlines in a
value are escaped so a cell cannot break out of the table.

### Linking a row to its note

`link(file.path, name.full)` is emitted as a `[[type/shortcode|Name]]` wikilink to the
row's own note, which each build then resolves the way it resolves any other wikilink:
into a `@UUID` enricher for Foundry, and into a site href for the knowledgebase. The
same query therefore yields a clickable catalog in all three places. The implicit
`File` column (a `TABLE` written without `WITHOUT ID`) links the same way.

A note the build cannot address that way — one carrying no `type` or no `shortcode` —
renders as plain text rather than shipping a literal `[[…]]` into a journal.

## Fields

**Any frontmatter property is addressable**, in either the columns or the `WHERE`
clause, as a dotted path (`sohl.protection.blunt`) or a bracketed key
(`sohl["subType"]`, needed when a key is not a bare word). A path that names nothing
is `null`, not an error.

`file.*` names the note's place in the tree instead:

| Field         | Value                                                                |
| ------------- | -------------------------------------------------------------------- |
| `file.path`   | Location below `assets/content/` — `Creatures/Animal/Aurochs.md`     |
| `file.folder` | Its directory — `Creatures/Animal`                                   |
| `file.name`   | Its filename without the extension — `Aurochs`                       |
| `file.link`   | A link to the note itself                                            |
| `file.tags`   | Its tags, each with a leading `#`, plus every parent of a nested tag |
| `file.etags`  | Its tags exactly as written, without parent expansion                |

An unknown `file.*` field is a build error — it would otherwise read as a table that
silently matches nothing.

`this` is the note **containing** the query (not the row), so `this.package` or
`this["name.full"]` reads the page the table is written on.

## Expressions

| Form                                        | Meaning                                                          |
| ------------------------------------------- | ---------------------------------------------------------------- |
| `a and b`, `a or b`, `not a`, `!a`, `( … )` | Boolean combination                                              |
| `type = "creature"`                         | Equality — **case-sensitive**, as Dataview's is                  |
| `intensity != "attribute"`                  | Inequality                                                       |
| `sohl.value > 90`, `>=`, `<`, `<=`          | Ordering; numeric when both sides are numbers                    |
| `shortcode`                                 | A bare field is a **presence** test (absent/empty/zero is false) |
| `!shortcode`                                | Absence                                                          |
| `"text"`, `12`, `true`, `null`, `[a, b]`    | Literals                                                         |

Functions: `contains` / `icontains` / `econtains`, `startswith`, `endswith`, `lower`,
`upper`, `length`, `default`, `number`, `string`, `join`, `regexmatch`, `regextest`,
and `link`. An unknown function is a build error.

`contains()` recurses into a list and substring-matches a string — which is why
`contains(file.tags, "cooking")` matches the tag `#cooking`. It is case-sensitive;
`icontains()` is the forgiving variant and `econtains()` demands an exact element.

## Sorting

Rows are ordered by the `SORT` keys — numerically where both values are numbers,
otherwise as text and **case-insensitively**, with empty values last. Ties break on
the note's content path and then its id, so a table emits identically on every build.
With no `SORT` clause, rows keep content-path order.

Note the asymmetry, which Dataview shares: `=` is case-sensitive, but ordering is not.
`"Horn, Hunting"` belongs beside `"Horn, fanfare"`, not before it.

## Scope and failure

A table searches only notes of the **source note's own `package`**, so a SoHL page
never tabulates setting-package content, and vice versa.

A query that cannot be honoured — malformed, naming an unsupported clause, or calling
an unknown function — is a **build error**, and the block is left in the body verbatim
so the failure is visible in the output as well as on the console. In the pack build
the note fails to compile; in the knowledgebase build the run exits non-zero.

A query that matches **no** note is _not_ an error: it renders as an empty table
(headers only), which is exactly what the author already sees in Obsidian. A category
with no content written yet is a normal state of the corpus, not a broken build.

## Where it runs

Expansion happens **before** wikilink resolution, in all four content compilers:
`@heroiclands/content-build/engine/journals`, `@heroiclands/content-build/sohl/items`, `@heroiclands/content-build/sohl/actors`, and
`utils/build-kb-content.mjs`. That ordering is what lets a generated cell contain a
wikilink. In the knowledgebase build it also runs _outside_ that build's code-fence
protection — a query **is** a fenced block, so protecting it first would hide it from
the expander. The expander itself is dependency-free ESM and is unit-tested in
`HeroicLands/content-build's `tests/content-tables.test.ts``.
