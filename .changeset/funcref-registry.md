---
"sohl": minor
---

**Add a function-reference registry for safe function serialization (#155)**

Functions that must survive serialization are now carried as a
`__funcref__:<id>` _reference_ to a registered, code-authored function rather
than being reconstructed from source. This is the first slice of the security
remediation tracked by epic #154 ("reference code, don't compile it") and is
behavior-preserving on its own.

- New leaf module `funcRegistry` (mirroring `kindRegistry`) exposes
  `registerFunc(id, fn)` / `getFunc(id)` / `getIdForFunc(fn)`, with a strict
  one-to-one id↔function mapping (conflicting registrations throw; re-registering
  the identical pair is a no-op).
- `defaultToJSON` encodes a **registered** function as `__funcref__:<id>`
  (never as executable source); an unregistered function is still dropped to
  `undefined`, exactly as before.
- `defaultFromJSON` revives a `__funcref__:<id>` by looking the id up in the
  registry — unknown ids resolve to `undefined` (and log a warning) and are
  never compiled, so corrupt or hostile serialized data cannot introduce code.

The legacy `__func__:` / `deserializeFn` path is untouched by this change; its
removal, and the migration of Script Action executors to Foundry Macros, follow
in #156.
