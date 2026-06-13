---
"sohl": patch
---

**Correct valueDesc element localization keys in en.json**

Fixes [#55](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/55):
the `Trait.valueDesc` element subfields now localize under
`valueDesc.element.label.*` / `valueDesc.element.maxValue.*`, matching Foundry's
array-of-schema convention. This removes the key collision that aborted
localization on world load and places the keys where the field auto-localizer
looks them up.
