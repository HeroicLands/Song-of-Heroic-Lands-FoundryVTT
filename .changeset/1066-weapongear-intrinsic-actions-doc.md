---
"sohl": patch
---

**Document Weapon Gear's Intrinsic Actions in the User Guide**

The Weapon page now documents everything a weapon can do, verified against a running
client rather than read off the source.

- **Attack, Block, and Counterstrike** each get name, shortcode, icon, API link, what
  they do and when to reach for them, how they are invoked, and the dialogs and chat
  card the flow produces. The strike-mode picker and the standard test dialog are
  linked to _Base Item_, where they are described once; **Toggle Carried** is linked
  to _Gear_.
- **New sections for the two preconditions a player actually trips over.** _Holding a
  Weapon_ explains the Combat tab's **Held Items** list, the two-limb grip a **Min
  Parts** 2 mode needs, and how holding differs from carrying. _The Strike Modes Tab_
  covers a weapon's several modes and the three editor fields that behave differently
  on a weapon than on a combat technique — chiefly that a weapon has **no mastery
  level of its own**, so an unset **Associated Skill** leaves it swinging at its flat
  modifiers alone.
- **What the roll is made against** is now stated: the associated skill's mastery
  level, plus the strike mode's own flat modifier, plus anything else in play.
- **Corrected stale content.** Strike modes are described as part of the weapon, not
  as nested items; the **Heft** property was missing from the properties list; and the
  Combat tab is noted as showing a weapon only while it is held.

Four known defects found while verifying are flagged in-page and linked to their
issues: the Gear-tab ⋮ menu omits the three combat actions (#1132), the test-result
card's title renders a raw localization key (#1107), Fate cannot be spent on a
weapon's combat tests (#1106), and Block / Counterstrike are offered on a
missile-only weapon and silently do nothing (#1137).

Closes #1066
