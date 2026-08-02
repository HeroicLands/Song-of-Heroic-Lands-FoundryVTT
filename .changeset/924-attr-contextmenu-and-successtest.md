---
"sohl": patch
---

**Attribute cards: stable context menu + a Success Test action**

Two fixes for the attribute cards on the Being Profile tab, reported together.

**Context menu no longer shifts the card (#924).** Opening a card's ⋮ menu used
to force `position: relative` onto the trigger element — a leftover in
`SohlContextMenu._setPosition` from Foundry's original in-target positioning.
SoHL instead appends the menu into the `.application` container and positions it
with container-relative coordinates, so the trigger's own position is never read;
the forced `relative` only dropped the absolutely-positioned corner ⋮ back into
flow, shoving the card's text, and — because nothing cleared the inline style on
close — the shift was permanent. The mutation is removed, so every context-menu
trigger (attribute, body-zone, body-part, body-location, effect) stays put.

**Attributes can run a Success Test (#925).** Every attribute has a Target Level
(its mastery level, effective score × 5, the "TL" shown on the card) and is now
rollable as a Success Test against it from the attribute context menu, exactly the
way a skill is. `AttributeLogic` gains a `successTest` intrinsic action and
executor delegating to `MasteryLevelModifier.successTest`.

Closes #924
Closes #925
