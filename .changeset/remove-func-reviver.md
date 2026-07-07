---
"sohl": minor
---

**Remove the `__func__:` code reviver — untrusted data can no longer become executable (#170)**

`defaultFromJSON` no longer reconstructs functions from serialized strings.
The `__func__:` revive branch and the `serializeFn`/`deserializeFn` helpers
(which compiled `new Function` from a string with no screening) are removed.
This closes the cross-client remote-code-execution path where a crafted chat
card `data-scope` — or persisted document data — could carry a `__func__:`
payload that was revived into a live function and later invoked. Part of the
"reference code, don't compile it" remediation (epic #154); functions now
travel only as `__funcref__:<id>` references (#155).

- `defaultFromJSON`: the `__func__:` branch is gone. Such a string (which no
  current writer emits) is returned verbatim as an inert string; there is no
  `new Function` path.
- `buildActionScope` rejects any chat-card scope payload containing a
  `__func__:` marker outright (defense-in-depth on the untrusted path).
- `SuccessTestResult` accepts a `targetValueFunc` only when it is an actual
  function; any other value falls back to identity, so revived data cannot
  become callable.
- **Removed exports:** `serializeFn` and `deserializeFn` (no consumers).
