---
"sohl": patch
---

**Fix actor import crash from unwired intrinsic actions**

Fixes [#62](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/62):
importing an actor (e.g. `Basic_Folk`) threw _"The target of this action does not
have a function named 'perform'"_ during data preparation. Several Logic classes
declared intrinsic actions whose `executor` named a method that did not exist or
was misnamed, and `SohlAction`'s constructor rejects an unresolved intrinsic
executor — aborting the whole actor's data preparation.

Every declared intrinsic executor now resolves to a real method. Not-yet-built
actions (`mysticalability` perform, `mystery` useMystery, `weapongear`
attack/block/counterstrike, `trauma` treatment/healing tests, `affliction`
fatigue/morale/fear tests) degrade gracefully with a "not yet implemented"
warning instead of throwing, and the `affliction` transmit/contract actions now
point at their existing `transmit`/`contractTest` methods. Adds the missing
action-title localization keys.
