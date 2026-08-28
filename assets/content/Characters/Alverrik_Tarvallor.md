---
aliases:
  - Álverrik Tárvallor
  - Alverrik Tarvallor
  - being-alverriktarvall
tags: []
name:
  full: Álverrik Tárvallor
  title: ""
  given: Álverrik
  clan: Tárvallor
  home: Solárden
  aliases:
    - Roran Stonefist
id: KSL4vCrnfP7FxZqU
folder: Nu7AgLZEmR26u2pk
shortcode: alverriktarvall
img: icons/game-icons/delapouite/person.svg
portrait: images/being/alverriktarvall-portrait.webp
type: being
package: sohl
social:
  occupation: Caravan Guard
  station: soldiery
  class: freeman
  society: Tarvénan
traits:
  gender: male
  age: 30
  birthday: 690/6/11
  height:
    m: 1.83
  weight:
    kg: 82
  build:
    frame: heavy
  appearance:
    eye_color: black
    hair_color: black
    skin_color: olive
    complexion: olive_toned
    extra_features:
      - a scar on the left shoulder
gear:
  weapons:
    - Heavy mace
  armor:
    - Chainmail and leather armor
  misc:
    - Large pack for supplies
    - Shield
    - basic first aid kit
    - navigation tools
sohl:
  kbcat: npc
  archetype: null
  attributes:
    str: 16
    end: 15
    dex: 12
    agl: 10
    per: 14
    cml: 9
    aur: 11
    wil: 12
    rea: 10
    cre: 8
    emp: 10
    elo: 9
    mor: 13
    voi: 11
  body:
    structure:
      zones:
        - name: Head
          shortcode: headzone
          probWeight: 1
        - name: Arms
          shortcode: armszone
          probWeight: 4
        - name: Torso
          shortcode: torsozone
          probWeight: 4
        - name: Legs
          shortcode: legszone
          probWeight: 6
      parts:
        - name: Head
          shortcode: headpart
          bodyZoneCode: headzone
          roles:
            - vital
          canHoldItem: false
          probWeight: 1
        - name: Right Arm
          shortcode: rarmpart
          bodyZoneCode: armszone
          roles:
            - manipulator
          canHoldItem: true
          probWeight: 2
        - name: Left Arm
          shortcode: larmpart
          bodyZoneCode: armszone
          roles:
            - manipulator
          canHoldItem: true
          probWeight: 2
        - name: Torso
          shortcode: torsopart
          bodyZoneCode: torsozone
          roles:
            - core
          canHoldItem: false
          probWeight: 4
        - name: Right Leg
          shortcode: rlegpart
          bodyZoneCode: legszone
          roles:
            - locomotor
          canHoldItem: false
          probWeight: 3
        - name: Left Leg
          shortcode: llegpart
          bodyZoneCode: legszone
          roles:
            - locomotor
          canHoldItem: false
          probWeight: 3
      locations:
        - name: Skull
          shortcode: skullloc
          bodyPartCode: headpart
          bleedingSusceptibility: low
          amputability: none
          shockValue: 5
          probWeight: 500
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Left Eye
          shortcode: leyeloc
          bodyPartCode: headpart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 5
          probWeight: 15
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Right Eye
          shortcode: reyeloc
          bodyPartCode: headpart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 5
          probWeight: 15
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Nose
          shortcode: noseloc
          bodyPartCode: headpart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 5
          probWeight: 30
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Left Cheek
          shortcode: lcheekloc
          bodyPartCode: headpart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 4
          probWeight: 60
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Right Cheek
          shortcode: rcheekloc
          bodyPartCode: headpart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 4
          probWeight: 60
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Left Ear
          shortcode: learloc
          bodyPartCode: headpart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 4
          probWeight: 15
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Right Ear
          shortcode: rearloc
          bodyPartCode: headpart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 4
          probWeight: 15
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Mouth
          shortcode: mouthloc
          bodyPartCode: headpart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 4
          probWeight: 30
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Jaw
          shortcode: jawloc
          bodyPartCode: headpart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 4
          probWeight: 60
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Neck
          shortcode: neckloc
          bodyPartCode: headpart
          bleedingSusceptibility: high
          amputability: low
          shockValue: 5
          probWeight: 200
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Right Shoulder
          shortcode: rshldloc
          bodyPartCode: rarmpart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 3
          probWeight: 30
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Right Upper Arm
          shortcode: rupaloc
          bodyPartCode: rarmpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 1
          probWeight: 30
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Right Elbow
          shortcode: relbloc
          bodyPartCode: rarmpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 2
          probWeight: 10
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Right Forearm
          shortcode: rfraloc
          bodyPartCode: rarmpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 1
          probWeight: 20
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Right Hand
          shortcode: rhandloc
          bodyPartCode: rarmpart
          bleedingSusceptibility: none
          amputability: high
          shockValue: 2
          probWeight: 10
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Left Shoulder
          shortcode: lshldloc
          bodyPartCode: larmpart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 3
          probWeight: 30
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Left Upper Arm
          shortcode: lupaloc
          bodyPartCode: larmpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 1
          probWeight: 30
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Left Elbow
          shortcode: lelbloc
          bodyPartCode: larmpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 2
          probWeight: 10
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Left Forearm
          shortcode: lfraloc
          bodyPartCode: larmpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 1
          probWeight: 20
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Left Hand
          shortcode: lhandloc
          bodyPartCode: larmpart
          bleedingSusceptibility: none
          amputability: high
          shockValue: 2
          probWeight: 10
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Thorax
          shortcode: thrxloc
          bodyPartCode: torsopart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 4
          probWeight: 40
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Abdomen
          shortcode: abdmnloc
          bodyPartCode: torsopart
          bleedingSusceptibility: high
          amputability: none
          shockValue: 4
          probWeight: 40
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Pelvis
          shortcode: plvisloc
          bodyPartCode: torsopart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 4
          probWeight: 20
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Right Thigh
          shortcode: rthghloc
          bodyPartCode: rlegpart
          bleedingSusceptibility: medium
          amputability: low
          shockValue: 3
          probWeight: 40
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Right Knee
          shortcode: rkneeloc
          bodyPartCode: rlegpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 2
          probWeight: 10
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Right Calf
          shortcode: rcalfloc
          bodyPartCode: rlegpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 1
          probWeight: 30
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Right Foot
          shortcode: rfootloc
          bodyPartCode: rlegpart
          bleedingSusceptibility: none
          amputability: medium
          shockValue: 2
          probWeight: 20
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Left Thigh
          shortcode: lthghloc
          bodyPartCode: llegpart
          bleedingSusceptibility: medium
          amputability: low
          shockValue: 3
          probWeight: 40
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Left Knee
          shortcode: lkneeloc
          bodyPartCode: llegpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 2
          probWeight: 10
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Left Calf
          shortcode: lcalfloc
          bodyPartCode: llegpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 1
          probWeight: 30
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Left Foot
          shortcode: lfootloc
          bodyPartCode: llegpart
          bleedingSusceptibility: none
          amputability: medium
          shockValue: 2
          probWeight: 20
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
    weight:
      base: 181
      calc: (9 * str) + 50
    reachBase: 0
    bodyScaleBase: 1
    personalFatigue: enc + 5
  currentMoveMedium: terrestrial
  movementProfiles:
    - medium: terrestrial
      feetPerRound: 50
      leaguesPerWatch: 5
      encumbrance: floor(wt/4)
      strMod: -5 * floor((str - 10) / 2)
      disabled: false
  defaultCombatGroup: null
  items:
    - shortcode: cook
      type: skill
      system:
        masteryLevelBase: 24
    - shortcode: eng
      type: skill
      system:
        masteryLevelBase: 9
    - shortcode: folklr
      type: skill
      system:
        masteryLevelBase: 11
    - shortcode: hrld
      type: skill
      system:
        masteryLevelBase: 22
    - shortcode: pysn
      type: skill
      system:
        masteryLevelBase: 24
    - shortcode: ritual
      type: skill
      system:
        masteryLevelBase: 11
    - shortcode: chrm
      type: skill
      system:
        masteryLevelBase: 27
    - shortcode: cmd
      type: skill
      system:
        masteryLevelBase: 22
    - shortcode: dscr
      type: skill
      system:
        masteryLevelBase: 20
    - shortcode: guil
      type: skill
      system:
        masteryLevelBase: 27
    - shortcode: intr
      type: skill
      system:
        masteryLevelBase: 40
    - shortcode: sing
      type: skill
      system:
        masteryLevelBase: 27
    - shortcode: thtcs
      type: skill
      system:
        masteryLevelBase: 8
    - shortcode: herb
      type: skill
      system:
        masteryLevelBase: 24
    - shortcode: pilt
      type: skill
      system:
        masteryLevelBase: 24
    - shortcode: srvl
      type: skill
      system:
        masteryLevelBase: 55
    - shortcode: awar
      type: skill
      system:
        masteryLevelBase: 65
    - shortcode: clmb
      type: skill
      system:
        masteryLevelBase: 33
    - shortcode: dnce
      type: skill
      system:
        masteryLevelBase: 18
    - shortcode: jump
      type: skill
      system:
        masteryLevelBase: 39
    - shortcode: ridg
      type: skill
      system:
        masteryLevelBase: 10
    - shortcode: stlth
      type: skill
      system:
        masteryLevelBase: 33
    - shortcode: swim
      type: skill
      system:
        masteryLevelBase: 12
    - shortcode: archery
      type: skill
      system:
        masteryLevelBase: 13
    - shortcode: init
      type: skill
      system:
        masteryLevelBase: 55
    - shortcode: melee
      type: skill
      system:
        masteryLevelBase: 44
    - shortcode: thro
      type: skill
      system:
        masteryLevelBase: 52
    - shortcode: draw
      type: skill
      system:
        masteryLevelBase: 10
    - shortcode: fltch
      type: skill
      system:
        masteryLevelBase: 13
    - shortcode: glas
      type: skill
      system:
        masteryLevelBase: 26
    - shortcode: masn
      type: skill
      system:
        masteryLevelBase: 14
    - shortcode: mtlc
      type: skill
      system:
        masteryLevelBase: 14
    - shortcode: mill
      type: skill
      system:
        masteryLevelBase: 30
    - shortcode: wpnc
      type: skill
      system:
        masteryLevelBase: 56
    - shortcode: tlnt
      type: mysticalability
      system:
        masteryLevelBase: 33
    - shortcode: spirit
      type: skill
      initSkillMult: 3
    - shortcode: bflkbite
      type: skill
      initSkillMult: 2
    - shortcode: bflkgrab
      type: skill
      initSkillMult: 2
    - shortcode: bflkheadbutt
      type: skill
      initSkillMult: 2
    - shortcode: bflkkick
      type: skill
      initSkillMult: 2
    - shortcode: limbblock
      type: skill
      initSkillMult: 2
    - shortcode: press
      type: skill
      initSkillMult: 2
    - shortcode: bflkpunch
      type: skill
      initSkillMult: 2
    - shortcode: trip
      type: skill
      initSkillMult: 2
    - shortcode: sprt
      type: mysticalability
---

# Appearance {#appearance}

Álverrik Tárvallor is a 34-year-old man who stands 6'0" tall and is broad and solidly built. He has an angular face with prominent cheekbones, a prominent forehead, and an angular jaw that leads to a square chin. His large black eyes sit beneath thick brows, lending him an expressive gaze. An aquiline nose and firm lips complete his features. He has olive skin with an olive-toned complexion. His black hair is shorn at the sides with length on top.

# Dossier {#dossier}

Born in the Tarvénia region to a freeman family of Tarvénan heritage, Álverrik Tárvallor came into the world of the caravan guard through a combination of circumstance and aptitude.

Roran has spent years as a caravan guard, ensuring the safety of traders traveling through dangerous territories. Known for his strength and vigilance, he is respected by his peers and feared by would-be bandits. Roran has a strong sense of duty and is committed to protecting both the goods and the lives of those he guards.

Now at 30 years of age, Álverrik Tárvallor has established himself as a known figure among the caravan guards of Tarvénia. His reputation, for better or worse, precedes him in the circles where such things matter.

## Psyche

### Personality

Can be overly serious, struggles with the fast-paced nature of caravan travel.

### Motivation

Álverrik is driven by the desire to master his craft and secure a stable future. The uncertainties of life in caravan guard work keep him vigilant and adaptable.

### Strengths

Physically strong, experienced in combat, good at reading threats.

## Social

Álverrik is affiliated with Local Mercenaries' Guild.

As a Tarvénan caravan guard, Álverrik occupies a recognized social niche within Tarvénia society.

## Companions

### Patrons

Álverrik's primary patron is Merchants and traders seeking protection for their caravans.. This relationship provides both opportunity and obligation.

### Enemies

Few; generally well-respected.

## Plot Hooks

1. **The Caravan Guard's Dilemma** — Álverrik faces a professional crisis that threatens his livelihood. A choice must be made between principle and survival, and the consequences will ripple through his community in Tarvénia.

2. **Old Grudges** — Few; generally well-respected. This conflict threatens to escalate beyond personal rivalry into something far more dangerous.

3. **Echoes of the Past** — Something from Álverrik's earlier life resurfaces unexpectedly, forcing him to confront unfinished business that he thought was long buried.

4. **Shifting Winds** — Political changes in Tarvénia threaten to upend the social order that Álverrik depends upon. He must decide whether to adapt, resist, or flee.

5. **The Opportunity** — A chance encounter offers Álverrik the possibility of advancement beyond anything he has dared hope for — but the price may be higher than it first appears.
