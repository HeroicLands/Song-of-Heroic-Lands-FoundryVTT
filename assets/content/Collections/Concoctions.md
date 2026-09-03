---
id: zo3tZIMKCKxVzfZ6
name:
  full: Concoctions
  aliases: []
type: doc
shortcode: concoctins
section: concoctiongear
tags:
description: Infusions, potions, elixirs, polutices, etc.
banner: banners/containergear.webp
---

Infusions, potions, elixirs, polutices, etc.

## Simples

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", sohl.value as "Value", sohl.weight as "Weight", description AS "Description"
WHERE type = "concoctiongear" and sohl.subType = "mundane" and package = "sohl"
SORT name.full ASC
```

## Potions

### Mild

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", sohl.value as "Value", sohl.weight as "Weight", description AS "Description"
WHERE type = "concoctiongear" and sohl.subType = "exotic" and sohl.potency = "mild" and package = "sohl"
SORT name.full ASC
```

### Strong

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", sohl.value as "Value", sohl.weight as "Weight", description AS "Description"
WHERE type = "concoctiongear" and sohl.subType = "exotic" and sohl.potency = "strong" and package = "sohl"
SORT name.full ASC
```

### Great

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", sohl.value as "Value", sohl.weight as "Weight", description AS "Description"
WHERE type = "concoctiongear" and sohl.subType = "exotic" and sohl.potency = "great" and package = "sohl"
SORT name.full ASC
```

## Elixirs

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", sohl.value as "Value", sohl.weight as "Weight", description AS "Description"
WHERE type = "concoctiongear" and sohl.subType = "elixir" and package = "sohl"
SORT name.full ASC
```
