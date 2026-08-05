---
"sohl": minor
---

**Affiliation as capability credential: retire the Skill.level bolt-on**

Religious rank and arcane grade were being approximated by a `level` on ritual and
arcane **Skills** — a bolt-on with no mechanical weight. That standing belongs on
**Affiliation** (`Affiliation.level`), establishing Affiliation as the credential and
Mystery / Mystical Ability as the capabilities it informs.

- **Retired `Skill.levelBase`.** The Skill schema field, its `SkillLogic.level`
  modifier, and the Skills-tab **Lvl** column are removed. This is a pre-Beta clean
  break — no migration; standing is recorded directly on the Affiliation's **Level**.
- **`AffiliationLogic.level`** is exposed as the stable seam for reading a character's
  rank. The `assocAffiliationCode` association (shipped in #1012) already resolves to
  `assocAffiliation` during a Mystical Ability's `evaluate()`, so an individual
  ability subtype can consult its affiliation's rank. No gating or EML change is
  imposed here — the affiliation only _informs_ a derivation; the player still
  triggers every invocation.

Documentation updated: the Affiliation, Skill, and Mystical Ability user-guide pages
and the Skills rules page reflect the credential model (the Skill "Level / Circle"
concept is retired).

Closes #1000
