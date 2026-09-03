---
id: Go1pBv5Wt8EKxaG7
type: doc
subType: weapongear
name:
  full: Weapons
  aliases: []
shortcode: weapons
description: Arms used in combat.
---

Arms used in combat.

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", sohl.value as "Value", sohl.weight as "Weight", description AS "Description"
WHERE type = "weapongear"
SORT weaponType, name.full ASC
```
