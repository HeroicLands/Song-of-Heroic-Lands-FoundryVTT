---
"sohl": patch
---

**Docs: the Mystical Ability Intrinsic Action in the User Guide**

The Mystical Ability page explained how an ability's Effective Mastery Level is
derived but never said how an ability is actually _invoked_ — the one action it
defines — and its property list had drifted from the schema.

- **Success Test** (`successTest`) is documented in full: shortcode, icon, API
  link, both ways it is invoked (the Actions context menu and the row's **EML**
  cell, Shift-clicked to skip the dialog), what it rolls, and the test-result card
  part by part. The standard test dialog is named and linked to **Base Item**
  rather than re-described.
- **Before you start** covers the two ways an invocation is refused — an
  **exhausted** ability and a Spirit Rite / Spirit Action with **no valid Spirit
  Power** — with the exact notice each produces, and states that a completed roll
  **spends a charge** while a cancelled dialog spends nothing.
- **Where It Appears** now describes the Mystical tab's per-sub-type ledgers
  column by column, including which columns each sub-type shows, that the EML cell
  _is_ the roll, and that a greyed row cannot be invoked.
- **Additional Properties** is reconciled with the schema: the nonexistent
  **Associated Mystery** entry is removed; the previously undocumented **Mastery
  Level** (used only when no skill governs the ability) and **Improvement Flag**
  are documented; **Level** and **Charges** gain their blank-value meanings (no
  level / unlimited / does not use charges); **Associated Skill** gains its
  Spirit-Power reading on the two spirit sub-types; and the sub-type list is
  corrected — the nonexistent _Spirit Incantation_ is dropped, the missing
  **Spirit Action** and **Divination** are added, and the sub-type is noted as
  fixed at creation.
- **The Incantation Casting Penalty** now says where the Level × 2 penalty is
  itemized (the **LvlPen** tooltip, and its own Adjustment row), and the page
  states that SoHL rolls the invocation but never applies the ability's effect.

Four defects found while writing the page are noted in place and filed: every
**modifier breakdown renders raw localization keys** on test cards and in the
standard test dialog (#1127), the Charges box's checkbox is **unlabelled and
inert** (#1129), the **☆ improve flag has no action to consume it** (#1130), and
the **Chgs/Max and Notes column headers collide** (#1131). The card's raw-key
title (#1107) is confirmed here too.

Closes #1068
