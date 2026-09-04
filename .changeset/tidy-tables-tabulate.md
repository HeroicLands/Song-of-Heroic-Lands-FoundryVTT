---
"sohl": patch
---

**Generated content tables — Dataview `TABLE` queries** (#1275, #1410)

A content note can now declare a catalog table by query instead of authoring its rows
by hand, in a fenced `dataview` block:

```text
TABLE WITHOUT ID
  link(file.path, name.full) AS "Name",
  sohl.weight AS "Weight",
  sohl.protection.blunt AS "B"
WHERE type = "armorgear" and sohl.material = "Cloth"
SORT name.full ASC
```

The build fills in the rows from the matching notes' frontmatter, in both content
builds — the Foundry compendium packs (with `@UUID` links) and the knowledgebase
(with site links) — so one authored query yields the same table in both.

- _Columns_ are any expression, optionally named with `AS "Header"`. Numeric columns
  right-align, absent values render as an em dash, and `link(file.path, …)` links a
  cell to the row's own note.
- _Fields_ are any frontmatter property, however nested (`sohl.protection.blunt`,
  `sohl["subType"]`), plus `file.path` / `file.folder` / `file.name` / `file.link` /
  `file.tags`, and `this` for the note the query is written on.
- _`WHERE`_ combines `and` / `or` / `not` and parentheses over `=`, `!=`, ordering
  comparisons, and bare-field presence, with `contains` / `icontains` / `econtains`,
  `startswith`, `lower`, `default`, `regexmatch` and more. `FROM` scopes to a folder or
  a tag; `SORT` takes several keys with per-key direction; `LIMIT` caps the rows.
- A malformed query, an unsupported clause (`LIST`, `GROUP BY`, `FLATTEN`), an unknown
  function, or a column resolving to an object fails the build naming the problem. A
  query matching nothing renders as an empty table.

See _Generated Content Tables_ in the developer documentation.
