---
"sohl": minor
---

**KnowledgeBase home catalog and consistent section landings**

The KB home page now leads with three large hero-image cards — Developer
Documentation, User Guide, and Rules — followed by a "Content reference" catalog
where every category is a boxy card with a 1792×768 hero banner. **Actors**
(Characters, Creatures) and **Gear** (Armor/Clothing, Containers, Misc Gear,
Projectiles, Weapons) are set off as their own bordered groups; Afflictions,
Mystical Abilities, Skills/Attributes, and Trauma sit alongside.

To support the Actors group, the KB build (`utils/build-kb-content.mjs`) now
routes `character` and `creature` content to their own `/character/` and
`/creature/` sections (previously a combined `beings` section), and emits an
empty titled landing for an actor subtype that has no content yet — so a browse
button always resolves rather than 404ing.

The KB now also includes `package: thalorna` content (previously `sohl`-only), so
Thalorna creatures and characters appear in the catalog alongside the core SoHL
content.

Each content section landing now shows its friendly title and hero banner (via a
generated `_index.md`) instead of Hugo's auto section name, and renders in a
consistent format:

- **Tables** — Weapons and Armor (grouped by `kbcat`), Misc Gear (grouped tables),
  Containers (+ Capacity) and Projectiles, all sharing Name / Shortcode / Package /
  Dur / Weight / Value plus type-specific columns; and Characters / Creatures
  attribute tables (the Creatures page grouped by source subfolder, recorded as a
  `kbfolder` param since the KB tree is otherwise flat).
- **"Name (shortcode) + description" rows** — Afflictions, Mystical Abilities, and
  the ungrouped default sections via a `_default/list.html` override; Skills/
  Attributes and Trauma render the same rows grouped by `kbcat`.

The KB also now includes `package: thalorna` content (previously `sohl`-only), so
Thalorna creatures and characters appear alongside the core SoHL content.

The developer docs (`/dev/`), user guide (`/guide/`), and rules (`/rules/`) each
render their README as the section landing (curated index + hero banner). The
Rules are split into their own `/rules/` section (a `type: doc` page now routes
by its top-level source folder), with redirects from the old `/guide/sohl-*`
URLs. Obsidian-style `[[wikilinks]]` in the content now resolve to KB pages
(by filename, slug, or name). KB layouts and build only; no system-package
impact.
