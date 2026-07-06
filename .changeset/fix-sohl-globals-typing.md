---
"sohl": patch
---

**Restore type safety on `sohl.*` and SoHL document types (fix stale `sohl-globals.d.ts`)**

`types/sohl-globals.d.ts` had regressed to a broken state: it imported from a
non-existent `@src/common/*` layout and referenced removed `X.DataModel`
namespace members, while `tsconfig`'s `skipLibCheck: true` hid the breakage. The
effect was that `var sohl: SohlSystem`, the Foundry `DocumentClassConfig`, and
`DataModelConfig` all silently resolved to `any` — turning off type checking on
every `sohl.*` global access and on SoHL document / data-model types.

- **Corrected the declaration file**: repointed all imports to the current
  `@src/document/*/{foundry,logic}`, `@src/core/logic`, and `@src/entity`
  layout; use the standalone `XDataModel` classes (the `X.DataModel` namespaces
  are gone); dropped dead imports; made `SohlActor`/`SohlItem`/`SohlActiveEffect`
  non-generic to match their classes; fixed the `Mixin` utility-type constraint.
- **Broke an fvtt-types instantiation cycle**: the actor/item `DataModelConfig`
  entries pin their DataModel generics to `any`, because the concrete classes
  carry self-referential `TLogic` defaults (DataModel → Logic → Data → system →
  DataModelConfig) that otherwise send the compiler into infinite recursion.
  Per-subtype `system` stays loosely typed (as it already was while the file was
  broken); everything else is now correctly typed.
- **Fixed the ~50 latent type errors** the correction de-masked: added a typed
  `SohlSystem.CONFIG` getter; cast heterogeneous `SohlDocument`-union member
  access in the base sheet; annotated implicit-`any` callback params; and fixed
  two genuine bugs surfaced by real typing — a possibly-undefined
  `charges.value` read in `SkillLogic`, and `BodyPart.heldItem` now normalizes
  to `undefined` (its declared type) instead of `null` when no item is held.

Also adds a build/CI guard (`npm run lint:dts`, wired into `build:noci` and the
build workflow) that type-checks the project's own declaration files with
`skipLibCheck` off and fails on any error in a file we own — so this regression
cannot silently recur. Third-party library errors (which `skipLibCheck` exists
to suppress) are ignored.

Type-only change; no runtime behavior change beyond the two correctness fixes
noted above.
