---
aliases:
  - Container
id: rF2XSEFWmBoOwkks
type: doc
subType: user-guide
name:
  full: "Container"
shortcode: cntnr
folder: QtOgPodi8X6gDWL0
---

# What Is a Container?

Containers represent an object that holds other items — a backpack, sack, chest, belt pouch, saddlebag, or any other storage vessel. Containers use SoHL's nested item system to hold other gear items inside them, helping organize a character's inventory and track what is stored where. This matters for encumbrance, accessibility during combat, and narrative details like "the potion is in my belt pouch."

# Where It Appears

Containers appear on the Being's **Gear** tab. Other gear (Miscellaneous, Concoctions, Projectiles, Armor, Weapons, even other Containers) can be nested inside a Container, creating a hierarchical inventory structure.

# Additional Properties

In addition to the [[doc-itemgear|Standard Gear Properties]], the following additional properties are defined for containers:

- **Capacity** — how much the container can hold, limiting what can be stored inside.
- **Weight** — the weight of the container itself (contents add their own weight on top).
- **Contained Items** — the gear items nested inside this container.

<!-- TODO: Expand with details on how container capacity is enforced,
     how nested containers affect encumbrance calculations, and
     accessing items from containers during combat -->

# Intrinsic Actions

A container defines no actions of its own. Everything you can run against one is a standard action it already inherits:

| Action                     | Shortcode           |
| -------------------------- | ------------------- |
| Edit                       | `editDocument`      |
| Delete                     | `deleteDocument`    |
| Output Description to Chat | `outputDescription` |
| Toggle Carried             | `toggleCarried`     |

The first three belong to every item and are described on [[doc-baseitem|Base Item]]; **Toggle Carried** belongs to every piece of gear and is described on [[doc-itemgear|Gear]]. Those pages cover what each one does, how it is invoked, and what it produces — none of it changes for a container. Everything else about a container — its capacity, and what is nested inside it — is set on the sheet or by dragging gear onto the container, not by running an action.

# See also

- [[doc-ugitems|Items]] — every item type at a glance.
- [[doc-itemgear|Gear]] — the properties and the **Toggle Carried** action every carried thing has.
- [[doc-baseitem|Base Item]] — the three shared actions named above, including what deleting a container does to its contents.
- [[doc-wrkngwth|Working with Gear and Equipment]] — nesting gear, and moving it between containers.
- [[doc-userguide|User Guide]] — back to the index.
