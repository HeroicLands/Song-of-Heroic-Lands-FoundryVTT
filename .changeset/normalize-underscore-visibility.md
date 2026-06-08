---
"sohl": patch
---

Normalize member visibility to the underscore naming convention

Align member visibility with the project's underscore naming convention so the
two always agree: a leading underscore means `protected`, while `private`
members carry no underscore.

- **Public underscore members → `protected`.** Every underscore-prefixed
  class member that was `public` (by omission) is now `protected`. Foundry
  framework overrides keep their underscore names; the compiler confirmed each
  can be `protected` (their fvtt-types bases are already protected), and Foundry
  still invokes them at runtime since TypeScript visibility is erased.
- **Private underscore members → de-underscored.** Members that were `private`
  stay `private` and have the leading underscore removed (e.g. `_subs` →
  `subs`, `_dispatchOne` → `dispatchOne`). The exception is a private backing
  field paired with a public getter of the same name (e.g. `_parent` ↔
  `get parent()`, `_logic` ↔ `get logic()`); those keep the underscore, since
  the field and accessor cannot share a name.
- **`skillBaseForRoll` → `_skillBaseForRoll`.** The one `protected` member that
  lacked an underscore is renamed to match.
- Constructor parameters (including underscore-prefixed unused parameters) are
  unaffected.

This is an encapsulation/hygiene change with no runtime behavior change. The
public underscore members were already internal by convention; making them
`protected` also removes them from the published API reference (TypeDoc excludes
protected members).
