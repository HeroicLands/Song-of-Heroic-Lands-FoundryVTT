---
"sohl": minor
---

Give armour two properties it was faking, and delete 311 Active Effects.

**Perception was an effect; it is now a number.** Every armour article carried an embedded
Active Effect to apply its perception penalty — 311 of them, of which **302 applied zero**.
Each also carried a predicate string, repeated 311 times, naming which skills count as
perception-based:

    (doc.type==='skill' && doc.logic.hasAttr('per'))||(doc.type==='attribute' && ...)

That is a fixed rule about the system living in data, so changing it meant rewriting every
article. `perceptionPenaltyBase` replaces the lot: one number on the article, the rule
expressed once in code, and the 311 effects gone.

The **worst** worn penalty now applies rather than their sum — a great helm subsumes what a
mail cowl does to sight and hearing rather than compounding it. Summing was never a
decision; it was what independent effects happened to do. This matches how impaired body
parts penalize a test, where the worst of the role and limb penalties applies.

**Encumbrance groups.** An article's ENC applied whenever it was worn, but the small rigid
arm pieces do not work that way: a spaulder costs nothing alone, and wearing three or more
costs 5 between them. That threshold had been encoded as 1.67 per piece so a sum would
reach 5 — right at exactly three, and wrong everywhere else, charging a lone spaulder a
third and a full harness half as much again.

`encumbranceGroup` marks those thirteen articles instead. An article carries an encumbrance
value or belongs to a group, never both, and the threshold is charged once to the set.
Since worn armour contributes no weight, this is the whole of what an arm harness costs.

**Both are documented and visible.** The Gear rules gain an _Arm Harness_ rule under
Armor Encumbrance and a precise _Sensory Penalties_ rule stating that the worst worn
penalty applies rather than the sum; the generated armour tables gain Harness and
Perception columns, so a reader sees that a spaulder costs nothing alone but belongs to a
set; and both fields are editable on the armour sheet, with the encumbrance value disabled
for an article that belongs to a group.

Closes #1339.
