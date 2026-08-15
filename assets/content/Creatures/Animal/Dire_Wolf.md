---
aliases:
    - Dire Wolf
    - creature-direwolf
tags:
    - animal
name:
    full: Dire Wolf
    aliases: []
id: ILqvei5kP8X84icm
img: icons/game-icons/lorc/wolf-head.svg
portrait: images/direwolf.webp
shortcode: direwolf
type: creature
package: sohl
sohl:
    kbcat: animal
    archetype: 0
    attributes:
        str: 20
        end: 18
        dex: 13
        agl: 15
        per: 16
        aur: 12
        wil: 16
        rea: 11
        cre: 8
    attrRollFormula:
        str: 1d6+16
        end: 1d6+14
        dex: 1d6+9
        agl: 1d6+11
        per: 1d6+12
        aur: 1d6+8
        wil: 1d6+12
        rea: 1d6+7
        cre: 1d4+5
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 2
                - name: Forelegs
                  shortcode: forelegszone
                  probWeight: 2
                - name: Torso
                  shortcode: torsozone
                  probWeight: 4
                - name: Hindquarters
                  shortcode: hindqtrzone
                  probWeight: 2
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
            base: 150
            calc: "150"
        reachBase: 0
        bodyScaleBase: 1.47
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 80
          leaguesPerWatch: 7
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
              masteryLevelBase: 75
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 42
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 56
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 60
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 48
        - name: Crushing Bite
          type: skill
          system:
              shortcode: bite
              subType: combattechnique
              masteryLevelBase: 70
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
                      spread: 2
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 5
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

You hear it first: a sound that carries for miles, a howl that raises the hair on your arms and freezes your breath in your throat. Then you see them emerging from shadow and forest edge—creatures that dwarf ordinary wolves. The lead animal stands as tall as a human’s waist, its frame a lean assemblage of coiled muscle and predatory grace. Storm-gray fur ripples over powerful limbs; yellow eyes gleam with an intelligence that seems almost human. The jaws open in a snarl that reveals teeth made for tearing, and the smell hits—wild, musk-laden, carrying the scent of blood and danger. When it moves, there is almost no sound: just the whisper of paws on earth and the distant, chilling song of the pack.

# Dossier {#dossier}

The Dire Wolf is an apex predator found in deep forests, mountains, and wilderness regions far from human civilization. Standing four feet tall at the shoulder and measuring seven to nine feet from nose to tail, these enormous canines are twice the size of common gray wolves while retaining the pack intelligence and social complexity of their smaller cousins. Unlike common wolves that hunt small game, Dire Wolves regularly take prey as large as elk and have been documented hunting humans when circumstances allow. They are extraordinarily intelligent, capable of tactics that suggest planning and coordination beyond simple instinct. A Dire Wolf pack represents one of the most serious predatory threats an adventurer can encounter in wilderness. Solitary Dire Wolves are rarer than packs and are typically outcasts from pack hierarchies—they are notably more aggressive and more likely to attack humans. Adventurers may encounter these creatures while traveling through wilderness, camping in their territory, or investigating missing person cases where the missing have been taken by wolves.

## Presentation

A massive canine built on a frame designed for power and endurance. The body is lean and muscular, with long legs positioned for sustained running and powerful shoulders engineered for taking down large prey. The head is broad and powerful with a snout designed to deliver devastating bite force. The eyes are yellow or amber and positioned laterally, allowing excellent peripheral vision. The ears are erect and mobile, capable of rotating independently for precise hearing. The fur is thick and unkempt, typically gray, black, or reddish-brown, with lighter undersides. Scars marking territorial conflicts and past hunts are virtually universal on adult individuals. The teeth are formidable, with canines measuring one and a half inches or more. The tail is long, thick, and muscular. The overall impression is of a creature engineered for predation: powerful, intelligent, and utterly dangerous.

## Key Behaviors

Dire Wolves live in packs typically numbering five to fifteen individuals, with a clear alpha hierarchy. Packs are matriarchal—the alpha female is typically the most powerful and authoritative, with the alpha male supporting her authority. Subordinate pack members are organized in a hierarchy that determines feeding order and mating rights. Pack members communicate through vocalizations (howling, growling), scent marking, and body language of extraordinary sophistication. They hunt cooperatively, using tactics that suggest planning: some individuals herd prey toward a kill zone while others attack from ambush. They establish territories spanning twenty to fifty square miles and defend those territories fiercely against rival packs. A pack that has learned humans carry food or that humans are vulnerable prey will actively hunt humans. They are capable of sustained pursuit, tracking prey for hours or days. They have long memories and will remember human hunters who have opposed them, actively seeking revenge.

## Combat Strategy

A Dire Wolf pack's hunting strategy involves positioning individuals to maximize tactical advantage: some create distraction while others attack from flank or rear, some harry prey toward terrain advantages, some focus on disabling limbs while others attack vital areas. A coordinated pack can surround and incapacitate prey far larger than any individual wolf. Against humans, packs typically isolate and attack a single individual, pulling them from the group and overwhelming them before the group can mount effective defense. A solitary Dire Wolf employs hit-and-run tactics, testing for weaknesses and exploiting them ruthlessly.

## Attack Methods

### Crushing Bite with Canine Teeth

The Dire Wolf accelerates and attempts to bite, targeting the neck, throat, or limbs with devastating force. The bite can crush bone and sever arteries. Multiple bites in rapid succession are common, with the wolf moving to fresh wounds between bites.

### Pack Coordination Attacks

Multiple Dire Wolves attacking simultaneously from different angles prevent a target from defending in all directions. While one wolf attacks from front, others attack from flank or rear, making coordinated defense nearly impossible.

### Hamstringing and Leg Attacks

Dire Wolves will frequently target legs, attempting to sever tendons and cripple prey. A hamstrung target cannot flee or maintain standing position.

### Throwing and Pinning

Using their bite, Dire Wolves can seize and shake prey violently, potentially breaking bones or dislocating joints. Multiple wolves can pin prey by seizing different extremities simultaneously.

## Special Abilities

### Pack Intelligence and Coordination

Dire Wolves are intelligent enough to execute complex hunting strategies requiring planning, communication, and coordination. A pack can surround prey, cut off escape routes, and attack in precisely coordinated waves. This intelligence makes them far more dangerous than animals relying on instinct alone.

### Exceptional Strength and Endurance

Dire Wolves can sustain pursuit for hours, traveling at speeds that exhaust human runners. Their bite force exceeds that of bears, and their physical resilience allows them to sustain injuries that would incapacitate lesser predators.

### Keen Senses and Tracking

Dire Wolves can follow scent trails days old over any terrain. Their hearing allows detection of prey sounds from miles away. This sensory advantage makes escape through stealth nearly impossible.

### Territorial Fury and Pack Loyalty

A Dire Wolf defending its territory or protecting pack members fights with suicidal determination. Pack members will defend one another to the death, and a pack that has bonded is capable of executing complex group tactics in support of individual members.

## Attributes

- **Strength:** 17-22 (1d6+16)

- **Endurance:** 15-20 (1d6+14)

- **Dexterity:** 10-15 (1d6+9)

- **Agility:** 12-17 (1d6+11)

- **Perception:** 13-18 (1d6+12)

- **Aura:** 9-14 (1d6+8)

- **Will:** 13-18 (1d6+12)

- **Reasoning:** 8-13 (1d6+7)

- **Creativity:** 6-9 (1d4+5)
