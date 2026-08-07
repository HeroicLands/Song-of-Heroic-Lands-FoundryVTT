---
"sohl": minor
---

**Flag a cohort member whose actor cannot be found**

A member whose handle no longer resolves — the actor was deleted, or this client
cannot see it — was shown only as a greyed row bearing its raw handle. Greyed
alone reads as _inactive_; nothing said the actor was **missing**.

Such a row now carries an amber warning triangle and the words **Not Found**
beside the handle, with a tooltip explaining the two reasons it can happen. A
member that resolves is unchanged.

_Note:_ the flag uses a single `triangle-exclamation` glyph rather than a
layered `fa-layers` composition. Foundry ships Font Awesome as a **webfont**, and
`fa-layers` / `data-fa-transform` only take effect in FA's SVG mode — layering
there renders a stray `!` beside the triangle instead of inside it.
