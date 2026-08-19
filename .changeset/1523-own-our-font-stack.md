---
"sohl": patch
---

Own SoHL's font stack instead of inheriting Foundry's by accident (#1523, #1522).

Foundry assigns fonts to CSS variables and applies them with **unscoped element
selectors** — `body { --font-h1: "Modesto Condensed" }` plus a bare
`h1 { font-family: var(--font-h1) }`. Because `body` is the scope, those values
inherit into every application window, SoHL's included, and any heading the system
does not explicitly style renders in a face it neither ships nor chose.

**Measured, not assumed.** Walking every heading in a live client across a Being
sheet and four Item sheets: of **172 headings, 8 rendered in Modesto Condensed** —
the skill sheet's combat-technique names. The other 141 non-serif headings only
looked right because core's default happens to be Signika, the same family SoHL's
sans token names. Correct by coincidence, not by decision.

`scss/base/_foundry-vars.scss` — the block that already remaps core's `--color-*`
variables onto SoHL tokens, scoped to `.sohl` so only our surfaces are affected —
now remaps the font slots too: `--font-primary`, `--font-h1` through `--font-h6`,
and `--font-serif`.

**This owns the stack without restyling it.** The heading slots are mapped to the
**sans** token, matching what they already resolved to, so the same 172 headings
now report **0** in a non-SoHL font while Cinzel (4) and Cormorant Garamond (19)
counts are unchanged — the SoHL rules that make those choices win on specificity
and are untouched. Only the 8 leaking headings moved. Which headings take the
Manuscript serif remains a design decision for the sheet redesign (§2.2: serif for
wordmark, section legends and attribute names; sans for chrome and body).

**The bundled Signika is dropped** — 5 `.woff2` files and 5 `@font-face`
declarations, ~188 KB. Foundry bundles Signika as its default UI font and loads
all five weights (300/400/500/600/700) through `CONFIG.fontDefinitions`, so the
family resolves without our copy. Relying on core is a deliberate judgement rather
than an oversight: dropping Signika would break every system that names it, so it
could only land in a major release, loudly announced, leaving time to adapt or
reintroduce it. `_typography.scss` records that where `$font-sans` is defined.

Verified rather than assumed: with our copy removed, the same 172 headings still
report **0** in a non-SoHL font and the identical distribution (149 Signika,
19 Cormorant Garamond, 4 Cinzel). Every weight resolves from core's copy —
`document.fonts.load("700 12px Signika")` matches two faces and both load, and a
700 sample measures 171.0px against 167.6px at 400 and 186.8px in the generic
bold fallback, so real Signika bold renders rather than a synthesized substitute.
