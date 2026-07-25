---
"sohl": minor
---

**KnowledgeBase home: content catalog with set-off Actors and Gear groups**

The KB home page now leads with Developer Documentation, User Guide, and Rules,
followed by a "Content reference" catalog of browse buttons. **Actors**
(Characters, Creatures) and **Gear** (Armor/Clothing, Containers, Misc Gear,
Projectiles, Weapons) are set off as their own bordered groups; Afflictions,
Mystical Abilities, Skills/Attributes, and Trauma sit alongside as standalone
buttons.

To support the Actors group, the KB build (`utils/build-kb-content.mjs`) now
routes `character` and `creature` content to their own `/character/` and
`/creature/` sections (previously a combined `beings` section), and emits an
empty titled landing for an actor subtype that has no content yet — so a browse
button always resolves rather than 404ing.

The KB now also includes `package: thalorna` content (previously `sohl`-only), so
Thalorna creatures and characters appear in the catalog alongside the core SoHL
content. KB layouts and build only; no system-package impact.
