---
"sohl": patch
---

**The API documentation builds again.** `npm run docs` failed, taking the CI
**Build API documentation** step — and therefore every open pull request — down
with it, regardless of what the pull request changed.

The implementation signature behind the `getItemLogic` overloads carried
`@inheritDoc` _and_ its own `@param`/`@returns` block. `@inheritDoc` copies the
whole inherited comment, block tags included, so the hand-written `@returns` on
the next line was discarded — TypeDoc reported that as "Content in the
`@returns` block will be overwritten", and `treatWarningsAsErrors` in
`typedoc-html.json` turned the warning into a non-zero exit.

The warning was accurate: one of the two comments was dead text. The local prose
is the more specific of the pair — it documents the merged
`(idOrShortcode, type?)` signature rather than the id-only overload above it — so
it stays, and the `@inheritDoc` that was silently discarding it is gone. The
escalation setting is untouched: the point of `treatWarningsAsErrors` is to catch
exactly this, and suppressing it would have hidden the same defect everywhere else
it occurs.

(Closes #1605.)
