---
"sohl": minor
---

**Migrate Privation and Fatigue content to Trauma items**

The taxonomy reorg (#565) moved Privations and Fatigue out of `AFFLICTION_SUBTYPE`,
but their compendium content was never migrated with it. The 10 Privation and 21
Fatigue items are now Trauma items:

- Privations become **Physical Condition** (`physcond`) traumas. Because Physical
  Condition categories are `trait`/`impediment`/`debility`, each privation's
  `category` is graded from its `levelBase` — `trait` (0–1), `impediment` (2),
  `debility` (3+).
- Fatigue items become **Fatigue** (`fatigue`) traumas, keeping their
  `FATIGUE_CATEGORY` (windedness / weariness / weakness).
- Affliction-only frontmatter (`diagnosisBonus`, `contagionIndex`, `transmission`)
  is dropped; `levelBase` / `healingRateBase` are retained.
- The items move under the Trauma compendium folders — Privations under
  _Trauma › Physical_, Fatigue under _Trauma_.

The now-Trauma-only `FATIGUE_CATEGORY` enum and its localization move from
`SOHL.Affliction.FATIGUE_CATEGORY` to `SOHL.Trauma.FATIGUE_CATEGORY`; the
affliction-only `PRIVATION_CATEGORY` enum and its localization are removed.

Closes #692.
