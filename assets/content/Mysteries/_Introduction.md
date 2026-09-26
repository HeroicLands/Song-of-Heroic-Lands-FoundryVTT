---
shortcode: mystery
name: {full: Mysteries, aliases: []}
type: doc
subType: reference
description: Esoteric knowledge and hidden lore.
---

Esoteric knowledge and hidden lore.

## Grace

```sql :allow-empty
SELECT address.slug AS _ref,
       name.full    AS "Name",
       description  AS "Description"
FROM notes
WHERE type = 'mystery'
  AND subType = 'grace'
ORDER BY name.full COLLATE NOCASE
```

## Piety

```sql :allow-empty
SELECT address.slug AS _ref,
       name.full    AS "Name",
       description  AS "Description"
FROM notes
WHERE type = 'mystery'
  AND subType = 'piety'
ORDER BY name.full COLLATE NOCASE
```

## Fate

```sql :allow-empty
SELECT address.slug AS _ref,
       name.full    AS "Name",
       description  AS "Description"
FROM notes
WHERE type = 'mystery'
  AND subType = 'fate'
ORDER BY name.full COLLATE NOCASE
```

## Fate Bonus

```sql :allow-empty
SELECT address.slug AS _ref,
       name.full    AS "Name",
       description  AS "Description"
FROM notes
WHERE type = 'mystery'
  AND subType = 'fateBonus'
ORDER BY name.full COLLATE NOCASE
```

## Fate Point Bonus

```sql :allow-empty
SELECT address.slug AS _ref,
       name.full    AS "Name",
       description  AS "Description"
FROM notes
WHERE type = 'mystery'
  AND subType = 'fatePointBonus'
ORDER BY name.full COLLATE NOCASE
```

## Blessing

```sql :allow-empty
SELECT address.slug AS _ref,
       name.full    AS "Name",
       description  AS "Description"
FROM notes
WHERE type = 'mystery'
  AND subType = 'blessing'
ORDER BY name.full COLLATE NOCASE
```

## Ancestor Spirit Power

```sql :allow-empty
SELECT address.slug AS _ref,
       name.full    AS "Name",
       description  AS "Description"
FROM notes
WHERE type = 'mystery'
  AND subType = 'ancestorSpiritPower'
ORDER BY name.full COLLATE NOCASE
```

## Totem Spirit Power

```sql :allow-empty
SELECT address.slug AS _ref,
       name.full    AS "Name",
       description  AS "Description"
FROM notes
WHERE type = 'mystery'
  AND subType = 'totemSpiritPower'
ORDER BY name.full COLLATE NOCASE
```
