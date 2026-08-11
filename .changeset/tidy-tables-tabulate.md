---
"sohl": minor
---

**Generated content tables — the `(@Table …)` directive** (#1275)

A content note can now declare a table by search criteria and column list instead of
authoring its rows by hand:

```text
(@Table search=[type:armorgear, sohl.material:Cloth]
        columns=[Name:name.full, Weight:sohl.weight, B:sohl.protection.blunt])
```

The build fills in the rows from the matching notes' frontmatter, in both content
builds — the Foundry compendium packs and the knowledgebase — so one authored
directive yields the same table in Foundry (with `@UUID` links) and on the KB (with
site links).

- _Search_ terms are AND-ed. They read any dotted frontmatter path plus the synthetic
  `path`, `tld`, and `folder` keys, and support alternates (`Cloth|Mail`), negation
  (`!Cloth`), presence (`*` / `!*`), and globs — `*` within a path segment, `**`
  across directories, so `path=Creatures/Animal/*.md` tabulates that directory.
- _Columns_ are `Header:frontmatter.path`. Numeric columns right-align, absent values
  render as an em dash, and the first column links to the row's own note by default.
- A malformed directive, a column path that resolves to an object, or a search that
  matches nothing fails the build rather than shipping an empty or broken table.

See _Generated Content Tables_ in the developer documentation.
