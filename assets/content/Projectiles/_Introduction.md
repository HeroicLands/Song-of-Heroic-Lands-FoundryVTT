---
shortcode: projectilegear
name: {full: Projectiles, aliases: []}
type: doc
subType: reference
description: "Projectiles - arrows, stones, bolts, etc."
---

Projectiles - arrows, stones, bolts, etc.

```sql
SELECT address.slug           AS _ref,
       name.full              AS "Name",
       sohl.system.valueBase  AS "Value",
       sohl.system.weightBase AS "Weight",
       description            AS "Description"
FROM notes
WHERE type = 'projectilegear'
ORDER BY name.full COLLATE NOCASE
```
