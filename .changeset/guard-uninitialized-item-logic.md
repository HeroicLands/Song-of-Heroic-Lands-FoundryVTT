---
"sohl": patch
---

**Guard the Being sheet against uninitialized item logic (#511)**

A freshly-dropped or not-yet-initialized item could crash the Being sheet. An item's logic seeds its `ValueModifier`s in `initialize()`, so they are `undefined` until that runs; several logic getters and sheet render reads dereferenced them without a guard, so a single such item threw. In the render path this was unrecoverable — dropping an affliction made `AfflictionLogic.levelLabel` throw during the Trauma-tab context prep, and the sheet could no longer be opened.

Hardened the reads so a partially-initialized item degrades to a default instead of crashing: `AfflictionLogic.levelLabel` and `canHeal`, `SkillLogic.canImprove`, and the Being sheet's Attributes / Skills / Health / Corpus render reads (added the missing optional chaining on the nested modifier). This is a whole class of defect — a logic getter that assumes its modifiers are seeded can brick the sheet when read on an item whose lifecycle has not completed.
