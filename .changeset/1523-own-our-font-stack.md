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

**The bundled Signika is kept, and now says why.** Core loads the same five
weights, so our copy is redundant at runtime — but `.sohl` now names
`--sohl-font-sans` explicitly, and a token the system names should be one it can
honour rather than one satisfied by another package's assets. The failure mode of
relying on core is silent: a release that dropped Signika or narrowed its weights
would re-render text at a nearby weight with nothing logged. `_typography.scss`
records that reasoning so the next audit does not re-open it.
