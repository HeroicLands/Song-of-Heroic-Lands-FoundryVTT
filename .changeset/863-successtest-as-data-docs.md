---
"sohl": patch
---

**Docs: teach "graded success test as data," not subclassing**

Corrected developer guidance that steered authors toward the bespoke path for a
new graded/special-result test, when the generic `successTest()` already makes
that unnecessary. Today's Fate, Shock, and Stumble/Fumble tests all avoided a
subclass — each is the one generic path fed a `scope.successStarTable` (outcome
mapping as data), with follow-ups riding the standard card via an optional
`buttons` entry on `SuccessTestResult.toChat`.

- **`reference/combat-resolution-pipeline.md`** — the "Extension guidance" bullet
  that said _"New test type: Subclass `SuccessTestResult` … Override `evaluate()`
  and `toChat()`"_ is replaced. It now teaches the `successStarTable` (+ optional
  `targetValueFunc` / `buttons`) recipe as the default and reserves a subclass for
  a test whose **roll math** genuinely differs — new result text or a follow-up
  button is never a reason to subclass.
- **`how-to/extension-points.md` §3** — adds a worked _"Adding a graded /
  special-result test — pass data, don't subclass"_ section (the `noChat` +
  `toChat({ buttons })` pattern), and rewrites the §3 "Safe extension" bullets to
  point at it instead of _"add new `*Result` types for new outcomes."_
- **`reference/result-description-tables.md`** — documents the
  `SuccessTestResult.toChat` **card-data contract** (`mlMod`, roll `total`, item /
  actor uuids, `fateScopeJSON`) and the `buttons` follow-up input, so an author
  reposting the card knows which derived fields must be folded in.
- **JSDoc** — `MasteryLevelModifier.successTest` now enumerates the recognized
  `context.scope` fields (surfacing them on IDE hover and in the API docs), and the
  `SuccessTestResult.ContextScope` interface comment is corrected from the
  misleading _"scope passed to actions that resume a prior success test"_ to its
  real role as the scope for **every** success test.

Closes #863
