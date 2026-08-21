---
"sohl": patch
---

**e2e: the #1535 map-notes case now tests the state it names.** It opened by
requiring `canvas.scene` to be `null` — "no scene is viewed headless" — one line
after importing an Adventure, and failed on every build and every world. The
premise was wrong, not the timing: the seeded test world ships an **active**
default scene (`utils/seed-test-world.mjs`, #451), which the client views at
load, so `canvas.scene` is a live Scene throughout a run. Headless suppresses
_rendering_; it does not leave the canvas without a scene.

Because that assertion failed first, nothing downstream of it ran, and the case
never reached the guard it was written for — with a scene viewed, the #1535
clause of `guardHeadlessRegionShapeConstraints` does not engage at all. The case
now presents the state instead of assuming it: it shadows `canvas.scene` for the
duration of the flag (the handle `scene-nonpersisted.cy.js` already uses for the
sibling #1550 defect), and asserts both directions — with a scene viewed core's
pass runs, with none viewed it is inert. Removing the guard's clause reproduces
the original `reading 'id'` crash in this case, which the previous version could
not do.

The guard itself is unchanged and stays: `canvas.scene` is `null` before the
first draw completes and in any run whose active scene is absent or unviewed. Its
rationale, the sibling spec's, and the testing gotchas are corrected where they
stated that no scene is ever viewed.

(Closes #1661.)
