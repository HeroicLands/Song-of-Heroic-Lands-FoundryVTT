---
id: MA6x5oaB16x7cvyk
type: doc
subType: reference
name:
  full: Armor
  aliases: []
shortcode: armorgear
description: "Defensive gear — mail, plate, shields, and more."
---

Defensive gear — mail, plate, shields, and more.

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", sohl.value as "Value", sohl.weight as "Weight", description AS "Description"
WHERE type = "armorgear"
SORT name.full ASC
```
