---
"sohl": patch
---

**Fix: migrate weapongear strike-mode `defense` to the nested block/counterstrike schema**

Every compendium weapongear stored strike-mode defense in the legacy flat
shape (`defense.blockMod` / `defense.counterstrikeMod`), but `MeleeStrikeMode`
now reads the nested schema (`defense.block` / `defense.counterstrike`, each
`{ disabled, modifier, successLevelMod }`). Embedding a compendium weapon on an
actor therefore threw `TypeError: Cannot read properties of undefined (reading
'modifier')` during `prepareData()`.

Migrate all 71 affected `_source` items (162 defense blocks) to the nested
schema, carrying each modifier value across and defaulting `disabled` to `false`
and `successLevelMod` to `0`. Verified against the licensed test container:
`gear-equip`, `combat-setup`, and `combat-automated` specs pass (compendium
weapons now embed without crashing).

Fixes #246
