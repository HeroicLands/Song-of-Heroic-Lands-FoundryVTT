---
"sohl": patch
---

**Vehicle `occupants` is typed as the shape it actually stores**

`occupants` was declared `string[]` on both `VehicleDataModel` and the
`VehicleData` logic interface, but the schema stores an array of objects
(`{ actorCodeOrUuid, role, title }`). Code written against the declared type —
`occupants.includes(code)`, or treating an entry as a bare shortcode — compiled
cleanly and would have failed at runtime.

- Adds the exported `VehicleOccupant` interface (handle, role, optional title)
  and uses it for both declarations.
- The unit test asserted the incorrect string-array shape; because the logic
  harness builds from a plain object it bypasses the DataModel, so the schema
  never contradicted it. It now asserts the stored shape.

No data change: the schema and the persisted data were always correct — only
the TypeScript declarations disagreed with them.
