---
"sohl": patch
---

**Key embedded items when exporting the actors pack**

Fixes [#59](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/59):
the actor pack exporter now writes a hierarchical `_key`
(`!actors.items!<actorId>.<itemId>`, and `!actors.items.effects!…` for any
effects an item carries) on each embedded item. Foundry's LevelDB pack compiler
keys every embedded document by `_key`, so without it the compile aborted with
`LEVEL_INVALID_KEY` ("Key cannot be null or undefined") as soon as the actors
pack contained an actor.
