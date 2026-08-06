---
aliases:
    - Mystery
id: 6fJTkfpqjc4srAqd
type: doc
package: sohl
category: user-guide
name:
    full: "Mystery"
slug: "item-mystery"
folder: QtOgPodi8X6gDWL0
---

# What Is a Mystery?

A Mystery represents a supernatural condition or aspect of the Being. It represents what the Being "is" rather than what they can "do". Fate points, piety, blessings, and other similar conditions are all mysteries.

# Where It Appears

Mysteries appear on the Being sheet's **Mysteries** tab.

# Additional Properties

Along with the [[Item_Base|Standard Item Properties]], the following properties also appear in the **Properties** tab:

- **SubType:**
- **Level:** Power level of this mystery, if applicable
- **Charges:** If this mystery can be used up, this represents the number of charges
    - **Value:** Current number of charges avaiable
    - **Max:** Maximum number of charges

# Intrinsic Actions

A Mystery describes what a character _is_, not something they roll, so it
defines no action of its own. It carries only the standard actions every item
has:

| Action                     | Shortcode           |
| -------------------------- | ------------------- |
| Edit                       | `editDocument`      |
| Delete                     | `deleteDocument`    |
| Output Description to Chat | `outputDescription` |

All three belong to every item and are described on [[Item_Base|Base Item]],
which covers what each one does, how it is invoked, and what it produces.

A Mystery's effect on a character is applied through the Active Effects it
carries, and any power a character actively invokes is a
[[Item_MysticalAbility|Mystical Ability]], which has its own action and roll.
