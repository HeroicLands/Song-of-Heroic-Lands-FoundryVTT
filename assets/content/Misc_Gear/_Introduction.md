---
shortcode: miscgear
name: {full: Miscellaneous Gear, aliases: []}
type: doc
subType: reference
description: Everyday equipment and sundry goods.
---

Everyday equipment and sundry goods.

## Clothing

```sql
SELECT address.slug           AS _ref,
       name.full              AS "Name",
       sohl.system.valueBase  AS "Value",
       sohl.system.weightBase AS "Weight",
       description            AS "Description"
FROM notes
WHERE type = 'miscgear'
  AND list_contains(tags, 'clothing')
ORDER BY name.full COLLATE NOCASE
```

## Cooking

```sql
SELECT address.slug           AS _ref,
       name.full              AS "Name",
       sohl.system.valueBase  AS "Value",
       sohl.system.weightBase AS "Weight",
       description            AS "Description"
FROM notes
WHERE type = 'miscgear'
  AND list_contains(tags, 'cooking')
ORDER BY name.full COLLATE NOCASE
```

## Expedition

```sql
SELECT address.slug           AS _ref,
       name.full              AS "Name",
       sohl.system.valueBase  AS "Value",
       sohl.system.weightBase AS "Weight",
       description            AS "Description"
FROM notes
WHERE type = 'miscgear'
  AND list_contains(tags, 'expedition')
ORDER BY name.full COLLATE NOCASE
```

## Food

```sql
SELECT address.slug           AS _ref,
       name.full              AS "Name",
       sohl.system.valueBase  AS "Value",
       sohl.system.weightBase AS "Weight",
       description            AS "Description"
FROM notes
WHERE type = 'miscgear'
  AND list_contains(tags, 'food')
ORDER BY name.full COLLATE NOCASE
```

## Instruments

```sql
SELECT address.slug           AS _ref,
       name.full              AS "Name",
       sohl.system.valueBase  AS "Value",
       sohl.system.weightBase AS "Weight",
       description            AS "Description"
FROM notes
WHERE type = 'miscgear'
  AND list_contains(tags, 'instruments')
ORDER BY name.full COLLATE NOCASE
```

## Jewelry & Cash

```sql
SELECT address.slug           AS _ref,
       name.full              AS "Name",
       sohl.system.valueBase  AS "Value",
       sohl.system.weightBase AS "Weight",
       description            AS "Description"
FROM notes
WHERE type = 'miscgear'
  AND list_contains(tags, 'jewelry_cash')
ORDER BY name.full COLLATE NOCASE
```

## Lighting

```sql
SELECT address.slug           AS _ref,
       name.full              AS "Name",
       sohl.system.valueBase  AS "Value",
       sohl.system.weightBase AS "Weight",
       description            AS "Description"
FROM notes
WHERE type = 'miscgear'
  AND list_contains(tags, 'lighting')
ORDER BY name.full COLLATE NOCASE
```

## Medical

```sql
SELECT address.slug           AS _ref,
       name.full              AS "Name",
       sohl.system.valueBase  AS "Value",
       sohl.system.weightBase AS "Weight",
       description            AS "Description"
FROM notes
WHERE type = 'miscgear'
  AND list_contains(tags, 'medical')
ORDER BY name.full COLLATE NOCASE
```

## Music

```sql
SELECT address.slug           AS _ref,
       name.full              AS "Name",
       sohl.system.valueBase  AS "Value",
       sohl.system.weightBase AS "Weight",
       description            AS "Description"
FROM notes
WHERE type = 'miscgear'
  AND list_contains(tags, 'music')
ORDER BY name.full COLLATE NOCASE
```

## Natural

```sql
SELECT address.slug           AS _ref,
       name.full              AS "Name",
       sohl.system.valueBase  AS "Value",
       sohl.system.weightBase AS "Weight",
       description            AS "Description"
FROM notes
WHERE type = 'miscgear'
  AND list_contains(tags, 'natural')
ORDER BY name.full COLLATE NOCASE
```

## Religious

```sql
SELECT address.slug           AS _ref,
       name.full              AS "Name",
       sohl.system.valueBase  AS "Value",
       sohl.system.weightBase AS "Weight",
       description            AS "Description"
FROM notes
WHERE type = 'miscgear'
  AND list_contains(tags, 'religious')
ORDER BY name.full COLLATE NOCASE
```

## Scribe

```sql
SELECT address.slug           AS _ref,
       name.full              AS "Name",
       sohl.system.valueBase  AS "Value",
       sohl.system.weightBase AS "Weight",
       description            AS "Description"
FROM notes
WHERE type = 'miscgear'
  AND list_contains(tags, 'scribe')
ORDER BY name.full COLLATE NOCASE
```

## Spirits

```sql
SELECT address.slug           AS _ref,
       name.full              AS "Name",
       sohl.system.valueBase  AS "Value",
       sohl.system.weightBase AS "Weight",
       description            AS "Description"
FROM notes
WHERE type = 'miscgear'
  AND list_contains(tags, 'spirits')
ORDER BY name.full COLLATE NOCASE
```

## Stone

```sql
SELECT address.slug           AS _ref,
       name.full              AS "Name",
       sohl.system.valueBase  AS "Value",
       sohl.system.weightBase AS "Weight",
       description            AS "Description"
FROM notes
WHERE type = 'miscgear'
  AND list_contains(tags, 'stone')
ORDER BY name.full COLLATE NOCASE
```

## Tack

```sql
SELECT address.slug           AS _ref,
       name.full              AS "Name",
       sohl.system.valueBase  AS "Value",
       sohl.system.weightBase AS "Weight",
       description            AS "Description"
FROM notes
WHERE type = 'miscgear'
  AND list_contains(tags, 'tack')
ORDER BY name.full COLLATE NOCASE
```
