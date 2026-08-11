---
aliases:
    - Honey Badger
tags:
    - animal
name:
    full: Honey Badger
    aliases: []
id: ChZvdUocVZoLXeL0
img: icons/game-icons/caro-asercion/badger.svg
portrait: ""
shortcode: hnybdgr
type: creature
package: sohl
sohl:
    kbcat: animal
    archetype: 0
    attributes:
        str: 15
        end: 17
        dex: 13
        agl: 11
        per: 14
        aur: 12
        wil: 17
        rea: 8
        cre: 7
    attrRollFormula:
        str: 1d6+11
        end: 1d6+13
        dex: 1d6+9
        agl: 1d6+7
        per: 1d6+10
        aur: 1d6+8
        wil: 1d6+13
        rea: 1d4+5
        cre: 1d4+4
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
                      blunt: 5
                      edged: 4
                      piercing: 3
                      fire: 5
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 2
                  protectionBase:
                      blunt: 5
                      edged: 4
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
                      blunt: 5
                      edged: 4
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
                      blunt: 5
                      edged: 4
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
                      blunt: 5
                      edged: 4
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
                      blunt: 5
                      edged: 4
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
                      blunt: 5
                      edged: 4
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
                      blunt: 5
                      edged: 4
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
                      blunt: 5
                      edged: 4
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
                      blunt: 5
                      edged: 4
                      piercing: 3
                      fire: 5
        weight:
            base: 25
            calc: "25"
        reachBase: 0
        bodyScaleBase: 1.22
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 40
          leaguesPerWatch: 3
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
              masteryLevelBase: 70
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 42
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 52
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 48
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 40
        - name: Sharp Claws
          type: skill
          system:
              shortcode: claw
              subType: combattechnique
              masteryLevelBase: 62
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: claw
                  name: Sharp Claws
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
        - name: Powerful Bite
          type: skill
          system:
              shortcode: bite
              subType: combattechnique
              masteryLevelBase: 62
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
---

# Appearance {#appearance}

You catch movement in the underbrush—a low, powerful shape with contrasting white and black fur. The creature's musky scent reaches you first, rank and acrid. When it pauses to sniff the air, you notice the raw power coiled in its squat frame; muscles ripple beneath loose, thick skin. Its claws have torn the earth into furrows, and its eyes—small and dark but utterly focused—lock onto yours without hesitation or fear. The air around it crackles with hostile intent.

# Dossier {#dossier}

The honey badger is a small but devastatingly dangerous mustelid, measuring only 2-3 feet long yet possessing the heart of something ten times its size. Its distinctive black and white coat serves as a warning to would-be predators, and its thick, almost rubbery skin can twist within itself, allowing the creature to rotate and bite an attacker even when pinned or partially swallowed. It weighs up to 35 pounds of pure combative fury.

## Presentation

Honey badgers are compact and heavily muscled, with stocky legs ending in powerful claws perfect for burrowing and tearing. Their fur is coarse and dense, providing insulation and protection. The black coat contrasts dramatically with white or pale stripes running from the head along the spine to the tail. Small, rounded ears sit flush against the head, and the snout is short but packed with sharp, formidable teeth. They move with a peculiar, rolling gait that belies their explosive speed and agility.

## Key Behaviors

Honey badgers are notoriously fearless and will attack adversaries many times their size without hesitation. They are voracious hunters, seeking out bees, snakes (including venomous ones), small mammals, and insects with equal enthusiasm. Highly territorial, a honey badger marks its domain and defends it against all intrusion, whether from rival badgers or creatures far larger. Their persistence is legendary—once engaged, they rarely retreat, often fighting to the death even when catastrophically injured. They are primarily nocturnal but hunt during the day when prey is abundant.

## Combat Strategy

Honey badgers charge directly at opponents with reckless aggression, targeting vulnerable areas like eyes, faces, and throats. They rely on their low profile and loose hide to slip past attacks and retaliate with vicious bites and claws. If momentarily overwhelmed, a honey badger will curl defensively, using its thick hide as armor while waiting for an opening. When cornered, they become even more dangerous, explosive in their counterattacks.

## Attack Methods

### Sharp Claws

Delivered in rapid slashing attacks or used to dig into opponents; these claws can rake across flesh, inflict deep wounds, or disarm enemies.

### Powerful Bite

The honey badger's jaws are capable of crushing bone and can latch onto soft or vital areas with devastating results; once clamped, breaking free requires considerable effort.

## Special Abilities

### Thick, Loose Hide

The honey badger's skin is remarkably elastic and can slip within itself, allowing it to escape many grabs or constrictions and rotate to bite attackers who think they have pinned it. This hide also resists cuts, bites, and stings from most sources.

### Relentless Fury

Honey badgers continue fighting with undiminished aggression even when severely wounded, and they gain bonuses to actions when injured and defending their territory or young.

## Attributes

- **Strength:** 12-17 (1d6+11)

- **Endurance:** 14-19 (1d6+13)

- **Dexterity:** 10-15 (1d6+9)

- **Agility:** 8-13 (1d6+7)

- **Perception:** 11-16 (1d6+10)

- **Aura:** 9-14 (1d6+8)

- **Will:** 14-19 (1d6+13)

- **Reasoning:** 6-9 (1d4+5)

- **Creativity:** 5-8 (1d4+4)
