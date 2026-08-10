---
aliases:
    - Giant Beaver
tags:
    - animal
name:
    full: Giant Beaver
    aliases: []
id: sChYtBXlCKoOHaHl
slug: giant-beaver
img: icons/game-icons/lorc/paw-print.svg
portrait: ""
shortcode: gntbvr
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 13
        end: 15
        dex: 11
        agl: 10
        per: 12
        aur: 8
        wil: 13
        rea: 10
        cre: 9
    attrRollFormula:
        str: 1d6+9
        end: 1d6+11
        dex: 1d6+7
        agl: 1d4+7
        per: 1d6+8
        aur: 1d4+5
        wil: 1d6+9
        rea: 1d4+7
        cre: 1d4+6
    body:
        structure:
            zones:
                - name: Forequarters
                  shortcode: fqtrzone
                  probWeight: 3
                - name: Torso
                  shortcode: torsozone
                  probWeight: 3
                - name: Hindquarters
                  shortcode: hindqtrzone
                  probWeight: 3
            parts:
                - name: Head
                  shortcode: headpart
                  bodyZoneCode: fqtrzone
                  roles:
                      - vital
                      - manipulator
                  canHoldItem: false
                  probWeight: 10
                - name: Left Foreleg
                  shortcode: lforelegpart
                  bodyZoneCode: fqtrzone
                  roles: &a1
                      - locomotor
                  canHoldItem: false
                  probWeight: 5
                - name: Right Foreleg
                  shortcode: rforelegpart
                  bodyZoneCode: fqtrzone
                  roles: *a1
                  canHoldItem: false
                  probWeight: 5
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
                  probWeight: 5
                - name: Right Hind Leg
                  shortcode: rhindlegpart
                  bodyZoneCode: hindqtrzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 5
                - name: Tail
                  shortcode: tailpart
                  bodyZoneCode: hindqtrzone
                  roles:
                      - manipulator
                  canHoldItem: false
                  probWeight: 10
            locations:
                - name: Head
                  shortcode: headloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 3
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
                  probWeight: 2
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
            base: 300
            calc: "300"
        reachBase: 0
        bodyScaleBase: 1.11
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 30
          leaguesPerWatch: 2
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
        - medium: aquatic
          feetPerRound: 50
          leaguesPerWatch: 4
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
    defaultCombatGroup: null
    items:
        - shortcode: awar
          type: skill
          system:
              masteryLevelBase: 65
        - shortcode: stlth
          type: skill
          system:
              masteryLevelBase: 55
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 30
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 48
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 44
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 35
        - name: Powerful Bite
          type: skill
          system:
              shortcode: bite
              subType: combattechnique
              masteryLevelBase: 60
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: bite
                  name: Powerful Bite
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 2
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 2
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
        - name: Tail Slam
          type: skill
          system:
              shortcode: tail
              subType: combattechnique
              masteryLevelBase: 50
              combatCategory: melee
              impairedByRoles:
                  - locomotor
              strikeMode:
                  type: melee
                  shortcode: tail
                  name: Tail Slam
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 4
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: -1
                      aspect: blunt
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
---

# Appearance {#appearance}

The sound reaches you first—the rhythmic crack and splinter of a tree trunk being systematically gnawed. You push through the brush and find yourself staring at a creature the size of a pony, its fur dark and slick with water, its massive teeth clearly visible as it works the wood with mechanical precision. The thing does not look up, focused entirely on its labor—but you feel the weight of its attention nonetheless. Around its territory, you notice the scope of its engineering: trees felled in geometric perfection, their trunks stripped and woven into a massive dam that has entirely reshaped the river. The water level has risen dramatically, drowning the forest and creating a landscape of flooded timber and still, dark water. When the beaver finally turns to look at you, its tail—a massive, paddle-like weapon—rises and slaps the water with a thunderous crack that sends spray to your chest.

# Dossier {#dossier}

The Giant Beaver is an intelligent, industrious creature standing four feet at the shoulder and weighing several hundred pounds. These are master engineers that fundamentally reshape their environment, constructing elaborate dam systems and lodge structures that entirely redirect watercourses and create new landscapes. A giant beaver's territory is instantly recognizable by its engineering—lakes that did not exist before, waterways redirected, forests partially drowned. These creatures are territorial and aggressive in defense of their domain, particularly during construction seasons. Adventurers most commonly encounter them while traveling through beaver-infested waterways or when they attempt to cross a dam that blocks their passage.

## Presentation

The Giant Beaver is a powerful aquatic mammal with a body built for both water and land. Its fur is dense and waterproof, typically dark brown with hints of red or lighter undertones, and it sits wet and slick whether the creature is in or out of water. The shoulders and hindquarters are powerfully muscled, and the hind feet are partially webbed, providing propulsion in water. The front paws are smaller and more dexterous, equipped with sharp claws used for felling trees and manipulating materials. The tail is the creature's most distinctive feature—a flat, paddle-like appendage covered in scales and nearly as long as the body, used for balance, signaling, and as a powerful weapon. The head is blocky and powerful, with prominent incisors that never stop growing and are kept sharp by constant gnawing. The eyes are small and set to the sides of the head, providing good peripheral vision. The overall impression is of a creature designed for specific purpose—water, wood, and creation.

## Key Behaviors

Giant Beavers are highly intelligent and work with singular focus on constructing and maintaining their territories. A territory includes elaborate dam systems (sometimes consisting of multiple dams on a single watercourse), lodge structures that serve as homes and defensible positions, and carefully maintained foraging areas. Beavers spend much of the day gathering wood and materials, falling trees with their teeth and transporting the material through water or by dragging. They are social within family units but fiercely territorial toward other beavers. They are primarily nocturnal but will work during daylight hours if urgent construction demands it. A beaver that perceives a threat to its dam or lodge responds with immediate, focused aggression.

## Combat Strategy

A Giant Beaver defends its territory with absolute commitment. When threatened, it typically retreats to water where it has supreme advantage, then attacks from there—using the water as both weapon and escape route. In direct combat, the beaver uses its powerful tail as a crushing weapon and its bite for grappling and damage. The creature fights methodically and without hesitation, showing no fear of larger opponents and no inclination to flee once combat has begun. A beaver defending its dam will draw attackers into complex terrain of water, flooded timber, and narrow passages where its knowledge provides advantage.

## Attack Methods

### Powerful Bite

The beaver's incisors are capable of cutting through wood and are equally effective against flesh and bone. A beaver clamps onto a target and holds, attempting to drag the target into water or closer to the beaver's body for additional attacks.

### Tail Slam

The flat, powerful tail is brought to bear as a bludgeoning weapon—the beaver swings or brings it down with force sufficient to break bones, knock creatures off balance, or drive them into water. The tail can also be used to slap the water, creating waves or splashes that obscure vision.

## Special Abilities

### Aquatic Master

In water, the Giant Beaver is supremely graceful and fast—it can navigate submerged passages, hold its breath for extended periods, and move at speeds that land creatures cannot match. On land, the beaver is slower and more vulnerable. In its own territory with its dam and dam-adjacent waters, the beaver gains significant tactical advantage.

### Tireless Engineering

The beaver can fell trees and move materials at remarkable speed, reshaping waterways and constructing barriers. This ability is useful for trapping or isolating enemies within the beaver's territory.

## Additional Information

A beaver's territory can be extremely valuable—a well-constructed dam provides water power for mills, the lake behind the dam provides resources, and the flooded timber can be harvested. Negotiating with a giant beaver for access to its territory is theoretically possible but practically difficult—the creatures are not interested in non-wood-related payment. A dead beaver's tail is prized for various purposes including cloaks and trophies. The teeth are sometimes worked into decorative items or tools.

## Attributes

- **Strength:** 10-15 (1d6+9)

- **Endurance:** 12-17 (1d6+11)

- **Dexterity:** 8-13 (1d6+7)

- **Agility:** 8-11 (1d4+7)

- **Perception:** 9-14 (1d6+8)

- **Aura:** 6-9 (1d4+5)

- **Will:** 10-15 (1d6+9)

- **Reasoning:** 8-11 (1d4+7)

- **Creativity:** 7-10 (1d4+6)
