---
aliases:
    - Xerathian Forest Elephant
tags:
    - animal
name:
    full: Xerathian Forest Elephant
    aliases: []
id: pGoe1xHOveNk8ycM
slug: xerathian-forest-elephant
img: icons/game-icons/delapouite/elephant.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 27
        end: 23
        dex: 10
        agl: 9
        per: 15
        aur: 12
        wil: 15
        rea: 11
        cre: 7
    attrRollFormula:
        str: 1d6+23
        end: 1d6+19
        dex: 1d4+7
        agl: 1d4+6
        per: 1d6+11
        aur: 1d6+8
        wil: 1d6+11
        rea: 1d6+7
        cre: 1d4+4
    body:
        structure:
            parts: []
            adjacent: []
        weight:
            base: 10000
            calc: 10000
        reachBase: 0
        bodyScaleBase: 1.0
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 60
          leaguesPerWatch: 6
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
    defaultCombatGroup: null
    items: []
---

# Appearance {#appearance}

The forest seems to move as a single unit before separating into distinct creature: massive, dark-skinned, and emerging with surprising grace from dense vegetation. The rounded ears fan humid air, and the straighter tusks point downward, carving through foliage with practiced ease. The trunk curls and unfolds with obvious intelligence, sampling scents and reaching for vegetation. The eyes are remarkable in their awareness and wariness.

# Dossier {#dossier}

The Xerathian Forest Elephant is smaller and more elusive than its savanna cousin, standing 8-9 feet at the shoulder and weighing 4-5 tons, found exclusively in dense tropical forests. These intelligent, reclusive creatures are rarely encountered by humans due to their avoidance of human areas and their camouflage in forest environments.

## Presentation

The forest elephant has darker gray or brownish skin compared to savanna elephants, straighter downward-pointing tusks, and relatively rounded ears. The build is adapted for forest navigation rather than open grasslands.

## Key Behaviors

Forest elephants are shy and avoid human contact when possible. They feed on wide variety of forest vegetation and play crucial role in seed dispersal. They are highly intelligent and social within family groups.

## Combat Strategy

When threatened, the forest elephant charges using tusks and trunk. It is less aggressive than savanna cousins but equally dangerous when defending young or territory.

## Attack Methods

### Tusk Gore

The elephant uses its downward-pointing tusks to gore and create wounds.

### Trunk Blow

The trunk delivers powerful strikes capable of knocking opponents backward.

## Special Abilities

### Forest Navigation

The elephant can move through dense terrain with remarkable grace and speed.

### Intelligent Problem-Solving

The elephant understands and responds to threats tactically.

### Additional Information

Forest elephants avoid confrontation and will flee if escape is possible. The creatures are most dangerous when defending young or territory. The tusks can be harvested after death.

## Attributes

- **Strength:** 24-29 (1d6+23)

- **Endurance:** 20-25 (1d6+19)

- **Dexterity:** 8-11 (1d4+7)

- **Agility:** 7-10 (1d4+6)

- **Perception:** 12-17 (1d6+11)

- **Aura:** 9-14 (1d6+8)

- **Will:** 12-17 (1d6+11)

- **Reasoning:** 8-13 (1d6+7)

- **Creativity:** 5-8 (1d4+4)
