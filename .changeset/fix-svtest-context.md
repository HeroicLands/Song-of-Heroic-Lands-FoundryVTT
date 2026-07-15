---
"sohl": patch
---

**`successValueTest` passes the correct `svTestContext` to `successTest`**

Previously, `successValueTest` built `svTestContext` with the right `svTable` and index-offset `targetValueFunc` but then called `this.successTest(context)` with the original, unmodified context. As a result, `successValueTest` behaved identically to a plain `successTest` and the success-value grading was never applied.

The fix passes `svTestContext` (spreading any caller-supplied scope fields underneath, then overriding with `svTable` and the index-offset func) to `this.successTest(...)`.

Closes #78.
