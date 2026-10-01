---
shortcode: affliction
name: {full: Afflictions, aliases: []}
type: doc
subType: reference
description: "Diseases, curses, poisons, and other ailments."
---

Diseases, curses, poisons, and other ailments.

An **affliction** is a hostile agent with a course of its own: it is contracted,
it runs, and it ends in cure, in a lasting condition, or in death. A **trauma**
is a state the body or mind is left in, graded rather than contracted. The
catalogues below cover both — the afflictions a character can contract, and the
trauma whose forms are written as content rather than raised by an event at the
table.

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

## Poison/Toxin

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

```sql
SELECT address.slug AS _ref,
       name.full    AS "Name",
       description  AS "Description"
FROM notes
WHERE type = 'trauma'
  AND sohl.kbcat = 'physprivations'
ORDER BY name.full COLLATE NOCASE
```

Privations are one family of [[doc-physclcn|physical condition]]; that page
carries the rest.

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

## Psychological Condition

```sql
SELECT address.slug AS _ref,
       name.full    AS "Name",
       description  AS "Description"
FROM notes
WHERE type = 'trauma'
  AND subType = 'psycond'
ORDER BY name.full COLLATE NOCASE
```
