---
aliases:
  - Donkey
  - being-donkey
tags:
  - animal
name:
  full: Donkey
  aliases: []
description: "A small, sure-footed equine prized for endurance and long life, hauling loads through rough terrain that would defeat a horse."
id: Z0cG8fAIzSARDUaH
img: icons/game-icons/skoll/donkey.svg
portrait: images/being/donkey-portrait.webp
shortcode: donkey
type: being
package: sohl
sohl:
  kbcat: animal
  archetype: 0
  attributes:
    str: 24
    end: 13
    agl: 12
    per: 18
    snt: 3
    aur: 4
    wil: 12
    rea: 4
    cre: 5
  attrRollFormula:
    str: 1d6+21
    end: 1d6+10
    agl: 1d6+9
    per: 1d6+15
    snt: 1d4+1
    aur: 1d4+2
    wil: 1d6+9
    rea: 1d4+2
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
            blunt: 4
            edged: 3
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
            blunt: 4
            edged: 3
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
            blunt: 4
            edged: 3
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
            blunt: 4
            edged: 3
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
            blunt: 4
            edged: 3
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
            blunt: 4
            edged: 3
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
            blunt: 4
            edged: 3
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
            blunt: 4
            edged: 3
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
            blunt: 4
            edged: 3
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
            blunt: 4
            edged: 3
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
            blunt: 4
            edged: 3
            piercing: 1
            fire: 3
    weight:
      base: 600
      calc: "600"
    reachBase: 0
    bodyScaleBase: 1.66
    personalFatigue: enc + 5
  currentMoveMedium: terrestrial
  movementProfiles:
    - medium: terrestrial
      feetPerRound: 110
      leaguesPerWatch: 6
      encumbrance: floor(wt/4)
      strMod: -5 * floor((str - 10) / 2)
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
        masteryLevelBase: 60
    - shortcode: sprt
      type: mysticalability
      system:
        masteryLevelBase: 24
    - shortcode: init
      type: skill
      system:
        masteryLevelBase: 24
    - shortcode: dge
      type: skill
      system:
        masteryLevelBase: 60
    - shortcode: shok
      type: skill
      system:
        masteryLevelBase: 39
    - name: Kick
      type: skill
      system:
        shortcode: kick
        subType: combattechnique
        masteryLevelBase: 60
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
            modifier: 4
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
    - name: Bite
      type: skill
      system:
        shortcode: bite
        subType: combattechnique
        masteryLevelBase: 48
        combatCategory: melee
        impairedByRoles:
          - manipulator
        strikeMode:
          type: melee
          shortcode: bite
          name: Bite
          minParts: 1
          assocSkillCode: null
          attack:
            disabled: false
            spread: 3
            modifier: 0
          impactBase:
            numDice: 1
            die: 4
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
---

# Appearance {#appearance}

The small, sturdy animal stands with quiet patience, its oversized ears tracking movement with independent precision. The coat is rough and practical, gray or brown, unadorned by vanity. The short, strong legs end in sturdy hooves that have walked countless miles through terrain that would destroy lesser animals. When it turns its head toward you, the eyes are intelligent and patient—this is not a beast driven by fear or unreasoning aggression but by stoic pragmatism.

# Dossier {#dossier}

The Donkey is a small equine renowned for endurance, sure-footedness, and stubbornness. Standing ten to fourteen hands tall and weighing five hundred to nine hundred pounds, donkeys are primary pack animals for adventurers, merchants, and farmers. They excel in rough terrain where horses struggle, require less food and water than horses, and live longer—often exceeding thirty years. Donkeys are intelligent and develop strong preferences about routes and handlers. They are surprisingly aggressive when defending themselves or their young, capable of injuring predators with kicks and bites. Despite stereotypes about stupidity, donkeys are thoughtful animals that refuse dangerous tasks if they assess the task as likely to injure them. Adventurers rely on donkeys for transport through mountains, deserts, and rough wilderness where heavier horses cannot go.

## Presentation

A compact equine with a stocky frame and short, strong legs positioned for stability rather than speed. The head is proportionally large with long, mobile ears providing excellent hearing and serving as status indicators. The muzzle is relatively long and flexible. The coat is typically coarse and gray or brown. The tail is thin and often cropped short. The hooves are small and hard, well-adapted for rocky terrain. Donkeys often bear scars from pack straps, saddle rubbing, or past injuries. The overall impression is of a creature built for practicality and endurance rather than beauty or speed.

## Key Behaviors

Donkeys are highly social herd animals that form strong bonds with their companions—both other donkeys and humans. They are thoughtful animals that remember routes, recognize individual handlers, and prefer certain companions. They are stubborn in the sense that they will refuse tasks they assess as dangerous, not from obstinacy but from practical assessment. They are territorial and will defend space they occupy. They are long-lived and develop strong personalities with clear preferences. They have good memories and will remember handlers, routes, and past events.

## Combat Strategy

Donkeys prefer flight to fight but will defend themselves vigorously when cornered. They use powerful rear-leg kicks and bites. A donkey defending young is remarkably aggressive.

## Attack Methods

### Rear-leg Kick

The donkey's powerful hind legs deliver crushing blows, capable of breaking bones. The kick is the primary defense mechanism.

### Bite

The donkey will bite when grabbed or cornered, delivering sharp bites capable of drawing blood.

## Special Abilities

### Exceptional Endurance and Sure-footedness

A donkey can carry substantial loads over terrain that would defeat horses: narrow mountain passes, rocky ground, and unstable surfaces. It can travel days with minimal water and food. Its footing on dangerous terrain is superior to horses.

### Stubbornness and Self-preservation

A donkey will refuse tasks it assesses as dangerous. This is not stupidity but intelligent self-preservation. A donkey that refuses to proceed may be showing wisdom about danger ahead.

### Longevity and Intelligence

Donkeys live thirty or more years and develop genuine relationships with handlers. They remember routes, recognize individuals, and show emotions including grief.

## Attributes

- **Strength:** 22-27 (1d6+21)

- **Endurance:** 11-16 (1d6+10)

- **Agility:** 10-15 (1d6+9)

- **Perception:** 16-21 (1d6+15)

- **Scent:** 2-5 (1d4+1)

- **Aura:** 3-6 (1d4+2)

- **Will:** 10-15 (1d6+9)

- **Reasoning:** 3-6 (1d4+2)

- **Creativity:** 4-7 (1d4+3)
