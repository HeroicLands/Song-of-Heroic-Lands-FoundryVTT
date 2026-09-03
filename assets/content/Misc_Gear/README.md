---
id: gw0PK5jHBTEdEEQR
type: doc
subType: miscgear
name:
  full: Miscellaneous Gear
  aliases: []
shortcode: miscelnsgr
description: Everyday equipment and sundry goods.
---

Everyday equipment and sundry goods.

## Clothing

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", sohl.value as "Value", sohl.weight as "Weight", description AS "Description"
WHERE type = "miscgear" and contains(file.tags, "clothing")
SORT name.full ASC
```

## Cooking

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", sohl.value as "Value", sohl.weight as "Weight", description AS "Description"
WHERE type = "miscgear" and contains(file.tags, "cooking")
SORT name.full ASC
```

## Expedition

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", sohl.value as "Value", sohl.weight as "Weight", description AS "Description"
WHERE type = "miscgear" and contains(file.tags, "expedition")
SORT name.full ASC
```

## Food

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", sohl.value as "Value", sohl.weight as "Weight", description AS "Description"
WHERE type = "miscgear" and contains(file.tags, "food")
SORT name.full ASC
```

## Instruments

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", sohl.value as "Value", sohl.weight as "Weight", description AS "Description"
WHERE type = "miscgear" and contains(file.tags, "instruments")
SORT name.full ASC
```

## Jewelry & Cash

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", sohl.value as "Value", sohl.weight as "Weight", description AS "Description"
WHERE type = "miscgear" and contains(file.tags, "jewelry_cash")
SORT name.full ASC
```

## Lighting

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", sohl.value as "Value", sohl.weight as "Weight", description AS "Description"
WHERE type = "miscgear" and contains(file.tags, "lighting")
SORT name.full ASC
```

## Medical

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", sohl.value as "Value", sohl.weight as "Weight", description AS "Description"
WHERE type = "miscgear" and contains(file.tags, "medical")
SORT name.full ASC
```

## Music

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", sohl.value as "Value", sohl.weight as "Weight", description AS "Description"
WHERE type = "miscgear" and contains(file.tags, "music")
SORT name.full ASC
```

## Natural

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", sohl.value as "Value", sohl.weight as "Weight", description AS "Description"
WHERE type = "miscgear" and contains(file.tags, "natural")
SORT name.full ASC
```

## Religous

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", sohl.value as "Value", sohl.weight as "Weight", description AS "Description"
WHERE type = "miscgear" and contains(file.tags, "religous")
SORT name.full ASC
```

## Scribe

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", sohl.value as "Value", sohl.weight as "Weight", description AS "Description"
WHERE type = "miscgear" and contains(file.tags, "scribe")
SORT name.full ASC
```

## Spirits

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", sohl.value as "Value", sohl.weight as "Weight", description AS "Description"
WHERE type = "miscgear" and contains(file.tags, "spirits")
SORT name.full ASC
```

## Stone

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", sohl.value as "Value", sohl.weight as "Weight", description AS "Description"
WHERE type = "miscgear" and contains(file.tags, "stone")
SORT name.full ASC
```

## Tack

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", sohl.value as "Value", sohl.weight as "Weight", description AS "Description"
WHERE type = "miscgear" and contains(file.tags, "tack")
SORT name.full ASC
```
