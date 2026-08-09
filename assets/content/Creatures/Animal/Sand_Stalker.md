---
aliases:
    - Sand Stalker
tags:
    - animal
name:
    full: Sand Stalker
    aliases: []
id: cF5pl6GNTSOo7LyT
slug: sand-stalker
img: icons/game-icons/lorc/paw-print.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 13
        end: 11
        dex: 15
        agl: 16
        per: 16
        aur: 9
        wil: 12
        rea: 8
        cre: 7
    attrRollFormula:
        str: 1d6+9
        end: 1d6+7
        dex: 1d6+11
        agl: 1d6+12
        per: 1d6+12
        aur: 1d4+6
        wil: 1d6+8
        rea: 1d4+5
        cre: 1d4+4
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 1
                - name: Forelegs
                  shortcode: forelegszone
                  probWeight: 1
                - name: Torso
                  shortcode: torsozone
                  probWeight: 3
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
                - name: Left Foreleg
                  shortcode: lforelegpart
                  bodyZoneCode: forelegszone
                  roles: &a1
                      - locomotor
                      - manipulator
                  canHoldItem: false
                  probWeight: 1
                - name: Right Foreleg
                  shortcode: rforelegpart
                  bodyZoneCode: forelegszone
                  roles: *a1
                  canHoldItem: false
                  probWeight: 1
                - name: Torso
                  shortcode: torsopart
                  bodyZoneCode: torsozone
                  roles:
                      - core
                  canHoldItem: false
                  probWeight: 10
                - name: Left Hind Leg
                  shortcode: lhindlegpart
                  bodyZoneCode: hindqtrzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 9
                - name: Right Hind Leg
                  shortcode: rhindlegpart
                  bodyZoneCode: hindqtrzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 9
                - name: Tail
                  shortcode: tailpart
                  bodyZoneCode: hindqtrzone
                  roles: []
                  canHoldItem: false
                  probWeight: 2
            locations:
                - name: Head
                  shortcode: headloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 6
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 4
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Left Foreleg
                  shortcode: lforelegloc
                  bodyPartCode: lforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Right Foreleg
                  shortcode: rforelegloc
                  bodyPartCode: rforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Thorax
                  shortcode: thoraxloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 5
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 3
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Pelvis
                  shortcode: plvsloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 2
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Left Hind Leg
                  shortcode: lhindlegloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Right Hind Leg
                  shortcode: rhindlegloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Tail
                  shortcode: tailloc
                  bodyPartCode: tailpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 1
                  probWeight: 10
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
        weight:
            base: 130
            calc: "130"
        reachBase: 0
        bodyScaleBase: 1.18
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 70
          leaguesPerWatch: 5
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors:
              - scope: surface_cover
                key: mixed_forest
                mode: add
                textValue: "0"
          disabled: false
    defaultCombatGroup: null
    items:
        - name: Raking Claws
          type: skill
          system:
              shortcode: claw
              subType: combattechnique
              masteryLevelBase: 72
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: claw
                  name: Raking Claws
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 2
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 8
                      modifier: 1
                      aspect: edged
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
        - name: Swift Bite
          type: skill
          system:
              shortcode: bite
              subType: combattechnique
              masteryLevelBase: 72
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: bite
                  name: Swift Bite
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 1
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 2
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

Movement catches your eye — the ripple of a shadow across pale sand, gone as quickly as seen. The creature rises, and suddenly what was invisible becomes unmistakable: a lean, powerful feline silhouette against the desert heat. Its sandy-tan fur seems to shimmer and shift, making it difficult to focus upon even when you know where to look. The amber eyes fix on you with an unsettling intelligence, and you notice the tension in its body — every muscle coiled and ready. As it circles, its wide paws leave barely a trace in the sand, and you hear almost nothing despite its movement. The tail swishes once, twice, and you realize you're being assessed as potential prey.

# Dossier {#dossier}

The Sand Stalker is a lithe desert feline predator reaching 6-7 feet in length with a shoulder height of 3-4 feet, found in arid badlands, dune fields, and rocky desert where small-to-medium prey animals are plentiful. These nocturnal hunters are stealthy specialists that hunt during cool night hours and rest during the day. Adventurers might encounter sand stalkers while traveling through deserts at night, disturbing the creature's rest, or crossing territory where the cat hunts.

## Presentation

The Sand Stalker presents a lean, muscular form optimized for speed and agility over brute strength. The fur is a light sandy-tan or pale golden color with subtle darker markings that provide extraordinary camouflage in desert environments. The body is lithe and compact, with long legs suited for extended movement across sand and rough terrain. The head is proportionally feline with large, forward-facing amber eyes suited for nocturnal hunting, pointed ears that swivel to track sound, and a sensitive nose adapted for scent-hunting in arid conditions. The paws are notably wide and padded, spreading weight across sand and leaving minimal traces of passage. The tail is long and muscular, used for balance and communication.

## Key Behaviors

Sand Stalkers are primarily nocturnal and are most active during cool evening and night hours, sheltering during daylight in caves, rocky crevices, or deep burrows. They are solitary and territorial, with each cat maintaining exclusive hunting grounds marked by scent deposits on prominent rocks and clawed markings. They hunt small mammals, lizards, birds, and other prey items suitable for a mid-sized predator, and they will opportunistically target larger prey including humanoids if encounter permits. Sand Stalkers are intelligent and capable of learning — a cat that has successfully hunted humanoids will recognize humans as prey in future encounters. They communicate through vocalizations, scent marking, and subtle body language.

## Combat Strategy

The sand stalker's primary tactic is to approach prey silently and from unexpected direction, using stealth and terrain to close distance before attacking. The initial attack is explosive — a pounce intended to knock the target off balance and create an opening for bites and claw attacks. If the initial strike fails or the engagement turns against the cat, the stalker will retreat into darkness or terrain advantage, circling to find a new opening. The cat prefers not to engage in prolonged combat with anything that can effectively defend itself, preferring to wait for weakness or further opportunities.

## Attack Methods

### Explosive Pounce

The sand stalker launches itself with explosive acceleration, using its full body weight to knock a target off balance. The attack combines momentum with claw rakes and biting, intended to overwhelm prey through surprise and ferocity.

### Raking Claw Attacks

Once engaged, the stalker uses its powerful forelimbs to rake and slash at exposed flesh, tearing clothing and creating wounds. The claws can penetrate leather and inflict serious bleeding wounds.

### Swift Bite

The sand stalker's bite is sharp and precise, targeted at exposed flesh, faces, hands, or the throat. The bite is used to establish dominance, create additional trauma, or finish wounded prey.

## Special Abilities

### Desert Camouflage

The sand stalker's coloration is so effective in desert environments that it is nearly invisible when still or moving across sand and rocks. The cat gains significant advantage on stealth checks in desert terrain.

### Silent Prowl

The sand stalker's wide paws and light weight allow it to move with remarkable silence, capable of approaching prey without detection. The cat gains advantage on stealth checks while moving and the ability to move at speed without creating audible disturbance.

### Nocturnal Superiority

The sand stalker's eyes are adapted for night vision, allowing it to hunt effectively in near-total darkness. It gains significant advantage in all actions taken during low-light conditions.

### Scent Hunting

The sand stalker can track prey through smell, allowing it to hunt in darkness or when visual tracking is impossible. The cat can follow days-old scent trails and identify specific individuals by smell.

### Reflexive Evasion

The sand stalker's speed and agility allow it to dodge incoming attacks more effectively than most creatures, gaining bonus to defense against ranged and melee attacks.

### Additional Information

Sand stalkers are most active during night hours and sleeping or sheltering during day, making encounters during daylight hours rare. The cats avoid areas with significant human settlements or organized defense but will hunt isolated travelers or small groups. A stalker injured in combat will retreat and avoid re-engagement unless cornered or defending young. The creature's fur and claws are valuable to hunters and can be harvested to create armor or tools.

## Attributes

- **Strength:** 10-15 (1d6+9)

- **Endurance:** 8-13 (1d6+7)

- **Dexterity:** 12-17 (1d6+11)

- **Agility:** 13-18 (1d6+12)

- **Perception:** 13-18 (1d6+12)

- **Aura:** 7-10 (1d4+6)

- **Will:** 9-14 (1d6+8)

- **Reasoning:** 6-9 (1d4+5)

- **Creativity:** 5-8 (1d4+4)
