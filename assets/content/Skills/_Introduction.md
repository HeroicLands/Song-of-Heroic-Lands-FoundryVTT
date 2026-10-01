---
shortcode: skill
name: {full: Skills, aliases: []}
type: doc
subType: reference
description: Learned abilities and proficiencies.
---

Learned abilities and proficiencies — the trained and practiced competences that define what a character can actually _do_, as distinct from the innate gifts measured by their traits.

## Social

Skills for swaying hearts and minds — the arts of conversation, performance, persuasion, and deception by which characters navigate the tangled web of courts, markets, and hearths.

```sql
SELECT address.slug AS _ref,
       name.full    AS "Name",
       description  AS "Description"
FROM notes
WHERE type = 'skill'
  AND subType = 'social'
ORDER BY name.full COLLATE NOCASE
```

## Nature

Skills for working with the living world — husbandry of land, beast, and water, and the woodscraft that lets a traveler read the weather, follow a trail, and survive in the wild.

```sql
SELECT address.slug AS _ref,
       name.full    AS "Name",
       description  AS "Description"
FROM notes
WHERE type = 'skill'
  AND subType = 'nature'
ORDER BY name.full COLLATE NOCASE
```

## Craft

Hand-trades of the workshop — the shaping of raw material into finished goods, from stone and metal to hide, cloth, glass, and wood.

```sql
SELECT address.slug AS _ref,
       name.full    AS "Name",
       description  AS "Description"
FROM notes
WHERE type = 'skill'
  AND subType = 'craft'
ORDER BY name.full COLLATE NOCASE
```

## Lore

Bookish and professional knowledge — scholarship, reckoning, jurisprudence, medicine, and the learned trades that depend more on study than on a steady hand.

```sql
SELECT address.slug AS _ref,
       name.full    AS "Name",
       description  AS "Description"
FROM notes
WHERE type = 'skill'
  AND subType = 'lore'
ORDER BY name.full COLLATE NOCASE
```

## Physical

Skills of the trained body — balance, stealth, speed, and the finer coordination that turns raw attribute scores into reliable action.

```sql
SELECT address.slug AS _ref,
       name.full    AS "Name",
       description  AS "Description"
FROM notes
WHERE type = 'skill'
  AND subType = 'physical'
ORDER BY name.full COLLATE NOCASE
```

## Combat

Skills of the trained warrior — striking, parrying, shooting, and the timing and judgment that turn a brawl into a duel won.

```sql
SELECT address.slug AS _ref,
       name.full    AS "Name",
       description  AS "Description"
FROM notes
WHERE type = 'skill'
  AND subType = 'combat'
ORDER BY name.full COLLATE NOCASE
```

## Language

Spoken tongues — the languages a character can understand and speak, from mother tongue to the trade pidgins and courtly dialects of distant realms.

```sql
SELECT address.slug AS _ref,
       name.full    AS "Name",
       description  AS "Description"
FROM notes
WHERE type = 'skill'
  AND subType = 'language'
ORDER BY name.full COLLATE NOCASE
```

## Script

Written systems — the scripts a character can read and write, which may or may not correspond to the tongues they speak.

```sql
SELECT address.slug AS _ref,
       name.full    AS "Name",
       description  AS "Description"
FROM notes
WHERE type = 'skill'
  AND subType = 'script'
ORDER BY name.full COLLATE NOCASE
```

## Esoteric

Occult arts and hidden disciplines — alchemy, astrology, runecraft, tarotry, and the contemplative practices that brush against the supernatural.

```sql {allow-empty=true}
SELECT address.slug AS _ref,
       name.full    AS "Name",
       description  AS "Description"
FROM notes
WHERE type = 'skill'
  AND subType = 'esoteric'
ORDER BY name.full COLLATE NOCASE
```

## Ritual

Formal devotional practice — the sacred rites by which a character petitions a pantheon or faith for its aid, blessing, or intercession.

```sql {allow-empty=true}
SELECT address.slug AS _ref,
       name.full    AS "Name",
       description  AS "Description"
FROM notes
WHERE type = 'skill'
  AND subType = 'ritual'
ORDER BY name.full COLLATE NOCASE
```
