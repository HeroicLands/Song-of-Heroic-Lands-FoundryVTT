---
shortcode: containergearug
name: {full: "Container"}
type: doc
subType: userguide
data: {packFolder: items}
---

# What Is a Container?

Containers represent an object that holds other items — a backpack, sack, chest, belt pouch, saddlebag, or any other storage vessel. Containers use SoHL's nested item system to hold other gear items inside them, helping organize a character's inventory and track what is stored where. This matters for encumbrance, accessibility during combat, and narrative details like "the potion is in my belt pouch."

# Where It Appears

Containers appear on the Being's **Gear** tab. Other gear (Miscellaneous, Concoctions, Projectiles, Armor, Weapons, even other Containers) can be nested inside a Container, creating a hierarchical inventory structure.

# Additional Properties

Along with the [[doc-gearug|Standard Gear Properties]], the following property also appears in the **Properties** tab:

- **Max Capacity:** The weight or volume the container is meant to hold. The container's section on the Gear tab shows a used-over-maximum readout against this number, but nothing in the sheet refuses an item that pushes the total over it — the readout is for your judgment, not an enforced limit.

What is nested inside a container is not a property of the container itself: an item becomes contained by being dragged onto the container's row on the actor's **Gear** tab, and leaves the same way — see [[doc-gearug|Gear]]. The container's own weight is the [[doc-gearug|Standard Gear Properties]]' Weight Base, with its contents' weight added on top.

# Intrinsic Actions

A container defines no actions of its own. Everything you can run against one is a standard action it already inherits:

| Action                     | Shortcode           |
| -------------------------- | ------------------- |
| Edit                       | `editDocument`      |
| Delete                     | `deleteDocument`    |
| Output Description to Chat | `outputDescription` |
| Toggle Carried             | `toggleCarried`     |

The first three belong to every item and are described on [[doc-baseitemug|Base Item]]; **Toggle Carried** belongs to every piece of gear and is described on [[doc-gearug|Gear]]. Those pages cover what each one does, how it is invoked, and what it produces — none of it changes for a container. Everything else about a container — its capacity, and what is nested inside it — is set on the sheet or by dragging gear onto the container, not by running an action.

# See also

- [[doc-ugitems|Items]] — every item type at a glance.
- [[doc-gearug|Gear]] — the properties and the **Toggle Carried** action every carried thing has.
- [[doc-baseitemug|Base Item]] — the three shared actions named above, including what deleting a container does to its contents.
- [[doc-gearandequipug|Working with Gear and Equipment]] — nesting gear, and moving it between containers.
- [[doc-userguide|User Guide]] — back to the index.
