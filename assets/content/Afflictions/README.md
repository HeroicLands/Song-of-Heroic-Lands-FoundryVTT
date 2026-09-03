---
id: YX8E9Qy0Ysm66VsH
type: doc
subType: affliction
name:
  full: Afflictions
  aliases: []
shortcode: aflictions
description: "Diseases, curses, poisons, and other ailments."
---

Diseases, curses, poisons, and other ailments.

## Disease

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", description AS "Description"
WHERE type = "affliction" and subType = "disease"
SORT name.full ASC
```

## Poision/Toxin

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", description AS "Description"
WHERE type = "affliction" and subType = "poisontoxin"
SORT name.full ASC
```

## Privation

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", description AS "Description"
WHERE type = "affliction" and subType = "privation"
SORT name.full ASC
```

## Fatigue

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", description AS "Description"
WHERE type = "affliction" and subType = "fatigue"
SORT name.full ASC
```

## Fear

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", description AS "Description"
WHERE type = "affliction" and subType = "fear"
SORT name.full ASC
```

## Morale

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", description AS "Description"
WHERE type = "affliction" and subType = "morale"
SORT name.full ASC
```

## Infection

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", description AS "Description"
WHERE type = "affliction" and subType = "infection"
SORT name.full ASC
```

## Shadow

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", description AS "Description"
WHERE type = "affliction" and subType = "shadow"
SORT name.full ASC
```

## Psyche

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", description AS "Description"
WHERE type = "affliction" and subType = "psyche"
SORT name.full ASC
```

## Aural Shock

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", description AS "Description"
WHERE type = "affliction" and subType = "auralshock"
SORT name.full ASC
```
