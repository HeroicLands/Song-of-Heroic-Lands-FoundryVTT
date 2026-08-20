---
"sohl": patch
---

**`npm run build:icon-legend` no longer breaks the page it generates.** The
generator and the file it owns had diverged, and the page's own header says _"do
not edit by hand"_ — so the divergence could only ever be resolved by the
generator overwriting work it knew nothing about. Running it failed
`lint:content-aliases` and would have taken live links down with it.

Four things had drifted, and all four are fixed in the generator rather than in
the page:

- **The `doc-iconlgnd` address alias was missing.** It is now derived from the
  same `type` and `shortcode` constants the generator writes into the
  frontmatter, so the three cannot come apart. This is the one that mattered:
  Obsidian resolves `[[doc-iconlgnd]]` against the literal string in `aliases`,
  so dropping it takes the page's address away in the editor where content is
  authored — and the link goes dead rather than erroring.
- **`slug: "icon-legend"` was emitted.** Authored slugs are retired (#1278); a
  note's URL derives from its shortcode, no other content note carries the key,
  and nothing reads it. The generator no longer writes it.
- **The "See also" links used the retired `[[doc/shortcode]]` slash form.**
  Obsidian reads a slash as a vault path, so each was a broken link in the
  editor. They are hyphen-qualified now, as every other note in the tree is.
- **The prose was hard-wrapped.** Content notes are authored unwrapped and
  Prettier's `proseWrap` is `preserve`, so every run reflowed four paragraphs
  that nothing else in `assets/content/` wraps.

The committed page needed no edit at all: with the generator corrected,
regenerating it is a byte-for-byte no-op.

**`lint:icon-legend` now keeps it that way.** `build-icon-legend.mjs --check`
renders the page and compares it to the tree, failing with the first differing
line — the same shape as `lint:expr-scopes` and `lint:type-catalog`. The drift
this closes was visible only because someone happened to run the generator.

(Closes #1620.)
