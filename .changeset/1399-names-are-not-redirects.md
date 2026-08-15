---
"sohl": patch
---

**Knowledgebase pages no longer redirect from their display names** (#1399)

`aliases` names two unrelated things: in Obsidian a note's alternative _names_, in Hugo
a page's URL _redirects_. The knowledgebase build conflated them, publishing every
authored alias as a redirect — 1402 of the 1656 emitted entries were display names such
as `Black Death` and `Nightwights`, each claiming a public URL.

- _Redirects are now wholly generated._ A page emits exactly the addresses it really did
  publish at before: its legacy slug (`kb/data/legacy-slugs.json`) and, for a moved page,
  its pre-split `/guide/` or `/dev/` URL. Both still emit and still resolve; only the 1402
  display-name entries are gone.
- _Names stay in the vault._ An authored `aliases` still resolves a bare `[[Text]]`
  wikilink, which is what it was always for.
- This also unblocks giving every note a `type-shortcode` alias for Obsidian addressing,
  which would otherwise have published 1599 further shortcode-shaped public URLs.
