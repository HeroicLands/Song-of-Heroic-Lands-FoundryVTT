---
"sohl": patch
---

**Birthsigns combine by taking the best aptitude, and the twelve cusp signs are
gone.** A cusp was never a sign in its own right: its modifiers are the
elementwise maximum of the two signs it sits between. Holding that derived
result as twelve more content files meant nothing enforced the derivation
(editing a principal sign silently desynchronised its two cusps), nothing stated
it, and a birth under three signs could not be expressed at all. Closes #1378.

**A generic aptitude field.** Mysteries carry `system.skillAptitudes` — a map of
selector to mastery-level modifier, where a selector is a skill shortcode or
`subType:<value>`. Nothing about it is birthsign-specific; any item asserting an
innate leaning toward or away from a class of skills can carry one.

**Aptitudes never sum.** Where several items speak to one selector, the
_greatest_ value wins, and a skill matched both by shortcode and by subtype takes
the greater of the two. Each aptitude-bearing item merges into the being's
accumulator during the evaluate phase; each skill applies its own entry as a
single `Aptitude` delta on its mastery level during finalize. A selector matched
at `0` adds no delta, though the `0` still counts in the merge — an element left
untouched beats one another sign hinders.

**What this means in play.** One sign behaves exactly as before. Two neighbouring
signs — a birth on the threshold — reproduce the former cusp values precisely,
including the +15 standing surplus, the +15 peak, and the −10 floor, which the
rules now state as a consequence of the rule rather than leaving as an unexplained
property of half the wheel. Three or more signs keep climbing, which the rules
frame as a deliberate GM choice.

**Migration.** None is required. A birthsign already embedded on an actor keeps
the Active Effects it was created with and carries no aptitude map, so it neither
breaks nor double-counts — including a cusp item, whose baked-in values are
already the maximum of its neighbours.
