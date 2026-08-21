---
"sohl": patch
---

**Linter findings now name a file, line and column, in a parseable form** (#1668)

Every finding a `utils/check-*.mjs` linter emits is a single line in the form
every C-family compiler, `tsc` and ESLint already use, so an editor's error
matcher or a CI annotator resolves it with no knowledge of this repository:

```text
assets/content/Rules/Attributes.md:28:13: error: dead address [[doc-nosuchthing]] — no document has that identity
```

Before, a linter's output could not be acted on directly. Some findings named a
file and no line — `check-content-links` reported `  <file>: [[link]]`, so two
identical dead links in one note were indistinguishable and each had to be
hunted for. Others carried a line in an indented, ad-hoc layout no error matcher
reads. No two scripts agreed on a shape, so improving one improved only that
one.

Sixteen scripts now report through one formatter, `utils/lint-diagnostics.mjs`,
under two rules: the path starts the line, and a field is dropped rather than
guessed — nothing defaults to `1:1`. Where a finding is about a literal the
linter matched, its position is recovered by search, with an occurrence count so
repeats land on their own columns. Where a finding is a property of the whole
file, the file alone is the locator.

Exit codes and what each linter fails on are unchanged.
