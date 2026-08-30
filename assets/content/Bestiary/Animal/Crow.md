---
aliases:
  - Crow
tags:
  - animal
name:
  full: Crow
  aliases: []
description: "A clever, adaptable passerine thriving alongside humans, showing curiosity, problem-solving, and a memory that lends each bird real personality."
id: 12aoq5wWUTMD33Jm
img: icons/game-icons/lorc/crow-dive.svg
portrait: images/being/crow-portrait.webp
shortcode: crow
type: being
sohl:
  kbcat: animal
  archetype: 0
  attributes:
    str: 2
    end: 8
    agl: 10
    per: 22
    snt: 3
    aur: 6
    wil: 10
    rea: 8
    cre: 10
  attrRollFormula:
    str: 1d4
    end: 1d4+6
    agl: 1d6+7
    per: 1d6+19
    snt: 1d4+1
    aur: 1d4+4
    wil: 1d6+7
    rea: 1d4+6
    cre: 1d6+7
  body:
    structure:
      zones:
        - name: Head
          shortcode: headzone
          probWeight: 1
        - name: Body
          shortcode: torsozone
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
          bodyZoneCode: headzone
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
          bodyZoneCode: hindqtrzone
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
          probWeight: 3
        - name: Right Leg
          shortcode: rlegpart
          bodyZoneCode: hindqtrzone
          roles:
            - locomotor
            - manipulator
          canHoldItem: false
          probWeight: 3
        - name: Tail
          shortcode: tailpart
          bodyZoneCode: hindqtrzone
          roles: []
          canHoldItem: false
          probWeight: 4
      locations:
        - name: Head
          shortcode: headloc
          bodyPartCode: headpart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 5
          probWeight: 3
          protectionBase:
            blunt: -6
            edged: -7
            piercing: -8
            fire: -6
        - name: Neck
          shortcode: neckloc
          bodyPartCode: headpart
          bleedingSusceptibility: high
          amputability: low
          shockValue: 5
          probWeight: 2
          protectionBase:
            blunt: -6
            edged: -7
            piercing: -8
            fire: -6
        - name: Left Wing
          shortcode: lwingloc
          bodyPartCode: lwingpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 1
          probWeight: 10
          protectionBase:
            blunt: -6
            edged: -7
            piercing: -8
            fire: -6
        - name: Thorax
          shortcode: thoraxloc
          bodyPartCode: torsopart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 4
          probWeight: 6
          protectionBase:
            blunt: -6
            edged: -7
            piercing: -8
            fire: -6
        - name: Abdomen
          shortcode: abdloc
          bodyPartCode: torsopart
          bleedingSusceptibility: high
          amputability: none
          shockValue: 4
          probWeight: 4
          protectionBase:
            blunt: -6
            edged: -7
            piercing: -8
            fire: -6
        - name: Right Wing
          shortcode: rwingloc
          bodyPartCode: rwingpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 1
          probWeight: 10
          protectionBase:
            blunt: -6
            edged: -7
            piercing: -8
            fire: -6
        - name: Left Leg
          shortcode: llegloc
          bodyPartCode: llegpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 2
          probWeight: 10
          protectionBase:
            blunt: -6
            edged: -7
            piercing: -8
            fire: -6
        - name: Right Leg
          shortcode: rlegloc
          bodyPartCode: rlegpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 2
          probWeight: 10
          protectionBase:
            blunt: -6
            edged: -7
            piercing: -8
            fire: -6
        - name: Tail
          shortcode: tailloc
          bodyPartCode: tailpart
          bleedingSusceptibility: none
          amputability: high
          shockValue: 1
          probWeight: 10
          protectionBase:
            blunt: -6
            edged: -7
            piercing: -8
            fire: -6
    weight:
      base: 3
      calc: "3"
    reachBase: 0
    bodyScaleBase: 0.33
    personalFatigue: enc + 5
  currentMoveMedium: aerial
  movementProfiles:
    - medium: aerial
      feetPerRound: 200
      leaguesPerWatch: 6
      encumbrance: floor(wt/4)
      strMod: -5 * floor((str - 10) / 2)
      factors: []
      disabled: false
    - medium: terrestrial
      feetPerRound: 20
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
        masteryLevelBase: 80
    - shortcode: stlth
      type: skill
      system:
        masteryLevelBase: 64
    - shortcode: sprt
      type: mysticalability
      system:
        masteryLevelBase: 32
    - shortcode: init
      type: skill
      system:
        masteryLevelBase: 27
    - shortcode: dge
      type: skill
      system:
        masteryLevelBase: 64
    - shortcode: shok
      type: skill
      system:
        masteryLevelBase: 15
    - name: Talon
      type: skill
      system:
        shortcode: talon
        subType: combattechnique
        masteryLevelBase: 40
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
            spread: 1
            modifier: 0
          impactBase:
            numDice: 1
            die: 8
            modifier: -9
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
        masteryLevelBase: 44
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
            modifier: -8
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

The bird cocks its head, assessing you with an eye that seems disturbingly intelligent. Glossy black feathers catch sunlight in iridescent flashes of purple and blue as it shifts its weight. The beak is sharp and capable, the eye itself dark and penetrating—not the empty gaze of animal instinct but something resembling calculation. It caws—a harsh, echoing sound that seems to carry far more meaning than simple birdsong should. Somewhere nearby, you hear the response: other crows, numerous, answering the call.

# Dossier {#dossier}

The Crow is a medium-sized passerine bird remarkable for its intelligence, adaptability, and social complexity. Weighing one to two pounds and measuring sixteen to twenty-one inches in length, crows are found in nearly every terrestrial environment and have adapted successfully to human civilization. Unlike most birds, crows show genuine curiosity, problem-solving capacity, and what might be called personality. They recognize individual humans, remember those who have harmed them, and interact with each other through complex vocalizations and behavior. They are opportunistic feeders, consuming whatever food is available: insects, seeds, small animals, carrion, and garbage. They are notorious thieves, stealing shiny objects and hoarding them. While individually a crow presents minimal threat to humans, crows in flocks are considerably more dangerous—they can harass and distract, and historically documented cases exist of crows defending themselves against threats with coordinated attacks. Adventurers may encounter crows in almost any environment, particularly around settlements, battlefields, and hunting grounds where carrion is available.

## Presentation

A medium-sized passerine with an all-black plumage that displays iridescent blue and purple highlights in certain lighting conditions. The head is proportionally large with an intelligent eye placed laterally, allowing good vision to the side and rear. The beak is thick, powerful, and slightly curved downward. The wing-to-body ratio indicates a creature built for extended flight and maneuverability rather than pure speed. The tail is squared rather than forked, serving as a rudder in flight. The feet are strong and capable of gripping perches firmly or grasping food items. The overall impression is of a bird built for intelligence rather than speed or strength, with a frame suggesting sustained flight capability and manual manipulation. The corvid family (crows, ravens, jays) is distinctive in having a proportionally larger brain-to-body ratio than most other birds, and the physical design reflects this neural sophistication.

## Key Behaviors

Crows are social animals, forming flocks that range from dozens to hundreds of individuals. Within these flocks, complex hierarchies exist, with dominant individuals controlling access to resources. They are known to recognize individual human faces, remember those who have harmed them, and communicate information about dangerous humans to other crows. They are tool users, capable of using sticks to extract insects from crevices and other problem-solving behaviors. They are highly vocal, communicating through a complex variety of caws, clicks, and other vocalizations. They have been documented playing—engaging in apparently non-functional behaviors that seem to be driven by curiosity or enjoyment. They are famous thieves, stealing shiny objects and hoarding them in hidden locations. They are also famous scavengers, following hunters and eating carcasses abandoned after hunting. They mate for life and show affection toward mates and offspring. They are omnivorous, eating anything from insects and seeds to small animals and garbage. They are long-lived birds, sometimes reaching twenty-five years in captivity and likely similar ages in the wild.

## Combat Strategy

Individual crows rarely engage in direct combat with humans or large animals. When threatened, they prefer to flee to the air, where they are safer from ground-based threats. In flocks, however, crows become considerably bolder. Multiple crows will mob predators—a coordinated behavior where the flock works together to distract, harass, and attack. While individual pecks cause minimal damage, dozens or hundreds of pecks over sustained time can cause significant injury and blood loss. Crows attacking in groups focus on eyes, face, and exposed hands, attempting to cause discomfort and distraction sufficient to drive the threat away. Crows will also steal food, distract opponents, and use intelligence to identify weaknesses in a target's defenses.

## Attack Methods

### Pecking Attack

A single peck from a crow's beak causes minor trauma but can target sensitive areas: eyes, face, ears, or hands. Multiple pecks accumulate damage and cause progressive pain and distraction. Crows often target the eyes, attempting to blind or at least discomfort the target.

### Dive-bombing

Using aerial superiority, a crow will dive at a target from above, attempting to strike the head, face, or back. The momentum of the dive adds force to the impact. Repeated dives can daze or confuse targets.

### Coordinated Group Harassment

When multiple crows coordinate, they create sustained harassment through simultaneous attacks from multiple angles. The target cannot defend against all attacks simultaneously, ensuring that some pecks land while others are blocked.

## Special Abilities

### Exceptional Intelligence and Problem-solving

Crows are problem-solvers capable of understanding cause and effect, spatial relationships, and even basic tool use. This intelligence allows them to exploit weaknesses in defenses, identify vulnerable targets, and adapt tactics in real-time. A crow or group of crows may engage in deception: creating distraction to allow steal attempts, or driving prey toward obstacles.

### Aerial Superiority and Maneuverability

Crows are exceptional fliers with superior maneuverability to most other birds. They can hover, turn sharply, and navigate complex terrain from the air. This aerial advantage makes them difficult to target and allows them to attack from positions that ground-based opponents cannot defend against effectively.

### Complex Communication and Coordination

Crows communicate through a sophisticated system of vocalizations and body language. Flocks demonstrate collective behavior, including coordinated attacks, shared defense, and problem-solving. Information about dangerous humans, food sources, and threats is transmitted through populations—a crow that has learned a human is dangerous will communicate that information to other crows, and that information may spread far beyond the original encounter.

### Persistence and Grudge-holding

Crows have been documented holding grudges against individual humans for years, and corvids are known to recognize faces and communicate about dangerous individuals. A crow that has been harmed by a particular human may actively harass that human in future encounters, and may communicate that information to other crows, leading to group harassment from birds the human has never directly encountered.

## Attributes

- **Strength:** 1-4 (1d4)

- **Endurance:** 7-10 (1d4+6)

- **Agility:** 8-13 (1d6+7)

- **Perception:** 20-25 (1d6+19)

- **Scent:** 2-5 (1d4+1)

- **Aura:** 5-8 (1d4+4)

- **Will:** 8-13 (1d6+7)

- **Reasoning:** 7-10 (1d4+6)

- **Creativity:** 8-13 (1d6+7)
