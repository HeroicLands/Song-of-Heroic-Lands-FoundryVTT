---
"sohl": patch
---

**Fix #75:** `SuccessTestResult.testDialog` now records the target's movement
from the dialog form.

The `targetMovement` handling block was commented out with a `FIXME(#75)`.
The block referenced a nonexistent `this.targetMovement` field and the wrong
guard name (`isMovement`). The fix:

- Reads `formData.targetMovement` (not `data.targetMovement`)
- Validates with `isSuccessTestResultMovement`
- Assigns `this._movement` (the existing `movement` backing field)
- Throws `Invalid target movement "…"` for unrecognized values, mirroring the
  existing `rollMode` validation pattern directly above it

Also adds `isSuccessTestResultMovement` to the import list.
