---
"sohl": minor
---

Record which skill produces every item, and make every craft catalog row name a real
one.

**The problem.** Nothing in the data said what makes an item — that lived only in which
catalog table a row happened to sit in. A generated table selects on frontmatter, so
"everything Weaponcraft makes" was inexpressible: a broadsword, a wood axe and a
quarterstaff are all weapon gear with nothing to tell them apart.

**Every gear item now declares its producer** and the Secondary Modifier skills that go
with the test. Coverage is total across all 847, because everything is produced by
someone — crafted, grown, brewed, milled, mined, hunted, or simply gathered, with
Survival as the floor. Armour is assigned by material and weapons by the Weaponcraft
marks; bows and crossbows go to Fletching rather than Weaponcraft, and slings to
Hideworking. Crops go to Agriculture, herds to Animalcraft, catch to Fishing, flour and
bread to Milling, drink to Brewing, ores and gems to Mineralogy, cut stones to
Jewelcraft, inks and dyes to Herblore.

**Thirteen more articles** join the compendium — the ones an earlier pass counted as
present because the only item of that name was the wrong material. A woodworker's
catalog was resolving to a copper cup, a canvas sack to a bag of salt, a tool hammer to
a war hammer. Adds the wooden cup, bucket and cages, the cabinet, canvas sacks, arrow
bag, buckram pouch, tarpaulin, horse blanket, plain hammer, and the padded cloak.

**All 160 catalog rows now resolve** to exactly one item. Three tables are split out
instead, because their rows are not possessions: a Vehicles table in Woodworking for the
wagon and cart, a building-materials table in Ceramics for brick and tile, and a glazing
table in Glassworking for window glass — the last two priced by the piece or the square
foot, where the quantity is a unit of measure. Fletching's projectile bundles expand onto
the real projectile items, noting that cost and time are per dozen.

Closes #1329.
