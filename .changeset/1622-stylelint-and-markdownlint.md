---
"sohl": patch
---

**Two lint gates for the checks Prettier structurally cannot make.** Prettier
formats ~96% of the hand-written text in this repository and formatting is all it
does — it will happily reformat a stylesheet whose class name has drifted out of
the documented convention, or a page whose heading levels skip a rung. `npm run
lint:styles` and `npm run lint:markdown` now cover that gap, and both are part of
`npm run lint`.

**`lint:styles` — stylelint over `scss/`.** The reason it matters is naming, not
tidiness: `kb/dev-docs/concepts/css-architecture.md` publishes the `--sohl-*`
custom properties as an extension surface module authors compile against, and
fixes SoHL's class names to BEM. Neither had a guard, so a rename was an API break
with nothing to catch it.

- `selector-class-pattern` enforces BEM `block__element--modifier`, with the
  Foundry-owned classes SoHL selects on admitted as the plain kebab-case blocks
  they are.
- `custom-property-pattern` enforces lowercase kebab-case everywhere, tightened to
  the `--sohl-*` namespace inside `scss/abstracts/` where the tokens are declared.
  It is looser outside that folder on purpose: the rule inspects `var()`
  references as well as declarations, and SoHL legitimately reads Foundry-core
  properties and its own template-set layout hooks.
- The rest of `stylelint-config-standard-scss` — invalid and duplicate
  declarations, unknown properties and units, dead selectors — stays on.

_Know its limit:_ the tokens are emitted by interpolation
(`--sohl-color-#{$name}`), which stylelint skips as non-standard syntax, so
renaming a key in a token map still renames a public property unguarded.

**`lint:markdown` — markdownlint over every git-tracked `.md` file.** Nine rules,
named individually: heading hierarchy (`MD001`), duplicate sibling anchors
(`MD024`, `siblings_only`), broken table rows (`MD056`), and five link-correctness
rules. `MD018` is deliberately absent — it reads a line starting `#1405) …` as a
malformed heading, and this repository writes bare issue numbers constantly; so is
`MD051`, already covered across files by `lint:doc-links`.

**Both rule sets are deliberately narrow, and each config file carries the reason
per rule.** stylelint's and markdownlint's defaults fire ~170 and ~74,000 times
respectively on this tree, almost entirely on blank-line placement, value notation,
line length, and list indentation — a second formatter's taste applied to bytes
Prettier already owns, and satisfying it would mean exactly the cosmetic refactor
this repository forbids. The test for adding a rule to either is whether it can
report that something is _wrong_.

Four real findings fell out and are fixed: three skipped heading levels
(`Effect_Targeting`, `event-queue`, `build-and-deployment`) and a bare email
address in the brand `NOTICE`. Three deliberate exceptions are annotated where
they live rather than switched off globally — `clip` in the visually-hidden mixin,
the hand-written `-webkit-appearance` on the checkbox reset, and ProseMirror's own
`.ProseMirror` class. No compiled CSS changed.

(Closes #1622.)
