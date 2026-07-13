---
"sohl": patch
---

**Build compendium packs from in-repo Markdown; retire the vault export (#419)**

`build:compiledb` now generates each pack's per-entry JSON from the authoritative
`assets/content/` Markdown into a `build/packs-json/<pack>/` intermediate and
compiles the LevelDB packs from it. The JSON is a disposable build artifact — never
committed — and the build needs no HeroicLands vault.

- Content is routed by **frontmatter, not directory**: `type` selects the pack (item
  kinds → items, `type: doc` → journals, `character` / `creature` → actors) and
  `package: sohl` scopes it to the system, so setting-specific content is excluded.
- Removed the `packs:export` / `packs:rebuild` / `packs:clean` scripts and the vault
  code paths (`utils/packs/export.mjs`, `clean-sources.mjs`). The pack compilers now
  read `assets/content/` (`contentBase`) rather than the vault.
- Entry IDs come from frontmatter `id`, so compiled IDs are unchanged across the
  move (verified against the prior committed sources: items 0 dropped, actors
  identical).
