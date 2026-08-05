---
"sohl": patch
---

**User Guide: the base Gear Intrinsic Action**

The _Gear_ page gains an **Intrinsic Actions** section documenting **Toggle
Carried** (`toggleCarried`) — the one action every piece of gear adds to the
standard item actions, and the action the four inherit-only gear pages already
link here for (#1065, part of the intrinsic-action documentation epic #1061).

The entry gives the action's name, shortcode, icon, and API link, then covers it
in player terms: what flipping **Is Carried** is for, the three ways to run it
(the Actions context menu, the item sheet's Actions tab, and the sack shortcut on
the Gear-tab row), and what happens on screen — no dialog, no roll, no card, just
the flag and a recomputed carried weight. It also states the limits that are easy
to guess wrong: worn armor is not counted as carried load, a weapon's own
encumbrance value applies while carried, the toggle does not touch worn or
equipped state, it does not cascade into a container's contents, it does not
block using the item, and only a Being keeps a carried-weight total for it to
feed.

**Edit**, **Delete**, and **Output Description to Chat** are linked to _Base
Item_ rather than restated.
