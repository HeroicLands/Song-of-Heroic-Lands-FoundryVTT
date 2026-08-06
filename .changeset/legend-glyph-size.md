---
"sohl": patch
---

**Icon Legend** — glyphs now render at twice body size so they can be studied
(#1120).

The page previously drew each icon at inline text size, the same size it appears
at in the interface. That is fine for an icon you already recognise, but this
page exists for the opposite case: a reader learning the shape so they can spot
it later. The detail was too small to take in, most noticeably for the
game-icons artwork, which carries more detail than the Font Awesome silhouettes.

The size is applied to the glyph element, so the two icon families stay matched —
`ginf-` glyphs carry their own compensation for their smaller artwork, and the
em-based baseline shift scales with the element. The global icon metrics are
untouched; every sheet tab, context menu, and chat card renders exactly as
before.
