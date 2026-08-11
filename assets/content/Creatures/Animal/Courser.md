---
aliases:
    - Courser
tags:
    - animal
name:
    full: Courser
    aliases: []
id: inCsJVZjrrZVkpJI
img: icons/game-icons/delapouite/horse-head.svg
portrait: ""
shortcode: courser
type: creature
package: sohl
sohl:
    kbcat: animal
    archetype: 0
    attributes:
        str: 27
        end: 10
        agl: 12
        per: 17
        snt: 4
        aur: 4
        wil: 11
        rea: 4
        cre: 4
    attrRollFormula:
        str: 1d6+24
        end: 1d6+7
        agl: 1d6+9
        per: 1d6+14
        snt: 1d4+2
        aur: 1d4+2
        wil: 1d6+8
        rea: 1d4+2
        cre: 1d4+2
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 4
                - name: Forelegs
                  shortcode: forelegszone
                  probWeight: 2
                - name: Torso
                  shortcode: torsozone
                  probWeight: 8
                - name: Hindquarters
                  shortcode: hindqtrzone
                  probWeight: 6
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
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 6
                  protectionBase:
                      blunt: 5
                      edged: 4
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
                      blunt: 5
                      edged: 4
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
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Flank
                  shortcode: flkloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 6
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 4
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Left Quarter
                  shortcode: lqtrloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 3
                  probWeight: 5
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Left Hind Leg
                  shortcode: lhindlegloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 4
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Right Quarter
                  shortcode: rqtrloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 3
                  probWeight: 5
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Right Hind Leg
                  shortcode: rhindlegloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 4
                  protectionBase:
                      blunt: 5
                      edged: 4
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
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
        weight:
            base: 1100
            calc: "1100"
        reachBase: 0
        bodyScaleBase: 1.79
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 150
          leaguesPerWatch: 12
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
              masteryLevelBase: 56
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 21
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 32
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 60
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 52
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
                      spread: 8
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 5
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
                      spread: 4
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 4
                      modifier: 4
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

The animal carries itself with nervous energy barely constrained. Built on clean, fine-boned legs, the courser shifts its weight constantly, ears swiveling to track every sound. Its breathing is controlled but noticeably faster than a placid horse, and its muscles seem to ripple beneath thin skin every time it moves. When it accelerates, the transition is nearly instantaneous: one moment in a trot, the next in a driving gallop that covers ground with terrifying efficiency. The wind from its passage stirs your cloak, and you realize the speed is something you could never match on foot.

# Dossier {#dossier}

The Courser is a light, swift horse bred specifically for speed and maneuverability rather than strength and weight-bearing capacity. Standing fourteen to fifteen hands tall and weighing eight hundred to one thousand pounds, these horses are the choice of scouts, messengers, and light cavalry. They are nervous, energetic animals with quick reactions and the stamina to maintain speed for hours. Unlike heavier breeds, a Courser is a sprinter capable of achieving higher speeds than draft or war horses, though they lack the staying power and collision force of larger animals. They are most valuable in roles emphasizing agility and speed rather than direct combat power. Adventurers riding Coursers benefit from superior mobility and the ability to flee from threats that heavier horses could not outrun. A Courser ridden by a skilled rider can outmaneuver mounted knights on heavier horses, though one-on-one combat is a poor choice for a light cavalry mount.

## Presentation

A distinctly elegant equine with a refined build emphasizing length of leg over bulk. The legs are particularly fine-boned but not fragile, with tendons and muscles visible beneath thin skin. The chest is not especially broad but is deep, housing lungs engineered for high oxygen exchange. The back is relatively short and straight, optimized for speed and rider weight distribution rather than load carrying. The neck is long and gracefully curved, held high, with excellent maneuverability. The head is refined and proportionally smaller than heavier breeds, with sharp, intelligent features and nostrils that flare dramatically. The eyes are large and frequently wide—an expression of nervousness or alertness. The coat is typically sleek and well-maintained on domestic animals, though wild Coursers may appear shaggy. Coloring varies: chestnut, bay, black, gray, or spotted patterns are all common. The tail and mane are fine but full. Overall, the Courser presents as a creature built for speed and elegance rather than power.

## Key Behaviors

Coursers are notably more nervous than heavier horse breeds, reacting quickly to stimuli and demonstrating superior awareness of threats. They require experienced, confident handlers—a nervous or inexperienced rider will transmit anxiety that makes the horse more nervous. Once they trust a handler, they bond intensely and will perform enthusiastically. They require less food than heavier horses but need consistent access to water and rest. They are particularly sensitive to whip and spur, responding to very light pressure; heavy-handed riders will create a nervous, resistant animal. They have excellent memories and will remember routes, threats, and familiar locations. Unlike heavier horses, Coursers are prone to panic—a spooked Courser can bolt with such speed that even experienced riders have difficulty maintaining control. They are less naturally suited to military discipline than Chargers and require careful training to maintain composure in chaos. In wild form, Coursers are typically herd animals, living in large groups for protection.

## Combat Strategy

A Courser’s primary combat advantage is speed and mobility. An ideal strategy for a Courser-mounted rider is to use hit-and-run tactics: make passes at enemies while maintaining distance, strike from unexpected angles, and retreat at speed if pressed. The horse is not defensively strong and should not be expected to stand and fight. A competent Courser rider will use terrain, speed, and mobility to overcome opponents relying on weight and strength. Against multiple mounted opponents on heavier horses, a Courser can typically outmaneuver them. Against a mounted knight on a Charger, the Courser’s speed is its advantage, allowing evasion of the more powerful charge but reducing opportunity for decisive counter-attacks.

## Attack Methods

### Precision Hoof Strike

With focused effort, the Courser can deliver a sharp kick—typically rear legs—with surprising force for its size. The impact is more precise than a heavier horse’s stomp but carries somewhat less force. The Courser uses hoof strikes defensively against unmounted threats or to deter attackers from approaching the rider.

### Bite and Nip

The Courser will bite if grabbed or if an opponent comes too close. The bite is less powerful than a heavier horse’s bite but is sharp and causes bleeding. The Courser uses biting primarily for defense rather than as an offensive strategy.

### Quick Evasion and Repositioning

The Courser’s primary contribution to combat is not through direct attack but through speed that allows the rider to maintain positioning advantage. The horse rapidly changes direction, accelerates, and decelerates in ways that heavier horses cannot match, allowing mounted riders to execute tactics that ground-based or mounted-on-heavier-horses opponents cannot.

## Special Abilities

### Exceptional Speed and Acceleration

A Courser can accelerate from standstill to gallop in seconds and can sustain speeds that exceed most horses significantly. The speed is particularly useful for distance travel and for tactical retreat. A Courser at full gallop is faster than a human can run, faster than most mounted pursuers can match, and faster than most projectiles can travel.

### Rapid Reflexes and Quick Maneuvering

The Courser’s physiology supports quick reaction to rein and spur inputs, allowing it to change direction sharply, stop quickly, and execute maneuvers that would be impossible for heavier horses. This agility allows riders to navigate tight terrain, avoid obstacles, and respond instantly to emerging threats.

### Sensitive and Responsive to Training

A Courser that has bonded with an experienced rider will respond to subtle communications: weight shifts, barely-perceptible rein movements, and leg pressure that heavier horses might not notice. This responsiveness allows riders to execute complex tactical maneuvers and maintains constant communication between rider and mount.

### Sustained Endurance Despite Light Build

Despite light weight and fine bone structure, a well-trained and well-fed Courser has remarkable endurance, capable of traveling thirty to forty miles per day at moderate pace and maintaining reasonable speed for hours at a time. This endurance advantage is particularly useful for scouts and messengers who need to cover ground quickly.

## Attributes

- **Strength:** 25-30 (1d6+24)

- **Endurance:** 8-13 (1d6+7)

- **Agility:** 10-15 (1d6+9)

- **Perception:** 15-20 (1d6+14)

- **Scent:** 3-6 (1d4+2)

- **Aura:** 3-6 (1d4+2)

- **Will:** 9-14 (1d6+8)

- **Reasoning:** 3-6 (1d4+2)

- **Creativity:** 3-6 (1d4+2)
