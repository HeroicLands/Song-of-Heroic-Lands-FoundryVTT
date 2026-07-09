---
"sohl": minor
---

**Reimplement the Being sheet Skills tab**

The Being sheet's Skills tab now renders skills grouped by subtype, matching the
Traits and Affiliations sections.

- **Grouped sections.** Skills are grouped into the six display subtypes
  (Social, Nature, Craft, Lore, Language, Script), each shown as its own
  fieldset with a localized legend. Every defined subtype is always emitted —
  even when empty — so its seeded **"+ Add"** control stays reachable. Any
  additional subtype present on a skill but outside the display order is
  appended after the ordered ones, so nothing is dropped.
- **Columns.** Each row shows **SB / ML / Index / EML / Fate**. When a skill's
  mastery level is disabled, the Index and EML cells render an ✕ in place of the
  number. The ML cell remains rollable (shift-click skips the dialog).
- **Skill-development star.** Skills eligible for improvement show a star in the
  row controls that toggles the skill's `improveFlag` — a filled star when set,
  an outline star when not.

The pure grouping logic lives in a new Foundry-free `buildSkillGroups` helper,
unit-tested alongside `buildTraitGroups`.
