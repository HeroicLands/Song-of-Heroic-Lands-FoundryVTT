---
"sohl": minor
---

**Drag-and-drop items from a compendium or the world onto a Being**

Dropping an Item onto an actor sheet now creates it. The Being sheet is built on
`DocumentSheetV2` (not `ActorSheetV2`), so it inherited no item-drop handling and
dropping a compendium or world item did nothing. `SohlActorSheetBase` now
overrides `_onDropItem` to create the dropped item as an embedded **clone** on
the actor (all item kinds). An item already embedded on the same actor is ignored
(no duplicate), and a second **lineage** is refused (the lineage is a singleton).
