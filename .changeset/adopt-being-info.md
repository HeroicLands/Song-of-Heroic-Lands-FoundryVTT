---
"sohl": patch
---

**The knowledgebase's being info-block derivation comes from the shared
toolchain now.** `@heroiclands/content-build` 0.16.0 exports it, so the 113-line
copy in `utils/build-kb-content.mjs` is gone along with its `GEAR_TYPE_TO_KEY`
table.

The gate goes with it. Whether a note is a being is `isBeing`'s answer rather
than this file's, which is the actual fix for #1696: the derivation was never
wrong, but each repository wrote out its own idea of what a being _is_, and this
one still said `character`/`creature` months after #1580 retired them.

Nothing published changes — the whole `kb/content/` tree is byte-identical
across all 1,520 files.
