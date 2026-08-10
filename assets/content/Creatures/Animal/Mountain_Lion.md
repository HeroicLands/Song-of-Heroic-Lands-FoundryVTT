---
aliases:
    - Mountain Lion
tags:
    - animal
name:
    full: Mountain Lion
    aliases: []
id: izFUCMnqOWBiGfb5
slug: mountain-lion
img: icons/game-icons/lorc/lion.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 16
        end: 13
        dex: 17
        agl: 19
        per: 15
        aur: 8
        wil: 13
        rea: 9
        cre: 9
    attrRollFormula:
        str: 1d4+13
        end: 1d4+10
        dex: 1d4+14
        agl: 1d4+16
        per: 1d4+12
        aur: 1d4+5
        wil: 1d4+10
        rea: 1d4+6
        cre: 1d4+6
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
            base: 60
            calc: "60"
        reachBase: 0
        bodyScaleBase: 1.45
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 70
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
              masteryLevelBase: 70
        - shortcode: stlth
          type: skill
          system:
              masteryLevelBase: 80
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
              masteryLevelBase: 68
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 38
        - name: Killing Bite
          type: skill
          system:
              shortcode: bite
              subType: combattechnique
              masteryLevelBase: 78
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: bite
                  name: Killing Bite
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 1
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 3
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
        - name: Claw Rake
          type: skill
          system:
              shortcode: claw
              subType: combattechnique
              masteryLevelBase: 78
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: claw
                  name: Claw Rake
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 2
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 8
                      modifier: 2
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
---

# Appearance {#appearance}

A sleek, tawny shadow flows across the terrain with liquid grace—a muscular body built for explosive speed and deadly precision. The mountain lion crouches low, its long tail held rigidly behind it for balance, muscles coiled and ready. Its piercing yellow eyes lock onto you with undeniable intelligence and predatory focus. When it moves, there is almost no sound, and you are struck with the terrible realization that it has been watching you for far longer than you have been watching it. The silence that surrounds it is the silence of a perfect hunter.

# Dossier {#dossier}

The mountain lion, also known as the cougar or puma, is a large solitary felid measuring 6-8 feet in body length and weighing 80-220 pounds, with males considerably larger than females. The coat is short and uniformly tawny or reddish-brown, ranging from pale cream to rich rust depending on individual and environment. The build is lean and muscular, built for explosive speed and agility rather than raw strength. The head is small and rounded, with a powerful jaw and bright yellow eyes. The tail is long, nearly as long as the body, and used for balance and subtle communication.

## Presentation

Mountain lions display a sleek, aerodynamic build with long, powerful hind legs that provide explosive jumping power. The fur is short and dense, tawny in coloration with white ventral surfaces. The face is narrow and angular, with small, rounded ears and forward-facing yellow eyes that provide excellent binocular vision. The claws are sharp, curved, and retractable, allowing silent movement and excellent climbing capability. The tail is long and muscular, often held low when stalking or coiled tightly when tense. The musculature is visible beneath the thin fur, particularly in the shoulders and hind legs. Individual mountain lions often bear scars from territorial disputes or hunting injuries.

## Key Behaviors

Mountain lions are solitary predators except during mating season, establishing and defending large territories ranging across forests, mountains, deserts, and scrublands. They are ambush hunters par excellence, stalking prey silently for long distances before striking. They hunt primarily at dawn and dusk, though they will hunt at any time when prey is available. They prefer large prey—deer, wild goats, and similar animals—and can bring down prey much larger than themselves through explosive speed and powerful bite. They are elusive and generally avoid confrontation with humans or other large threats, preferring to hunt undetected and escape if threatened.

## Combat Strategy

Mountain lions employ stealth, speed, and devastating first strikes. They stalk from a distance until within striking range, then launch a explosive pounce from behind or above, attempting to land on the prey's back and deliver a killing bite to the neck or spine. Against opponents in direct combat, they use their agility and speed to dodge attacks while delivering rapid strikes with claws and teeth. They target the throat, neck, and belly—vulnerable areas—with preference. If an opponent proves too dangerous, they use their climbing ability to escape to places pursuers cannot easily follow.

## Attack Methods

### Killing Bite

The mountain lion lunges to deliver a devastating bite to the neck, throat, or spine, aiming for a fatal strike; this bite deals significant damage and may incapacitate the victim if the bite connects to a vital area.

### Claw Rake

The mountain lion uses its sharp, retractable claws in rapid succession to shred flesh and light armor; these attacks are often delivered during a pounce and can incapacitate or blind opponents.

## Special Abilities

### Ambush Master

The mountain lion gains substantial bonuses to stealth and to attack rolls when striking from surprise; it can stalk prey for extended distances without being detected and gains advantage on the first attack of an ambush.

### Explosive Speed

The mountain lion can move with extraordinary speed over short distances, allowing it to close distance rapidly or escape from threats; this grants it bonuses to initiative and allows it to move further than would normally be possible.

### Climbing Master

The mountain lion can scale vertical surfaces and trees with ease, using its claws and muscle control; it gains bonuses to climbing checks and can reach terrain that non-climbing opponents cannot easily follow.

## Attributes
