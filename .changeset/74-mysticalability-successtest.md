---
"sohl": minor
---

**Roll a Mystical Ability by clicking its EML — retire the stub "perform" action**

A Mystical Ability is now _invoked_ the same way a skill is rolled: click its
**EML** value on the Being sheet's Mysteries tab to roll a **success test**
against its Effective Mastery Level (hold **Shift** to skip the dialog). The
cell reuses the same `successTest` intrinsic action skills use, so it also
appears in the ability row's context menu.

This replaces the previously unimplemented **perform** action, which only
warned "not yet implemented". There is nothing special to automate about
performing a mystical ability — the system **rolls but does not adjudicate**:
the player reads the outcome and applies the ability's effect from the
rulebook. Anyone who wants bespoke activation behavior can attach their own
Script Action.

Closes #74
