---
aliases:
    - Luminophage
tags:
    - dreadspawn
name:
    full: Luminophage
    aliases: []
id: Ul7aa7gAof3P8b46
slug: luminophage
img: icons/game-icons/delapouite/griffin-symbol.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 8
        end: 10
        dex: 14
        agl: 10
        per: 16
        aur: 14
        wil: 12
        rea: 10
        cre: 12
    attrRollFormula:
        str: 1d4+5
        end: 1d6+6
        dex: 1d6+10
        agl: 1d6+6
        per: 1d4+13
        aur: 1d6+10
        wil: 1d4+9
        rea: 1d6+6
        cre: 1d4+9
    body:
        structure:
            zones: []
            parts: []
            locations: []
        weight:
            base: 20
            calc: 20
        reachBase: 0
        bodyScaleBase: 1.0
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: aerial
          feetPerRound: 60
          leaguesPerWatch: 4
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
    defaultCombatGroup: null
    items: []
---

# Appearance {#appearance}

A soft, pulsing radiance emanates from the shadows overhead—beautiful and hypnotic, yet radiating an almost nauseating wrongness. The light intensifies as a segmented, translucent shape descends from the darkness, its pale body wreathed in sickly luminescence that casts impossible shadows on the walls. The air grows cold, and you notice the smell of burned ozone and decay. Two points of pure brilliance fixate on you from within the glow, and you hear a faint, wet clicking sound as translucent appendages unfurl, lined with quivering needle-points that glisten with venom.

# Dossier {#dossier}

Luminophages are parasitic predators that haunt deep, lightless places—caverns, sunken ruins, and the abyssal depths of underground waters. They have evolved to weaponize light itself, using bioluminescence as both lure and feeding mechanism. When they find a chamber, they settle into the ceiling or walls and wait with preternatural patience for wanderers drawn to their glow; once prey draws close enough, the creature strikes with lethal precision, paralyzing its victim with neurotoxic venom while slowly draining its life force and absorbing any light sources in the area, leaving survivors in absolute darkness.

## Presentation

A Luminophage resembles a grotesque jellyfish merged with a scorpion, elongated and segmented, measuring 5 to 8 feet from crown to the tips of its longest appendages. Its translucent, chitinous body is a sickly pale white or wan gray, veined with channels that pulse with acidic luminescence in shades of green, blue, or phosphorescent white. Six to eight prehensile appendages hang from its body, each tipped with a cluster of needle-like proboscises. When agitated or feeding, the creature emits a rhythmic clicking or chittering sound, and the intensity of its bioluminescence increases dramatically, casting a hypnotic, strobing glow. It moves with disturbing fluidity, able to scuttle sideways or upside-down with equal ease, and can suspend itself from any surface indefinitely.

## Key Behaviors

Luminophages are solitary hunters that stake out territories in perpetually dark spaces where other creatures occasionally venture. They remain motionless for hours or days, their glow the only sign of their presence, radiating outward as a beacon that seems to draw weaker-willed creatures toward them compulsively. They are drawn to any source of light—torches, lanterns, magical illumination—and will attempt to drain or consume it, leaving behind only oppressive darkness. Luminophages breed slowly; a gravid female may lay a clutch of translucent eggs on high cave walls, which hatch into juvenile forms no larger than a clenched fist. These juveniles cling to dark stone until they have grown large enough to hunt.

## Combat Strategy

A Luminophage begins an encounter by intensifying its glow, attempting to mesmerize or distract prey with the hypnotic pulsing of its light. If a target appears weak-willed or slow to act, it may close the distance slowly, drawing them in with the promise of illumination before striking. Once combat erupts, the creature relies on its superior dexterity to position multiple appendages for coordinated attacks. It avoids prolonged melee if possible, preferring to paralyze prey and retreat to a defensible position where it can feed at leisure. If wounded or facing overwhelming numbers, a Luminophage will douse its glow entirely and flee into the nearest crevice or down into deeper water, disappearing from sight.

## Attack Methods

### Needle Strike

The creature's appendages lash out with surgeon-like precision, driving clusters of venomous proboscises into exposed flesh. These attacks are remarkably accurate, made more so by the creature's exceptional hand-eye coordination.

### Paralytic Venom Injection

Successful needle strikes inject a potent neurotoxin that spreads rapidly through the victim's body. Affected targets lose mobility and find themselves helpless while the Luminophage feeds.

## Special Abilities

### Bioluminescent Lure

The creature's hypnotic glow can fascinate weaker-minded targets, compelling them to approach despite conscious misgivings. Those with strong will or high reasoning can resist the compulsion, but others find themselves drawn inexorably forward.

### Light Absorption

Luminophages drain the luminous energy from any light source they can reach, extinguishing flames, dimming magical light, and converting the absorbed energy into their own bioluminescence. A torch can be drained in a single round.

### Darkness Adaptation

The creature sees perfectly in absolute darkness and moves as easily in the black as in daylight. In well-lit areas, it becomes slightly sluggish, its reflexes diminished.

## Additional Information

Fire poses the greatest threat to a Luminophage—flames damage its translucent body directly and overwhelm its sensory systems, causing it to withdraw. Its venom can be extracted and preserved in ceramic vessels, and alchemists prize it for medicinal purposes or the creation of poisons. The chitin plates along its back, when harvested carefully, can be fashioned into armor or magical foci that retain faint bioluminescent properties for years. Some isolated communities have learned to trap Luminophages in light-filled chambers, where the creatures become docile and can be contained; a few mad scholars keep them as living lanterns, accepting the constant threat of paralysis as the price of endless illumination.

## Attributes

- **Strength:** 6-9 (1d4+5)

- **Endurance:** 7-12 (1d6+6)

- **Dexterity:** 11-16 (1d6+10)

- **Agility:** 7-12 (1d6+6)

- **Perception:** 14-17 (1d4+13)

- **Aura:** 11-16 (1d6+10)

- **Will:** 10-13 (1d4+9)

- **Reasoning:** 7-12 (1d6+6)

- **Creativity:** 10-13 (1d4+9)
