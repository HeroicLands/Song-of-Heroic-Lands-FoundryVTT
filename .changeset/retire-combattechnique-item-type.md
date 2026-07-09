---
"sohl": minor
---

**Retire the `combattechnique` item type**

Combat techniques are now a `combattechnique` **skill subtype** (introduced in earlier work), so the standalone `combattechnique` item type is removed: its DataModel, Sheet, and Logic classes, its registration, its item-type enum entry and metadata, and its localization keys are all gone.

**Combat machinery re-sourced from skills.** Reach, available/blockable/in-range strike modes, the melee-attack gating, and strike-mode pointer resolution now read technique strike modes off `combattechnique`-subtype skills (`SkillLogic.strikeMode` / `strikeModes`) instead of the retired item type.

**Combat-tab section removed.** The Being sheet's Combat tab no longer renders a dedicated Techniques section. Technique strike modes will resurface through the aggregated Strike Modes view (tracked separately); until then, techniques are edited on the skill sheet.
