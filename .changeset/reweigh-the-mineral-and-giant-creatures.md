---
"sohl": patch
---

Reweigh the mineral and giant creatures, and bring the three stone giants down
to a size the setting can hold
([#1240](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1240)).

Every creature made of stone, iron, clay, crystal, ice or lava was priced as
though it were made of meat. The Mountain Troll's own text says it "weighs as
much as a small cottage" and the data said 500 lb — half a horse. Eight
Elementals carried no weight at all.

Weights are now computed from each creature's described dimensions and the
density of what it is actually made of. A humanoid of height H occupies
`2.9 × (H/6)³` cubic feet — a six-foot, 180-pound person at water density —
times a bulk factor for a frame heavier than human proportions; a quadruped is
anchored on a seven-foot, 400-pound feline. Densities: wrought iron 480,
stone and crystal 165, lava 175, fired clay 120, wet mud 105, ice 57, flesh 64.

**Three giants were also too large for the setting.** A Lithogiant at forty to
sixty feet dwarfed the Old Dragon, which should be among the biggest and
fiercest things in the world. The Boulderback is now fifteen feet of fitted
boulders, the Stonebeast twenty feet of blocky stone (read as length, which is
what a quadruped's measurement means), and the Lithogiant twenty-five to thirty
feet.

The Terrakith Sentinel keeps its 1000 lb: eight feet of clay at 120 lb/ft³ is
almost exactly that, so it was right all along. The Ironjaw keeps its 250 lb —
it is a wolf wearing metal, not a wolf made of it.

Body weight is descriptive; encumbrance keys off carried gear, so none of these
figures change how a creature behaves in play.
