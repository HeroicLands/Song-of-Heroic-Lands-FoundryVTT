---
"sohl": patch
---

**One marker for each kind of emphasis.** `lint:markdown` now enables MD049 and
MD050: `_emphasis_` and `**strong**`.

Both are already satisfied everywhere — 1,663 files, zero findings — because
Prettier normalises to exactly this pair. That is why they are worth stating:
the convention held as a side effect of the formatter's default, so it would
have lapsed silently if that default changed or a path joined
`.prettierignore`.
