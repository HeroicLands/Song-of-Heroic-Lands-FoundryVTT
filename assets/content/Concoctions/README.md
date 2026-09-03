---
id: zo3tZIMKCKxVzfZ6
type: doc
subType: concoctiongear
name:
  full: Concoctions
  aliases: []
shortcode: concoctins
description: "Infusions, potions, elixirs, polutices, etc."
---

Infusions, potions, elixirs, polutices, etc.

## Simples

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", sohl.value as "Value", sohl.weight as "Weight", description AS "Description"
WHERE type = "concoctiongear" and subType = "mundane"
SORT name.full ASC
```

## Potions

### Mild

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", sohl.value as "Value", sohl.weight as "Weight", description AS "Description"
WHERE type = "concoctiongear" and subType = "exotic" and sohl.potency = "mild"
SORT name.full ASC
```

### Strong

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", sohl.value as "Value", sohl.weight as "Weight", description AS "Description"
WHERE type = "concoctiongear" and subType = "exotic" and sohl.potency = "strong"
SORT name.full ASC
```

### Great

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", sohl.value as "Value", sohl.weight as "Weight", description AS "Description"
WHERE type = "concoctiongear" and subType = "exotic" and sohl.potency = "great"
SORT name.full ASC
```

## Elixirs

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", sohl.value as "Value", sohl.weight as "Weight", description AS "Description"
WHERE type = "concoctiongear" and subType = "elixir"
SORT name.full ASC
```
