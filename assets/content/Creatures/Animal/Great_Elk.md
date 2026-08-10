---
aliases:
    - Great Elk
tags:
    - animal
name:
    full: Great Elk
    aliases: []
id: MMuW0ZSPSzJPFbmM
slug: great-elk
img: icons/game-icons/lorc/stag-head.svg
portrait: ""
shortcode: greatelk
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 15
        end: 17
        dex: 12
        agl: 14
        per: 15
        aur: 11
        wil: 12
        rea: 8
        cre: 6
    attrRollFormula:
        str: 1d6+11
        end: 1d6+13
        dex: 1d6+8
        agl: 1d6+10
        per: 1d6+11
        aur: 1d6+7
        wil: 1d6+8
        rea: 1d4+5
        cre: 1d4+3
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 3
                - name: Forelegs
                  shortcode: forelegszone
                  probWeight: 2
                - name: Torso
                  shortcode: torsozone
                  probWeight: 7
                - name: Hindquarters
                  shortcode: hindqtrzone
                  probWeight: 4
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
                  probWeight: 4
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
                  probWeight: 6
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
                - name: Flank
                  shortcode: flkloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 6
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
                  probWeight: 4
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Left Quarter
                  shortcode: lqtrloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 3
                  probWeight: 5
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
                  probWeight: 4
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Right Quarter
                  shortcode: rqtrloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 3
                  probWeight: 5
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
                  probWeight: 4
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
            base: 800
            calc: "800"
        reachBase: 0
        bodyScaleBase: 1.22
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 80
          leaguesPerWatch: 5
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
    defaultCombatGroup: null
    items:
        - shortcode: awar
          type: skill
          system:
              masteryLevelBase: 70
        - shortcode: stlth
          type: skill
          system:
              masteryLevelBase: 65
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 33
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 40
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 56
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 40
        - name: Antler Gore
          type: skill
          system:
              shortcode: gore
              subType: combattechnique
              masteryLevelBase: 65
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: gore
                  name: Antler Gore
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 3
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 3
                      aspect: piercing
                  lengthBase: 2
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
        - name: Kick
          type: skill
          system:
              shortcode: kick
              subType: combattechnique
              masteryLevelBase: 58
              combatCategory: melee
              impairedByRoles:
                  - locomotor
              strikeMode:
                  type: melee
                  shortcode: kick
                  name: Kick
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 6
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 0
                      aspect: blunt
                  lengthBase: 3
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

The earth trembles before you fully comprehend what approaches—a massive shape moving with deceptive grace through the forest. The elk stands nearly eight feet at the shoulder, a creature of overwhelming physical presence. The antlers are the true marvel: a crown of bone spanning twelve feet or more, branching like an ancient tree, each point sharp enough to pierce armor. The coat is rich tawny brown, lighter on the belly, and moves like silk over the powerful musculature beneath. The breath steams visibly in the cold air, and the eyes—large and dark—fix on you with an expression that combines calm intelligence with the capacity for terrible violence. The sound of the hooves on stone is heavy and authoritative, and the ground seems to reshape itself to accommodate the creature's passage.

# Dossier {#dossier}

The Great Elk is a regal megafauna creature that dominates the temperate and cold forests and plains where it ranges. These animals are migratory, often traveling hundreds of miles in established herds that follow seasonal patterns established over generations. A mature bull elk stands nearly eight feet at the shoulder and can weigh close to a ton—a creature built for both grace and raw power. Great Elks are generally peaceful herbivores but become territorial and aggressive during the rutting season, and any threat to calves is met with protective fury.

## Presentation

The Great Elk is built for power and endurance, with a body that combines the muscle of a draft animal with the grace of a dancer. The front legs are columnar and strong, supporting the enormous weight of the torso and head. The antlers are the defining feature: a massive crown of bone that can span twelve feet or more, branching extensively with multiple points all sharp enough to serve as weapons. The coat is dense and double-layered, providing protection from cold, in shades of tawny brown with lighter coloring on the belly and underside. The head is large and noble in bearing, with large, expressive eyes and a broad muzzle. The neck is thick and muscular, built to support the weight of the antlers. The overall impression is of a creature of majesty and power.

## Key Behaviors

Great Elks are herd animals that travel in organized groups ranging from a few individuals to herds of several dozen. They are migratory, following established routes to summer and winter ranges. They are primarily crepuscular, most active during dawn and dusk, spending daylight hours resting and chewing cud. They feed on vegetation—grasses, shrubs, leaves, and twigs—and can consume enormous quantities. Bulls are solitary during non-breeding season but gather with cows for the rut (mating season), during which they become intensely territorial and aggressive. Calves are protected fiercely by mothers, and bulls will defend harems from rival males.

## Combat Strategy

A Great Elk's primary defense is the charge—using the antlers as lance points, driving with the full weight and power of the body. A charging elk can pierce armor and impale opponents with shocking ease. If cornered or if a calf is threatened, the elk uses powerful hind legs to deliver crushing kicks. A herd of elks may stampede, trampling anything in their path. An elk defending its territory or offspring will press attacks with determination, though it will typically retreat if seriously wounded and escape is possible.

## Attack Methods

### Antler Gore

The massive antlers are driven forward in a charging attack, capable of penetrating armor and impaling opponents. The impact of the charge adds tremendous force behind the antler strike.

### Crushing Kick

The hind legs deliver powerful kicks—slow but tremendously forceful—that can break bones or drive an opponent backward with significant violence.

## Special Abilities

### Herd Alert

Within a herd, Great Elks are nearly impossible to surprise—one alert individual shares danger signals with the entire group, allowing them to react as a coordinated unit. A solitary elk is more vulnerable but still maintains excellent vigilance.

### Legendary Endurance

The Great Elk can travel for days without tiring, covering vast distances at a steady pace. This endurance allows escape from most pursuers, though it also means a determined elk can follow prey relentlessly.

## Additional Information

A Great Elk's antlers are molted annually and can be collected and crafted into extraordinary weapons or decorative pieces. A single antler can be worth significant coin to craftspeople. The elk's hide is valuable for leather goods. Some cultures venerate the Great Elk as a symbol of wildness and untamed strength.

## Attributes

- **Strength:** 12-17 (1d6+11)

- **Endurance:** 14-19 (1d6+13)

- **Dexterity:** 9-14 (1d6+8)

- **Agility:** 11-16 (1d6+10)

- **Perception:** 12-17 (1d6+11)

- **Aura:** 8-13 (1d6+7)

- **Will:** 9-14 (1d6+8)

- **Reasoning:** 6-9 (1d4+5)

- **Creativity:** 4-7 (1d4+3)
