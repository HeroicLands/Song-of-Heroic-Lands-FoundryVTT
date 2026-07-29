---
aliases:
    - Hunting Dog
tags:
    - animal
name:
    full: Hunting Dog
    aliases: []
id: Po2VUAbp6OfYsojS
slug: hunting-dog
img: icons/game-icons/lorc/hound.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 11
        end: 10
        agl: 13
        per: 17
        snt: 5
        aur: 4
        wil: 14
        rea: 6
        cre: 7
    attrRollFormula:
        str: 1d6+8
        end: 1d6+7
        agl: 1d4+10
        per: 1d6+14
        snt: 1d4+3
        aur: 1d4+2
        wil: 1d6+11
        rea: 1d4+4
        cre: 1d4+5
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 2
                - name: Torso
                  shortcode: torsozone
                  probWeight: 3
                - name: Hind Legs
                  shortcode: hindlegszone
                  probWeight: 2
                - name: Tail
                  shortcode: tailzone
                  probWeight: 1
            parts:
                - name: Head
                  shortcode: headpart
                  bodyZoneCode: headzone
                  canHoldItem: false
                  combatArea: 2
                - name: Torso
                  shortcode: torsopart
                  bodyZoneCode: torsozone
                  canHoldItem: false
                  combatArea: 3
                - name: Left Rear Leg
                  shortcode: lrearlegpart
                  bodyZoneCode: hindlegszone
                  canHoldItem: false
                  combatArea: 1
                - name: Right Rear Leg
                  shortcode: rrearlegpart
                  bodyZoneCode: hindlegszone
                  canHoldItem: false
                  combatArea: 1
                - name: Tail
                  shortcode: tailpart
                  bodyZoneCode: tailzone
                  canHoldItem: false
                  combatArea: 1
            locations:
                - name: Head
                  shortcode: headloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 4
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: high
                  shockValue: 5
                  probWeight: 2
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Left Foreleg
                  shortcode: lforelegloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: low
                  amputability: low
                  shockValue: 2
                  probWeight: 2
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Right Foreleg
                  shortcode: rforelegloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: low
                  amputability: low
                  shockValue: 2
                  probWeight: 2
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Thorax
                  shortcode: thoraxloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 5
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 3
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Pelvis
                  shortcode: plvsloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 2
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Left Hind Leg
                  shortcode: lhindlegloc
                  bodyPartCode: lrearlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 1
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Right Hind Leg
                  shortcode: rhindlegloc
                  bodyPartCode: rrearlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 1
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Tail
                  shortcode: tailloc
                  bodyPartCode: tailpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 1
                  probWeight: 1
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
        weight:
            base: 80
            calc: 80
        reachBase: 0
        bodyScaleBase: 1.0
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 110
          leaguesPerWatch: 6
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors:
              - scope: surface_cover
                key: mixed_forest
                mode: add
                textValue: "-1"
              - scope: surface_cover
                key: needleleaf_forest
                mode: add
                textValue: "0"
          disabled: false
    defaultCombatGroup: null
    items:
        - shortcode: awar
          type: skill
          system:
              masteryLevelBase: 80
        - shortcode: stlth
          type: skill
          system:
              masteryLevelBase: 60
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 27
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 50
---

# Appearance {#appearance}

The dog's nostrils flare as it catches your scent on the wind, and its entire body goes tense with focus. Every muscle defines itself beneath sleek fur, and its eyes—bright and intelligent—lock onto you with predatory interest. The warm, animal smell of it carries on the breeze, mingled with the scent of leather and old sweat from the hunters it serves. A low, rumbling sound builds in its chest, not yet a snarl, but a promise of violence.

# Dossier {#dossier}

Hunting dogs are medium-sized, powerfully built canines bred and trained over generations to track, pursue, and bring down prey. They stand 24-28 inches at the shoulder and weigh 45-70 pounds, with lean, muscular builds designed for endurance over distance and speed in short bursts. Their intelligence is considerably higher than that of wild dogs, a result of selective breeding and training.

## Presentation

Hunting dogs display a variety of coat colors—red, black, brindle, or combinations thereof—depending on their breeding line. Their fur is short and dense, providing protection from brush and weather without impeding movement. They have deep chests, long legs with visible musculature, and tails that remain raised and alert. Their ears are medium-sized and alert, and their eyes are bright, intelligent, and constantly scanning. They move with an economical grace, each step purposeful. A well-trained hunting dog may wear a leather collar or harness and often bears scars from previous hunts.

## Key Behaviors

Hunting dogs are disciplined and focused, capable of tracking a scent over dozens of miles and across many hours. They respond to handler commands instantly and will maintain a hunt even when exhausted. They are highly social within their pack structure, following a clear hierarchy. When working, they communicate through subtle body postures, brief vocalizations, and scent marking. They rest between hunts, alert but patient, waiting for their handler's next instruction.

## Combat Strategy

Hunting dogs employ pack tactics when possible, surrounding prey and cutting off escape routes while one or more dogs close for the bite. A dog will target the extremities—legs, arms, throat—to immobilize or wound. They circle and harry opponents, wearing them down through relentless pressure and coordinated attacks. Against multiple opponents, they prioritize isolating weaker or separated targets.

## Attack Methods

### Bite

The hunting dog's powerful jaws clamp down on limbs, throats, or torsos, aiming to wound and immobilize; a dog that has latched on will shake violently to inflict additional damage.

### Coordinated Tackle

A hunting dog will leap at an opponent, driving them backward or to the ground with its full body weight; multiple dogs will execute this simultaneously to ensure success.

## Special Abilities

### Scent Tracking

The hunting dog can follow a scent trail over any surface and across extended distances, even days old; it can distinguish between individual scents and will unerringly pursue a marked target.

### Pack Coordination

Hunting dogs gain significant combat bonuses when working alongside other trained dogs, and they can execute complex coordinated attacks based on subtle handler signals or instinctive pack behavior.

## Attributes

- **Strength:** 10-15 (1d6+9)

- **Endurance:** 12-17 (1d6+11)

- **Dexterity:** 11-16 (1d6+10)

- **Agility:** 12-17 (1d6+11)

- **Perception:** 13-18 (1d6+12)

- **Aura:** 7-10 (1d4+6)

- **Will:** 10-15 (1d6+9)

- **Reasoning:** 7-10 (1d4+6)

- **Creativity:** 6-9 (1d4+5)
