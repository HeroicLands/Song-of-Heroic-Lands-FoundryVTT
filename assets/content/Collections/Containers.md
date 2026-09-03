---
id: RtMkTCGjBNTXWJCB
name:
  full: Containers
  aliases: []
type: doc
shortcode: containers
section: containergear
tags:
description: Sacks, packs, pouches, and other carriers.
banner: banners/containergear.webp
---

# Containers

Sacks, packs, pouches, and other carriers.

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", sohl.value as "Value", sohl.weight as "Weight", description AS "Description"
WHERE type = "containergear" and package = "sohl"
SORT name.full ASC
```
