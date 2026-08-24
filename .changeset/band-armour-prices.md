---
"sohl": patch
---

Band every armour and clothing price: up to the next pence below 20d, up to the
next multiple of 5 pence at or above it.

164 of the 312 articles move. Prices were carrying derived precision that read
as false exactness — a cloak at 34.5d, a coat at 94.6d — because they came from
`coverage × material rate`, which lands off-integer for most articles and every
non-plain grade.

Price is authorial: an initial value may be derived that way, but the figure a
player sees is a design decision. Nothing depends on the derived precision any
more, since the coverage checksum that used to assert it has been retired in
favour of weight (#1716).

Prices rise slightly as a result — 3.8% on average, at most 19.6% where an
article sat just above the 20d threshold.
