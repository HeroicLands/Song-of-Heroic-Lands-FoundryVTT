---
id: PK3S3tmvGF9iEbWW
name:
  full: Mysteries
  aliases: []
type: doc
shortcode: mysteries
section: mystery
tags:
description: Esoteric knowledge and hidden lore.
banner: banners/mystery.webp
---

# Mysteries

Esoteric knowledge and hidden lore.

## Grace

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", description AS "Description"
WHERE type = "mystery" and sohl.subType = "grace" and package = "sohl"
SORT name.full ASC
```

## Piety

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", description AS "Description"
WHERE type = "mystery" and sohl.subType = "piety" and package = "sohl"
SORT name.full ASC
```

## Fate

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", description AS "Description"
WHERE type = "mystery" and sohl.subType = "fate" and package = "sohl"
SORT name.full ASC
```

## Fate Bonus

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", description AS "Description"
WHERE type = "mystery" and sohl.subType = "fateBonus" and package = "sohl"
SORT name.full ASC
```

## Fate Point Bonus

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", description AS "Description"
WHERE type = "mystery" and sohl.subType = "fatePointBonus" and package = "sohl"
SORT name.full ASC
```

## Blessing

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", description AS "Description"
WHERE type = "mystery" and sohl.subType = "blessing" and package = "sohl"
SORT name.full ASC
```

## Ancestor Spirit Power

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", description AS "Description"
WHERE type = "mystery" and sohl.subType = "ancestorSpiritPower" and package = "sohl"
SORT name.full ASC
```

## Totem Spirit Power

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", description AS "Description"
WHERE type = "mystery" and sohl.subType = "totemSpiritPower" and package = "sohl"
SORT name.full ASC
```
