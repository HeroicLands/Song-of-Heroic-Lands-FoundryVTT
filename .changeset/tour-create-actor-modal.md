---
"sohl": patch
---

Fix the Character Creation guided tour's opening step, which was effectively
modal — Foundry's tour overlay blocked all input, so the user could not click
the sidebar to create their character. `SohlTour` now lets pointer events pass
through the fade/overlay on **every** step (not just gated ones), so a
coach-and-wait tour never blocks the app it is coaching. The opening step is
also split into two clearer highlight steps — highlight the **Actors** sidebar
tab, then (auto-opening the Actors directory) highlight the **Create Actor**
button — via a new `nav.sidebarTab` scene-setting option. Closes #656.
