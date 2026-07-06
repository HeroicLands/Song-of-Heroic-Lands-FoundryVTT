---
"sohl": minor
---

**Skill base is a computed value; birthsigns are mysteries**

The skill base is now a plain number produced by a Foundry-free
`calcSkillBase(skillBaseFormula, actorLogic)` function, replacing the
`SkillBase` entity object. `SkillLogic.skillBase` is now a `number`.

- **Birthsigns are Mystery items of subtype `buff`.** Birthsign bonuses in a
  skill-base formula are matched by the mystery's shortcode, instead of a
  trait's hyphen-split `textValue`. A `subType` field was added to the Mystery
  data model — `buff` marks a birthsign — completing the field the mystery
  sheet already read. The field has a default, so no world migration is needed.
- **Formula evaluation follows the documented rules.** `@code` (optionally
  `@code:multiplier`) averages the actor's attribute scores by shortcode; the
  two-attribute up/down rounding rule, the single largest matching birthsign
  bonus, flat numeric modifiers, and the clamp to ≥ 0 all apply. This also
  fixes latent parser bugs in the old `SkillBase` (mis-detected birthsign
  terms and double-counted numeric modifiers).
- `SkillLogic.valid` and the Aura-based _no-fate_ rule now derive from the
  formula's attribute references, so they no longer depend on a `SkillBase`
  instance.
- The `SkillBase` entity class (`src/entity/skillbase/SkillBase.ts`) and its
  direct unit test are removed; `calcSkillBase` is covered by a new
  value-focused test that adds the previously-missing birthsign-bonus cases.
