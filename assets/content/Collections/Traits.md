---
aliases:
  - Traits
id: b6UHh4QRhBkDNf02
name:
  full: Traits
  aliases: []
type: doc
category: collection
shortcode: traits
section: trait
tags:
description: Personality and physical traits.
banner: banners/trait.webp
---

## Attributes

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", sohl.subType as "SubType", description AS "Description"
WHERE type = "trait" and intensity = "attribute" and package = "sohl"
SORT sort ASC
```

## Physique Traits

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", intensity as "Intensity", description AS "Description"
WHERE type = "trait" and sohl.subType = "physique" and intensity != "attribute" and package = "sohl"
SORT intensity, name.full ASC
```

## Personality Traits

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", intensity as "Intensity", description AS "Description"
WHERE type = "trait" and sohl.subType = "personality" and intensity != "attribute" and package = "sohl"
SORT intensity, name.full ASC
```

## Transcendant Traits

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", intensity as "Intensity", description AS "Description"
WHERE type = "trait" and sohl.subType = "transcendent" and intensity != "attribute" and package = "sohl"
SORT intensity, name.full ASC
```
