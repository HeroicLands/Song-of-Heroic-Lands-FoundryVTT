---
aliases:
    - Lion
tags:
    - animal
name:
    full: Lion
    aliases: []
id: TpFdKsRE286DXe8u
img: icons/game-icons/lorc/lion.svg
portrait: ""
shortcode: lion
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 12
        end: 13
        agl: 18
        per: 16
        snt: 4
        aur: 5
        wil: 16
        rea: 5
        cre: 5
    attrRollFormula:
        str: 1d6+9
        end: 1d6+10
        agl: 1d6+15
        per: 1d6+13
        snt: 1d4+2
        aur: 1d4+3
        wil: 1d6+13
        rea: 1d4+3
        cre: 1d4+3
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
        bodyScaleBase: 1.06
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 160
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
              masteryLevelBase: 85
        - shortcode: stlth
          type: skill
          system:
              masteryLevelBase: 90
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 30
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 44
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 72
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 60
        - name: Claw
          type: skill
          system:
              shortcode: claw
              subType: combattechnique
              masteryLevelBase: 85
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: claw
                  name: Claw
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 2
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 8
                      modifier: 0
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
        - name: Bite
          type: skill
          system:
              shortcode: bite
              subType: combattechnique
              masteryLevelBase: 68
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
                      spread: 1
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 1
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
                      armorReduction: 1
---

# Appearance {#appearance}

The moment you see it, you understand why it is called the king of beasts. The massive lion strides into view with utter confidence, its golden coat rippling with each powerful motion. The distinctive mane frames the head and neck like a crown of spun copper and amber, catching the light and making the animal appear even larger than it already is. Its muscles move beneath the fur like coiled rope, and its eyes—amber and intelligent—hold yours for a moment. A low rumble that you feel as much as hear emanates from its throat: a sound of absolute authority.

# Dossier {#dossier}

The lion is a massive carnivore — second in size only to the tiger among the great cats — weighing 300-500 pounds with males significantly larger than females. The body is covered in short, tawny fur ranging from pale gold to deep reddish-brown, with white spots visible on the ears and face. Males possess a distinctive mane—thick, long fur covering the neck, shoulders, and parts of the face—that serves both as display and as protection during combat. The mane darkens with age and virility, becoming nearly black in the oldest, most dominant males. The body is heavily muscled, built for explosive power rather than sustained speed.

## Presentation

Lions display impressive musculature throughout their entire frame, with the shoulders and forelimbs particularly developed. Their heads are broad and powerful, with jaws capable of crushing bone. Their eyes are large and forward-facing, providing excellent binocular vision. The ears are rounded and move independently to pinpoint sounds. The tail is long—nearly a meter—and tipped with a tuft of hair that can be used for signaling. The claws are sharp and partially retractable. A male's mane varies considerably in size and color depending on health, dominance, and age; a particularly impressive mane indicates a lion at the peak of its power.

## Key Behaviors

Lions are the only truly social felids, living in prides of 4 to 30 individuals with a complex social hierarchy and division of labor. Females do most of the hunting while males guard territory and young. The pride hunts cooperatively, surrounding prey and cutting off escape routes before a coordinated strike. Lions are territorial and patrol and defend an enormous range against rival prides. They rest up to 20 hours per day, hunting primarily during dawn and dusk. Males spend much of their time patrolling and marking territory with scent and visual markers.

## Combat Strategy

When hunting in pride, lions execute coordinated attacks: some lionesses drive prey toward waiting ambushers while others move to cut off escape. A lion will charge directly when confident, using its strength to knock prey down and deliver a killing bite. Males defend against rivals using their strength and mane as both weapon and shield. A wounded lion becomes more dangerous, not less, using its strength and intelligence to lure attackers into positions of disadvantage.

## Attack Methods

### Powerful Bite

The lion lunges to clamp powerful jaws on the target's neck, throat, or vulnerable areas; the bite can crush bone and is often instantly fatal to large prey, dealing devastating damage to any opponent caught in the lion's powerful grip.

### Claw Swipe

The lion rakes its claws across an opponent, capable of delivering deep lacerations, disarming weapons, or knocking a target prone; the swipe is often a follow-up to a successful charge.

## Special Abilities

### Strength of Kings

The lion possesses extraordinary raw strength and uses this to overpower opponents; it gains bonuses to feats of strength and can perform actions that would be impossible for lesser creatures.

### Pack Hunter

Lions gain significant bonuses when fighting alongside other pride members, and they can execute coordinated attacks with preternatural synchronization, communicating through subtle roars and body language.

## Attributes

- **Strength:** 10-15 (1d6+9)

- **Endurance:** 11-16 (1d6+10)

- **Agility:** 16-21 (1d6+15)

- **Perception:** 14-19 (1d6+13)

- **Scent:** 3-6 (1d4+2)

- **Aura:** 4-7 (1d4+3)

- **Will:** 14-19 (1d6+13)

- **Reasoning:** 4-7 (1d4+3)

- **Creativity:** 4-7 (1d4+3)
