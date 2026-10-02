---
shortcode: concoctiongearug
name: {full: "Concoction"}
type: doc
subType: userguide

data: {packFolder: items}
---

# What are Concoctions?

Concoctions are consumable preparations — potions, salves, poisons, elixirs, herbal remedies, and other crafted substances that produce an effect when used. Concoctions are typically created through skills like Herblore or Alchemy and have a limited number of uses before they are depleted.

Note that although the term "concoction" would seem to suggest a liquid, concoctions can come in any form such as poultices, gum, wafers, slaves, powders, or other forms than simply liquids.

Concoctions are consumed when applied or ingested and may interact with afflictions (as treatments) or produce other effects.

# Where They Appear

Concoctions appear on the **Gear** tab, and are often placed inside of containers such as flasks or vials.

# Additional Properties

Along with the [[doc-gearug|Standard Gear Properties]] — where **Quantity** is how many doses remain — the following additional properties are defined for concoctions:

- **Potency:** How strong the concoction's effect is, as a category: **Not Applicable**, **Mild**, **Strong**, or **Great**.
- **Strength:** A numeric effectiveness rating, read alongside Potency.

A concoction's **Type** — **Mundane**, **Exotic**, or **Elixir** — classifies what kind of preparation it is, but has no field on the Properties tab; it is set in the compendium entry rather than on the sheet.

What the concoction actually _does_ when used — healing, poison, a buff — is not a property stored on the item; it is read off its description and applied by the people at the table, matching the rule that nothing here administers a dose on its own.

# Intrinsic Actions

A concoction defines no actions of its own. Everything you can run against one is a standard action it already inherits:

| Action                     | Shortcode           |
| -------------------------- | ------------------- |
| Edit                       | `editDocument`      |
| Delete                     | `deleteDocument`    |
| Output Description to Chat | `outputDescription` |
| Toggle Carried             | `toggleCarried`     |

The first three belong to every item and are described on [[doc-baseitemug|Base Item]]; **Toggle Carried** belongs to every piece of gear and is described on [[doc-gearug|Gear]]. Those pages cover what each one does, how it is invoked, and what it produces — none of it changes for a concoction. In particular there is no "use" action: drinking, applying, or administering a concoction stays a table decision, so you adjust its **Quantity** and apply its effect yourself.

# See also

- [[doc-ugitems|Items]] — every item type at a glance.
- [[doc-gearug|Gear]] — the properties and the **Toggle Carried** action every carried thing has.
- [[doc-baseitemug|Base Item]] — the three shared actions named above.
- [[doc-gearandequipug|Working with Gear and Equipment]] — quantities, containers, and handing an item over.
- [[doc-userguide|User Guide]] — back to the index.
