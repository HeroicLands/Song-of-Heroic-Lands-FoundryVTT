---
"sohl": patch
---

**Make `helpers.ts` strictly Foundry-free and break the helpers ↔ FoundryHelpers cycle**

`src/utils/helpers.ts` no longer imports the Foundry shim, so the util layer is a
true Foundry-free foundation. Previously `helpers.ts` and `FoundryHelpers.ts`
imported each other; the two runtime touch-points that caused it are gone.

- `cloneInstance` now merges overrides with a pure, internal `deepMerge`
  (recursive plain-object merge; arrays and scalars replace wholesale) instead of
  Foundry's `mergeObject`.
- `defaultFromJSON` revives a `ClientDocument` reference through an injected
  resolver registered via the new `setUuidResolver`. The `FoundryHelpers` shim
  (and its test mock) registers `fvttResolveUuid` at load, so Foundry UUID
  resolution is wired in for every runtime path without the util importing the
  shim.
- Free-standing pure types moved to a new `src/utils/types.ts`: the dialog
  types/interfaces (out of `FoundryHelpers.ts`, still re-exported there for
  existing importers) and `SohlSettingValue` (out of `helpers.ts`). Branded types
  paired with runtime guards (`FilePath`, `HTMLString`, `DocumentId`,
  `DocumentUuid`) stay with their guards in `helpers.ts`.

No public API or behavior change; enforced by the existing purity test, which now
loads `helpers.ts` with no Foundry globals and no shim dependency.
