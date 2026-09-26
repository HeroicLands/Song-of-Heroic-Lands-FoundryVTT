---
shortcode: mysticalability
name: {full: Mystical Abilities, aliases: []}
type: doc
subType: reference
description: Magical and supernatural powers.
---

## Arcane Incantation

```sql :allow-empty
SELECT address.slug AS _ref,
       name.full    AS "Name",
       description  AS "Description"
FROM notes
WHERE type = 'mysticalability'
  AND subType = 'arcaneincantation'
ORDER BY name.full COLLATE NOCASE
```

## Arcane Talent

```sql
SELECT address.slug AS _ref,
       name.full    AS "Name",
       description  AS "Description"
FROM notes
WHERE type = 'mysticalability'
  AND subType = 'arcanetalent'
ORDER BY name.full COLLATE NOCASE
```

## Shamanic Rite

```sql :allow-empty
SELECT address.slug AS _ref,
       name.full    AS "Name",
       description  AS "Description"
FROM notes
WHERE type = 'mysticalability'
  AND subType = 'shamanicrite'
ORDER BY name.full COLLATE NOCASE
```

## Spirit Action

```sql
SELECT address.slug AS _ref,
       name.full    AS "Name",
       description  AS "Description"
FROM notes
WHERE type = 'mysticalability'
  AND subType = 'spiritaction'
ORDER BY name.full COLLATE NOCASE
```

## Spirit Power

```sql :allow-empty
SELECT address.slug AS _ref,
       name.full    AS "Name",
       description  AS "Description"
FROM notes
WHERE type = 'mysticalability'
  AND subType = 'spiritpower'
ORDER BY name.full COLLATE NOCASE
```

## Benediction

```sql :allow-empty
SELECT address.slug AS _ref,
       name.full    AS "Name",
       description  AS "Description"
FROM notes
WHERE type = 'mysticalability'
  AND subType = 'benediction'
ORDER BY name.full COLLATE NOCASE
```

## Divine Devotion

```sql :allow-empty
SELECT address.slug AS _ref,
       name.full    AS "Name",
       description  AS "Description"
FROM notes
WHERE type = 'mysticalability'
  AND subType = 'divinedevotion'
ORDER BY name.full COLLATE NOCASE
```

## Divine Incantation

```sql :allow-empty
SELECT address.slug AS _ref,
       name.full    AS "Name",
       description  AS "Description"
FROM notes
WHERE type = 'mysticalability'
  AND subType = 'divineincantation'
ORDER BY name.full COLLATE NOCASE
```

## Spirit Talent

```sql :allow-empty
SELECT address.slug AS _ref,
       name.full    AS "Name",
       description  AS "Description"
FROM notes
WHERE type = 'mysticalability'
  AND subType = 'spirittalent'
ORDER BY name.full COLLATE NOCASE
```

## Alchemy

```sql
SELECT address.slug AS _ref,
       name.full    AS "Name",
       description  AS "Description"
FROM notes
WHERE type = 'mysticalability'
  AND subType = 'alchemy'
ORDER BY name.full COLLATE NOCASE
```

## Divination

```sql
SELECT address.slug AS _ref,
       name.full    AS "Name",
       description  AS "Description"
FROM notes
WHERE type = 'mysticalability'
  AND subType = 'divination'
ORDER BY name.full COLLATE NOCASE
```
