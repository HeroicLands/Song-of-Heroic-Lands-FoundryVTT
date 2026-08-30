---
aliases:
  - Projectiles
id: DuzvuEQp2xMqiZWY
name:
  full: Projectiles
  aliases: []
type: doc
category: collection
shortcode: projectils
section: projectilegear
tags:
description: Projectiles - arrows, stones, bolts, etc.
banner: banners/projectilegear.webp
---

# Projectiles

Projectiles - arrows, stones, bolts, etc.

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", sohl.value as "Value", sohl.weight as "Weight", description AS "Description"
WHERE type = "projectilegear" and package = "sohl"
SORT name.full ASC
```
