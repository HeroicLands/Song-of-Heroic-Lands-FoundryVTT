---
aliases:
    - Dire Wolverine
tags:
    - animal
name:
    full: Dire Wolverine
    aliases: []
id: 9zpdW3LB7gb3PZXi
slug: dire-wolverine
img: icons/game-icons/caro-asercion/badger.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 27
        end: 25
        dex: 15
        agl: 15
        per: 16
        aur: 15
        wil: 23
        rea: 9
        cre: 8
    attrRollFormula:
        str: 1d6+23
        end: 1d6+21
        dex: 1d6+11
        agl: 1d6+11
        per: 1d6+12
        aur: 1d6+11
        wil: 1d6+19
        rea: 1d4+6
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
                      blunt: 6
                      edged: 5
                      piercing: 3
                      fire: 5
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 4
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 3
                      fire: 5
                - name: Left Foreleg
                  shortcode: lforelegloc
                  bodyPartCode: lforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 3
                      fire: 5
                - name: Right Foreleg
                  shortcode: rforelegloc
                  bodyPartCode: rforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 3
                      fire: 5
                - name: Thorax
                  shortcode: thoraxloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 5
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 3
                      fire: 5
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 3
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 3
                      fire: 5
                - name: Pelvis
                  shortcode: plvsloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 2
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 3
                      fire: 5
                - name: Left Hind Leg
                  shortcode: lhindlegloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 3
                      fire: 5
                - name: Right Hind Leg
                  shortcode: rhindlegloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 3
                      fire: 5
                - name: Tail
                  shortcode: tailloc
                  bodyPartCode: tailpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 1
                  probWeight: 10
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 3
                      fire: 5
        weight:
            base: 150
            calc: "150"
        reachBase: 0
        bodyScaleBase: 2.45
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 60
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
              masteryLevelBase: 95
        - shortcode: stlth
          type: skill
          system:
              masteryLevelBase: 95
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 57
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 64
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 60
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 65
        - name: Raking Claws
          type: skill
          system:
              shortcode: claw
              subType: combattechnique
              masteryLevelBase: 70
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
                      spread: 4
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 8
                      modifier: 8
                      aspect: edged
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
                      modifier: 9
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

The reek precedes the beast—a musky, animal smell mixed with something wild and utterly fearless. What emerges is compact, squat, low-slung yet terrifyingly massive. Three feet tall at the shoulder, the Dire Wolverine is built entirely of muscle and aggression, a wedge of coiled fury wrapped in dark fur. The claws, curved and wickedly sharp, extend inches beyond the paws. The teeth, when visible in a snarl, promise a bite capable of crushing bone. The eyes—small, dark, utterly devoid of fear—fix directly on you with singular intent. The sound it makes—a growl that rumbles like distant thunder—vibrates through your chest and carries the promise of something that will fight until death and drag you with it.

# Dossier {#dossier}

The Dire Wolverine is one of the most dangerous terrestrial predators, pound for pound. Standing three feet tall at the shoulder and weighing two hundred fifty to three hundred fifty pounds, these solitary mustelids are found in cold forests, mountains, and tundra regions. A Dire Wolverine is essentially a wolverine magnified to lethal proportions—it retains the fearlessness, aggression, and unstoppable persistence of its smaller cousins but adds the mass and strength to match or exceed bears and wolves in direct combat. These creatures are solitary and extraordinarily territorial, defending vast ranges against any perceived intrusion. A Dire Wolverine has been documented challenging and killing bears, wolf packs, and groups of hunters. They are famously immune to pain and fear—a wolverine that loses a limb will continue fighting with undiminished aggression. Adventurers in cold regions may encounter these creatures while traveling, camping, or hunting in wilderness.

## Presentation

A heavily muscled mustelid built low to the ground with a wide stance. The head is small, broad, and powerful with a relatively short snout and strong jaw structure. The eyes are small and dark. The ears are rounded and set close to the head. The body is barrel-shaped, wider and deeper than tall, with unusually short legs positioned laterally. The fur is dense, typically dark brown to black with pale stripes or patches. The claws are curved, non-retractable, and measure up to two inches long. The tail is short and bushy. The overall impression is of a creature engineered for power and aggression rather than grace or speed.

## Key Behaviors

Dire Wolverines are solitary and move through vast territories, sometimes ranging twenty to thirty square miles. They are omnivorous but primarily carnivorous, eating meat from kills, scavenging, and hunting small to medium prey. They cache food, storing kills in protected locations for consumption over time. They are nocturnal or crepuscular, most active during dawn, dusk, and night. They breed once yearly, with females becoming particularly aggressive during breeding season and while raising young. They are long-lived, sometimes reaching twenty years. They are famous for their fearlessness, attacking animals far larger than themselves without hesitation.

## Combat Strategy

A Dire Wolverine's strategy is direct and overwhelming: charge at the threat, use massive claws to open wounds, bite with crushing force, and continue attacking until something stops moving. The creature does not use terrain or tactics—it simply overwhelms through superior strength and refusal to accept defeat. Injured wolverines become more aggressive, not less.

## Attack Methods

### Raking Claw Attacks

Using powerful forelimbs, the wolverine rakes with claws each exceeding two inches, capable of tearing through flesh and armor. Multiple rake attacks open deep wounds.

### Crushing Bite

The wolverine bites with exceptional force, capable of crushing bone. Bites to limbs can sever, bites to vital areas can be fatal.

### Throwing and Pinning

The wolverine's strength allows it to throw opponents and pin them using body weight and grip strength.

## Special Abilities

### Fearless Aggression and Pain Immunity

A Dire Wolverine charges threats without hesitation and continues fighting even with mortal wounds. Pain does not trigger retreat—instead, it seems to amplify aggression. A dying wolverine is more dangerous than a healthy one.

### Overwhelming Strength and Durability

The wolverine's strength exceeds expectations for its size. It can survive injuries, continue functioning with disabled limbs, and maintain combat effectiveness despite damage that would incapacitate other animals.

### Thick Hide and Insulation

Dense fur and thick skin provide protection against bites and slashing attacks, making the wolverine more resilient than expected.

## Attributes

- **Strength:** 24-29 (1d6+23)
- **Endurance:** 22-27 (1d6+21)
- **Dexterity:** 12-17 (1d6+11)
- **Agility:** 12-17 (1d6+11)
- **Perception:** 13-18 (1d6+12)
- **Aura:** 12-17 (1d6+11)
- **Will:** 20-25 (1d6+19)
- **Reasoning:** 7-10 (1d4+6)
- **Creativity:** 6-9 (1d4+5)

#### Iron Hide

Its dense fur and skin reduce damage from attacks.

## Attributes

- **Strength:** 24-29 (1d6+23)

- **Endurance:** 22-27 (1d6+21)

- **Dexterity:** 12-17 (1d6+11)

- **Agility:** 12-17 (1d6+11)

- **Perception:** 13-18 (1d6+12)

- **Aura:** 12-17 (1d6+11)

- **Will:** 20-25 (1d6+19)

- **Reasoning:** 7-10 (1d4+6)

- **Creativity:** 6-9 (1d4+5)
