---
shortcode: affliction
name: {full: Afflictions, aliases: []}
type: doc
subType: reference
description: "Diseases, curses, poisons, and other ailments."
---

Diseases, curses, poisons, and other ailments.

## Disease

```sql
SELECT address.slug AS _ref,
       name.full    AS "Name",
       description  AS "Description"
FROM notes
WHERE type = 'affliction'
  AND subType = 'disease'
ORDER BY name.full COLLATE NOCASE
```

## Poision/Toxin

```sql
SELECT address.slug AS _ref,
       name.full    AS "Name",
       description  AS "Description"
FROM notes
WHERE type = 'affliction'
  AND subType = 'poisontoxin'
ORDER BY name.full COLLATE NOCASE
```

## Privation

```sql {allow-empty=true}
SELECT address.slug AS _ref,
       name.full    AS "Name",
       description  AS "Description"
FROM notes
WHERE type = 'affliction'
  AND subType = 'privation'
ORDER BY name.full COLLATE NOCASE
```

## Fatigue

```sql
SELECT address.slug AS _ref,
       name.full    AS "Name",
       description  AS "Description"
FROM notes
WHERE type = 'trauma'
  AND subType = 'fatigue'
ORDER BY name.full COLLATE NOCASE
```

## Fear

```sql
SELECT address.slug AS _ref,
       name.full    AS "Name",
       description  AS "Description"
FROM notes
WHERE type = 'trauma'
  AND subType = 'fear'
ORDER BY name.full COLLATE NOCASE
```

## Morale

```sql {allow-empty=true}
SELECT address.slug AS _ref,
       name.full    AS "Name",
       description  AS "Description"
FROM notes
WHERE type = 'affliction'
  AND subType = 'morale'
ORDER BY name.full COLLATE NOCASE
```

## Infection

```sql {allow-empty=true}
SELECT address.slug AS _ref,
       name.full    AS "Name",
       description  AS "Description"
FROM notes
WHERE type = 'affliction'
  AND subType = 'infection'
ORDER BY name.full COLLATE NOCASE
```

## Shadow

```sql {allow-empty=true}
SELECT address.slug AS _ref,
       name.full    AS "Name",
       description  AS "Description"
FROM notes
WHERE type = 'affliction'
  AND subType = 'shadow'
ORDER BY name.full COLLATE NOCASE
```

## Psyche

```sql {allow-empty=true}
SELECT address.slug AS _ref,
       name.full    AS "Name",
       description  AS "Description"
FROM notes
WHERE type = 'affliction'
  AND subType = 'psyche'
ORDER BY name.full COLLATE NOCASE
```

## Aural Shock

```sql {allow-empty=true}
SELECT address.slug AS _ref,
       name.full    AS "Name",
       description  AS "Description"
FROM notes
WHERE type = 'affliction'
  AND subType = 'auralshock'
ORDER BY name.full COLLATE NOCASE
```
