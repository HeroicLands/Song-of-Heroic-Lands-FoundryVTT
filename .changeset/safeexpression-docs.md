---
"sohl": minor
---

**Docs: comprehensive SafeExpression authoring guide (#364)**

The "Expressions and Scripts" concept doc now documents how to author a
`SafeExpression` end to end: how it works (parse → static allowlist validation →
hand-walked evaluation), the exact grammar (what is allowed and what is rejected
at parse time), the **bindings each call site provides** (action `visible` /
`trigger`, active-effect `test` for item and strike-mode scopes, context-menu
`condition`, and Corpus movement-profile value fields), a full **reference table
of the built-in helpers with their signatures and return values**, and worked
examples for both predicates and computed values.

It also fixes a rendering bug in the `SafeExpression` class documentation: the
JSDoc `@example` tags were swallowing the prose sections that followed them, so
everything after the first example rendered as preformatted text on
api.heroiclands.org. Those examples are now inline fenced code blocks, and the
class doc links back to the concept guide.
