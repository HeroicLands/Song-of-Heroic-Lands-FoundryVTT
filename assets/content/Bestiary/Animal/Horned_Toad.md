---
tags:
  - animal
name:
  full: Horned Toad
  aliases: []
description: "A four-foot desert reptile armored in jagged bony plates, its sand-colored, warty hide letting it vanish against rocky badlands terrain."
id: Pw1yCo0E0c33EE6P
img: icons/game-icons/delapouite/horned-reptile.svg
portrait: images/being/hrndtd-portrait.webp
shortcode: hrndtd
type: being
sohl:
  kbcat: animal
  archetype: 0
  attributes:
    str: 11
    end: 13
    dex: 12
    agl: 11
    per: 14
    aur: 8
    wil: 11
    rea: 7
    cre: 5
  attrRollFormula:
    str: 1d6+7
    end: 1d6+9
    dex: 1d6+8
    agl: 1d6+7
    per: 1d6+10
    aur: 1d4+5
    wil: 1d6+7
    rea: 1d4+4
    cre: 1d4+2
  body:
    structure:
      zones:
        - name: Forequarters
          shortcode: fqtrzone
          probWeight: 1
        - name: Torso
          shortcode: torsozone
          probWeight: 1
        - name: Hindquarters
          shortcode: hindqtrzone
          probWeight: 1
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
          roles:
            - manipulator
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
      base: 5
      calc: "5"
    reachBase: 0
    bodyScaleBase: 1
    personalFatigue: enc + 5
  currentMoveMedium: terrestrial
  movementProfiles:
    - medium: terrestrial
      feetPerRound: 20
      leaguesPerWatch: 1
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
        masteryLevelBase: 27
    - shortcode: init
      type: skill
      system:
        masteryLevelBase: 36
    - shortcode: dge
      type: skill
      system:
        masteryLevelBase: 48
    - shortcode: shok
      type: skill
      system:
        masteryLevelBase: 30
    - name: Tail Sweep
      type: skill
      system:
        shortcode: tail
        subType: combattechnique
        masteryLevelBase: 52
        combatCategory: melee
        impairedByRoles:
          - locomotor
        strikeMode:
          type: melee
          shortcode: tail
          name: Tail Sweep
          minParts: 1
          assocSkillCode: null
          attack:
            disabled: false
            spread: 2
            modifier: 0
          impactBase:
            numDice: 1
            die: 6
            modifier: -2
            aspect: blunt
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
    - name: Bite
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

The desert floor erupts with motion—a squat, armored shape surfacing from the sand like a spiky crown. Every inch of the creature bristles with sharp, bony protrusions that catch the sunlight. Its coloration blends so perfectly with the surrounding dunes that you almost missed it, and only the swift dart of its oversized eyes and the flick of a long, precise tongue give it away. The air carries a faint, metallic tang—old blood, perhaps. This is survival distilled into scales and spines.

# Dossier {#dossier}

The Horned Toad is a four-foot-long reptile perfectly adapted to harsh desert and badlands environments. Its body is a armor plating of jagged, bony protrusions that extend from its crown, back, and tail, serving both as defensive armor and as a warning to would-be predators. Its sand-colored scales and warty, irregular texture allow it to vanish against rocky or sandy terrain. Its eyes are large and independently mobile, providing nearly 360-degree vision.

## Presentation

Horned toads are squat and heavily built, with short, powerful legs that allow them to move with surprising speed across desert terrain. Their heads are broad and flattened, crowned with a row of distinctive spikes and horns. The body tapers slightly toward a thick, muscular tail ringed with spines. The scales are dull and dusty in coloration—tan, brown, and gray with darker mottling—providing excellent camouflage. Their eyes are large, unblinking, and capable of swiveling to track movement in nearly any direction. A long, sticky tongue extends frequently, catching insects.

## Key Behaviors

Horned toads are primarily insectivorous, spending much of their day hunting small arthropods with their precise, rapid-fire tongue strikes. They are solitary and territorial, establishing home ranges that they patrol daily but remain in for extended periods. During extreme heat, they burrow into sand or hide beneath rocks to avoid dehydration and temperature extremes. They are most active during cooler mornings and evenings. When threatened, they exhibit a dramatic and effective defensive display: they can force blood to pool behind their eyes and spray it outward with surprising force and accuracy, creating a burst of crimson that startles and disorients predators.

## Combat Strategy

Horned toads strongly prefer to flee or hide when threatened, using their camouflage and low profile to escape notice. If cornered or trapped, they resort to their defensive arsenal: a display of spines and horns to appear larger and more formidable, a powerful tail swipe that can puncture or lacerate, and finally the blood spray if an attacker presses close. They are not aggressive combatants and typically will not pursue fleeing opponents.

## Attack Methods

### Tail Sweep

The horned toad lashes its thick, spined tail with surprising force, capable of knocking smaller foes off balance, inflicting puncture wounds, or driving back melee combatants.

### Blood Spray

If pressed into direct contact or threatened with grappling, the creature forces blood to the back of its eyes and expels it in a forceful burst up to 10 feet; this spray causes momentary blindness and disorients targets, and the blood itself is caustic to mucous membranes.

## Special Abilities

### Spiked Body

The array of bony protrusions covering the horned toad’s body inflicts damage on any opponent attempting to grapple, pin, or tackle it; these spikes are particularly effective against unarmed combat.

### Desert Camouflage

When still, the horned toad’s coloration and texture allow it to blend nearly perfectly with rocky or sandy terrain, making it nearly impossible to spot without careful observation or magical assistance.

## Attributes

- **Strength:** 8-13 (1d6+7)

- **Endurance:** 10-15 (1d6+9)

- **Dexterity:** 9-14 (1d6+8)

- **Agility:** 8-13 (1d6+7)

- **Perception:** 11-16 (1d6+10)

- **Aura:** 6-9 (1d4+5)

- **Will:** 8-13 (1d6+7)

- **Reasoning:** 5-8 (1d4+4)

- **Creativity:** 3-6 (1d4+2)
