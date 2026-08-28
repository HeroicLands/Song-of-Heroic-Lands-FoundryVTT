---
"sohl": minor
---

Add rings, earrings, amulets and necklaces in five materials — twenty finished
pieces of jewelry.

The Jewelry folder carried **materials** and nothing made from them: gold, silver,
copper/bronze and two dozen cut stones, all priced by the ounce. A character could buy
the metal but not the ring. These twenty articles fill that gap across four forms and
five materials, priced from the material notes already in the tree (gold 1200d/oz,
silver 60d/oz, copper and bronze 1d/oz, wood negligible) plus the jeweller's labour,
which dominates the cost of the base-metal pieces and disappears into the metal on the
gold ones.

Earrings are priced and weighed as a **pair**; the rest are single articles. Durability
tracks the metal rather than the form — gold is soft and takes 2, silver and copper 3,
bronze 4, wood 2.

| Article          | Code             | Weight | Value | Durability |
| ---------------- | ---------------- | -----: | ----: | ---------: |
| Ring, gold       | `ringgold`       |   0.03 |   600 |          2 |
| Ring, silver     | `ringsilver`     |   0.03 |    40 |          3 |
| Ring, bronze     | `ringbronze`     |   0.03 |     8 |          4 |
| Ring, copper     | `ringcopper`     |   0.03 |     6 |          3 |
| Ring, wood       | `ringwood`       |   0.02 |     2 |          2 |
| Earrings, gold   | `earringsgold`   |   0.02 |   400 |          2 |
| Earrings, silver | `earringssilver` |   0.02 |    30 |          3 |
| Earrings, bronze | `earringsbronze` |   0.02 |     5 |          4 |
| Earrings, copper | `earringscopper` |   0.02 |     4 |          3 |
| Earrings, wood   | `earringswood`   |   0.01 |     2 |          2 |
| Amulet, gold     | `amuletgold`     |   0.10 |  2000 |          2 |
| Amulet, silver   | `amuletsilver`   |   0.10 |   120 |          3 |
| Amulet, bronze   | `amuletbronze`   |   0.10 |    14 |          4 |
| Amulet, copper   | `amuletcopper`   |   0.10 |    12 |          3 |
| Amulet, wood     | `amuletwood`     |   0.06 |     4 |          2 |
| Necklace, gold   | `necklacegold`   |   0.25 |  5000 |          2 |
| Necklace, silver | `necklacesilver` |   0.25 |   300 |          3 |
| Necklace, bronze | `necklacebronze` |   0.25 |    35 |          4 |
| Necklace, copper | `necklacecopper` |   0.25 |    30 |          3 |
| Necklace, wood   | `necklacewood`   |   0.15 |     8 |          2 |

All twenty are `miscgear`, crafted with **Jewelcraft** (secondary Metalcraft, or
Woodcraft for the wooden pieces), and sit in the existing Jewelry folder.
