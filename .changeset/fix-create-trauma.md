---
"sohl": patch
---

**Fix the Add Injury flow never recording a trauma**

`createTraumaFromInjury` called `actor.createEmbeddedDocuments(...)`, but both
call sites pass the `BeingLogic`, not a Foundry actor, so it threw
`TypeError: actor.createEmbeddedDocuments is not a function` and no trauma was
created. It now routes the write through a new
`FoundryHelpers.fvttCreateEmbeddedItems(actorLogic, itemsData)` boundary, which
resolves the actor from the logic — keeping `injury-actions.ts` free of direct
Foundry calls. With this, the Add Injury flow records the trauma end to end. (#286)
