---
"sohl": patch
---

**Armor: Protection and Encumbrance are now editable (#1133)**

The Armor Properties tab gained a **Protection** section with _Blunt_, _Edged_,
_Piercing_, and _Fire_ inputs bound to `system.protectionBase.*`, and an
_Encumbrance_ input bound to `system.encumbrance` alongside the other gear
fields. Both values already drove play — protection is folded onto every covered
body location and subtracted from an impact, and encumbrance is added to the
wearer's while the armor is worn — but neither had an editor, so armor built on
the sheet protected for 0/0/0/0 and could only be corrected by editing the pack
source or running a script. Edits persist on change like every other sheet field.
