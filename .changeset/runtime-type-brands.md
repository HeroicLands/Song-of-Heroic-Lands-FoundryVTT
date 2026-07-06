---
"sohl": patch
---

**Runtime type brands via `isA`, replacing cycle-forming `instanceof`**

Adds a small Symbol-brand mechanism in `constants.ts` — a `BRAND` map (brand key
→ unique `Symbol()`), a `BrandType` registry (key → the type it narrows to), and
a generic `isA(x, key)` type guard — as a targeted replacement for `instanceof`
in the one place a value import would form a module cycle.

- **Breaks an import cycle.** `SohlEntity.clone` no longer uses
  `instanceof SohlLogic`, which forced `SohlEntity` to import `SohlLogic` as a
  value and closed the cycle `SohlEntity → SohlLogic → SohlActionContext →
SohlEntity` (throwing `Class extends value undefined` when the entity modules
  loaded). It now imports `SohlLogic` type-only and detects it with
  `isA(x, "SohlLogic")`.
- **Inherited, un-spoofable brands.** A class attaches its brand through an
  inherited getter (`get [BRAND.SohlLogic]()`), so every subtype at any depth is
  recognized. Because the brand is a `Symbol`, it is invisible to
  `Object.keys` / `JSON.stringify` and never leaks into serialized data.
- **One mechanism, not two.** The earlier one-off `isSohlTokenDocumentLogic`
  string getter is folded into the same pattern
  (`BRAND.SohlTokenDocumentLogic` + `isA`).

Plain `instanceof` remains the default wherever it does not cause a cycle; the
brand is added only where the import graph forces it, and the `BrandType`
registry is meant to grow lazily rather than branding every type.
