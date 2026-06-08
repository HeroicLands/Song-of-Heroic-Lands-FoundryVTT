---
"sohl": patch
---

Normalize underscore-prefixed members to `protected`

Align member visibility with the project's underscore naming convention so the
two always agree: a leading underscore now consistently means "not part of the
public surface."

- Every underscore-prefixed class member (field, method, getter, or setter —
  instance or static) is now `protected`, where it was previously `public` (by
  omission) or `private`. Foundry framework overrides keep their underscore
  names; the compiler confirmed each can be `protected` (their fvtt-types bases
  are already protected), and Foundry still invokes them at runtime since
  TypeScript visibility is erased.
- The one member that was `protected` without an underscore —
  `SkillLogic`'s `skillBaseForRoll` getter — is renamed to `_skillBaseForRoll`
  to match.
- Constructor parameters (including underscore-prefixed unused parameters) are
  unaffected.

This is an encapsulation/hygiene change with no runtime behavior change. These
members were already internal by convention; tightening their declared
visibility also removes them from the published API reference (TypeDoc excludes
protected members).
