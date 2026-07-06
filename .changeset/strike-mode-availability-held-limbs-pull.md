---
"sohl": minor
---

**Strike-mode availability gated by held limbs and pull**

A being's available weapon strike modes now depend on how the weapon is
physically held and, for missiles, on the being's pull — an inline model on
`BeingLogic.availableStrikeModes` that replaces the former
`computeAvailableStrikeModes` helper.

- A weapon's strike mode is available only when the weapon is held in at least
  the mode's `minParts` body parts. Gear reports its holders through the new
  `GearLogic.heldBy` (the `BodyPart`s currently gripping the item). Combat
  technique strike modes are intrinsic and always available.
- A new Being **`pull`** score (a `ValueModifier`) gates missile modes: a missile
  mode is available only when its `draw` is at most the being's pull.
- The result reads already-prepared strike-mode data, so it must be evaluated
  after item preparation — see the actor-first data-preparation change.
