---
"sohl": patch
---

**The knowledgebase's wikilink address index comes from the shared toolchain
now.** `@heroiclands/content-build` 0.17.0 exports `buildSiteIndex` and
`wikiContext`, so 124 lines go from `utils/build-kb-content.mjs`: the key
spaces, the foreign-manifest merge and its short-form rule, and the per-page
resolver context.

What stays is how a page gets its address in the first place — the URL scheme
and the developer-docs pass — which is genuinely this site's rather than
shared.

The rules now have tests, which they never had here: they were inline
statements calling `process.exit`, so there was nothing to call.

Nothing published changes — the whole `kb/content/` tree is byte-identical
across all 1,520 files.
