---
"sohl": patch
---

**Fix: partial array-by-index updates no longer corrupt a being's body structure**

Hand-built updates that targeted a single element of the `bodyStructure.parts`
array by index (e.g. `update({ "system.bodyStructure.parts.1.heldItemId": id })`)
corrupted the **entire** parts array: Foundry rebuilds an array field from a
sparse `{ index: {…} }` change, truncating it and default-filling every element
that wasn't named. The first time `holdItem` ran, a being's 6 body parts
collapsed to 2 — wiping every part's `shortcode`, `canHoldItem`, `roles`, and
`locations` (hit locations, armor coverage, manipulator/locomotor roles). As a
knock-on, `releaseItem` then matched nothing (its filter needs the now-wiped
`canHoldItem`) and could never release.

Affected executors: `GearLogic.holdItem`, `GearLogic.releaseItem`,
`BodyPart.addLocationUpdate`, `BodyPart.removeLocationUpdate`.

Added `BodyStructure.setPartFieldsUpdate`, which sources the full canonical parts
array and writes it back whole with only the target element(s) modified — the
same complete-array pattern the existing `addPartUpdate`/`removePartUpdate`
builders already use. All four sites route through it. `ObjectField`-keyed
updates (`system.strikeModes.<id>.…`) and form submissions were never affected.

Fixes #247
