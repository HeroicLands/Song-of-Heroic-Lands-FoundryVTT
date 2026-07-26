---
aliases:
    - Swampgolem
tags:
    - dreadspawn
name:
    full: Swampgolem
    aliases: []
id: x4RrVkwOlUE0Vnh0
slug: swampgolem
img: images/swampgolem-headshot.webp
portrait: images/swampgolem.webp
type: creature
package: thalorna
sohl:
    attributes:
        str: 16
        end: 18
        per: 8
        aur: 8
        wil: 12
        cre: 6
    attrRollFormula:
        str: 1d4+13
        end: 1d6+14
        per: 1d6+4
        aur: 1d6+4
        wil: 1d4+9
        cre: 1d4+3
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

The swamp itself seems to rise before you—at first you think it is simply a surge of murky water and detritus stirred by some underwater current. Then you see it move with deliberation, with purpose, and you understand: this is something shaped and animated by malevolence rather than chance. A humanoid figure, roughly twelve feet tall, rises dripping from the water, composed almost entirely of mud, rotting vegetation, moss, and things you cannot identify. Its eyes are pools of stagnant water set in a face of crude clay and stone, and as it turns toward you, you feel the weight of its gaze. The smell is overwhelming—centuries of decay concentrated in flesh, the reek of swamps and tombs and things that have rotted for longer than humans have walked upright. With each step, the ground becomes treacherous, and you can hear the squelch and slurp of mud and liquid filth moving with purpose.

# Dossier {#dossier}

Swampgolems are creatures of corrupted nature and malevolent animation, formed from the accumulated detritus of centuries of swamps—mud, rotting vegetation, bones of drowned creatures, and the accumulated spiritual poison of places where death is constant and life is desperate. A Swampgolem seems less alive than simply animated by the swamp itself, as though the wetland has grown a limb to lash out at those who would drain or despoil it. These creatures are found exclusively in deep marshes and ancient swamps where the water is thick and the soil is more decay than earth. They seem boundless in number—destroy one, and another seems to rise in its place weeks or months later, as though the swamp is endlessly capable of generating them.

## Presentation

A Swampgolem stands roughly 12 to 16 feet in height, its body a roughly humanoid mass of mud, clay, rotting plant matter, and detritus. Its form is never identical twice—composed of whatever materials lay at hand at the moment of its formation. Bones, stones, chunks of partially dissolved wood, and things less identifiable protrude from its surface. Its "skin" is slick and constantly weeping fluid, and the ground around it becomes treacherous with mud and slime. Its face is a grotesque caricature of a head, with hollows where eyes should be—filled with dark water that reflects no light. No mouth is visible, yet the creature can still somehow communicate through grinding sounds and the occasional eruption of muddy fluid. The temperature around it seems to drop, and the air becomes thick and difficult to breathe, heavy with swamp-gas and the stench of decay.

## Key Behaviors

A Swampgolem is a territorial creature, though less aggressively so than living predators. It tends to remain in one location, at the heart of a particular swamp or wetland, and it reacts defensively when that territory is threatened. The creature shows some level of awareness and reaction time, but its motivations are unclear—it may be defending the swamp itself, or simply existing in a state of semi-animated stupor. The creature seems dormant most of the time, moving slowly if at all, but it can become rapidly active if provoked or if large-scale intrusion into its territory occurs.

## Combat Strategy

A Swampgolem fights with methodical aggression, using its substantial mass and strength to deliver crushing blows rather than trying anything requiring finesse. It attempts to push opponents into deeper water or treacherous terrain where its weight is advantage and their mobility is compromised. The creature is patient, willing to wait and attack at its own pace, seemingly unaffected by prolonged combat or the passage of time. If forced to retreat, it moves toward deeper water where it becomes increasingly powerful and less vulnerable to most forms of attack.

## Attack Methods

### Mud Crush

The Swampgolem raises one of its massive appendages and brings it down with weight and force, attempting to pulverize anything beneath. The impact creates tremors and destabilizes ground around it.

### Slime Sludge Wave

The creature generates waves of liquid mud and thick, adhesive slime, washing enemies with a torrent that attempts to drag them deeper into the marsh while impairing vision and movement.

### Mire Grasp

When enemies are in or near water, the Swampgolem can raise muddy appendages from the ground itself to grasp and drag targets into deeper water or pull them off-balance.

## Special Abilities

### Swamp Regeneration

So long as the Swampgolem remains in contact with water and organic material, it slowly heals from damage. Removal from the swamp or extended exposure to drying conditions causes it to weaken.

### Swamp Camouflage

In thick mud and murky water, a Swampgolem is extraordinarily difficult to perceive, blending completely with its surroundings. Spotting one requires exceptional perception or magical sight.

### Terrain Mastery

The Swampgolem's presence makes the swamp itself treacherous—mud becomes deeper, footing becomes uncertain, and the very ground seems to work against enemies. In swamp terrain, opponents suffer significant disadvantage to movement and balance checks.

## Additional Information

Fire is the Swampgolem's greatest weakness—flames damage its composition directly and prevent it from regenerating. Sustained heat or direct exposure to fire can destroy the creature entirely. Air-based magic is similarly effective, as are drying effects. Removing the Swampgolem to dry land causes it to weaken over time as its mud-based body slowly desiccates. The creature cannot survive indefinitely out of water and will become increasingly sluggish and weak if forced away from its swampy domain for extended periods. In communities neighboring particularly active swamp areas, preventing the formation of new Swampgolems through controlled burning or through the strategic dumping of lime and salt to poison the water is sometimes attempted—though such efforts are typically only temporary, as the swamp always seems to regenerate what was destroyed.

## Attributes

- **Strength:** 14-17 (1d4+13)

- **Endurance:** 15-20 (1d6+14)

- **Perception:** 5-10 (1d6+4)

- **Aura:** 5-10 (1d6+4)

- **Will:** 10-13 (1d4+9)

- **Creativity:** 4-7 (1d4+3)
