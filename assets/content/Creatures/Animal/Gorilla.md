---
aliases:
    - Gorilla
    - creature-gorilla
tags:
    - animal
name:
    full: Gorilla
    aliases: []
id: bDs9MTm1QajerNwp
img: icons/game-icons/delapouite/gorilla.svg
portrait: images/gorilla.webp
shortcode: gorilla
type: creature
package: sohl
sohl:
    kbcat: animal
    archetype: 0
    attributes:
        str: 25
        end: 19
        dex: 13
        agl: 12
        per: 14
        aur: 14
        wil: 16
        rea: 11
        cre: 10
    attrRollFormula:
        str: 1d6+21
        end: 1d6+15
        dex: 1d6+9
        agl: 1d6+8
        per: 1d6+10
        aur: 1d6+10
        wil: 1d6+12
        rea: 1d6+7
        cre: 1d4+7
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 2
                - name: Arms
                  shortcode: armszone
                  probWeight: 5
                - name: Torso
                  shortcode: torsozone
                  probWeight: 5
                - name: Legs
                  shortcode: legszone
                  probWeight: 8
            parts:
                - name: Head
                  shortcode: headpart
                  bodyZoneCode: headzone
                  roles:
                      - vital
                      - manipulator
                  canHoldItem: false
                  probWeight: 1
                - name: Right Arm
                  shortcode: rarmpart
                  bodyZoneCode: armszone
                  roles:
                      - manipulator
                  canHoldItem: true
                  probWeight: 2
                - name: Left Arm
                  shortcode: larmpart
                  bodyZoneCode: armszone
                  roles:
                      - manipulator
                  canHoldItem: true
                  probWeight: 2
                - name: Torso
                  shortcode: torsopart
                  bodyZoneCode: torsozone
                  roles:
                      - core
                  canHoldItem: false
                  probWeight: 4
                - name: Right Leg
                  shortcode: rlegpart
                  bodyZoneCode: legszone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 3
                - name: Left Leg
                  shortcode: llegpart
                  bodyZoneCode: legszone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 3
            locations:
                - name: Skull
                  shortcode: skullloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: low
                  amputability: none
                  shockValue: 5
                  probWeight: 500
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Left Eye
                  shortcode: leyeloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 15
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Right Eye
                  shortcode: reyeloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 15
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Nose
                  shortcode: noseloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 30
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Left Cheek
                  shortcode: lcheekloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 60
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Right Cheek
                  shortcode: rcheekloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 60
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Left Ear
                  shortcode: learloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 15
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Right Ear
                  shortcode: rearloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 15
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Mouth
                  shortcode: mouthloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 30
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Jaw
                  shortcode: jawloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 60
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 200
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Right Shoulder
                  shortcode: rshldloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 3
                  probWeight: 30
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Right Upper Arm
                  shortcode: rupaloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 30
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Right Elbow
                  shortcode: relbloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Right Forearm
                  shortcode: rfraloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 20
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Right Hand
                  shortcode: rhandloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Left Shoulder
                  shortcode: lshldloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 3
                  probWeight: 30
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Left Upper Arm
                  shortcode: lupaloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 30
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Left Elbow
                  shortcode: lelbloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Left Forearm
                  shortcode: lfraloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 20
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Left Hand
                  shortcode: lhandloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Thorax
                  shortcode: thrxloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 40
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Abdomen
                  shortcode: abdmnloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 40
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Pelvis
                  shortcode: plvisloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 20
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Right Thigh
                  shortcode: rthghloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: medium
                  amputability: medium
                  shockValue: 3
                  probWeight: 40
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Right Knee
                  shortcode: rkneeloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 15
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Right Calf
                  shortcode: rcalfloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 30
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Right Foot
                  shortcode: rfootloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 2
                  probWeight: 15
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Left Thigh
                  shortcode: lthghloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: medium
                  amputability: medium
                  shockValue: 3
                  probWeight: 40
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Left Knee
                  shortcode: lkneeloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 15
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Left Calf
                  shortcode: lcalfloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 30
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Left Foot
                  shortcode: lfootloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 2
                  probWeight: 15
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
        weight:
            base: 350
            calc: "350"
        reachBase: 0
        bodyScaleBase: 1.71
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 40
          leaguesPerWatch: 3
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
    defaultCombatGroup: null
    items:
        - shortcode: awar
          type: skill
          system:
              masteryLevelBase: 75
        - shortcode: stlth
          type: skill
          system:
              masteryLevelBase: 70
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 45
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 56
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 52
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 55
        - name: Devastating Punch
          type: skill
          system:
              shortcode: punch
              subType: combattechnique
              masteryLevelBase: 64
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: punch
                  name: Devastating Punch
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 4
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 7
                      aspect: blunt
                  lengthBase: 1
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
        - name: Crushing Bite
          type: skill
          system:
              shortcode: bite
              subType: combattechnique
              masteryLevelBase: 64
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: bite
                  name: Crushing Bite
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 4
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 8
                      aspect: piercing
                  lengthBase: 1
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

The sound comes first—a deep, reverberating roar that makes your bones vibrate. The gorilla steps into view, and your perspective on size recalibrates. The creature stands nearly eight feet tall, and the sheer density of muscle across its chest and arms is overwhelming. The dark hair is thick and coarse, and across the back and shoulders you see the distinctive silvering that marks an alpha male. The eyes are deeply set but expressive, burning with intelligence and protective fury. The arms are disproportionately massive, hanging partway down the legs. Then the gorilla beats its chest—a thunderous percussion that echoes across the landscape—and the display is so perfectly timed to the roar that you understand you are witnessing a creature asserting absolute dominion over its territory.

# Dossier {#dossier}

The Gorilla is a massive, supremely intelligent primate that lives in family groups (troops) centered on an alpha male (the silverback). These are generally peaceful herbivores that cause little trouble unless provoked or unless their group is threatened. However, a silverback defending its troop is a nightmare of muscle and determination—capable of matching or exceeding humanoid warriors in physical combat. Adventurers most commonly encounter gorillas when exploring deep jungles or when trespassing into territory the gorillas claim.

## Presentation

A mature silverback gorilla is an overwhelming physical presence. The creature stands seven to eight feet tall and can weigh several hundred pounds, nearly all of it muscle and bone. The body is powerfully built with an upright or semi-upright posture, long arms that hang nearly to the knees, and legs built to support the immense weight. The hair is dark brown or black, with the characteristic silvering across the back and shoulders that marks a mature male. The face is distinctly primate in structure, with deep-set eyes, a broad nose, and prominent teeth. The hands are large with powerful fingers and opposable thumbs. The overall impression is of a creature that is not humanoid but not fully animal either—something caught in between, possessed of remarkable intelligence and emotional complexity.

## Key Behaviors

Gorillas live in social groups of eight to fifteen individuals led by a dominant silverback male. The group spends most of the day foraging for vegetation, fruits, and leaves in a defined territory. They are primarily diurnal and follow established movement patterns within their range. They communicate through vocalizations, gestures, and displays, and there is clear social hierarchy and affection within groups. Silverbacks are highly protective of their troop and will intervene in conflicts between subordinates or to protect young. An infant gorilla is nursed for several years, creating strong bonds between mothers and offspring.

## Combat Strategy

A silverback defending its troop begins with intimidating displays—chest-beating, roaring, and aggressive charging—designed to frighten intruders away. If these displays fail to deter an opponent, the gorilla engages in direct combat with overwhelming strength and power. The silverback uses its massive arms to grapple, strike, and throw opponents, and will not disengage from combat if a threat to its troop remains. A silverback's tactics are straightforward: overwhelm through sheer force and size. The silverback fights with intelligence and experience, using leverage and positioning to maximum advantage.

## Attack Methods

### Crushing Bite

The gorilla's powerful jaws deliver a bite capable of crushing bone—the teeth are designed as weapons, sharp and strong enough to puncture thick hide or leather. A bite from a gorilla is debilitating and potentially lethal.

### Devastating Punch

The gorilla's massive arms deliver strikes with terrible force—a punch from a silverback is capable of breaking bones, shattering armor, or driving a target backward. These strikes are slow but tremendously powerful.

### Grapple and Throw

The gorilla's strength advantage is used to grapple opponents and control them—pinning them to the ground or throwing them with force sufficient to cause serious injury. A grappled target is in grave danger.

## Special Abilities

### Intimidating Presence

The silverback's displays—chest-beating, roaring, and aggressive charging—are designed to frighten and intimidate. A creature facing a silverback's display must maintain composure or risk fleeing or becoming paralyzed with fear.

### Protective Fury

When the silverback's troop is threatened, the gorilla's combat effectiveness increases—it becomes more aggressive and shows less concern for its own safety. A silverback defending its young will pursue threats indefinitely.

## Additional Information

A silverback gorilla's strength is legendary, and some cultures revere them as forest spirits or embodiments of protective power. A gorilla that has not been provoked will rarely attack, though they will enforce boundaries around their territory. Attempting to separate a gorilla from its troop is supremely dangerous. Some indigenous peoples report negotiating peace with gorilla troops through specific gestures and respectful behavior.

## Attributes

- **Strength:** 22-27 (1d6+21)

- **Endurance:** 16-21 (1d6+15)

- **Dexterity:** 10-15 (1d6+9)

- **Agility:** 9-14 (1d6+8)

- **Perception:** 11-16 (1d6+10)

- **Aura:** 11-16 (1d6+10)

- **Will:** 13-18 (1d6+12)

- **Reasoning:** 8-13 (1d6+7)

- **Creativity:** 8-11 (1d4+7)
