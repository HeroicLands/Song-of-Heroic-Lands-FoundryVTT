---
"sohl": patch
---

**Fix JSDoc references to concept docs; retarget the broken lifecycle ref (#397)**

JSDoc comments that pointed at developer-doc pages rendered as plain text (or, in
one case, copied a raw `.md` into the API site's `media/`), and one reference
pointed at a `docs/concepts/lifecycle-model.md` file that does not exist.

Because the api/kb split (#418) moved all prose to the knowledgebase — the API
site is now strictly generated symbols — a rendered JSDoc reference to a doc now
links to its **knowledgebase URL** (`https://kb.heroiclands.org/dev/<path>/`)
rather than a relative `.md` (which no longer resolves to anything on the API
site):

- `SafeExpression` → the Expressions and Scripts KB page (was a relative link that
  dumped the raw markdown into `media/`).
- `fvttCleanHTML` (`FoundryHelpers`) → the Security Model KB page (was plain text).

The broken `lifecycle-model.md` references are retargeted to the real
**Phase-batched lifecycle** section of `architecture.md` (in `SohlLogic`'s section
comment and `CLAUDE.md`); no such page ever existed. The three lifecycle locations
— that concept section, the `SohlLogic` class JSDoc, and the Lifecycle Hooks
how-to — now cross-reference each other. `docs/contributing/system-development.md`
documents the JSDoc→doc-page convention (link to the KB URL; `{@link}` resolves
code symbols only). The `SohlLogic` edit is comment/JSDoc-only.

Non-rendered `//` and `/* */` comments that cite `docs/…​.md` repo paths are left
as-is — TypeDoc never emits them, and the path is what a source reader opens.
