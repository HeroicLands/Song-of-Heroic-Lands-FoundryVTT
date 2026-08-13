---
"sohl": patch
---

Show a pointer description's target on the item sheet's Description tab
([#1357](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1357)).

A description that is only a link is a **pointer** — the item's description
lives at the target. Output Description to Chat has followed one since
[#1356](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1356),
but the Description tab did not: opening such an item showed a bare link in an
editor, so the description was two clicks away and the tab looked empty of
content.

The tab now shows what the link points at, read-only, with a **pencil** in the
upper right that reveals the editor holding the link — so the description can
still be re-aimed or replaced with prose, and the reader never meets the
machinery. The icon becomes an open book to switch back, and closing the sheet
returns to reading. An ordinary description is unchanged: the editor, directly,
with no toggle.

A pointer whose target will not resolve shows the broken link rather than an
empty tab, matching how the chat card degrades, and links inside the shown text
stay live so a reader can still open the page itself.

**Presentation only** — nothing about what counts as a pointer changed. The
convention is now documented end to end (write, read, edit, post) on the **Base
Item** page of the user guide, which it was not before.
