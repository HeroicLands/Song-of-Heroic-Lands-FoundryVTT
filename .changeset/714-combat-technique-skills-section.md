---
"sohl": patch
---

**Combat Techniques on the Being sheet Skills tab**

Combat techniques (a `combattechnique` subtype skill) have a home on the Being
sheet's Skills tab: once a being has one, it renders as its own **Combat
Technique** subtype section alongside the other skill subtypes, with the
section's **+ Add** control to add more. Creating a combat technique seeds its
default strike mode (as every combat technique does on creation), so the
technique's own sheet then displays that strike mode on the Strike Modes tab.

The display subtype order is now a single Foundry-free constant
(`SKILL_DISPLAY_SUBTYPE_ORDER`) so it is unit-testable.

Closes #714
