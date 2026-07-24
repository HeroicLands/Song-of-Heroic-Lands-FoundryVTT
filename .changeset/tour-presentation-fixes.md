---
"sohl": patch
---

**Guided tour presentation fixes**

Make the Character Creation tour readable and non-blocking, and tidy its offer card.

- The tour no longer dims the whole screen or grays out the sheets and dialogs a
  player must read and type into. Each step now draws a bright ring around its
  target instead of a full-screen scrim.
- The step card is a stable, centered panel rather than being anchored to
  Foundry's shared tooltip — so it no longer vanishes when a sidebar, context
  menu, or sheet steals the tooltip on hover.
- Highlights are computed from a settled, on-screen rect: the tour waits for the
  target to stop animating, scrolls it into view, and clamps the ring to the
  sheet viewport, so the ring lands on the target instead of off-screen or below
  the fold.
- The step instruction text was rewritten for clarity.
- The whispered tour-offer chat card header is now centered with no route icon
  (previously the icon sat left with the title mushed into the remaining width).

Closes #664
Closes #665
