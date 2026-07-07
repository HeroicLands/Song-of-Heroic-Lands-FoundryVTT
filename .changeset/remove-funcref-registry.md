---
"sohl": minor
---

**Remove the unused function-reference registry (#174)**

The `funcref` registry (added in #155 as a safe way to serialize a function by
reference) has no consumer: Script actions run Foundry Macros, intrinsic actions
reference a method name, and serialized domain objects carry data plus a
`__kind` tag with behavior re-derived locally. Nothing registers or serializes a
function, so the mechanism is removed before anything depends on it.

- Deleted `src/utils/funcRegistry.ts` (and its test). **Removed exports:**
  `registerFunc`, `getFunc`, `getIdForFunc`.
- `defaultToJSON` drops functions again (no `__funcref__:` emission); the
  `__funcref__:` revival branch is removed from `defaultFromJSON`. A
  `__funcref__:`-prefixed string is now inert data, like any unknown string.
- The security win is unchanged: functions are still never revived into code
  (the `__func__:`/`deserializeFn` reviver removed in an earlier change stays
  gone). Behavior travels as data + `__kind`, not as a function.
- Docs: the Security Model doc drops the `__funcref__` reference kind and adds
  the sync/async × shipped/GM extension-point matrix (synchronous GM values use
  `SafeExpression`; asynchronous GM behavior uses Macros).
