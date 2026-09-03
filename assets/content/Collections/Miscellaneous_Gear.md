---
id: gw0PK5jHBTEdEEQR
name:
  full: Miscellaneous Gear
  aliases: []
type: doc
shortcode: miscelnsgr
section: miscgear
tags:
description: Everyday equipment and sundry goods.
banner: banners/miscgear.webp
---

# Miscellaneous Gear

Everyday equipment and sundry goods.

## Clothing

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", sohl.value as "Value", sohl.weight as "Weight", description AS "Description"
WHERE type = "miscgear" and contains(file.tags, "clothing") and package = "sohl"
SORT name.full ASC
```

## Cooking

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", sohl.value as "Value", sohl.weight as "Weight", description AS "Description"
WHERE type = "miscgear" and contains(file.tags, "cooking") and package = "sohl"
SORT name.full ASC
```

## Expedition

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", sohl.value as "Value", sohl.weight as "Weight", description AS "Description"
WHERE type = "miscgear" and contains(file.tags, "expedition") and package = "sohl"
SORT name.full ASC
```

## Food

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", sohl.value as "Value", sohl.weight as "Weight", description AS "Description"
WHERE type = "miscgear" and contains(file.tags, "food") and package = "sohl"
SORT name.full ASC
```

## Instruments

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", sohl.value as "Value", sohl.weight as "Weight", description AS "Description"
WHERE type = "miscgear" and contains(file.tags, "instruments") and package = "sohl"
SORT name.full ASC
```

## Jewelry & Cash

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", sohl.value as "Value", sohl.weight as "Weight", description AS "Description"
WHERE type = "miscgear" and contains(file.tags, "jewelry_cash") and package = "sohl"
SORT name.full ASC
```

## Lighting

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", sohl.value as "Value", sohl.weight as "Weight", description AS "Description"
WHERE type = "miscgear" and contains(file.tags, "lighting") and package = "sohl"
SORT name.full ASC
```

## Medical

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", sohl.value as "Value", sohl.weight as "Weight", description AS "Description"
WHERE type = "miscgear" and contains(file.tags, "medical") and package = "sohl"
SORT name.full ASC
```

## Music

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", sohl.value as "Value", sohl.weight as "Weight", description AS "Description"
WHERE type = "miscgear" and contains(file.tags, "music") and package = "sohl"
SORT name.full ASC
```

## Natural

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", sohl.value as "Value", sohl.weight as "Weight", description AS "Description"
WHERE type = "miscgear" and contains(file.tags, "natural") and package = "sohl"
SORT name.full ASC
```

## Religous

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", sohl.value as "Value", sohl.weight as "Weight", description AS "Description"
WHERE type = "miscgear" and contains(file.tags, "religous") and package = "sohl"
SORT name.full ASC
```

## Scribe

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", sohl.value as "Value", sohl.weight as "Weight", description AS "Description"
WHERE type = "miscgear" and contains(file.tags, "scribe") and package = "sohl"
SORT name.full ASC
```

## Spirits

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", sohl.value as "Value", sohl.weight as "Weight", description AS "Description"
WHERE type = "miscgear" and contains(file.tags, "spirits") and package = "sohl"
SORT name.full ASC
```

## Stone

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", sohl.value as "Value", sohl.weight as "Weight", description AS "Description"
WHERE type = "miscgear" and contains(file.tags, "stone") and package = "sohl"
SORT name.full ASC
```

## Tack

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", sohl.value as "Value", sohl.weight as "Weight", description AS "Description"
WHERE type = "miscgear" and contains(file.tags, "tack") and package = "sohl"
SORT name.full ASC
```
