---
"sohl": minor
---

Add Canvas and Waxed Canvas as armour detail materials, and a Quilted Trousers article.

Canvas is the heavy hemp plain-weave that makes sails, tents and working clothes, and
waxed canvas is that cloth driven through with wax and oil until it turns water. Neither
existed in the tree, which carried Buckram — glue-stiffened cloth — as its only stiff
coarse weave. Buckram is a poor stand-in: its size dissolves when wet, so it is the one
fabric that fails at exactly what a canvas cloak is for.

Eleven articles, seven plain and four waxed:

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

**These figures are interpolated, not transcribed.** Canvas does not appear in the Armour
& Clothing Articles table, so unlike the rest of the armour tree these numbers were
derived from the one already in it. The existing 311 articles form a clean two-factor
table — weight and value factor as _piece base_ × _material multiplier_, exactly so within
the metal family and within 10% across 95% of the tree — so Canvas is the Buckram column
scaled by ×1.25 weight and ×0.90 value, and Waxed Canvas is ×1.50 and ×1.305. Canvas is
the heavier cloth and the cheaper one per yard; waxing is where the cost goes. `origValue`
carries the exact derived figure where the shop price is rounded.

Durability carries the real difference: 11 for canvas, above Buckram's 10, and 12 for
waxed canvas, since waxing is a preservative before it is anything else. Nothing else sat
at 12, which leaves it between the layered fabrics and the metals.

**Protection is left at the tree's existing values**, which are `4/8/5/5` on all 311
articles regardless of material. Once those carry real per-material figures, waxed canvas
should take a _fire penalty_ rather than any bonus — wax and oil impregnation is
flammable, and that is the only aspect where waxing changes what the material does.

Quilted Trousers fills a hole in the Quilted column, which had a Cuisse but no full leg
article, at 7.0 lb / 156d — a figure every path through the table agrees on.

No code change: `detailMaterial` is a free-form content field with no enum, registry or
localization key behind it.
