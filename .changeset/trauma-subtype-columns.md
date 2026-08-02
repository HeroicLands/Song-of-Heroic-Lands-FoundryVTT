---
"sohl": minor
---

**Trauma: per-sub-type columns on the Being sheet and fields on the item sheet**

Each Trauma sub-type now presents only the columns and fields that matter to it,
instead of every sub-type sharing one generic injury layout.

- **Being sheet (Trauma tab).** A sub-type's section still appears only when it
  has at least one trauma, but now shows a sub-type-specific column set: Fatigue →
  Category / FL / Notes; Fear & Morale → Category / Notes; Pall → PSL / Next Pall
  Recovery; Psychological Condition → PSY / Category / Next PSY Recovery Test;
  Physical Condition → Category / Notes; Aural Shock → ASL / Next AS Recovery
  Test; Injury & Infection → Sev / HR / Area / Next Heal Test; Shock & Coma → HR /
  Next Course Test. Every "level" column (FL / PSL / PSY / ASL) renders the level
  modifier.
- **Trauma item sheet.** The Properties tab now shows only the fields relevant to
  the sub-type, plus `contractDate` for all. Injury and Infection add
  `treatmentDate`, body location, and the healing-check interval (with a computed
  Next Heal Test); Injury also adds the infectable and permanent-impairment flags;
  Shock and Coma add the course interval (with a computed Next Course Test). The
  sub-category field is a proper select for Fatigue / PsychCond / PhysCond.
- **Next-test dates are view-only.** "Next Heal / Course / Recovery Test" is
  derived from the recurring schedule in `system.scheduledActions` — nothing is
  auto-armed (consent model), so it shows an em-dash when no test is scheduled.
- `TraumaLogic.categoryLabel` now localizes the Psychological- and
  Physical-Condition sub-categories (previously only Fatigue).

Closes #939
