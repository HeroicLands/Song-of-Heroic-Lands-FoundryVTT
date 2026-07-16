---
"sohl": patch
---

**Show icons on Being list rows (#508)**

Skill rows (and injury/gear/affiliation rows) rendered without their icon: the
skills row emitted no image element, and the shared `.list__image` had no size so
it collapsed. `buildSkillGroups` now carries each skill's `img`, the skills
template renders it, and `.list__image` is sized in the Being styles so every
list row shows its icon.
