---
"sohl": patch
---

**Docs: disambiguate ambiguous `[[Fate]]` / `[[Gear]]` wikilinks in the Rules KB**

`node utils/build-kb-content.mjs` (part of `npm run build:kb`) failed because bare
`[[Fate]]` and `[[Gear]]` wikilinks resolved ambiguously — each name maps to both a
Rules page and a Mystical-Ability / User-Guide page, so the collision-aware resolver
dropped the fallback and failed the build.

The five links (in `Rules/README.md`, `Rules/Esoterica/Arcane.md`, and
`Rules/Strike_Modes.md`) all intend the Rules pages, so they now use explicit
`section/slug` targets — `[[rules/sohl-fate|…]]` and `[[rules/sohl-gear|…]]` — which
are unambiguous by construction. The KB content build exits 0 again. Documentation
only; no behaviour change.

Closes #998
