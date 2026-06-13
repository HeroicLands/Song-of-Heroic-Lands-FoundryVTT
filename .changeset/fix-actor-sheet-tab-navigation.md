---
"sohl": patch
---

**Repair actor sheet tab navigation**

Fixes [#53](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/53):
the Being actor sheet crashed on render, and tab content rendered hidden on all
actor sheets (Being, Cohort, Structure, Vehicle, Assembly). The Being `tabs` part
now uses Foundry's core navigation template, and every actor tab section resolves
its `active` state and tab group so the correct tab body is shown.
