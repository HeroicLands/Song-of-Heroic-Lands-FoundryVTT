---
shortcode: containergear
name: {full: Containers, aliases: []}
type: doc
subType: reference
description: "Sacks, packs, pouches, and other carriers."
---

Sacks, packs, pouches, and other carriers.

```sql
SELECT address.slug           AS _ref,
       name.full              AS "Name",
       sohl.system.valueBase  AS "Value",
       sohl.system.weightBase AS "Weight",
       description            AS "Description"
FROM notes
WHERE type = 'containergear'
ORDER BY name.full COLLATE NOCASE
```
