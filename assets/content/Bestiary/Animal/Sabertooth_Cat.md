---
tags:
  - animal
name:
  full: Sabertooth Cat
  aliases: []
description: "A muscular ambush-hunting feline that fells prey far larger than itself through precision and raw power across grasslands and scrublands."
id: pEWPIYv8UGQDka8v
img: icons/game-icons/lorc/lion.svg
portrait: images/being/sbrtthct-portrait.webp
shortcode: sbrtthct
type: being
sohl:
  kbcat: animal
  archetype: 0
  attributes:
    str: 14
    end: 13
    dex: 14
    agl: 15
    per: 16
    aur: 10
    wil: 12
    rea: 8
    cre: 6
  attrRollFormula:
    str: 1d6+10
    end: 1d6+9
    dex: 1d6+10
    agl: 1d6+11
    per: 1d6+12
    aur: 1d4+7
    wil: 1d6+8
    rea: 1d4+5
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
      base: 150
      calc: "150"
    reachBase: 0
    bodyScaleBase: 1.17
    personalFatigue: enc + 5
  currentMoveMedium: terrestrial
  movementProfiles:
    - medium: terrestrial
      feetPerRound: 80
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
        masteryLevelBase: 65
    - shortcode: sprt
      type: mysticalability
      system:
        masteryLevelBase: 33
    - shortcode: init
      type: skill
      system:
        masteryLevelBase: 40
    - shortcode: dge
      type: skill
      system:
        masteryLevelBase: 60
    - shortcode: shok
      type: skill
      system:
        masteryLevelBase: 35
    - name: Lethal Bite
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
          name: Lethal Bite
          minParts: 1
          assocSkillCode: null
          attack:
            disabled: false
            spread: 2
            modifier: 0
          impactBase:
            numDice: 1
            die: 6
            modifier: 2
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
            modifier: 1
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
---

# Appearance {#appearance}

The shape emerges from tall grass like death materializing, its tawny hide rippling with predatory grace. The first thing you notice are the teeth — elongated, curved, dark, like ivory daggers that extend from the creature’s upper jaw and protrude below its lower jaw, ghastly and efficient. The body beneath is corded muscle covered in fur marked with faint rosettes that provide perfect camouflage in dappled shadow. The eyes are impossibly large and cold, golden and intelligent, tracking your position with the certainty of something that has killed thousands. As it growls, the sound reverberates through your chest, a promise of violence contained barely in a living throat.

# Dossier {#dossier}

The Sabertooth Cat is a large, muscular feline predator reaching 8-10 feet in length with a shoulder height of 4-5 feet, found in grasslands, forests, and scrublands where large prey animals are plentiful. These apex predators are ambush specialists that hunt creatures much larger than themselves through precision and power. Adventurers might encounter sabertooth cats while traveling through wild lands, hunting in territory already claimed by the cats, or defending themselves when the cats perceive humans as prey.

## Presentation

The Sabertooth Cat is a vision of predatory efficiency and lethal adaptation. The body is heavily muscled and compact, covered in short fur in tawny gold or faint reddish tones with darker rosette patterning that provides camouflage in dappled grassland and shadow. The distinctive feature is the elongated canine teeth, which extend 4-6 inches below the jaw line, curved and sharp like curved scimitars or tusks. These teeth are the creature’s primary killing tool. The head is disproportionately large with massive jaw muscles, golden eyes positioned for predatory vision, and retractable claws on powerful paws. The tail is long and muscular, used for balance during explosive movements and directional control during hunting.

## Key Behaviors

Sabertooth Cats are solitary apex predators with large territorial ranges that they defend aggressively against other cats. They are ambush specialists that hunt large prey items, including animals significantly larger than themselves, using patience, stealth, and explosive power. The cats are most active during dawn and dusk but hunt opportunistically at any time. They are intelligent, capable of learning hunting patterns and prey behavior, and of adjusting tactics based on experience. A cat that has successfully hunted humanoids may specialize in human prey. Sabertooths mark territory through claw marks on trees and scent deposits, and they communicate through vocalizations that can carry across substantial distances.

## Combat Strategy

The sabertooth cat’s primary tactic is ambush — using terrain and vegetation to approach prey undetected, then launching an explosive attack intended to incapacitate the victim instantly. The initial strike targets the neck, skull, or spine with the powerful saber teeth, intended to sever the spinal cord or carotid artery, causing rapid death. If the initial strike fails, the cat uses claws and continued biting to subdue prey. If the engagement goes against the cat, it will retreat to fight another day, unwilling to risk serious injury through prolonged combat.

## Attack Methods

### Lethal Bite

The sabertooth launches its entire body weight into a bite targeted at the throat, neck, or skull, using the elongated saber teeth to pierce and sever vital structures. This bite is rapid, powerful, and designed to incapacitate or kill instantly. The curved teeth can pierce bone and sinew with ease.

### Raking Claws

Once the cat has secured hold with its jaws, it uses its powerful forelimbs to rake targets with extended claws, creating additional trauma and wounds. The claws can tear through leather and muscle with ease.

### Crushing Jaw Pressure

The cat’s jaw muscles are extraordinarily powerful, capable of crushing bone and holding prey immobile even if the prey struggles or attempts escape. A victim caught in the cat’s jaws is unlikely to escape without outside assistance.

## Special Abilities

### Ambush Predator

The sabertooth cat is superlatively effective when attacking from cover or from an unexpected direction, gaining significant advantage on attack rolls and damage when striking from ambush or hidden position. The cat is nearly silent when stalking and can approach prey without being heard or seen.

### Killing Strike

The sabertooth’s elongated saber teeth are specifically adapted for precision attacks on vital areas. Attacks targeting the neck or throat hit more reliably and inflict increased damage. A successful hit can instantly incapacitate large prey through spinal cord or artery damage.

### Explosive Speed

Despite its size, the sabertooth cat can move with explosive acceleration, closing distance in moments. This capability is most effective in the first attack, where momentum and surprise create maximum advantage.

### Territorial Intelligence

The cat’s familiarity with its own territory provides advantage in combat within established range — the cat knows the terrain and can use it tactically while opponents do not.

### Additional Information

Sabertooth cats avoid areas with dense settlements and significant humanoid presence, preferring wilderness where large prey animals are found. A cat that has successfully hunted humanoids becomes far more likely to target humans in future encounters. The cats’ saber teeth are valuable to hunters and craftspeople and can be harvested after death to create weapons or ornaments. A sabertooth defending a kill or cubs becomes significantly more aggressive and dangerous than a normally hunting cat.

## Attributes

- **Strength:** 11-16 (1d6+10)

- **Endurance:** 10-15 (1d6+9)

- **Dexterity:** 11-16 (1d6+10)

- **Agility:** 12-17 (1d6+11)

- **Perception:** 13-18 (1d6+12)

- **Aura:** 8-11 (1d4+7)

- **Will:** 9-14 (1d6+8)

- **Reasoning:** 6-9 (1d4+5)

- **Creativity:** 4-7 (1d4+3)
