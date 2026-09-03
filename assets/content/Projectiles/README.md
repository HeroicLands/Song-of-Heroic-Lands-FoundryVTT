---
id: DuzvuEQp2xMqiZWY
type: doc
subType: projectilegear
name:
  full: Projectiles
  aliases: []
shortcode: projectils
description: "Projectiles - arrows, stones, bolts, etc."
---

Projectiles - arrows, stones, bolts, etc.

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", sohl.value as "Value", sohl.weight as "Weight", description AS "Description"
WHERE type = "projectilegear"
SORT name.full ASC
```
