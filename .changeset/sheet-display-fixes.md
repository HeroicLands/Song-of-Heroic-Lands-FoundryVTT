---
"sohl": patch
---

**Sheet display fixes: labels, archetype ordering, gear controls**

- Item sheets localize the subtype label: a combat skill now reads _Combat Skill_
  rather than the raw _combat Skill_, and the Skills tab _Notes_ column heading
  shows its localized text instead of the bare `SOHL.Skill.Heading.Notes.label`
  key.
- The create-item/actor dialog lists archetypes alphabetically by name; the
  default selection remains the top-priority winner.
- On the Being Gear tab, an armor row's three controls (worn, carried, menu) fit
  on a single row again, and the worn and carried toggle icons render light gray
  when off and dark when on instead of always looking active.

Closes #666
Closes #667
Closes #668
