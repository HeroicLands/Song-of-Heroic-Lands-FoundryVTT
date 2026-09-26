---
tags: []
name:
  full: Bestiary
  aliases: []
shortcode: bestiary
type: doc
subType: rules
data:
  packFolder: rules
---

# Animals

```sql
SELECT address.slug                   AS _ref,
       name.full                      AS "Name",
       shortcode                      AS "Shortcode",
       sohl.system.body.weight.base   AS "Weight",
       sohl.system.body.bodyScaleBase AS "BodyScale",
       description                    AS "Description"
FROM notes
WHERE type = 'being'
  AND sohl.kbcat = 'animal'
```
