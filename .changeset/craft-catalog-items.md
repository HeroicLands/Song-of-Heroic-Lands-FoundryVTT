---
"sohl": minor
---

Add the 42 articles that the craft catalogs price but the compendium did not contain,
so a character can actually own what a crafter is told they can make.

**What is new.** Ceramics gains its own ware — amphora, jug, pot, urn, vase, lidded box
and bottle, plus ceramic bowl, plate, beads and icon, which previously existed only in
copper, pewter or glass. Woodworking gains barrels, a trunk, chest and box, the furniture
of an ordinary household (bed, bench, chair, table, ladder), and the haulage pieces
(wheel, wheelbarrow, ox yoke). Metalcraft gains the wagon axle, ploughshare, scythe and
spade; Glassworking, lenses and an hourglass; Perfumery, three grades of perfume, three
oils and soap; Textilecraft, a silk purse and a wool carpet; Hideworking, a leather bag;
and Fletching, the lever and windlass crossbow spanners.

**Types.** Anything that holds something is `containergear` with `maxCapacity` set in
pounds of contents, following the existing convention of roughly two pounds per quart;
everything else is `miscgear`.

**A new Furniture folder** joins the Misc_Gear tree, since a bed or a table fits none of
the existing categories. Its colour was chosen by the documented palette method rather
than by eye — white-text contrast 6.33:1 against a 4.5:1 floor, and a minimum OKLab
distance of 0.188 from its siblings against a 0.12 floor.

**Where the numbers come from.** Ceramics, Glassworking, Woodworking and Perfumery
catalogs list a sale price, which is used directly. Metalcraft, Textilecraft, Hideworking
and Fletching list only material cost and labour, so value is derived at six times
material cost — the one multiplier the rules state, given under Lockcraft. Weights for
those articles are estimated from their real-world equivalents.

Deliberately excluded, and left as hand-authored catalog rows: wagons and carts, which
belong with the vehicle concept rather than gear; brick, tile and window glass, which are
priced per unit area rather than per object; and the fletching bundles, which map onto
the existing per-head-type projectiles.

Closes #1327.
