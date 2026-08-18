---
aliases:
  - Armor
  - doc-armor
id: yh3LCFXRlhJWMqLW
type: doc
package: sohl
category: user-guide
name:
  full: "Armor"
shortcode: armor
folder: QtOgPodi8X6gDWL0
---

# What Is Armor?

Armor represents a wearable piece of protective equipment or normal clothing — a mail hauberk, a cloth surcoat, a linen shirt, a leather jerkin, leather sandals, a great helm, a wool dress, greaves, etc. When worn by a Being, armor provides protection at the body locations it covers, reducing the damage from incoming attacks. A single piece of armor can cover multiple body locations, and multiple pieces of armor can be layered for additional defense.

# Where It Appears

Armor belongs to Beings. It appears on the Being sheet's **Gear** and **Combat** tabs. Each Armor item specifies the protective aspects that define exactly which body locations it covers and how much protection it provides at each one. When armor is equipped, these protective values are factored into combat resolution.

Armor items are typically added from compendium packs that define standard equipment.

# Additional Properties

In addition to the [[doc-itemgear|Standard Gear Properties]], the following additional properties are defined for armor:

- **Material:** The type of material the armor is constructed from (chain, leather, kurbul, cloth, etc.). This is the word that appears in the **Material** column of the Combat tab's body-locations table for every location the armor covers.
- **Flexible Locations:** Body locations covered by flexible portions of this armor. Add one with **Add Flexible Location** and remove one with the 🗑 beside it; each is a body-location shortcode such as `thrxloc` (Thorax) or `skullloc` (Skull).
- **Rigid Locations:** Body locations covered by rigid portions of this armor (e.g., breastplate). A location named in **both** lists is covered once, and counts as rigid.
- **Encumbrance:** Specific encumbrance value used when equipped.
- **Protection Base:** For the four standard aspects-Blunt, Edged, Piercing, and Fire-the numbers here represent impact that is absorbed by the armor.

> **Known gap.** The last two — **Encumbrance** and **Protection Base** — are real properties of every armor item and are used in play, but the armor sheet has **no fields for them** (issue #1133). The Properties tab stops at Material and the two location lists. Until that is fixed, armor built by hand on the sheet protects for 0 against every aspect; take armor from a compendium pack, where the values are already set, and check them on the Combat tab (see [[#toggle-worn|Toggle Worn]]).

# Encumbrance

Armor and clothing that is worn (i.e., equipped) does not have any encumbrance, regardless of its weight. This is due to the distribution across the body, which is such that it normally does not cause any movement difficulty when worn. However, if there is a specific encumbrance value, then that is used as the encumbrance of that armor when equipped.

When not worn but carried (i.e., carried but not equipped), the armor does have encumbrance based on its weight. In this case any encumbrance value is ignored, since the weight determines its encumbrance instead.

# The Armor Actions

Armor adds one action of its own to the ones every piece of gear carries:

| Action                        | Shortcode    | Where you meet it                                     |
| ----------------------------- | ------------ | ----------------------------------------------------- |
| [[#toggle-worn\|Toggle Worn]] | `toggleWorn` | The 🛡 button on the Gear tab row, or the Actions tab |

Everything else on an armor item is inherited and documented elsewhere: **Toggle Carried** belongs to all gear and is described on [[doc-itemgear|Gear]], and **Edit**, **Delete**, and **Output Description to Chat** belong to every item and are described once on [[doc-baseitem|Base Item]]. None of them behaves differently on armor.

Armor defines **no hidden actions** — Toggle Worn is the whole of what armor adds, and it neither rolls anything nor posts anything to chat.

# Toggle Worn {#toggle-worn}

|               |                                                                                                                                |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Name**      | Toggle Worn                                                                                                                    |
| **Shortcode** | `toggleWorn`                                                                                                                   |
| **Icon**      | `fa-shield-halved` (a shield split down the middle)                                                                            |
| **Invoked**   | The 🛡 button on the armor's Gear tab row, or the ▶ beside _Toggle Worn_ on the armor's own **Actions** tab                    |
| **API**       | [`ArmorGearLogic.toggleWorn`](https://www.heroiclands.org/sohl/api/classes/sohl.document.item.logic.ArmorGearLogic#toggleworn) |

## What it does and when to use it

**Toggle Worn** flips the armor's **Worn** property: armor that was on the character's body comes off, and armor that was merely carried goes on. It is the difference between owning a hauberk and wearing one.

**Only worn armor protects.** Armor that is carried but not worn is just weight in a pack: it contributes nothing to any body location, and a blow that lands there is resolved as though the character had nothing on. So this is the action to reach for whenever what the character has _on_ changes — arming before a fight, stripping a helm to hear better, peeling off a mail shirt to swim, putting a cloak on against the cold.

## Before you start

**The armor must be carried.** Toggle Worn is refused while the armor's **Is Carried** is false — you cannot put on something that is not on your person. While the armor is not carried:

- the 🛡 button on the Gear tab row is greyed out, with the tooltip _"Armor must be carried before it can be worn"_;
- the **Worn** checkbox on the armor's own Properties tab is disabled;
- and the action refuses to run however it is invoked.

Pick the armor up with **Toggle Carried** ([[doc-itemgear|Gear]]) and Toggle Worn becomes available again — but the armor comes back **not worn**, so putting it on is always a deliberate act. Setting armor **down** while it is worn takes it off in the same stroke, so armor can never sit in a cart while still counting as protection.

## What happens on screen

There is **no dialog, no roll, and no chat card** — the action changes one flag and finishes:

1. **The armor's Worn property flips**, exactly as if you had ticked or cleared the **Worn** checkbox on its Properties tab.
2. **The 🛡 icon on the Gear tab row lights up or dims** to match the new state.
3. **Every body location the armor covers gains or loses its protection.** Open the Being sheet's **Combat** tab and look at the body-locations table: each location named in the armor's Flexible or Rigid lists now shows the armor's **Material** and adds its Blunt / Edged / Piercing / Fire values to the **B / E / P / F** columns.
4. **The character's carried weight and encumbrance are recomputed** — see below.

## What the numbers do

| Effect                          | While worn                                                                   | While carried but not worn                       |
| ------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------ |
| Protection at covered locations | Added to each location's own protection, aspect by aspect                    | None                                             |
| Material shown                  | Listed in the location's **Material** column                                 | Not listed                                       |
| Weight carried                  | **Not counted** — a fitted harness rides the body rather than hanging off it | Counts in full, like any other cargo             |
| Encumbrance                     | The armor's own Encumbrance value is added                                   | Not added (its weight feeds encumbrance instead) |

Two consequences are worth knowing at the table:

- **Layers stack.** Wear a gambeson and a hauberk over the same locations and both sets of numbers add together at every location they share; the Material column lists each covering layer in turn. A location covered by a **rigid** piece counts as rigid even if flexible layers also cover it.
- **Putting armor on can make you _lighter_.** Because worn armor stops counting as carried load, wearing a 25 lb hauberk you were already hauling drops your carried weight by 25 lb, and your encumbrance changes accordingly — replaced by the armor's own Encumbrance value, if it declares one.

## What it does not do

- **It does not ask first, and it does not undo.** The toggle applies immediately; run it again to take the armor off.
- **It does not check whether anything fits.** Nothing stops a character from wearing four hauberks at once; layering is the table's judgment, not the system's.
- **It does not pick the armor up.** Toggle Worn works on armor already carried; use **Toggle Carried** to get it there.

> **Known gap.** **Toggle Worn is missing from the Gear row's ⋮ Actions context menu**, even while the armor is carried (issue #1132). The menu shows only Edit, Toggle Carried, Delete, and Output Description to Chat. Use the 🛡 button on the row, or the ▶ on the armor's **Actions** tab, both of which work correctly. The same defect hides a weapon's attack and defence actions from that menu.
>
> Relatedly, the armor's **Actions** tab lists _Toggle Worn_ with an active ▶ even when the armor is not carried; clicking it there simply does nothing rather than telling you why (issue #1135). The greyed 🛡 button on the Gear tab is the honest indicator.

# See also

- [[doc-itemgear|Gear]] — the standard gear properties, **Toggle Carried**, and the carried-gear rule this page's action depends on.
- [[doc-baseitem|Base Item]] — the standard item properties and the shared **Edit** / **Delete** / **Output Description to Chat** actions.
- [[doc-wrkngwth|Working with Gear and Equipment]] — managing a character's kit day to day.
- [[doc-cmbtbscs|Combat Basics]] — where worn armor's protection is actually spent.
- [[doc-injrylvl|Injury]] (rules) — how armor protection is subtracted from an impact to give an injury level.
- [[doc-character#body-structure|Body Structure]] (rules) — the zones, parts, and locations an armor's coverage lists name.
- [[doc-shrtcds|Shortcodes]] — what a body-location shortcode such as `thrxloc` refers to.
- [[doc-ugitems|Items]] — every item type at a glance.
- [[doc-userguide|User Guide]] — back to the index.

<!-- TODO: Expand with the relationship between armor quality and
     protection, and armor damage/repair mechanics -->
