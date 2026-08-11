---
aliases:
    - Concoction
id: nV3Nq6xe3fUcJJzd
type: doc
package: sohl
category: user-guide
name:
    full: "Concoction"
shortcode: cncctn

folder: QtOgPodi8X6gDWL0
---

# What are Concoctions?

Concoctions are consumable preparations — potions, salves, poisons, elixirs, herbal remedies, and other crafted substances that produce an effect when used. Concoctions are typically created through skills like Herblore or Alchemy and have a limited number of uses before they are depleted.

Note that although the term "concoction" would seem to suggest a liquid, concoctions can come in any form such as poultices, gum, wafers, slaves, powders, or other forms than simply liquids.

Concoctions are consumed when applied or ingested and may interact with afflictions (as treatments) or produce other effects.

# Where They Appear

Concoctions appear on the **Gear** tab, and are often placed inside of containers such as flasks or vials.

# Additional Properties

In addition to the [[User_Guide/itemgear|Standard Gear Properties]], the following additional properties are defined for concoctions:

- **Quantity** — how many doses remain.
- **Weight** — the weight of the concoction, contributing to encumbrance.
- **Effect** — what happens when the concoction is used (healing, poison
  damage, buff, etc.).
- **Description** — details about the concoction's appearance, ingredients,
  and usage instructions.

<!-- TODO: Expand with details on crafting concoctions, how concoctions
     interact with the affliction/treatment system, application methods
     (ingested, applied, inhaled), and potency/quality -->

<!-- TODO: Document each field on the Properties tab of this type's sheet:
     what it means, what values to enter, and how it interacts with other
     fields and items. Include annotated screenshots. -->

# Intrinsic Actions

A concoction defines no actions of its own. Everything you can run against one
is a standard action it already inherits:

| Action                     | Shortcode           |
| -------------------------- | ------------------- |
| Edit                       | `editDocument`      |
| Delete                     | `deleteDocument`    |
| Output Description to Chat | `outputDescription` |
| Toggle Carried             | `toggleCarried`     |

The first three belong to every item and are described on [[Base Item]];
**Toggle Carried** belongs to every piece of gear and is described on
[[Gear]]. Those pages cover what each one does, how it is invoked, and
what it produces — none of it changes for a concoction.
In particular there is no "use" action: drinking, applying, or administering a
concoction stays a table decision, so you adjust its **Quantity** and apply its
effect yourself.
