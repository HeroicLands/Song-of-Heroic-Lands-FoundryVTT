---
shortcode: workshopqualifiers
name: {full: Workshop Qualifiers}
type: doc
subType: reference
description: "Use an explicitly selected Structure's workshop stars as a qualifier Target Number."
tags: [dev-reference]
data: {pack: none}
sohl: {kbcat: devdocs}
---

# Workshop Qualifiers

`StructureData.workshopRating` is an authored integer from zero through five. Its initial value is zero, meaning the Structure is not a rated workshop. One through five stars supply Target Numbers one through five respectively, following [[doc-crafting#workshop|The Workshop]]. The Structure header lets its owner edit the rating; read-only viewers can see it.

`sohl.entity.roll.workshopQualifierRoll(numDice, workshop, effectLadder, parent, rng?)` uses a workshop explicitly chosen by its caller. `workshop` is a Structure logic, `parent` owns the transient roll, and the optional random stream is the existing `Rng` interface. The wrapper resolves the workshop's authored stars and calls the same `qualifierRoll` primitive used by other routines. Each d10 succeeds at or below that Target Number, and the success count selects the caller's ladder entry.

The resolver rejects non-Structures, unrated workshops, fractional ratings and ratings outside one through five before drawing dice. Zero never becomes an automatic TN-zero failed roll. Ladder length and die count retain `qualifierRoll`'s existing validation.

For example, a player-invoked macro can choose a workshop and make two qualifier rolls:

```js
const workshop = game.actors.getName("The Forge")?.logic;
const crafter = game.user.character?.logic;
if (!workshop || !crafter) throw new Error("Select a workshop and a character.");
const outcome = sohl.entity.roll.workshopQualifierRoll(
  2,
  workshop,
  ["No masterwork successes", "One masterwork success", "Two masterwork successes"],
  crafter,
);
console.log(outcome);
```

The call returns recorded die values, a success count and its matching ladder entry. It makes no persisted changes to either actor. Call it only as part of an explicitly accepted player or GM action; allocation and resulting item changes belong to the caller's own routine.

Workshop selection is explicit. The helper does not infer a workshop from token location, enforce trade compatibility, or add Tool Quality. Other routines continue to supply their own numeric Target Numbers directly to `qualifierRoll`.

For authored Structures, use `sohl.system.workshopRating`. See [[doc-structureug|Structure]] for sheet controls and [[doc-crafting|Crafting]] for the game rules.
