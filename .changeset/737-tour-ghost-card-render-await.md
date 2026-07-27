---
"sohl": patch
---

**Fix: a tour exited during the render await no longer strands a ghost step card**

Follow-up to #679. That fix guarded `SohlTour._renderStep()` with a single
`activeTour !== this` check at the top — but `super._renderStep()` is `async` and
yields, so an `exit()` (an `afterEach`/Escape firing while the card paints) that
interleaves **that** await tears down before the just-painted card is tracked as
`#cardEl`, leaving an orphan `.tour-center-step`. A later gate probe reads the
ghost's Next button as "open", which is the residual, timing-dependent
full-suite flake in the Character Creation tour's gated-steps spec.

Two guards close the window: `_renderStep()` re-checks `activeTour === this`
**after** the `super._renderStep()` await and removes the card it just painted if
the tour is no longer active (preventing the orphan at its source); and the DOM
teardown now sweeps **all** stray `.tour-center-step` nodes, not just the tracked
`#cardEl` — so the next tour start reclaims any residual ghost before painting its
own card and before the gate probe can read it.

Closes #737
