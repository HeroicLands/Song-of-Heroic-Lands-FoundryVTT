---
"sohl": patch
---

**Fix: the Façade tab no longer leaks its content onto every Being-sheet tab**

The Façade tab's portrait and Appearance editor were rendering on **every** tab of
the Being sheet, stacked above the active tab's own content. `_facade.scss`
declared `display: flex` directly on `.facade`, which is the `.tab` element itself
(`<section class="tab facade …">`); that unconditional `display` overrode Foundry's
inactive-tab hiding (`.tab:not(.active) { display: none }`). None of the other tab
partials re-declare `display` on their `.tab` element, so only Façade leaked.

The flex layout is now gated to the active state (`.facade.active`), so an inactive
Façade tab collapses to `display: none` like every other tab.

Closes #812
