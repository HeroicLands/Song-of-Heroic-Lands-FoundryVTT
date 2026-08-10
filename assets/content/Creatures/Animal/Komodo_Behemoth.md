---
aliases:
    - Komodo Behemoth
tags:
    - animal
name:
    full: Komodo Behemoth
    aliases: []
id: 2cHRBpFKXGd8RaX4
slug: komodo-behemoth
img: icons/game-icons/lorc/gecko.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 15
        end: 14
        dex: 11
        agl: 10
        per: 14
        aur: 9
        wil: 12
        rea: 7
        cre: 6
    attrRollFormula:
        str: 1d6+11
        end: 1d6+10
        dex: 1d6+7
        agl: 1d4+7
        per: 1d6+10
        aur: 1d4+6
        wil: 1d6+8
        rea: 1d4+4
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
                  roles:
                      - manipulator
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
                      piercing: 4
                      fire: 6
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
                      piercing: 4
                      fire: 6
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
                      piercing: 4
                      fire: 6
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
                      piercing: 4
                      fire: 6
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
                      piercing: 4
                      fire: 6
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
                      piercing: 4
                      fire: 6
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
                      piercing: 4
                      fire: 6
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
                      piercing: 4
                      fire: 6
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
                      piercing: 4
                      fire: 6
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
                      piercing: 4
                      fire: 6
        weight:
            base: 250
            calc: "250"
        reachBase: 0
        bodyScaleBase: 1.22
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 35
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
              masteryLevelBase: 65
        - shortcode: stlth
          type: skill
          system:
              masteryLevelBase: 55
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 30
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 40
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 48
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 38
        - name: Powerful Bite
          type: skill
          system:
              shortcode: bite
              subType: combattechnique
              masteryLevelBase: 60
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
                      spread: 2
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 3
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
        - name: Tail Strike
          type: skill
          system:
              shortcode: tail
              subType: combattechnique
              masteryLevelBase: 50
              combatCategory: melee
              impairedByRoles:
                  - locomotor
              strikeMode:
                  type: melee
                  shortcode: tail
                  name: Tail Strike
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 4
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 0
                      aspect: blunt
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

A shadow moves across the rocky ground—enormous, inexorable, patient. The air grows warmer as the massive shape draws close, and the smell reaches you first: stale, meaty, and laced with something rotten. The creature slides into view with terrifying grace for something so vast, its scales catching the light in dull, metallic flashes. The ground trembles with each footfall. Its forked tongue emerges and retracts, tasting your fear on the wind, and its eyes—ancient, knowing, utterly pitiless—lock onto yours as the tail sweeps behind it like a felled tree.

# Dossier {#dossier}

The Komodo Behemoth is a titanic reptilian predator measuring 15 to 18 feet in length and weighing well over a ton. Its body is a mass of rippling muscle beneath mottled scales in shades of dark gray and green that shift in coloration depending on age and environment. Its head is broad and flattened, positioned at the end of a thick, powerful neck, with a mouth that can unhinge to an alarming degree. Its four legs are stocky and immensely powerful, ending in clawed feet that leave deep prints in soil and rock. Its tail, nearly as long as its body, is muscular and whip-like, dragging behind it as the creature moves.

## Presentation

Komodo Behemoths display coarse, warty scales across their entire body, with the scales along the back and tail forming rough ridges. Coloration varies from dark gray-green to nearly black, with lighter bands occasionally visible on younger specimens. Their eyes are positioned high on the head, providing excellent forward vision but limited peripheral sight. Their teeth are sharp, serrated, and constantly replaced throughout their lives—a new tooth will grow in if one is broken. The mouth opens vertically, allowing them to swallow prey nearly as large as themselves. A distinctive musky odor surrounds them at all times.

## Key Behaviors

Komodo Behemoths are solitary hunters that establish and fiercely defend large territories encompassing several square miles. They spend much of their day resting in burrows or dens, conserving energy until hungry or triggered by the presence of prey. When hunting, they employ patient ambush tactics, positioning themselves along known game trails and waiting motionlessly for hours or even days. Once prey appears within striking distance, they explode into action with shocking speed. Their saliva contains numerous species of pathogenic bacteria and venom, making a bite a death sentence even if the initial wound is not immediately fatal. They will bite prey, then retreat to allow the venom and infection to weaken the animal before returning to feed.

## Combat Strategy

The Komodo Behemoth's primary strategy is ambush and patience. It positions itself for maximum advantage and strikes with overwhelming force before its opponent can react. If forced into extended combat with a living opponent, it relies on the poisonous, bacterial saliva in its bite to gradually incapacitate the enemy while it harries with tail strikes and claws. A behemoth will only pursue if the prey is wounded; if prey escapes unharmed, it generally abandons the chase, reserving energy for a more promising hunt.

## Attack Methods

### Powerful Bite

The behemoth lunges forward with jaw spread wide, aiming to clamp down on limbs or the throat; the bite delivers an infectious toxin through saliva laden with venom and dangerous bacteria, causing progressive damage even after the initial wound is sustained.

### Tail Strike

With the force of a felled tree, the massive tail sweeps horizontally to knock opponents prone, destroy obstacles, or drive back multiple assailants; the tail can disarm, break bones, or inflict crushing damage.

## Special Abilities

### Infectious Bite

The Komodo Behemoth's bite is laden with venom and pathogenic bacteria; victims suffer immediate wound damage and ongoing poison damage as the infection progresses, with severity increasing over time if untreated.

### Stealth Predator

Despite its enormous size, the behemoth moves with remarkable stealth and silence when hunting; it gains substantial bonuses to stealth and hiding checks, particularly in rocky or vegetated terrain.

## Attributes

- **Strength:** 12-17 (1d6+11)

- **Endurance:** 11-16 (1d6+10)

- **Dexterity:** 8-13 (1d6+7)

- **Agility:** 8-11 (1d4+7)

- **Perception:** 11-16 (1d6+10)

- **Aura:** 7-10 (1d4+6)

- **Will:** 9-14 (1d6+8)

- **Reasoning:** 5-8 (1d4+4)

- **Creativity:** 4-7 (1d4+3)
