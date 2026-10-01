---
shortcode: concoctiongear
name: {full: Concoctions, aliases: []}
type: doc
subType: reference
description: "Infusions, potions, elixirs, polutices, etc."
---

Infusions, potions, elixirs, polutices, etc.

## Simples

```sql {allow-empty=true}
SELECT address.slug           AS _ref,
       name.full              AS "Name",
       sohl.system.valueBase  AS "Value",
       sohl.system.weightBase AS "Weight",
       description            AS "Description"
FROM notes
WHERE type = 'concoctiongear'
  AND subType = 'mundane'
ORDER BY name.full COLLATE NOCASE
```

## Potions

### Mild

```sql {allow-empty=true}
SELECT address.slug           AS _ref,
       name.full              AS "Name",
       sohl.system.valueBase  AS "Value",
       sohl.system.weightBase AS "Weight",
       description            AS "Description"
FROM notes
WHERE type = 'concoctiongear'
  AND subType = 'exotic'
  AND json_extract_string(to_json(sohl.system), 'potency') = 'mild'
ORDER BY name.full COLLATE NOCASE
```

### Strong

```sql {allow-empty=true}
SELECT address.slug           AS _ref,
       name.full              AS "Name",
       sohl.system.valueBase  AS "Value",
       sohl.system.weightBase AS "Weight",
       description            AS "Description"
FROM notes
WHERE type = 'concoctiongear'
  AND subType = 'exotic'
  AND json_extract_string(to_json(sohl.system), 'potency') = 'strong'
ORDER BY name.full COLLATE NOCASE
```

### Great

```sql {allow-empty=true}
SELECT address.slug           AS _ref,
       name.full              AS "Name",
       sohl.system.valueBase  AS "Value",
       sohl.system.weightBase AS "Weight",
       description            AS "Description"
FROM notes
WHERE type = 'concoctiongear'
  AND subType = 'exotic'
  AND json_extract_string(to_json(sohl.system), 'potency') = 'great'
ORDER BY name.full COLLATE NOCASE
```

## Elixirs

```sql {allow-empty=true}
SELECT address.slug           AS _ref,
       name.full              AS "Name",
       sohl.system.valueBase  AS "Value",
       sohl.system.weightBase AS "Weight",
       description            AS "Description"
FROM notes
WHERE type = 'concoctiongear'
  AND subType = 'elixir'
ORDER BY name.full COLLATE NOCASE
```
