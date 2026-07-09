---
"sohl": patch
---

**Seed a default strike mode for new combat-technique skills**

Creating a `combattechnique`-subtype skill now seeds a default melee strike mode
(named after the skill) when none is supplied, so the item is immediately valid
and usable — a combat technique needs a strike mode for its Attack / Block /
Counterstrike to mean anything. Handled in `SkillDataModel._preCreate`; every
other skill subtype keeps a null strike mode.
