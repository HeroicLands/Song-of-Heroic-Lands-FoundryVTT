---
"sohl": patch
---

**Localize the Combat Category labels on the Skill sheet**

The **Combat Category** select on a combat Skill's properties tab now shows its
localized labels (**Melee**, **Missile**, **None**, …) instead of the raw
localization keys (`SOHL.Skill.Combat.melee`). The control's `formGroup` was not
passing `localize=true`, so Foundry rendered the choice map's i18n keys verbatim;
the keys themselves were already present in `lang/en.json`.

Closes #751
