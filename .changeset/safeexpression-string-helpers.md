---
"sohl": minor
---

**Add a comprehensive set of string helpers to `SafeExpression`**

`SafeExpression` could compute numbers, booleans, comparisons, string literals, and
`+` concatenation, but method calls are banned — so string handling beyond `lower`,
`upper`, `startsWith`, `endsWith`, and `contains` was not expressible. That blocked
computed **label/description** flavor text for author-supplied result-description
tables (the `#202` feature line).

Expand the standard expression-helper library with string operations, exposed as
allowlisted helpers so the sandbox guarantees hold (no raw method access):

- **Building/formatting:** `str`, `concat`, `capitalize`, `padStart`, `padEnd`,
  `repeat`
- **Extracting:** `slice`, `substr`, `charAt`, `split`, `join`
- **Searching/editing:** `indexOf`, `trim`, `replace` (literal, all occurrences)

`replace` matches its search text literally (never as a regular expression), and
`padStart`/`padEnd`/`repeat` refuse to build strings longer than 100,000 characters
as a memory-exhaustion guard. Existing helpers (`lower`, `upper`, `contains`, `len`,
`matches`, …) are unchanged.

Closes #448
