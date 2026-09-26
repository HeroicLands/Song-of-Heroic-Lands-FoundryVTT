---
shortcode: weapongear
name: {full: Weapons, aliases: []}
type: doc
subType: reference
description: Arms used in combat.
---

Arms used in combat.

```sql
SELECT address.slug           AS _ref,
       name.full              AS "Name",
       sohl.system.valueBase  AS "Value",
       sohl.system.weightBase AS "Weight",
       description            AS "Description"
FROM notes
WHERE type = 'weapongear'
ORDER BY sohl.weaponType COLLATE NOCASE, name.full COLLATE NOCASE
```
