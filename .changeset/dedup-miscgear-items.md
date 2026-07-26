---
"sohl": patch
---

**Remove five duplicate Misc_Gear items**

Five Misc_Gear items were accidental duplicates — an `_2` copy that reused the
original's `slug` (with a `2`-suffixed shortcode): Oats, Pie (Meat), Pie (Fruit),
Bell (tiny), and Clappers (bone). The shared slug collided in the KB build (one
page silently overwrote the other), and the duplicates padded the compendium. The
`_2` copies are removed; nothing references their shortcodes.

Closes #703.
