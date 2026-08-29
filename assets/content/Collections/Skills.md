---
aliases:
  - Skills
  - doc-skills2
id: AVuARfyd5TjmGqUh
name:
  full: Skills
  aliases: []
type: doc
category: collection
shortcode: skills2
section: skill
tags:
description: Learned abilities and proficiencies.
banner: banners/skill.webp
---

# Skills

Learned abilities and proficiencies — the trained and practiced competences that define what a character can actually _do_, as distinct from the innate gifts measured by their traits.

## Social

Skills for swaying hearts and minds — the arts of conversation, performance, persuasion, and deception by which characters navigate the tangled web of courts, markets, and hearths.

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", description AS "Description"
WHERE type = "skill" and sohl.subType = "social" and package = "sohl"
SORT name.full ASC
```

## Nature

Skills for working with the living world — husbandry of land, beast, and water, and the woodscraft that lets a traveler read the weather, follow a trail, and survive in the wild.

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", description AS "Description"
WHERE type = "skill" and sohl.subType = "nature" and package = "sohl"
SORT name.full ASC
```

## Craft

Hand-trades of the workshop — the shaping of raw material into finished goods, from stone and metal to hide, cloth, glass, and wood.

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", description AS "Description"
WHERE type = "skill" and sohl.subType = "craft" and package = "sohl"
SORT name.full ASC
```

## Lore

Bookish and professional knowledge — scholarship, reckoning, jurisprudence, medicine, and the learned trades that depend more on study than on a steady hand.

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", description AS "Description"
WHERE type = "skill" and sohl.subType = "lore" and package = "sohl"
SORT name.full ASC
```

## Physical

Skills of the trained body — balance, stealth, speed, and the finer coordination that turns raw attribute scores into reliable action.

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", description AS "Description"
WHERE type = "skill" and sohl.subType = "physical" and package = "sohl"
SORT name.full ASC
```

## Combat

Skills of the trained warrior — striking, parrying, shooting, and the timing and judgment that turn a brawl into a duel won.

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", description AS "Description"
WHERE type = "skill" and sohl.subType = "combat" and package = "sohl"
SORT name.full ASC
```

## Language

Spoken tongues — the languages a character can understand and speak, from mother tongue to the trade pidgins and courtly dialects of distant realms.

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", description AS "Description"
WHERE type = "skill" and sohl.subType = "language" and package = "sohl"
SORT name.full ASC
```

## Script

Written systems — the scripts a character can read and write, which may or may not correspond to the tongues they speak.

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", description AS "Description"
WHERE type = "skill" and sohl.subType = "script" and package = "sohl"
SORT name.full ASC
```

## Esoteric

Occult arts and hidden disciplines — alchemy, astrology, runecraft, tarotry, and the contemplative practices that brush against the supernatural.

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", description AS "Description"
WHERE type = "skill" and sohl.subType = "esoteric" and package = "sohl"
SORT name.full ASC
```

## Ritual

Formal devotional practice — the sacred rites by which a character petitions a pantheon or faith for its aid, blessing, or intercession.

```dataview
TABLE WITHOUT ID link(file.path, name.full) AS "Name", description AS "Description"
WHERE type = "skill" and sohl.subType = "ritual" and package = "sohl"
SORT name.full ASC
```
