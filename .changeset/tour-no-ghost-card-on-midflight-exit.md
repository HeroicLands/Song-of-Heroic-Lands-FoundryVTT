---
"sohl": patch
---

**Fix: a tour exited mid-launch no longer strands a ghost step card**

`SohlTour.progress()` awaits `_preStep()` (sheet render, tab switch, stable-rect
settle) before `_renderStep()` paints the centered `.tour-center-step`. Foundry's
base `exit()` clears `Tour.activeTour` but leaves `stepIndex` intact, so `status`
stays `in-progress` — and an `exit()` that interleaves those awaits (a tour
launched but not awaited, e.g. from a chat-card Start button, whose owner exits
before the render settles; or Escape pressed mid-open) let the in-flight
`_renderStep()` paint a card **after** teardown already ran, leaving an orphan
step card no later teardown reclaimed.

`_renderStep()` now bails once this tour is no longer the active tour, preventing
the orphan at its source. This removes a non-deterministic full-suite e2e failure
where the stranded card's Next button was read by a later test's gate probe as
"open".

Closes #679
