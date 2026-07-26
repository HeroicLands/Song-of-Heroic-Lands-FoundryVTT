---
aliases:
    - Necrotic Mire
tags:
    - dreadspawn
name:
    full: Necrotic Mire
    aliases: []
id: 9kj0im7ByCh6WOTA
slug: necrotic-mire
img: images/necrotic-mire-headshot.webp
portrait: images/necrotic-mire.webp
type: creature
package: thalorna
sohl:
    attributes:
        str: 12
        end: 20
        dex: 10
        agl: 8
        per: 14
        aur: 20
        wil: 16
        rea: 10
        cre: 8
    attrRollFormula:
        str: 1d4+9
        end: 1d6+16
        dex: 1d6+6
        agl: 1d6+4
        per: 1d6+10
        aur: 1d6+16
        wil: 1d4+13
        rea: 1d6+6
        cre: 1d6+4
    body:
        structure:
            parts: []
            adjacent: []
        weight:
            base: 500
            calc: 500
        reachBase: 0
        bodyScaleBase: 1.0
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 20
          leaguesPerWatch: 1
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors:
              - scope: surface_cover
                key: wetlands
                mode: add
                textValue: "0"
              - scope: hydrology
                key: shallow
                mode: add
                textValue: "0"
          disabled: false
    defaultCombatGroup: null
    items: []
---

# Appearance {#appearance}

The swamp water ahead darkens and thickens, a black slick spreading across the surface like spilled oil. As it rises, the reek of millennia-old corpses and purifying flesh floods your senses—a choking, almost physical presence. The ooze forms a loosely humanoid shape, its surface roiling with blisters and pustules that burst to release vapors. Where the dark slime touches living things—grass, trees, flesh—they wither and blacken as though exposed to decades of decay in mere seconds. The creature has no eyes, yet you feel utterly, inexplicably watched by something that hungers with a ghastly patience.

# Dossier {#dossier}

The Necrotic Mire is not a creature in the traditional sense but rather a manifestation of death itself—an ooze animated by the concentrated essence of decay and corruption. It arises in deep swamps where countless creatures have died and rotted in place, their decomposition concentrated by stagnant water and airless depths until something wakens within the miasma. Once animate, a Necrotic Mire spreads inexorably, consuming everything organic and growing stronger with each meal. It exudes a tangible aura of death that withers living things and poisons the very air; entire regions of swamp can die around one of these creatures as it slowly devours the ecosystem that spawned it.

## Presentation

A Necrotic Mire has no fixed form, but typically manifests as a column or blob of ebon sludge standing 4 to 8 feet in height. Its surface roils constantly, undulating with a sickening, organic motion, blistered with pustules and boils that leak dark, caustic fluid. The creature smells overwhelmingly of rotting flesh, sulfur, and grave-earth—a stench so potent it can sicken the stomach of even hardened soldiers. Its movement leaves a trail of blackened, dead earth and vegetation; anything it brushes against withers instantly. The air within ten feet of the creature seems to grow thicker and harder to breathe, and the temperature drops to the bitter chill of a tomb.

## Key Behaviors

A Necrotic Mire exists for a single purpose: consumption and growth. It moves slowly but inexorably through its chosen territory—typically a swamp or wetland—devouring everything edible and spreading its corruption with each passing day. The creature is not mindless; it demonstrates a cunning ability to sense prey at distance through vibrations in water and ground, and it will position itself at watering holes or crossing points where living things must pass. It regenerates continuously as long as it remains in contact with organic material, making it nearly impossible to weaken unless isolated on barren ground. Necrotic Mires grow only marginally faster when actively hunting; their expansion is steady and relentless whether prey is scarce or abundant.

## Combat Strategy

A Necrotic Mire does not flee or strategize in the sense that mobile creatures do—it simply advances, consuming whatever lies before it. It may attempt to engulf a single target while ignoring others, prioritizing what it can fully encompass. If severely damaged or isolated from organic matter, it will retreat into the deepest, wettest part of its territory where regeneration is fastest. The creature's true power is not in active combat but in its poisonous aura, which weakens opponents and forces them into desperate decisions. Most combats against a Necrotic Mire hinge not on defeating the creature directly but on making it retreat by denying it access to its sustaining corpses and detritus.

## Attack Methods

### Engulfing Surge

The creature surges forward, attempting to envelope a target partially or wholly within its corrosive mass. Those caught experience rapidly accelerating dissolution of flesh and equipment as the ooze exerts constant, grinding pressure.

### Corrosive Spray

The Mire expels acidic vapors or liquid, spraying opponents within several feet with caustic, bone-eating material that eats through armor and skin alike.

## Special Abilities

### Aura of Decay

Everything within fifteen feet of the Necrotic Mire experiences the visceral presence of death and decay. Living creatures feel their life force sapped; plants wither; exposed flesh begins to rot. Those with weak constitutions may become physically ill from the miasma alone.

### Undying Regeneration

As long as the creature remains in contact with organic matter—corpses, plants, soil rich with decay—it heals rapidly from all damage. Only sustained attacks from fire, acid, or powerful magical sources can overcome this regeneration.

### Death Feeding

The creature grows larger and stronger with each organic meal. A Necrotic Mire that has feasted on a human corpse is noticeably more dangerous than one reduced to dining on swamp vegetation.

## Additional Information

Fire is the Necrotic Mire's greatest vulnerability, instantly destroying portions of its mass and preventing regeneration in the burned areas. Similarly, powerful acid or positive magical energy can force it into retreat. Isolation from organic matter causes it to weaken and eventually dissolve entirely, though this process takes weeks or months depending on the creature's size. Some desperate communities have attempted to contain a Necrotic Mire by surrounding it with salt circles or driving it into barren, dead earth where nothing grows. The creature's remains, if completely destroyed, leave behind only a toxic sludge with no useful properties—though the land underneath may take years to recover from its presence.

## Attributes

- **Strength:** 10-13 (1d4+9)

- **Endurance:** 17-22 (1d6+16)

- **Dexterity:** 7-12 (1d6+6)

- **Agility:** 5-10 (1d6+4)

- **Perception:** 11-16 (1d6+10)

- **Aura:** 17-22 (1d6+16)

- **Will:** 14-17 (1d4+13)

- **Reasoning:** 7-12 (1d6+6)

- **Creativity:** 5-10 (1d6+4)
