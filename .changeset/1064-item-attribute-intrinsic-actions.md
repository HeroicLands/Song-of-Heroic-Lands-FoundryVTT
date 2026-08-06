---
"sohl": patch
---

**Docs: the Attribute Intrinsic Actions in the User Guide**

The Attribute page described four properties — one of which does not exist — and
none of the two actions an Attribute defines, even though every attribute is
rollable in its own right against a Target Level of score × 5.

- **Both actions** — **Success Test** (`successTest`) and **Opposed Test**
  (`opposedTestStart`) — each with its shortcode, icon, API link, how it is invoked,
  what it rolls, and where it refuses. The standard test dialog is named and linked
  to **Base Item** rather than re-described, and the opposed-test flow (targeting,
  both cards, the responder's dialog, victory degrees) is linked to **Token**.
- **The test-result card** is documented part by part, and the two things that
  change an attribute roll for you — the score × 5 target, and the **Impaired By
  Roles** injury penalty (−5 / −10, or an automatic critical failure on an unusable
  part).
- **Where It Appears** now describes the Profile-tab attribute card control by
  control (name, ⋮ menu, score with its derivation tooltip, descriptor, TL), and
  states plainly that — unlike a skill's EML cell — **nothing on the card is
  click-to-roll**, so there is no Shift-click shortcut past the pre-roll dialog.
- **Additional Properties** is corrected against the schema: the **SubType** entry
  is removed (Attribute has no such field, and the three "traid categories" it
  listed do not exist), **Value Descriptors** gains the band-matching rule that
  picks the word shown under the score, and the previously undocumented **Impaired
  By Roles** is documented.

Four defects found while writing the page are noted in place and filed: the Score
and Init Dice Formula fields render with **empty labels** (#1105), **no Fate can be
spent on an attribute test** although the rules allow it (#1106), the test-result
card's **title shows a raw text key** rather than the test's name — on skills as
well as attributes (#1107), and the **Init Dice Formula is never rolled** by
anything (#1108).

Closes #1064
