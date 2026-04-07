---
title: "Combat Basics"
slug: "combat-basics"
category: "User Guide"
sort: 20
tags:
    - combat
    - tests
    - actions
foundry:
    id: yvxbLEj3LcSxOGOg
    folderId: 9s8n7Xo2h5l1v3a
    ownership:
        default: 0
        y4rrosWqroRqTLhW: 3
---

# Overview {#2DRbdpTMZqJDhWhv}

This page covers the minimum flow to run combat actions in SoHL.

See also: [Documentation Hub](README.md), [Character Creation](user-guide/character-creation.md), [Effect Targeting](user-guide/effect-targeting.md)

# Combat flow at a glance {#2kIpRp7rjfEoGMUu}

1. Identify acting character and target.
2. Choose a relevant action or strike mode.
3. Execute test from sheet/context action.
4. Review posted chat result.
5. Apply resulting state changes (injury, effects, positioning, follow-up actions).

# Running an attack {#qVsNYzF6WbOxLovT}

1. Open attacker sheet.
2. Select weapon/technique and strike mode.
3. Trigger attack action/test.
4. Resolve output shown in chat.

If your table uses additional house-rule logic, ensure related Action items or module hooks are enabled.

# Defenses and opposed resolution {#WpGtdzf06J4CxDIc}

Defenses may involve opposed or follow-up checks depending on the situation.

- Keep both actor sheets open when learning flow.
- Resolve in posted order from chat/results.
- Apply effects immediately to reduce drift.

# Hit location: aimed vs. unaimed strikes {#hLoc8mKd2vRtPqXz}

When an attack lands, the system determines which body part is struck. This works differently depending on whether the attacker aimed at a specific part.

## Unaimed strikes

An unaimed strike selects the hit location randomly, weighted by each body part's probability weight. Larger or more exposed parts (like the thorax) are struck more often than smaller ones (like the head). No accuracy value is involved.

## Aimed strikes

An aimed strike targets a specific body part and uses the attacker's **accuracy** to determine whether the strike lands where intended or drifts to a neighboring part.

The resolution works as follows:

1. If accuracy is less than or equal to the target part's probability weight, the aimed part is always hit.
2. Otherwise, a random number from 1 to accuracy is rolled. If the roll is within the part's probability weight, that part is hit.
3. On a miss, the accuracy is reduced by the part's probability weight, and the strike drifts to a random adjacent body part (weighted by probability). The check repeats from step 1 with the new part and reduced accuracy.
4. If there are no more adjacent parts to drift to, the current part is hit.

This means high accuracy relative to the target part makes aimed strikes reliable, while low accuracy causes the strike to wander along the body's adjacency graph. Aiming at a small, hard-to-hit part (low probability weight) with insufficient accuracy will often result in hitting a neighboring part instead.

# Injury and effects updates {#6uwrEK3c1Ud9c4o4}

After resolving a hit:

1. Apply injury/effect entries.
2. Verify derived values on the target sheet.
3. Confirm any duration-based effects are tracked.

# Practical table tips {#cekYOPb1LikJx8mH}

- Use consistent naming for weapons/abilities to reduce selection mistakes.
- Validate strike mode and projectile compatibility before rolling.
- Keep movement profile visible during tactical rounds.
