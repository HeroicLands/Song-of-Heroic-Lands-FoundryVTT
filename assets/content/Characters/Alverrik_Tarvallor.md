---
tags:
  - character
name:
  full: Álverrik Tárvallor
  title: ""
  given: Álverrik
  clan: Tárvallor
  home: Solárden
  aliases:
    - Roran Stonefist
packFolder: pregens
shortcode: alverriktarvall
type: being
data:
  icon: person
  templatePriority: null
  gender: male
  age: 30
  born: 690/6/11
  height: 1.83
  weight: 82
  frame: heavy
  appearance:
    eye_color: black
    hair_color: black
    skin_color: olive
    complexion: olive_toned
    extra_features:
      - a scar on the left shoulder
social:
  occupation: null
  station: null
  class: null
  society: null
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
  items:
    - { model: attribute-str, system: { scoreBase: 16 } }
    - { model: attribute-end, system: { scoreBase: 15 } }
    - { model: attribute-dex, system: { scoreBase: 12 } }
    - { model: attribute-agl, system: { scoreBase: 10 } }
    - { model: attribute-per, system: { scoreBase: 14 } }
    - { model: attribute-cml, system: { scoreBase: 9 } }
    - { model: attribute-aur, system: { scoreBase: 11 } }
    - { model: attribute-wil, system: { scoreBase: 12 } }
    - { model: attribute-rea, system: { scoreBase: 10 } }
    - { model: attribute-cre, system: { scoreBase: 8 } }
    - { model: attribute-emp, system: { scoreBase: 10 } }
    - { model: attribute-elo, system: { scoreBase: 9 } }
    - { model: attribute-mor, system: { scoreBase: 13 } }
    - { model: attribute-voi, system: { scoreBase: 11 } }
    - { model: skill-cook, system: { masteryLevelBase: 24 } }
    - { model: skill-eng, system: { masteryLevelBase: 9 } }
    - { model: skill-folklr, system: { masteryLevelBase: 11 } }
    - { model: skill-hrld, system: { masteryLevelBase: 22 } }
    - { model: skill-pysn, system: { masteryLevelBase: 24 } }
    - { model: skill-ritual, system: { masteryLevelBase: 11 } }
    - { model: skill-chrm, system: { masteryLevelBase: 27 } }
    - { model: skill-cmd, system: { masteryLevelBase: 22 } }
    - { model: skill-dscr, system: { masteryLevelBase: 20 } }
    - { model: skill-guil, system: { masteryLevelBase: 27 } }
    - { model: skill-intr, system: { masteryLevelBase: 40 } }
    - { model: skill-sing, system: { masteryLevelBase: 27 } }
    - { model: skill-thtcs, system: { masteryLevelBase: 8 } }
    - { model: skill-herb, system: { masteryLevelBase: 24 } }
    - { model: skill-pilt, system: { masteryLevelBase: 24 } }
    - { model: skill-srvl, system: { masteryLevelBase: 55 } }
    - { model: skill-awar, system: { masteryLevelBase: 65 } }
    - { model: skill-clmb, system: { masteryLevelBase: 33 } }
    - { model: skill-dnce, system: { masteryLevelBase: 18 } }
    - { model: skill-jump, system: { masteryLevelBase: 39 } }
    - { model: skill-ridg, system: { masteryLevelBase: 10 } }
    - { model: skill-stlth, system: { masteryLevelBase: 33 } }
    - { model: skill-swim, system: { masteryLevelBase: 12 } }
    - { model: skill-archery, system: { masteryLevelBase: 13 } }
    - { model: skill-init, system: { masteryLevelBase: 55 } }
    - { model: skill-melee, system: { masteryLevelBase: 44 } }
    - { model: skill-thro, system: { masteryLevelBase: 52 } }
    - { model: skill-draw, system: { masteryLevelBase: 10 } }
    - { model: skill-fltch, system: { masteryLevelBase: 13 } }
    - { model: skill-glas, system: { masteryLevelBase: 26 } }
    - { model: skill-masn, system: { masteryLevelBase: 14 } }
    - { model: skill-mtlc, system: { masteryLevelBase: 14 } }
    - { model: skill-mill, system: { masteryLevelBase: 30 } }
    - { model: skill-wpnc, system: { masteryLevelBase: 56 } }
    - { model: mysticalability-tlnt, system: { masteryLevelBase: 33 } }
    - { model: skill-spirit, initSkillMult: 3 }
    - { model: skill-bflkbite, initSkillMult: 2 }
    - { model: skill-bflkgrab, initSkillMult: 2 }
    - { model: skill-bflkheadbutt, initSkillMult: 2 }
    - { model: skill-bflkkick, initSkillMult: 2 }
    - { model: skill-limbblock, initSkillMult: 2 }
    - { model: skill-press, initSkillMult: 2 }
    - { model: skill-bflkpunch, initSkillMult: 2 }
    - { model: skill-trip, initSkillMult: 2 }
    - { model: mysticalability-sprt }
  system:
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
