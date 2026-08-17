---
aliases:
    - Armor
    - doc-armor2
id: MA6x5oaB16x7cvyk
name:
    full: Armor
    aliases: []
type: doc
category: collection
package: sohl
shortcode: armor2
section: armorgear
tags:
description: Defensive gear — mail, plate, shields, and more.
banner: banners/armorgear.webp
---

# Armor

Defensive gear — mail, plate, shields, and more.

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", sohl.value as "Value", sohl.weight as "Weight", description AS "Description"
WHERE type = "armorgear" and package = "sohl"
SORT name.full ASC
```
