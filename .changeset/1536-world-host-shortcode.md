---
"sohl": patch
---

**`sohl.worldHost()` can create its singleton again.** The reserved shortcode was
`_sohlworld`, which the shape rule added in #1397 refuses — a shortcode is
strictly alphanumeric, and nothing exempts a key the system writes itself. So the
host actor was created through the same `(type, shortcode)` guard as any
document, refused as malformed, and vetoed: `sohl.worldHost()` returned
`undefined` for a GM, world-scoped scheduling had no document to hang off, and
`sohl.addScriptAction(host, …)` failed on the missing document with
`Cannot read properties of undefined (reading 'system')`.

- The reserved code is now **`sohlworld`**, dropping the underscore rather than
  exempting it. This is also exactly what the 0.9.0 repair migration (#1397)
  produces from a host a v0.8 world already created, so an upgraded world keeps
  the one host it has instead of growing a second — no new migration.
- `attachScriptAction` now names an absent document
  (``addScriptAction: `doc` must be a document carrying system data.``) instead of
  dereferencing it, since `sohl.worldHost()` legitimately yields `undefined` for a
  user who cannot see the host and callers pass its result straight in.
- A unit test now asserts the system's own reserved keys satisfy the shape rule
  and that the migration's repair of a legacy `_sohlworld` lands on the code
  `worldHost()` looks up, so this class of defect cannot come back silently.

(Closes #1536.)
