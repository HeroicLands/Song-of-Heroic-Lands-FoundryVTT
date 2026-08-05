---
"sohl": minor
---

**Affiliation as capability credential: rank moves off Skill onto Affiliation**

Religious rank and arcane grade were being approximated by a `level` on ritual and
arcane **Skills** — a bolt-on with no mechanical weight. That standing now lives on
its proper semantic home, **Affiliation** (`Affiliation.level`), establishing
Affiliation as the credential and Mystery / Mystical Ability as the capabilities it
informs.

- **Retired `Skill.levelBase`.** The Skill schema field, its `SkillLogic.level`
  modifier, and the Skills-tab **Lvl** column are removed. A world migration
  (version `0.8.0`) strips the dead `system.levelBase` key from skill items. This is
  a clean break: no data links a Skill to the Affiliation it would belong to, so the
  value is dropped rather than moved — standing is re-entered on the Affiliation's
  **Level**.
- **Affiliation rank is usable in `SafeExpression` formulas.** A skill's **Skill Base
  Formula** can now reference `affiliation.<code>.level` (by an affiliation's
  shortcode) alongside `attr.<code>`, so a mystical skill's base can scale with the
  character's grade in a church or arcane school. Unknown affiliations resolve to a
  benign `0`, mirroring the zero-defaulting `attr` namespace. `AffiliationLogic`
  exposes a `level` getter as the stable seam for this derivation.
- **Mystical Ability standing.** The `assocAffiliationCode` association (already
  present) resolves to `assocAffiliation` during `evaluate()`, so an individual
  ability subtype can consult its affiliation's rank. No gating or EML change is
  imposed here — the affiliation only _informs_ a derivation; the player still
  triggers every invocation.

Documentation updated: the Affiliation, Skill, and Mystical Ability user-guide pages
and the Skills rules page reflect the new credential model, and the Expressions dev
doc documents the Skill Base bindings.

Closes #1000
