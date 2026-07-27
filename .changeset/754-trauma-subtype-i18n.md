---
"sohl": patch
---

**Localize the Sub-type labels on the Trauma sheet**

The **Sub-type** select on a Trauma's properties tab now shows its localized
labels (**Injury**, **Fear**, **Shock**, …) instead of the raw localization keys
(`SOHL.Trauma.SubType.physical`). The control's `formGroup` was not passing
`localize=true`, so Foundry rendered the choice map's i18n keys verbatim; the
keys themselves were already present in `lang/en.json`. Parallels the Skill sheet
Combat Category fix (#751).

Closes #754
