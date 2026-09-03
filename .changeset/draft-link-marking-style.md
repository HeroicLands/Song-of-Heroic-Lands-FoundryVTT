---
"sohl": minor
---

Style a link into a draft note, so the marking the content build emits is
visible (#1795).

`@heroiclands/package-build` wraps a wikilink whose target carries the `draft`
tag in `<span class="sohl-draft-link" title="Draft — not yet written">…</span>`
(HeroicLands/package-build#183), leaving the `@UUID` inside live. The system
shipped no rule for that class, so in a compiled journal a link into an unwritten
note read exactly like a link into a finished one.

`scss/components/_draft-link.scss` supplies it, beside `_unresolved-link.scss`
and following its conventions: unscoped, because compiled prose renders in
journal sheets, chat cards and tooltips rather than only under a `.sohl` frame;
`light-dark()`, because Foundry drives its themes through `color-scheme`; and an
overridable `--sohl-draft-link-color`.

**Deliberately unlike the unresolved marking**, because the two say different
things — an unresolved link's target does not exist, a draft link's exists and
is unwritten. So this keeps the link's normal weight and marks it in amber with a
dashed underline, against the unresolved marker's bold red and dotted one. Both
colours are contrast-checked at 4.5:1 or better against the plausible sheet
backgrounds of their own mode.
