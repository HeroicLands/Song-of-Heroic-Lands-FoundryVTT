---
aliases:
    - Eagle
tags:
    - animal
name:
    full: Eagle
    aliases: []
id: Q1LL76ihY4CmtAqA
slug: eagle
img: icons/game-icons/delapouite/eagle-head.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 7
        end: 11
        dex: 16
        agl: 17
        per: 17
        aur: 9
        wil: 13
        rea: 8
        cre: 7
    attrRollFormula:
        str: 1d4+4
        end: 1d6+7
        dex: 1d6+12
        agl: 1d6+13
        per: 1d6+13
        aur: 1d4+6
        wil: 1d6+9
        rea: 1d4+5
        cre: 1d4+4
    body:
        structure:
            parts: []
            adjacent: []
        weight:
            base: 12
            calc: 12
        reachBase: 0
        bodyScaleBase: 1.0
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: aerial
          feetPerRound: 100
          leaguesPerWatch: 10
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
        - medium: terrestrial
          feetPerRound: 25
          leaguesPerWatch: 1
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
    defaultCombatGroup: null
    items: []
---

# Appearance {#appearance}

The wind carries a shrill cry that makes your blood quicken. High above, a silhouette wheels through the clouds—wings stretched wide, banking and diving with predatory grace. Its shadow slides across the ground far below. As it drops lower, you catch the glint of sunlight off cruel curved talons and glimpse the intense, unblinking stare of a hunter that has already decided you are worth noting. The air itself seems to tremble with its presence.

# Dossier {#dossier}

The eagle is a magnificent apex predator of the high places—a solitary hunter that dominates its territory from ridge to cloud. These birds patrol vast hunting grounds, striking with sudden violence at small mammals, fish, and anything else they can snatch from the ground or water. Adventurers most often encounter them when crossing mountain passes or open terrain, where an eagle's territory may overlap the road, or when they stumble upon an aerie and awaken a protective parent.

## Presentation

A mature eagle stands roughly four feet tall with a wingspan exceeding six feet when fully extended. Its plumage is dark brown to black with distinctive pale coloring on the head and neck, creating the appearance of an aged, severe face. The eyes are pale gold or amber, fixed with an intensity that seems to pierce through you. The talons are the color of old bone and curve wickedly, each as long as a man's finger. The beak is massive and hooked, capable of rending flesh with effortless strength. It moves with deliberate grace on the ground, but in the air it is pure predatory poetry—every turn and dive economical and deadly.

## Key Behaviors

Eagles are solitary hunters except during breeding season, when a mated pair fiercely defends its nesting territory. They establish and patrol large hunting grounds, returning to favored perches or thermals to scan for prey. A hunting eagle is patient, circling for hours if necessary before detecting movement. They hunt primarily small mammals and fish, though a large eagle will occasionally take grouse, rabbits, or other relatively large prey. They are crepuscular hunters, most active in the hour after dawn and before dusk, though they will hunt at any time if pressed by hunger.

## Combat Strategy

An eagle's primary tactic is the dive—gaining altitude, then plummeting at tremendous speed to rake prey with talons while passing overhead. If the strike connects, it will attempt to carry small prey aloft; if the target is too heavy or puts up significant resistance, the eagle climbs again for another pass. A cornered or defending eagle uses its talons in close combat, raking with one foot while striking with the beak. It is quick to retreat if injured, climbing skyward where most terrestrial enemies cannot follow. If defending a nest, however, an eagle becomes almost fearless, making repeated passes and pressing attacks even against opponents that outweigh it.

## Attack Methods

### Talon Strike

A raking attack delivered from above or in close combat—the eagle extends its powerful legs to hook with curved talons, causing deep lacerating wounds. At range, this is devastating due to the velocity of the dive; in close quarters, the eagle can execute multiple strikes in rapid succession.

### Beak Tear

A vicious pecking and tearing attack, usually pressed once the eagle has grappled prey with its talons. The hooked beak can tear through hide and light armor, and does not require much positioning to be effective once the eagle has engaged.

## Special Abilities

### Keen Eyesight

An eagle's vision is legendary among birds—it can detect the movement of a rabbit from a thousand paces away and can track a flying target across open sky with perfect clarity. This translates to a marked advantage in any perception or tracking roll involving visual stimuli, and the eagle cannot be easily surprised or ambushed from a distance.

### Powerful Wings

The eagle's massive wings allow it to climb and maneuver at speeds that leave most terrestrial creatures behind. Once aloft, it can dive with punishing acceleration and recover from a dive into a steep climb that no land-bound pursuer can match. This gives it supreme tactical advantage in open air combat.

## Additional Information

Eagles mate for life and establish nesting territories that they defend with fierce dedication. A prospective character might trade favors for an eagle's aid—or its enmity if they interfere with a nest. Eagle feathers, particularly primary feathers from the wings, are prized for fletching and ceremonial purposes. A truly bold hunter might seek an eagle egg to raise a companion, though this requires either theft from a defended nest or negotiation with a territorial pair.

## Attributes

- **Strength:** 5-8 (1d4+4)

- **Endurance:** 8-13 (1d6+7)

- **Dexterity:** 13-18 (1d6+12)

- **Agility:** 14-19 (1d6+13)

- **Perception:** 14-19 (1d6+13)

- **Aura:** 7-10 (1d4+6)

- **Will:** 10-15 (1d6+9)

- **Reasoning:** 6-9 (1d4+5)

- **Creativity:** 5-8 (1d4+4)
