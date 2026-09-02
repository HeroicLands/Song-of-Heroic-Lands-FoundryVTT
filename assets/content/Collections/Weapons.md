---
aliases:
  - Weapons
id: Go1pBv5Wt8EKxaG7
name:
  full: Weapons
  aliases: []
type: doc
shortcode: weapons
section: weapongear
tags:
description: Arms used in combat.
banner: banners/weapongear.webp
---

# Weapons

Arms used in combat.

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", sohl.value as "Value", sohl.weight as "Weight", description AS "Description"
WHERE type = "weapongear" and package = "sohl"
SORT weaponType, name.full ASC
```
