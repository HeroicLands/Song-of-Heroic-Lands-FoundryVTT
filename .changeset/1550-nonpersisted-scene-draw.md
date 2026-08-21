---
"sohl": patch
---

**A scene deleted mid-draw no longer fails an unrelated e2e spec (#1550)**

Foundry 14.367 opened `updateRegionShapeConstraints` with a throw unless
`this.persisted`, but left callers that cannot honour it. The canvas calls the
`Scene` copy as the last step of its private draw, after a long run of awaits.
The Cypress suite deletes the scenes it creates in `afterEach`, so a draw begun
on a tagged scene routinely finished after that scene had left `game.scenes`.
The throw then escaped as an unhandled rejection and failed whichever spec
happened to be running, with no SoHL frame anywhere on the stack.

`cy.login()` now installs `guardHeadlessRegionShapeConstraints`, which skips the
call when the document reports `persisted === false` — recomputing region shape
constraints for a document nobody can update has no work to do, which is what
the caller assumed. The test is strict `=== false`, so a build without that
getter runs core untouched and the pinned 14.359 floor is unaffected. Both
`Scene` and `Level` are patched: `Level` has its own copy of the method (new in
14.367) and throws from it before delegating to the scene, so the callers that
address a level directly — the levels a moved token affects, and the equivalent
light and wall updates — would otherwise still throw.

A new spec, `scene-nonpersisted.cy.js`, pins this down rather than leaving it to
the race that exposed it: the original failure is timing-dependent, surfaces only
under the load of a full suite, and lands on a bystander spec rather than the one
that caused it. The spec deletes a scene and invokes the same entry points the
draw path does, requiring each one the build defines to be inert.

A source-level guard rather than an `uncaught:exception` allowlist entry: that
message is core's generic one for updating _any_ deleted document, so
allowlisting it — even qualified by a stack frame — could mask a real bug writing
to a document the system had already destroyed. Skipping one unreachable call can
mask nothing.

Test harness only; no shipped system behaviour changes.
