---
"sohl": minor
---

**Add a Skill level and a Skills-tab Level column**

Skills gain a numeric `levelBase` property (default `null`) and a derived `level`
`ValueModifier` seeded from it, mirroring the Mystery `levelBase` → `level`
pattern.

- **`level` modifier.** Seeded from `levelBase` in `SkillLogic.initialize`. A
  `null` base means the skill has _no level_ and leaves the modifier disabled; a
  stored `0` is a real level and stays enabled.
- **Level column.** The Being sheet's Skills tab now renders a **Level** column
  immediately after the skill name (before Skill Base). It shows the level, or an
  ✕ (`fa-xmark`) when the level is disabled.

No migration is required — the field defaults to `null`, so a skill whose source
omits `levelBase` initializes to "no level".

Documentation: the skill's User Guide entry now documents the **Level** property,
and a new **Skill Levels** rules journal explains the level/circle concept for
arcane and divine/ritual skills.

Closes #992
