---
"sohl": minor
---

**Arcane/Divine Incantation casting penalty**

Arcane and Divine Incantations now apply a **Level × 2** penalty to their
effective mastery level (EML), reflecting that higher-level spells are harder to
invoke. The penalty is added during preparation as a named, auditable delta
(**Level Penalty**) so it shows in the EML breakdown, and it stacks on top of
the associated convocation skill's mastery level. Level `0` and level-less
abilities add no penalty, and other Mystical Ability subtypes (talents, rites,
devotions, …) are unaffected.

Convocational _resistance_ — a caster's misalignment to a convocation — is
modelled separately as an Active Effect on the convocation skill and is inherited
into each spell's EML through the existing skill merge, so it composes with this
per-spell Level penalty.

Closes #969
