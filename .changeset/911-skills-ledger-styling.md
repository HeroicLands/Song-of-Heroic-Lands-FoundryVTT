---
"sohl": patch
---

**Skills ledger styling polish (Manuscript)**

The Being sheet's shared `.ledger` table now reads as intended in the Manuscript
direction. Skill icons sit as **black-on-transparent line art** directly on the
vellum — the opaque bordered "stamp" well behind each icon is gone — and the icon
is a touch larger. Row, cell, notes, and header fonts are slightly larger with a
**more compact row rhythm**, and the numeric column headers (SB / ML / INDEX /
EML / FATE) are now **centered over their columns**, while Skill and Notes stay
left-justified and clip with an ellipsis on overflow. The "Search Skills"
placeholder now renders as a **faint** prompt rather than near-black input text.

These changes are on the shared ledger component, so they apply consistently to
every ledger section on the Being sheet.

Closes #911
