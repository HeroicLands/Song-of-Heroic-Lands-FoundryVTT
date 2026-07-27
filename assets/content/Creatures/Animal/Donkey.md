---
aliases:
    - Donkey
tags:
    - animal
name:
    full: Donkey
    aliases: []
id: Z0cG8fAIzSARDUaH
slug: donkey
img: icons/game-icons/skoll/donkey.svg
portrait: ""
type: creature
package: sohl
sohl:
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
        agl: 1d4+10
        per: 1d6+14
        snt: 1d4+1
        aur: 1d4+2
        wil: 1d6+9
        rea: 1d4+2
        cre: 1d4+3
    body:
        structure:
            parts:
                - name: Head
                  shortcode: headpart
                  zones:
                      - vital
                  canHoldItem: false
                  combatArea: 3
                  locations:
                      - name: Head
                        shortcode: headloc
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
                  shortcode: lforelegpart
                  zones:
                      - locomotor
                  canHoldItem: false
                  combatArea: 1.5
                  locations:
                      - name: Leg
                        shortcode: lforelegloc
                        bleedingSusceptibility: low
                        amputability: medium
                        shockValue: 2
                        probWeight: 1
                        protectionBase:
                            blunt: 4
                            edged: 3
                            piercing: 1
                            fire: 3
                - name: Right Foreleg
                  shortcode: rforelegpart
                  zones:
                      - locomotor
                  canHoldItem: false
                  combatArea: 1.5
                  locations:
                      - name: Leg
                        shortcode: rforelegloc
                        bleedingSusceptibility: low
                        amputability: medium
                        shockValue: 2
                        probWeight: 1
                        protectionBase:
                            blunt: 4
                            edged: 3
                            piercing: 1
                            fire: 3
                - name: Torso
                  shortcode: torsopart
                  zones:
                      - core
                  canHoldItem: false
                  combatArea: 6
                  locations:
                      - name: Flank
                        shortcode: flkloc
                        bleedingSusceptibility: medium
                        amputability: none
                        shockValue: 4
                        probWeight: 4
                        protectionBase:
                            blunt: 4
                            edged: 3
                            piercing: 1
                            fire: 3
                      - name: Abdomen
                        shortcode: abdloc
                        bleedingSusceptibility: high
                        amputability: none
                        shockValue: 4
                        probWeight: 6
                        protectionBase:
                            blunt: 4
                            edged: 3
                            piercing: 1
                            fire: 3
                - name: Left Rear Leg
                  shortcode: lrearlegpart
                  zones:
                      - locomotor
                  canHoldItem: false
                  combatArea: 2.5
                  locations:
                      - name: Left Quarter
                        shortcode: lqtrloc
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
                        bleedingSusceptibility: low
                        amputability: medium
                        shockValue: 2
                        probWeight: 4
                        protectionBase:
                            blunt: 4
                            edged: 3
                            piercing: 1
                            fire: 3
                - name: Right Rear Leg
                  shortcode: rrearlegpart
                  zones:
                      - locomotor
                  canHoldItem: false
                  combatArea: 2.5
                  locations:
                      - name: Right Quarter
                        shortcode: rqtrloc
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
                  shortcode: tailpart
                  zones: []
                  canHoldItem: false
                  combatArea: 1
                  locations:
                      - name: Tail
                        shortcode: tailloc
                        bleedingSusceptibility: none
                        amputability: high
                        shockValue: 1
                        probWeight: 1
                        protectionBase:
                            blunt: 4
                            edged: 3
                            piercing: 1
                            fire: 3
            adjacent:
                - - headpart
                  - torsopart
                - - headpart
                  - lforelegpart
                - - headpart
                  - rforelegpart
                - - torsopart
                  - lforelegpart
                - - torsopart
                  - rforelegpart
                - - torsopart
                  - lhindlegpart
                - - torsopart
                  - rhindlegpart
                - - lforelegpart
                  - rforelegpart
                - - lhindlegpart
                  - rhindlegpart
                - - torsopart
                  - tailpart
                - - lhindlegpart
                  - tailpart
                - - rhindlegpart
                  - tailpart
        weight:
            base: 600
            calc: 600
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

- **Strength:** 10-15 (1d6+9)
- **Endurance:** 13-18 (1d6+12)
- **Dexterity:** 8-11 (1d4+7)
- **Agility:** 7-10 (1d4+6)
- **Perception:** 10-15 (1d6+9)
- **Aura:** 6-9 (1d4+5)
- **Will:** 12-17 (1d6+11)
- **Reasoning:** 5-8 (1d4+4)
- **Creativity:** 4-7 (1d4+3)

## Attributes

- **Strength:** 10-15 (1d6+9)

- **Endurance:** 13-18 (1d6+12)

- **Dexterity:** 8-11 (1d4+7)

- **Agility:** 7-10 (1d4+6)

- **Perception:** 10-15 (1d6+9)

- **Aura:** 6-9 (1d4+5)

- **Will:** 12-17 (1d6+11)

- **Reasoning:** 5-8 (1d4+4)

- **Creativity:** 4-7 (1d4+3)
