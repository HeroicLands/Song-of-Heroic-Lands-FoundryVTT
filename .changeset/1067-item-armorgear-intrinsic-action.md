---
"sohl": patch
---

**Docs: the ArmorGear Intrinsic Action in the User Guide**

The Armor page described what armor is and how encumbrance treats it, but never
documented **Toggle Worn** — the one action armor adds, and the switch that decides
whether a piece of armor protects anything at all.

- **Toggle Worn** (`toggleWorn`) is documented in full: shortcode, icon, API link,
  both places it can be invoked (the shield button on the Gear tab row and the ▶ on
  the armor's Actions tab), what it changes, and the fact that it opens no dialog,
  rolls nothing, and posts no chat card.
- **What the numbers do** is now a table: worn armor adds its Blunt / Edged /
  Piercing / Fire values to every covered body location (visible in the Combat tab's
  body-locations table, alongside its Material) and adds its own Encumbrance value,
  while carried-but-unworn armor protects nothing and counts its full weight as
  load. The two consequences that surprise people are stated plainly — **layers
  stack** at shared locations, and **putting armor on can make a character lighter**,
  because worn armor stops counting as carried weight.
- **The carried gate** is described as the action's precondition (greyed shield
  button, disabled Worn checkbox, refusal however it is invoked), and setting armor
  down is stated to take it off in the same stroke. The standalone _Wearing Requires
  Carrying_ section is folded into it rather than saying the same thing twice.
- **Inherited actions are linked, never restated**: **Toggle Carried** to **Gear**,
  and **Edit** / **Delete** / **Output Description to Chat** to **Base Item**. Armor
  is stated to define no hidden actions.
- **Additional Properties** gains how coverage is authored (shortcode entries, and
  that a location named in both lists is covered once and counts as rigid) and what
  Material controls on the Combat tab.

Four defects found while writing the page are noted in place and filed: every
carried-gated gear action — armor's **Toggle Worn**, a weapon's attack and defence
tests — is **missing from the Gear tab's context menu even while the item is
carried**, because no sheet emits the `data-actor-id` the visibility check needs
(#1132); the armor sheet has **no editor for Protection Base or Encumbrance**, so
hand-built armor protects for 0 (#1133); the Actions tab offers an active ▶ for a
gated action that **silently does nothing** (#1135); and every intrinsic action row
renders an **empty icon** because the template reads `data.img` while actions carry
`iconFAClass` (#1136).

Closes #1067
