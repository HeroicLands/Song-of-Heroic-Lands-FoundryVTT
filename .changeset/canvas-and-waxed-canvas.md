---
"sohl": patch
---

Add Canvas and Waxed Canvas as armour detail materials, and fill nine gaps in the
existing fabric and fur columns.

Canvas is the heavy hemp plain-weave that makes sails, tents and working clothes, and
waxed canvas is that cloth driven through with wax and oil until it turns water. Neither
existed in the tree, which carried Buckram — glue-stiffened cloth — as its only stiff
coarse weave. Buckram is a poor stand-in: its size dissolves when wet, so it is the one
fabric that fails at exactly what a canvas cloak is for.

**Canvas and Waxed Canvas**, eleven articles:

| Article               | Code        | Weight | Value | Durability |
| --------------------- | ----------- | -----: | ----: | ---------: |
| Canvas Cloak          | `CvCloak`   |    2.1 |    31 |         11 |
| Canvas Cowl           | `CvCowl`    |    0.4 |     5 |         11 |
| Canvas Leggings       | `CvLeg`     |    2.3 |    32 |         11 |
| Canvas Robe           | `CvRobe`    |    5.0 |    71 |         11 |
| Canvas Surcoat        | `CvScoat`   |    3.4 |    49 |         11 |
| Canvas Tunic          | `CvTunic`   |    2.9 |    41 |         11 |
| Canvas Vest           | `CvVest`    |    1.5 |    22 |         11 |
| Waxed Canvas Cloak    | `WxCvCloak` |    2.6 |    45 |         12 |
| Waxed Canvas Cowl     | `WxCvCowl`  |    0.5 |     8 |         12 |
| Waxed Canvas Leggings | `WxCvLeg`   |    2.7 |    47 |         12 |
| Waxed Canvas Tunic    | `WxCvTunic` |    3.5 |    59 |         12 |

**Gaps filled in existing columns**, eight articles. The Trousers row had only four
entries against ten materials that carry Breeches; Ermine had no body garment at all
above a Shirt:

| Article          | Code     | Weight | Value | Durability |
| ---------------- | -------- | -----: | ----: | ---------: |
| Quilted Trousers | `QTrsr`  |    7.0 |   156 |         11 |
| Rawhide Trousers | `RhTrsr` |    6.0 |   156 |         11 |
| Leather Trousers | `LtTrsr` |    4.0 |   312 |          9 |
| Beaver Trousers  | `BvTrsr` |    4.8 |   468 |          9 |
| Ermine Tunic     | `ETunic` |    4.3 |  1080 |          7 |
| Ermine Robe      | `ERobe`  |    7.4 |  1896 |          7 |
| Beaver Robe      | `BvRobe` |    9.6 |   948 |          9 |
| Cloth Hood       | `CHood`  |    0.3 |     6 |         10 |

**Cloth Hood introduces a Hood article**, covering `skullloc` and `neckloc`. That is what
the tree already says a hood is: `Worsted Hooded Cloak` is a Cloak whose coverage is the
plain `Worsted Cloak` plus those two locations and nothing else, at +0.2 lb and +15d.
Converted to Cloth, that delta is 0.26 lb / 6.25d — which is Cloth Cowl's 0.3 / 6, the
same geometry from the other direction.

**These figures are interpolated, not transcribed.** Canvas does not appear in the Armour
& Clothing Articles table, and neither do the eight filled cells, so unlike the rest of
the armour tree these numbers were derived from the entries already in it. Weight and
value factor cleanly as _piece base_ × _material multiplier_ — exactly so within the metal
family, and within 10% across 95% of the tree. Canvas is the Buckram column at ×1.25
weight and ×0.90 value, Waxed Canvas at ×1.50 and ×1.305; Ermine runs ×24 the value of
Cloth and Beaver ×12, both confirmed independently against Cowl, Mantle, Shirt and Tunic.
`origValue` carries the exact derived figure where the shop price is rounded.

Durability carries the real difference for the new materials: 11 for canvas, above
Buckram's 10, and 12 for waxed canvas, since waxing is a preservative before it is
anything else. Nothing else sat at 12, which leaves it between the layered fabrics and the
metals.

**Protection is left at the tree's existing values**, which are `4/8/5/5` on every article
regardless of material. Once those carry real per-material figures, waxed canvas should
take a _fire penalty_ rather than any bonus — wax and oil impregnation is flammable, and
that is the only aspect where waxing changes what the material does.

Noted while deriving, and _not_ addressed here: ten cells in the hide family carry
Rawhide's exact weight and value — `Vest` and `Cap` under Leather, Beaver, Ermine and
Sealskin, plus Leather `Bracers` and `Long Vest`. The `value` field has been corrected on
all ten but `origValue` and `weight` still hold Rawhide's figures, which leaves an Ermine
Vest heavier than an Ermine Shirt. It is the same shape of fault as the Mail/Scale copy
already fixed, and wants the table rather than a derivation.

Also adds two silk containers — **Belt pouch, silk, sm** (`bpchsmslk`, 1.5 capacity, 432d,
0.3 lb) and **Belt pouch, silk, med** (`bpchmdslk`, 3 capacity, 864d, 0.6 lb), both
durability 1. Both are scaled by capacity from `Purse, silk`, the only silk container in
the tree, which is 288d / 0.2 lb at capacity 1.

_That anchor is worth a second opinion._ The Containers tree has no coherent price model
to derive from — `Bag, lg, canvas` and `Sack, canvas, 20 lb` are both canvas at capacity
20 and are priced 8d and 60d — and `Purse, silk` sits two orders of magnitude above the
leather belt pouches it most resembles (2d, 4d, 8d). Anchoring on the silk purse keeps the
silk items consistent with each other; anchoring on the leather pouch line and applying the
armour tree's silk premium (Silk ÷ Leather is ×1.125 by value) would instead give 2d and
5d. The first was chosen because material consistency is the principle used everywhere else
here, but the two readings differ by roughly 200×, and only the table settles it.

No code change: `detailMaterial` is a free-form content field with no enum, registry or
localization key behind it.
