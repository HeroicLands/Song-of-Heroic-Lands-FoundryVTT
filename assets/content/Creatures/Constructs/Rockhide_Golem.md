---
aliases:
    - Rockhide Golem
tags:
    - construct
name:
    full: Rockhide Golem
    aliases: []
id: macjCavPVAyzjGV9
slug: rockhide-golem
img: images/rockhide-golem-headshot.webp
portrait: images/rockhide-golem.webp
type: creature
package: thalorna
sohl:
    attributes:
        str: 29
        agl: 6
        per: 17
    attrRollFormula:
        str: 1d6+25
        agl: 1d4+3
        per: 1d6+13
    body:
        structure:
            parts: []
            adjacent: []
        weight:
            base: 1000
            calc: 1000
        reachBase: 0
        bodyScaleBase: 1.0
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 30
          leaguesPerWatch: 3
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
    defaultCombatGroup: null
    items: []
---

# Appearance {#appearance}

The ground trembles as the massive stone construct rises, its form an assemblage of layered rocks and boulders fused into something approaching humanoid shape. The exterior is armored in thick stone plates, and magical runes glow faintly across the surface. The eyes are deep-set, glowing like molten lava, burning with unwavering dedication and purpose. You are looking at something created from stone and sorcery, given movement and will through magical binding.

# Dossier {#dossier}

Rockhide Golems are engineered for defense and brute force, standing 10-12 feet tall and composed of fused stone and rock. These relentless guardians protect valuable treasures and important locations throughout ancient ruins and fortifications. Adventurers encounter them when approaching guarded sites or attempting theft from protected locations.

## Presentation

A humanoid figure constructed from massive stones and boulders fused together, with magical runes glowing across the surface. The overall form is powerful and imposing, sized to intimidate and overpower.

## Key Behaviors

Rockhide Golems execute their programming absolutely, defending assigned areas with relentless commitment and no deviation.

## Combat Strategy

The golem relies on overwhelming brute force and crushing strength to destroy threats.

## Attack Methods

### Crushing Blow

The golem delivers devastating impacts using immense strength.

### Boulder Throw

The golem tears loose stone and throws it as a projectile weapon.

## Special Abilities

### Stone Armor

Highly resistant to physical and fire damage.

### Structural Reassembly

If broken into pieces, the golem can reassemble itself from the scattered stone.

### Terrain Advantage

Uses landscape tactically, moving through rocky terrain with ease.

### Additional Information

Water and sonic attacks disrupt the golem’s structure. The golem cannot be negotiated with or destroyed through conventional damage alone.

## Attributes

- **Strength:** 26-31 (1d6+25)

- **Agility:** 4-7 (1d4+3)

- **Perception:** 14-19 (1d6+13)
