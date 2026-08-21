---
"sohl": patch
---

**`SuccessTestResult` publishes with its class description again.** The API site
listed the class every d100 roll-under test resolves into with nothing but its
members — no prose saying what it is, when it is produced, or how it evaluates.

The description was never deleted. `VALUE_DIAMOND_SCALE` and
`toValueDiamondMarks` were introduced between the comment and the
`export class` line it documents, and a doc comment separated from its
declaration by another documented declaration attaches to neither — TypeDoc drops
it, and `jsdoc/require-jsdoc` reported the class as undocumented. The two Value
Diamond exports now sit above that comment instead of inside the gap, which
restores adjacency without rewriting a word of the prose.

The two module-private helpers in `description-link.ts` (`withoutTags`, `tidy`)
also gained the `@param`/`@returns` their existing summaries were missing. With
those, `npm run lint:eslint` is clean — the five warnings it had been emitting on
`main` are gone.

(Closes #1649.)
