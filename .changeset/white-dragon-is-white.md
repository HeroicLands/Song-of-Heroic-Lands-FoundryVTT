---
"sohl": patch
---

**The white coiled-dragon mark is actually white** (#1311)

`assets/icons/brand/sohl-dragon-white.svg` shipped filled `#000000` — byte-identical
to the black original apart from a stripped comment — so the variant intended for dark
grounds rendered as a black shape on them. Both paths are now `#FFFFFF`.

- _The trademark notice is restored._ The file had lost the comment recording that the
  coiled-dragon service mark is All Rights Reserved and is **not** covered by
  CC-BY-SA-4.0 or GPL-3.0. Since `assets/` is CC-BY-SA-4.0 by default and this mark is
  carved out of it, that notice is the only record of the exclusion inside the file
  itself. It was regenerated from the black original rather than retyped, so the
  wording matches exactly.
- _Geometry is untouched._ Both path definitions and the `viewBox` are unchanged from
  `sohl-dragon.svg`; only the two fill values differ.
