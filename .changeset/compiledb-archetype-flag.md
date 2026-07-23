---
"sohl": minor
---

**Compendium build now sets the archetype flag from `sohl.archetype`**

`build:compiledb` reads each Item/Actor content note's required
`sohl.archetype` frontmatter and writes it to `flags.sohl.docArchetype`, so
shipped compendium documents carry their archetype identity for the
create-dialog picker (issue #640, archetype contract #604).

- `sohl.archetype` is a **required, nullable number**: a number marks the
  document as an archetype of that priority (→ `flags.sohl.docArchetype`);
  `null` marks it as not an archetype (the flag is omitted); an **absent**
  value is an authoring error that fails the entry, so "not an archetype" is
  never silently assumed.
- New pure helpers `resolveArchetype` / `withArchetypeFlag` in
  `utils/packs/helpers.mjs` enforce the contract and are used by both the
  `items` and `actors` compilers.
- `Basic_Folk.md` drops its now-redundant explicit `flags.sohl.docArchetype`
  so `sohl.archetype` is the single source of truth.
