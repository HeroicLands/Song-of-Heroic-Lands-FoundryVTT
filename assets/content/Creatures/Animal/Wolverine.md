---
aliases:
    - Wolverine
tags:
    - animal
name:
    full: Wolverine
    aliases: []
id: bQLlmKIoRwxXeHV7
img: icons/game-icons/caro-asercion/badger.svg
portrait: ""
shortcode: wlvrn
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 17
        end: 19
        dex: 13
        agl: 13
        per: 14
        aur: 12
        wil: 19
        rea: 9
        cre: 8
    attrRollFormula:
        str: 1d6+13
        end: 1d6+15
        dex: 1d6+9
        agl: 1d6+9
        per: 1d6+10
        aur: 1d6+8
        wil: 1d6+15
        rea: 1d4+6
        cre: 1d4+5
    body:
        structure:
            zones:
                - name: Forequarters
                  shortcode: fqtrzone
                  probWeight: 2
                - name: Torso
                  shortcode: torsozone
                  probWeight: 2
                - name: Hindquarters
                  shortcode: hindqtrzone
                  probWeight: 2
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
                      - manipulator
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
                  roles: []
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
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 4
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 2
                  protectionBase:
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 4
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
                      piercing: 2
                      fire: 4
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
                      piercing: 2
                      fire: 4
                - name: Thorax
                  shortcode: thoraxloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 5
                  protectionBase:
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 4
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 3
                  protectionBase:
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 4
                - name: Pelvis
                  shortcode: plvsloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 2
                  protectionBase:
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 4
                - name: Left Hind Leg
                  shortcode: lhindlegloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 4
                - name: Right Hind Leg
                  shortcode: rhindlegloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 4
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
                      piercing: 2
                      fire: 4
        weight:
            base: 50
            calc: "50"
        reachBase: 0
        bodyScaleBase: 1.33
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
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
              masteryLevelBase: 85
        - shortcode: stlth
          type: skill
          system:
              masteryLevelBase: 80
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
              masteryLevelBase: 45
        - name: Raking Claws
          type: skill
          system:
              shortcode: claw
              subType: combattechnique
              masteryLevelBase: 66
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
                      modifier: 3
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
        - name: Bone-Crushing Bite
          type: skill
          system:
              shortcode: bite
              subType: combattechnique
              masteryLevelBase: 66
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: bite
                  name: Bone-Crushing Bite
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 1
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 4
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

The stocky form moves with deceptive grace despite its compact musculature, each step deliberate and predatory. The dark brown fur is dense and rippling with muscle, and the curved claws rake stone audibly as the creature sniffs the air. The short, wide snout twitches, processing information, while the small, bright eyes burn with focused intensity that seems almost unsettling in their clarity. When the creature growls, the sound reverberates with quiet menace that belies its modest size — this is something that knows itself formidable and fears nothing.

# Dossier {#dossier}

The Wolverine is a stocky, densely muscled predator standing 12-18 inches tall and reaching 2.5-3.5 feet in body length with a bushytail, found in cold, harsh terrains across northern regions and high mountains. These relentlessly aggressive creatures are known for confronting predators many times their size and for their refusal to retreat when engaged. Adventurers encounter wolverines primarily while traveling through harsh climates or when the creature is drawn to camps by food scents.

## Presentation

The wolverine is compact and heavily muscled beneath a dense brown coat that provides exceptional insulation. The face is broad with a short, powerful snout adapted for rooting and tearing. The eyes are small but bright and intelligent. The claws are long and curved, suitable for both climbing and tearing. The build is deceptive — the creature appears stocky but is far stronger than its modest size suggests.

## Key Behaviors

Wolverines are solitary and fiercely territorial, establishing enormous ranges for their size. They are opportunistic both as hunters and scavengers, capable of taking down prey as large as deer and of usurping kills from predators much larger than themselves. They are fearless to the point of recklessness and will confront bears, wolves, and other large predators for access to food. They are extraordinarily persistent and capable of pursuing prey or enemies relentlessly despite damage or exhaustion.

## Combat Strategy

The wolverine attacks with suicidal fearlessness, charging at threats and slashing with claws and teeth. It shows no signs of backing down regardless of damage and fights until unconscious or death.

## Attack Methods

### Raking Claw Attacks

The wolverine delivers rapid slashing attacks with long claws, creating multiple wounds that bleed freely.

### Bone-Crushing Bite

The wolverine's jaw strength is extraordinary, capable of crushing bone and severing limbs through focused bites to vital areas.

## Special Abilities

### Fearless Aggression

The wolverine shows no fear or caution in combat, attacking relentlessly regardless of odds or damage sustained.

### Relentless Pursuit

The wolverine pursues prey or enemies with unyielding determination, rarely abandoning a target even after significant injury.

### Iron Jaw

The wolverine's bite is extraordinarily powerful, capable of crushing bone and tearing through tough hides.

### Cold Adaptation

The wolverine is perfectly adapted to extreme cold and suffers no penalty from freezing conditions.

### Indomitable Will

Despite damage that would incapacitate other creatures, the wolverine continues fighting.

### Additional Information

Wolverines are far more dangerous than their size suggests and should be taken seriously. The creature's aggressive fearlessness makes it nearly impossible to intimidate or frighten away. A wolverine protecting food or defending young becomes even more aggressive than usual. Hunters who have killed wolverines report the creatures pursuing them relentlessly despite mortal wounds. The wolverine's pelt is valuable and can be harvested after death for cold-weather clothing.

## Attributes

- **Strength:** 14-19 (1d6+13)

- **Endurance:** 16-21 (1d6+15)

- **Dexterity:** 10-15 (1d6+9)

- **Agility:** 10-15 (1d6+9)

- **Perception:** 11-16 (1d6+10)

- **Aura:** 9-14 (1d6+8)

- **Will:** 16-21 (1d6+15)

- **Reasoning:** 7-10 (1d4+6)

- **Creativity:** 6-9 (1d4+5)
