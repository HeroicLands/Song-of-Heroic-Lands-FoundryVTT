---
"sohl": patch
---

**Serialization canonicalizes empty entity fields to `null`**

Extends the null-at-the-edges convention to the entity serialization layer.

`defaultToJSON` now deep-replaces `undefined` with `null` in the output of any custom
`toJSON` (a new internal `nullifyUndefined` pass). Serialized entity data — the blobs
`JSON.stringify`'d into chat-card `data-scope`, flags, and clone round-trips — now spells
"empty" as `null` consistently instead of relying on `JSON.stringify` silently dropping
`undefined` keys. This matches "null at the edges" (`null` is JSON-safe) while the logic
layer keeps `undefined`; the `== null` idiom bridges them on revival. Reads stay
backwards-compatible: an absent key still revives as `undefined` and is treated as empty.
A bare top-level `undefined` is unchanged.

**Small changes**

- Removed the dead `AnyObject` global alias (an unused duplicate of `UnknownObject`).
- Tightened `SohlEntity.clone`'s `options` parameter to `Partial<SohlEntity.Options>`
  (its `data` parameter intentionally stays `PlainObject` — an open subclass-override bag).
- Added tests: `nullifyUndefined` coercion in `defaultToJSON`, and a leaf-entity
  `defaultFromJSON(x.toJSON(), { parent })` reconstruction.
