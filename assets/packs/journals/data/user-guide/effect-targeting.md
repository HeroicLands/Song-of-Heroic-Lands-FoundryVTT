---
title: "Effect Targeting"
slug: "effect-targeting"
category: "User Guide"
sort: 30
tags:
    - effects
    - targeting
    - regex
foundry:
    id: 07lxkoy2tgigpjpQ
    folderId: 9s8n7Xo2h5l1v3a
    ownership:
        default: 0
        y4rrosWqroRqTLhW: 3
---

# Overview {#CckLQziJoVXRfxK2}

SoHL extends Foundry Active Effects so one effect can target:

- itself,
- the owning actor,
- or other embedded items on the same actor.

This is controlled by two fields on each Active Effect: `targetType` and `targetName`.

See also: [Documentation Hub](README.md), [Combat Basics](user-guide/combat-basics.md)

# Target Properties {#gH7IQqpf4h2qNbEN}
## targetType 

- `this`:
    - apply the effect to the document where the effect is embedded.
    - If the effect is on an item, it affects that item.
    - If the effect is on an actor, it affects that actor.
- `actor`:
    - apply the effect to the owning actor's data model.
- `<item type>` (for example `skill`, `trait`, `weapongear`):
    - apply to all matching item documents of that type on the same actor,
    - further filtered by `targetName`.

## targetName

When `targetType` is an item type, `targetName` is treated as a regular expression.

- Candidate items are first filtered by item type.
- Remaining items are matched by shortcode against `targetName`.
- Matching items receive the effect changes.

## Safe regex patterns

Use precise patterns first, then broaden only if needed.

- Exact shortcode:
    - `^init$`
- Prefix family:
    - `^melee-`
- Explicit alternatives:
    - `^(sword|axe|spear)$`

Avoid broad patterns such as `.*` unless you intentionally want all shortcodes of that type.

## Practical examples

1. Buff only this item:
    - `targetType = this`
    - `targetName` ignored.

2. Apply a condition to actor-level stats:
    - `targetType = actor`
    - `targetName` ignored.

3. Apply to a subset of skills:
    - `targetType = skill`
    - `targetName = ^(init|dodge|awareness)$`

# Troubleshooting {#QiehNsrLSBO4tSbw}

- Nothing changes:
    - confirm `targetType` is set correctly,
    - if targeting items, verify regex matches actual shortcodes.
- Too many items changed:
    - tighten regex with `^` and `$`,
    - replace wildcard patterns with explicit alternatives.
