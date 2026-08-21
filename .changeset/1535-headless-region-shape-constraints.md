---
"sohl": patch
---

**e2e: a restricted Region no longer throws out of a PIXI ticker headless.** A
Region with `restriction.enabled` makes core flag its scene's shape constraints
and defer the pass to a ticker callback, which picks a designated User with a
predicate reading `canvas.scene.id`. Headless no scene is ever viewed, so
`canvas.scene` is `null`, the callback throws `reading 'id'`, and whichever spec
was running fails for reasons unrelated to it. Nothing in the system's code is on
that stack — the defect is Foundry's, and core fixed it in 14.367 by reading
`this.id` instead; the workaround stays because the suite's committed default
pins `compatibility.minimum` (14.359), which still carries it.

`cy.login()` now installs `guardHeadlessRegionShapeConstraints`, which makes both
the public flag and its internal per-Region entry point inert whenever
`canvas.scene` is nullish — the behaviour the flag should have had anyway, since
shape constraints are perception state for a _viewed_ scene. That replaces the
`getDesignatedUser`-qualified `uncaught:exception` allowlist entry, which is
deleted: `reading 'id'` is far too generic a message to leave allowlisted, and a
source-level guard cannot mask a real null dereference in system code. Covered by
a `map-notes.cy.js` case that flags the fixture's restricted region and asserts
no shape-constraint pass is attempted.

(Closes #1535.)
