---
id: YX8E9Qy0Ysm66VsH
name:
  full: Afflictions
  aliases: []
type: doc
shortcode: aflictions
section: affliction
tags:
description: Diseases, curses, poisons, and other ailments.
banner: banners/affliction.webp
---

Diseases, curses, poisons, and other ailments.

## Disease

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", description AS "Description"
WHERE type = "affliction" and sohl.subType = "disease" and package = "sohl"
SORT name.full ASC
```

## Poision/Toxin

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", description AS "Description"
WHERE type = "affliction" and sohl.subType = "poisontoxin" and package = "sohl"
SORT name.full ASC
```

## Privation

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", description AS "Description"
WHERE type = "affliction" and sohl.subType = "privation" and package = "sohl"
SORT name.full ASC
```

## Fatigue

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", description AS "Description"
WHERE type = "affliction" and sohl.subType = "fatigue" and package = "sohl"
SORT name.full ASC
```

## Fear

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", description AS "Description"
WHERE type = "affliction" and sohl.subType = "fear" and package = "sohl"
SORT name.full ASC
```

## Morale

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", description AS "Description"
WHERE type = "affliction" and sohl.subType = "morale" and package = "sohl"
SORT name.full ASC
```

## Infection

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", description AS "Description"
WHERE type = "affliction" and sohl.subType = "infection" and package = "sohl"
SORT name.full ASC
```

## Shadow

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", description AS "Description"
WHERE type = "affliction" and sohl.subType = "shadow" and package = "sohl"
SORT name.full ASC
```

## Psyche

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", description AS "Description"
WHERE type = "affliction" and sohl.subType = "psyche" and package = "sohl"
SORT name.full ASC
```

## Aural Shock

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", description AS "Description"
WHERE type = "affliction" and sohl.subType = "auralshock" and package = "sohl"
SORT name.full ASC
```
