---
"sohl": patch
---

Point the knowledgebase landing's Actors card at the Beings catalog.

**The fault**

`/sohl/kb/` offered two cards under **Actors**, _Characters_ and _Creatures_,
and both 404'd. #1580 merged those two content types into one `being` type, so
`/sohl/kb/character/` and `/sohl/kb/creature/` have not been built since — while
`/sohl/kb/being/`, the 95-page catalog they were meant to reach, had no route
from the landing at all. They were the only failing in-site links on the page.

**The fix**

The two cards become one, _Beings_, linking to `kb/being/` and keeping the
banner the section itself declares. The **Actors** group, the **Gear** group and
every other card are untouched: across the whole 1,704-page site exactly one
built file changes, and on it the only differences are the removed card and the
one that replaces it.

This is the same pair of dead links #1760 repaired on `/sohl/`, which left
`/sohl/kb/` explicitly out of scope; the identical fault was still live one
level down.

**Why it is still hand-written**

The card list mirrors which content types exist, so an authored list goes stale
the moment the tree gains or retires one — which is exactly what happened here.
#1758 tracks deriving the cards from the sections instead, and is blocked on the
shared theme and build package (heroiclands-hugo-theme#41,
package-build#91). Until those land, this file is where a content type is added
to or removed from the landing.
