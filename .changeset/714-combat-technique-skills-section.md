---
"sohl": patch
---

**Show Combat Techniques on the Being sheet Skills tab**

The Being sheet's Skills tab now always renders a **Combat Technique** section —
including when the being has none — so combat techniques (a `combattechnique`
subtype skill) have a home there and can be created with the section's **+ Add**
control. Previously the section only appeared once a combat technique already
existed, and never offered an Add control, so there was no way to create one from
the Skills tab.

Because creating a combat technique from that control seeds its default strike
mode (as every combat technique does on creation), the technique's own sheet then
displays its strike mode on the Strike Modes tab.

The display subtype order is now a single Foundry-free constant
(`SKILL_DISPLAY_SUBTYPE_ORDER`) so it is unit-testable.

Closes #714
