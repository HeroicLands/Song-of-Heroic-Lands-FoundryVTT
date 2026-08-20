---
aliases:
  - Eagle
  - being-eagle
tags:
  - animal
name:
  full: Eagle
  aliases: []
description: "A solitary apex raptor of high ridges and passes, patrolling vast territory to snatch small mammals and fish with sudden violence."
id: Q1LL76ihY4CmtAqA
img: icons/game-icons/delapouite/eagle-head.svg
portrait: images/being/eagle-portrait.webp
shortcode: eagle
type: being
package: sohl
sohl:
  kbcat: animal
  archetype: 0
  attributes:
    str: 4
    end: 10
    agl: 10
    per: 26
    snt: 3
    aur: 5
    wil: 10
    rea: 8
    cre: 8
  attrRollFormula:
    str: 1d4+2
    end: 1d6+7
    agl: 1d6+7
    per: 1d6+23
    snt: 1d4+1
    aur: 1d4+3
    wil: 1d6+7
    rea: 1d4+6
    cre: 1d4+6
  body:
    structure:
      zones:
        - name: Head
          shortcode: headzone
          probWeight: 1
        - name: Left Wing
          shortcode: lwingzone
          probWeight: 1
        - name: Body
          shortcode: torsozone
          probWeight: 2
        - name: Right Wing
          shortcode: rwingzone
          probWeight: 1
        - name: Hindquarters
          shortcode: hindqtrzone
          probWeight: 1
      parts:
        - name: Head
          shortcode: headpart
          bodyZoneCode: headzone
          roles:
            - vital
            - manipulator
          canHoldItem: false
          probWeight: 10
        - name: Left Wing
          shortcode: lwingpart
          bodyZoneCode: lwingzone
          roles:
            - locomotor
          canHoldItem: false
          probWeight: 10
        - name: Body
          shortcode: torsopart
          bodyZoneCode: torsozone
          roles:
            - core
          canHoldItem: false
          probWeight: 10
        - name: Right Wing
          shortcode: rwingpart
          bodyZoneCode: rwingzone
          roles:
            - locomotor
          canHoldItem: false
          probWeight: 10
        - name: Left Leg
          shortcode: llegpart
          bodyZoneCode: hindqtrzone
          roles:
            - locomotor
            - manipulator
          canHoldItem: false
          probWeight: 5
        - name: Right Leg
          shortcode: rlegpart
          bodyZoneCode: hindqtrzone
          roles:
            - locomotor
            - manipulator
          canHoldItem: false
          probWeight: 5
        - name: Tail
          shortcode: tailpart
          bodyZoneCode: hindqtrzone
          roles: []
          canHoldItem: false
          probWeight: 10
      locations:
        - name: Head
          shortcode: headloc
          bodyPartCode: headpart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 5
          probWeight: 4
          protectionBase:
            blunt: -2
            edged: -3
            piercing: -4
            fire: -2
        - name: Neck
          shortcode: neckloc
          bodyPartCode: headpart
          bleedingSusceptibility: high
          amputability: low
          shockValue: 5
          probWeight: 6
          protectionBase:
            blunt: -2
            edged: -3
            piercing: -4
            fire: -2
        - name: Left Wing
          shortcode: lwingloc
          bodyPartCode: lwingpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 1
          probWeight: 10
          protectionBase:
            blunt: -2
            edged: -3
            piercing: -4
            fire: -2
        - name: Thorax
          shortcode: thoraxloc
          bodyPartCode: torsopart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 4
          probWeight: 6
          protectionBase:
            blunt: -2
            edged: -3
            piercing: -4
            fire: -2
        - name: Abdomen
          shortcode: abdloc
          bodyPartCode: torsopart
          bleedingSusceptibility: high
          amputability: none
          shockValue: 4
          probWeight: 4
          protectionBase:
            blunt: -2
            edged: -3
            piercing: -4
            fire: -2
        - name: Right Wing
          shortcode: rwingloc
          bodyPartCode: rwingpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 1
          probWeight: 10
          protectionBase:
            blunt: -2
            edged: -3
            piercing: -4
            fire: -2
        - name: Left Leg
          shortcode: llegloc
          bodyPartCode: llegpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 2
          probWeight: 10
          protectionBase:
            blunt: -2
            edged: -3
            piercing: -4
            fire: -2
        - name: Right Leg
          shortcode: rlegloc
          bodyPartCode: rlegpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 2
          probWeight: 10
          protectionBase:
            blunt: -2
            edged: -3
            piercing: -4
            fire: -2
        - name: Tail
          shortcode: tailloc
          bodyPartCode: tailpart
          bleedingSusceptibility: none
          amputability: high
          shockValue: 1
          probWeight: 10
          protectionBase:
            blunt: -2
            edged: -3
            piercing: -4
            fire: -2
    weight:
      base: 20
      calc: "20"
    reachBase: 0
    bodyScaleBase: 0.52
    personalFatigue: enc + 5
  currentMoveMedium: aerial
  movementProfiles:
    - medium: aerial
      feetPerRound: 300
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
  items:
    - shortcode: awar
      type: skill
      system:
        masteryLevelBase: 90
    - shortcode: stlth
      type: skill
      system:
        masteryLevelBase: 72
    - shortcode: sprt
      type: mysticalability
      system:
        masteryLevelBase: 21
    - shortcode: init
      type: skill
      system:
        masteryLevelBase: 36
    - shortcode: dge
      type: skill
      system:
        masteryLevelBase: 72
    - shortcode: shok
      type: skill
      system:
        masteryLevelBase: 28
    - name: Talon
      type: skill
      system:
        shortcode: talon
        subType: combattechnique
        masteryLevelBase: 50
        combatCategory: melee
        impairedByRoles:
          - locomotor
        strikeMode:
          type: melee
          shortcode: talon
          name: Talon
          minParts: 1
          assocSkillCode: null
          attack:
            disabled: false
            spread: 2
            modifier: 0
          impactBase:
            numDice: 1
            die: 10
            modifier: -5
            aspect: edged
          lengthBase: 0
          defense:
            block:
              disabled: true
              modifier: 0
              successLevelMod: 0
            counterstrike:
              disabled: false
              modifier: 0
              successLevelMod: 0
          traits:
            noBlock: true
    - name: Beak
      type: skill
      system:
        shortcode: beak
        subType: combattechnique
        masteryLevelBase: 40
        combatCategory: melee
        impairedByRoles:
          - manipulator
        strikeMode:
          type: melee
          shortcode: beak
          name: Beak
          minParts: 1
          assocSkillCode: null
          attack:
            disabled: false
            spread: 1
            modifier: 0
          impactBase:
            numDice: 1
            die: 6
            modifier: -4
            aspect: piercing
          lengthBase: 0
          defense:
            block:
              disabled: true
              modifier: 0
              successLevelMod: 0
            counterstrike:
              disabled: false
              modifier: 0
              successLevelMod: 0
          traits:
            noBlock: true
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

- **Strength:** 3-6 (1d4+2)

- **Endurance:** 8-13 (1d6+7)

- **Agility:** 8-13 (1d6+7)

- **Perception:** 24-29 (1d6+23)

- **Scent:** 2-5 (1d4+1)

- **Aura:** 4-7 (1d4+3)

- **Will:** 8-13 (1d6+7)

- **Reasoning:** 7-10 (1d4+6)

- **Creativity:** 7-10 (1d4+6)
