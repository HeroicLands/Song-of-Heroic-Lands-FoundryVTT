---
"sohl": patch
---

**Character Creation tour: presentation and interaction fixes**

A batch of fixes making the flagship Character Creation guided tour readable,
non-blocking, and free of stray artifacts:

- **Non-blocking overlay.** The tour no longer dims the whole screen or grays out
  the sheets and dialogs a player must read and type into, and pointer events pass
  through the fade on every step — so a coach-and-wait tour never blocks the app it
  is coaching. Open dialogs are lifted above the fade.
- **Stable step card.** Each step draws a bright ring around its target and shows a
  centered, stable step card instead of anchoring to Foundry's shared tooltip
  (which a sidebar, context menu, or sheet would steal). Highlights are computed
  from a settled, on-screen rect — the tour waits for the target to stop animating,
  scrolls it into view, and clamps the ring to the viewport.
- **Create-actor step guides the user.** The opening step highlights the **Actors**
  sidebar tab, then (auto-opening and, if collapsed, expanding the directory)
  spotlights the **Create Actor** button — via new `spotlight` / `nav.sidebarTab`
  step options and a stable-rect wait — so the button is always reachable and ringed
  where it comes to rest.
- **No stranded ghost card.** A tour exited mid-launch (a chat-card Start button
  whose owner exits before render settles, or Escape pressed mid-open) no longer
  leaves an orphan `.tour-center-step`: `_renderStep()` re-checks that this tour is
  still the active tour after its async render await and removes the card it just
  painted, and teardown sweeps any stray card — removing a non-deterministic
  full-suite e2e flake.
- **Offer card renders markup.** The whispered tour-offer chat card renders its
  inline `**bold**` / `_italic_` as HTML (raw triple-stache), with a centered header
  and no route icon, instead of showing the literal tags.

Closes #654
Closes #656
Closes #658
Closes #660
Closes #664
Closes #665
Closes #679
Closes #737
