---
aliases:
    - Mirelurker
tags:
    - dreadspawn
name:
    full: Mirelurker
    aliases: []
id: EAg26B2pYAXS9TJv
slug: mirelurker
img: icons/game-icons/delapouite/griffin-symbol.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 13
        end: 13
        dex: 11
        agl: 11
        per: 9
        aur: 8
    attrRollFormula:
        str: 1d4+10
        end: 1d4+10
        dex: 1d4+8
        agl: 1d4+8
        per: 1d4+6
        aur: 1d4+5
    body:
        structure:
            parts: []
            adjacent: []
        weight:
            base: 300
            calc: 300
        reachBase: 0
        bodyScaleBase: 1.0
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 30
          leaguesPerWatch: 2
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
        - medium: aquatic
          feetPerRound: 50
          leaguesPerWatch: 4
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
    defaultCombatGroup: null
    items: []
---

# Appearance {#appearance}

The water ahead shivers without cause, and then you see it—or rather, you see the absence of a thing, a void in the shape of something vast moving just beneath the surface. The reek of stagnant water and decaying vegetation floods your senses. A curved carapace breaks the murk, crusted with algae and slime, and then the water erupts as a limb strikes out—chitinous, twisted, impossibly powerful. The sound is wet and horrible, like tearing leather mixed with the click and scrape of insect armor.

# Dossier {#dossier}

Mirelurkers are apex predators of the deep marshes and brackish waters, evolved from some unholy fusion of crustacean and amphibian flesh. They haunt stagnant pools, murky rivers, and swamp channels where they can remain almost invisible amid the muck and reeds. Ambush is their method and their art—a Mirelurker can wait motionless for hours, indistinguishable from a submerged log or stone, before striking with brutal suddenness when prey ventures too close. Once an attack is underway, the creature's strength and resistance to damage make it a formidable opponent, though it abhors dryness and fire with visceral intensity.

## Presentation

A Mirelurker is roughly humanoid in basic structure but profoundly alien in detail—measuring 8 to 10 feet in length, with a grotesquely bulky frame. Its body is encased in a chitinous exoskeleton of mottled gray-brown, spotted with patches of slime and algae that aid its camouflage. Six limbs project from its torso: four shorter ones ending in clusters of sharp claws, and two longer, more muscular appendages that serve as primary striking weapons. Its head is a dome of armor with bulging, lidless eyes set wide apart, and a cavernous mouth lined with chitinous plates rather than teeth. The creature moves with an unsettling, side-to-side gait when on land but propels itself through water with serpentine grace. It emits a constant, barely audible clicking and chittering from deep within its shell.

## Key Behaviors

Mirelurkers are solitary, territorial creatures that claim a stretch of swamp or marsh as their hunting grounds and defend it fiercely from other large predators. They are primarily nocturnal, becoming more active as light fades, though they will hunt during the day if hungry. Their diet consists of fish, waterfowl, and any medium-to-large creature foolish enough to wade into their territory. They are sluggish out of water and rarely venture onto dry land except to reach adjacent bodies of water; a Mirelurker stranded in a drought becomes desperately aggressive. Breeding occurs during the spring rains; a gravid female lays hundreds of leathery eggs in a carefully constructed midden in the deepest part of her territory, tending them with fierce protectiveness until they hatch.

## Combat Strategy

A Mirelurker initiates combat by erupting from concealment with overwhelming physical force, attempting to grapple or crush prey before the target can react or flee. Once engaged, it relies on its superior strength to dominate, using both primary limbs in coordinated strikes and snapping bites. The creature is cunning enough to exploit terrain—herding prey into deeper water where its advantage is magnified, or separating weakened targets from the group. If an opponent deals sustained fire damage or the creature finds itself dying, it will attempt to retreat into water deep enough to escape pursuit, though a truly cornered Mirelurker fights with vicious desperation.

## Attack Methods

### Crushing Jaws

The creature lunges with its cavernous maw, attempting to bite prey in half or crush armor and bone with the mechanical force of its chitinous plates. Targets caught in these jaws suffer not only piercing trauma but crushing force that can snap limbs or shatter ribs.

### Claw Rake

Multiple limbs slash and tear simultaneously, seeking to open wounds and drag prey off-balance. The creature's rapid strikes make it nearly impossible for opponents to mount an effective defense.

### Mire Grasp

The Mirelurker churns mud and water into a suffocating slurry, attempting to blind and disorient prey while dragging them deeper into the murk. Those caught struggle to breathe and see, gaining advantage to enemies striking against them.

## Special Abilities

### Amphibious Adaptation

The Mirelurker breathes equally well in water and air and can remain submerged indefinitely. Its exoskeleton grants it resistance to slashing and piercing attacks—blade strikes glance off its armor with minimal effect.

### Swamp Camouflage

In murky water or heavy vegetation, the creature is nearly invisible, blending so thoroughly with its environment that only careful observation or magical sensing can reveal its presence. In clear water or open terrain, this advantage diminishes sharply.

### Terrain Mastery

The Mirelurker moves through swamp and water with perfect ease, treating such terrain as easy ground while enemies flounder and slip. Its knowledge of every pool, every current, and every submerged stone is absolute.

## Additional Information

Fire remains the Mirelurker's greatest weakness—sustained heat can crack its exoskeleton, and flames cause it genuine pain. Extended drought is equally devastating; removed from water, a Mirelurker weakens over days as its body dries. Its shell can be harvested after death and fashioned into durable armor or shields, though the process of preservation is foul and time-consuming. Some wilderness hunters prize Mirelurker claws for weapon hafts, as they retain a subtle sharpness even after death. The creature's internal organs contain a bitter, poisonous fluid that can be extracted and used in the creation of toxic compounds.

## Attributes

- **Strength:** 11-14 (1d4+10)

- **Endurance:** 11-14 (1d4+10)

- **Dexterity:** 9-12 (1d4+8)

- **Agility:** 9-12 (1d4+8)

- **Perception:** 7-10 (1d4+6)

- **Aura:** 6-9 (1d4+5)
