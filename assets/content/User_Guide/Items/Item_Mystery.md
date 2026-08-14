---
aliases:
    - Mystery
    - doc-mystery
id: 6fJTkfpqjc4srAqd
type: doc
package: sohl
category: user-guide
name:
    full: "Mystery"
shortcode: mystery
folder: QtOgPodi8X6gDWL0
---

# What Is a Mystery?

A Mystery represents a supernatural condition or aspect of the Being. It represents what the Being "is" rather than what they can "do". Fate points, piety, blessings, and other similar conditions are all mysteries.

# Where It Appears

Mysteries appear on the Being sheet's **Mysteries** tab.

# Additional Properties

Along with the [[doc-baseitem|Standard Item Properties]], the following properties also appear in the **Properties** tab:

- **SubType:**
- **Level:** Power level of this mystery, if applicable
- **Charges:** If this mystery can be used up, this represents the number of charges
    - **Current Charges:** Charges remaining. Leave it blank for a mystery whose
      uses are unlimited (the sheet shows ∞).
    - **Maximum Charges:** The cap, and the control that decides whether the
      mystery uses charges at all. Leave it blank for one that does not (the
      sheet shows ✕); enter `0` for one that is counted but uncapped.

# Intrinsic Actions

A Mystery describes what a character _is_, not something they roll, so it
defines no action of its own. It carries only the standard actions every item
has:

| Action                     | Shortcode           |
| -------------------------- | ------------------- |
| Edit                       | `editDocument`      |
| Delete                     | `deleteDocument`    |
| Output Description to Chat | `outputDescription` |

All three belong to every item and are described on [[Base Item]],
which covers what each one does, how it is invoked, and what it produces.

A Mystery's effect on a character is applied through the Active Effects it
carries, and any power a character actively invokes is a
[[Mystical Ability]], which has its own action and roll.

# See also

- [[doc-ugitems|Items]] — every item type at a glance.
- [[doc-baseitem|Base Item]] — the three shared actions named above.
- [[doc-mystclab|Mystical Ability]] — the counterpart a character actively
  invokes.
- [[doc-mystclpw|Mystical Powers]] — the Mysteries tab, and using the
  supernatural at the table.
- [[doc-mysteryintro|Mysteries]] (rules) — the standing conditions themselves.
- [[doc-userguide|User Guide]] — back to the index.
