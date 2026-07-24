---
"sohl": patch
---

Fix the Character Creation tour's create-actor step for a **collapsed sidebar**.
The step's `nav.sidebarTab` now **expands** the sidebar (not just selects the
Actors tab) — a programmatic `changeTab` doesn't auto-expand the way a user click
does, so a collapsed sidebar previously stayed collapsed and the Create Actor
button was never reachable. The spotlight also waits for the button's on-screen
rect to **settle** before ringing it, so the sidebar's expand animation no longer
leaves the ring placed where the button briefly was instead of where it comes to
rest. Closes #660.
