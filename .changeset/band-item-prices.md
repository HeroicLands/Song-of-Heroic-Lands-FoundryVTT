---
"sohl": patch
---

Band every armour, clothing and weapon price: up to the next pence below 20d, up to the
next multiple of 5 pence at or above it.

202 items move — 164 of 312 armour articles, and 38 of 82 weapons. Prices were carrying derived precision that read
as false exactness — a cloak at 34.5d, a coat at 94.6d — because they came from
`coverage × material rate`, which lands off-integer for most articles and every
non-plain grade.

Price is authorial: an initial value may be derived that way, but the figure a
player sees is a design decision. Nothing depends on the derived precision any
more, since the coverage checksum that used to assert it has been retired in
favour of weight (#1716).

Prices rise slightly as a result — 3.8% on average for both groups, at most
19.6% where an item sat just above the 20d threshold.

**Ammunition is deliberately excluded.** A `projectilegear` arrow costs 0.125d —
eight for a penny — so rounding up to the next whole pence would octuple it,
which is a balance change rather than a tidy-up.
