---
"sohl": patch
---

Make the Character Creation tour's create-actor step actually guide the user, and
stop dialogs being shadowed. The step now **selects the Actors tab itself** and
**spotlights the Create Actor button** (a bright fade ring on the button) while
the step card stays **centered and stable** — previously the card was anchored to
the sidebar via Foundry's shared tooltip, which the sidebar's own hover-tooltips
hijacked, so it vanished the moment the user moved onto the sidebar and never
returned. A new `SohlTour` `spotlight` step option provides this (ring the target
without tooltip-anchoring the card), and a new `nav.sidebarTab` scene-setting
option opens a sidebar directory first so its control is visible to ring.

Dialogs the user must read or type in are **no longer shadowed** by the tour fade:
while a tour runs, open dialogs are lifted above the fade. Closes #658.
