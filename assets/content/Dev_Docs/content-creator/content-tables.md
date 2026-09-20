---
type: doc
subType: howto
name:
  full: Generated Content Tables
  aliases: []
shortcode: contenttables
description: "SQL queries that tabulate content notes from their frontmatter."
pack: none
sohl:
  kbcat: devdocs
---

# Generated Content Tables

See also: [[doc-contentlinks|Linking Between Content Notes]], [[doc-shortcodeintegrity|Shortcode Integrity]], [[doc-systemdevelopment|System Development]]

A catalog table — every cloth armour, every animal's attributes, every trauma of a
category — is data that already lives in the frontmatter of the notes it describes.
Authoring such a table by hand duplicates that data and guarantees drift: the item's
weight changes, the table does not, and nothing in the build notices.

A content body therefore declares **what it wants tabulated** and the build fills in
the rows. The declaration is a **SQL query**, in a fenced `sql` block:

````text
```sql
SELECT address.slug                     AS _ref,
       name.full                        AS "Name",
       sohl.system.weightBase           AS "Weight",
       sohl.system.protectionBase.blunt AS "B"
FROM notes
WHERE type = 'armorgear' AND sohl.kbcat = 'cloth'
ORDER BY name.full COLLATE NOCASE
```
````

The build runs that query against the **content index** — one row per note, derived
from the same frontmatter the compilers read — so one authored query yields the same
table in both places it ships: the Foundry compendium packs and the knowledgebase.
The query is the single statement of what the table holds; there is no second copy to
fall out of date.

**The query is real SQL, run by [DuckDB](https://duckdb.org/docs/stable/sql/introduction).**
It is not a dialect maintained by this project, and there is no supported subset to
learn: anything DuckDB's `SELECT` accepts works here, including joins, `CASE`,
aggregates and window functions. This replaced a hand-written parser for
[Dataview](https://blacksmithgu.github.io/obsidian-dataview/)'s query language
, whose boundary was invisible — it accepted some
queries and silently misread others.

## What you are querying

`FROM notes` is this package's content index: **one row per note**, plus one per
documentation entry, which is why `type = 'miscgear'` selects the items and never the
journal pages describing them.

A nested field is addressed exactly as a note authors it — `sohl.system.weightBase`,
`name.full`, `sohl.protectionBase.blunt` — because the index is read as JSON and every
nested object is inferred as a `STRUCT`. Any frontmatter property is addressable,
however deeply nested, and a field a note _type_ does not carry reads `NULL` rather
than failing.

The index adds a few fields no note authors:

| Field          | Value                                                                  |
| -------------- | ---------------------------------------------------------------------- |
| `address.slug` | The note's address — `armorgear-tunicquilt`. This is what `_ref` wants |
| `file.path`    | Location below `assets/content/` — `Armor/Cloth/Tunic_Quilted.md`      |
| `file.folder`  | Its directory — `Armor/Cloth`                                          |
| `file.name`    | Its filename without the extension — `Tunic_Quilted`                   |
| `package`      | The package the note belongs to                                        |

**Beware `packFolder`.** That is a note's _pack_ folder — where the document lands in
the compendium — not its directory. The directory is `file.folder`.

### Reading another package's notes

Each package this one **depends on** is attached as a schema named after it, so a
query can tabulate what it builds on — `FROM sohl.notes` from a setting repository,
for instance. This package's own notes stay at the unqualified `notes`, and a query
may read both at once. It needs no fetch and no configuration: a dependency's
published index is already cached when a compile starts.

## The two aliases the renderer reads

Which column links and where a section breaks are decisions about _output_, not
relational operations, so they are carried as **underscore-prefixed aliases**. They
are ordinary SQL, they need no fence options, and they are visible in the query where
you are already looking. Neither is printed as a column.

| Alias      | What it does                                                           |
| ---------- | ---------------------------------------------------------------------- |
| `_ref`     | Makes the row's **first** rendered column a wikilink to that address.  |
| `_section` | Emits a headed table per distinct value, in the order the rows arrive. |

`SELECT address.slug AS _ref` is therefore how a row links to its own note. Each build
resolves that wikilink the way it resolves any other: into a `@UUID` enricher for
Foundry, and into a site href for the knowledgebase. A row whose address does not
resolve renders as plain text rather than shipping a dead link.

`_section` is what lets **one** query replace a run of near-identical blocks:

````text
```sql
SELECT address.slug AS _ref, sohl.kbcat AS _section, name.full AS "Name"
FROM notes WHERE type = 'miscgear'
ORDER BY sohl.kbcat, name.full COLLATE NOCASE
```
````

The authored `ORDER BY` decides the section order too. Use it when the headings _are_
the grouping value; where a page wants authored headings — `## Knives` over
`sohl.kbcat = 'knife'` — write a table per heading, as `Rules/Gear.md` does.

## Header arguments

Statements _about the directive_, as opposed to the query, are written after the
language word as **org-babel header arguments**:

````text
```sql :section-level 3 :allow-empty
SELECT name.full AS "Name", sohl.kbcat AS _section FROM notes WHERE type = 'affliction'
```
````

| Argument               | What it does                                                                             |
| ---------------------- | ---------------------------------------------------------------------------------------- |
| `:allow-empty`         | A table selecting nothing is intended, not a stale query. Without it, empty is an error. |
| `:section-level <1-6>` | The heading level `_section` emits. Default `2`.                                         |

The language word stays first and stays plain, so GitHub, Prettier and every other
markdown reader still highlight the block as SQL and ignore what follows. A key is
`:name` starting a word, its value runs to the next key, and a key with no value means
`true`.

## How values render

- absent or `NULL` → an em dash (`—`);
- a list → its elements, comma-separated;
- a boolean → `yes` / `no`;
- a **struct** → a build error. A column resolving to an object is almost always a
  truncated path (`sohl.system.protectionBase` for `…protectionBase.blunt`), and would
  otherwise ship as `[object Object]`.

A column whose every shown value is numeric is right-aligned; `|` and newlines in a
value are escaped so a cell cannot break out of the table.

## Ordering

`ORDER BY` is SQL's, which collates **binary** — every capital before every
lowercase. Text columns therefore take an explicit collation:

````text
```sql
ORDER BY name.full COLLATE NOCASE
```
````

That is what keeps `Horn, Hunting` beside `Horn, fanfare` rather than before it, and
it is worth writing on any table sorted by a name. `NULL`s sort last. With no
`ORDER BY` at all, rows arrive in the index's own order, which is stable between
builds but is not alphabetical.

## When a query selects nothing

**A table that selects nothing is a build error.** A zero-row table publishes as a bare
header and a rule, and a stale query — a renamed type, a retired category, a typo'd
path — is then indistinguishable from a category that is legitimately empty. Eight
tables in `Rules/Bestiary.md` published that way for months after the
`creature` → `being` rename, and no build said a word.

Where a table is _meant_ to be empty — a category whose content is not written yet —
say so on the fence with `:allow-empty`.

## When a field exists in the data model but in no note

A field **no note in the corpus authors** has no column in the inferred struct, so
naming it is a binder error rather than a `NULL` — the error names the key and lists
the ones that do exist. That is usually the report you want. Where a table is a
deliberate placeholder for content not yet written, read the field back out as JSON,
which tolerates its absence:

````text
```sql
WHERE type = 'concoctiongear'
  AND subType = 'exotic'
  AND json_extract_string(to_json(sohl.system), 'potency') = 'mild'
```
````

## Failure and where it runs

A query that cannot be honoured — a syntax error, an unknown column, a column
resolving to a struct — is a **build error** naming the query, and the block is left in
the body verbatim so the failure is visible in the output as well as on the console.
In the pack build the note fails to compile; in the knowledgebase build the run exits
non-zero. One bad directive costs its own table, not the whole build's report.

Expansion happens **before** wikilink resolution, in every content compiler —
`@heroiclands/package-build/engine/base-compiler` (which every pack compiler extends)
and `@heroiclands/package-build/engine/site-build` (`content-build site`) — which is
what lets a generated cell contain a wikilink. The link checker expands the same
tables from the same prepared results, so it cannot disagree with the compilers about
what a table selects. The expander is unit-tested in package-build's
`tests/sql-tables.test.ts`.
