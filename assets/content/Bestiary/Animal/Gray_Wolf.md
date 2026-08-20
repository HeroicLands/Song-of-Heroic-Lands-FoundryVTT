---
aliases:
  - Gray Wolf
  - being-graywolf
tags:
  - animal
name:
  full: Gray Wolf
  aliases: []
description: "A highly social pack predator of temperate and cold wilds, using numbers and tactical cunning to bring down prey far larger than itself."
id: nPuJf6mTzOMgeULk
img: icons/game-icons/lorc/wolf-head.svg
portrait: images/being/graywolf-portrait.webp
shortcode: graywolf
type: being
package: sohl
sohl:
  kbcat: animal
  archetype: 0
  attributes:
    str: 10
    end: 10
    agl: 14
    per: 17
    snt: 5
    aur: 4
    wil: 13
    rea: 5
    cre: 5
  attrRollFormula:
    str: 1d6+7
    end: 1d6+7
    agl: 1d6+11
    per: 1d6+14
    snt: 1d4+3
    aur: 1d4+2
    wil: 1d6+10
    rea: 1d4+3
    cre: 1d4+3
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
          probWeight: 2
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
      base: 80
      calc: "80"
    reachBase: 0
    bodyScaleBase: 0.94
    personalFatigue: enc + 5
  currentMoveMedium: terrestrial
  movementProfiles:
    - medium: terrestrial
      feetPerRound: 130
      leaguesPerWatch: 6
      encumbrance: floor(wt/4)
      strMod: -5 * floor((str - 10) / 2)
      factors:
        - scope: surface_cover
          key: mixed_forest
          mode: add
          textValue: "-1"
        - scope: surface_cover
          key: needleleaf_forest
          mode: add
          textValue: "0"
      disabled: false
  defaultCombatGroup: null
  items:
    - shortcode: awar
      type: skill
      system:
        masteryLevelBase: 75
    - shortcode: stlth
      type: skill
      system:
        masteryLevelBase: 60
    - shortcode: sprt
      type: mysticalability
      system:
        masteryLevelBase: 24
    - shortcode: init
      type: skill
      system:
        masteryLevelBase: 36
    - shortcode: dge
      type: skill
      system:
        masteryLevelBase: 60
    - shortcode: shok
      type: skill
      system:
        masteryLevelBase: 40
    - name: Bite
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
            modifier: 0
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
            clench: true
            armorReduction: 1
---

# Appearance {#appearance}

The howl reaches you long before the wolf itself—a long, echoing call that speaks to something primal in your bones. When the creature emerges from the darkness, it moves like smoke given form, muscle and sinew rippling beneath a thick coat of gray and brown. The eyes catch firelight and reflect it back: amber and gold, burning with intelligence that is utterly unlike the predators you know. The nose works the air constantly, cataloging scents beyond your ability to perceive. When it growls, the sound vibrates in your chest, and the teeth—sharp and white—promise things your mind rejects even as your instincts scream warnings. But the worst part is the realization that you are seeing only one, and somewhere in the darkness around you, others are moving, flanking, waiting for the moment to strike together.

# Dossier {#dossier}

The Gray Wolf is a highly social predator that hunts in coordinated packs rather than as individuals. These creatures are masters of tactical hunting, using numbers and intelligence to bring down prey far larger than any single wolf. Gray wolves are found in wild lands across temperate and cold regions, establishing territories that they defend fiercely. Adventurers most commonly encounter them when traveling through wilderness areas or when a pack's territory overlaps human settlements.

## Presentation

A mature gray wolf stands roughly thirty inches at the shoulder and weighs between eighty and one hundred twenty pounds, making it larger than most dogs. The build is lean and muscular, optimized for endurance and speed rather than raw power. The coat is thick and multi-layered, in shades of gray, brown, black, and white, with darker colors along the spine and lighter colors on the belly and chest. The head is broad but tapered, with a long snout and forward-facing eyes that provide good binocular vision. The ears are triangular and positioned high, rotating independently for directional hearing. The mouth is filled with sharp teeth, with the canines particularly prominent. The tail is long and bushy, used for balance and communication. The overall appearance is that of a creature built perfectly for hunting.

## Key Behaviors

Gray wolves are pack animals that live in hierarchical social groups of four to ten individuals, centered on an alpha pair. The pack hunts cooperatively, using coordinated strategies that allow them to take prey far larger than themselves. They are territorial and patrol established ranges, marking boundaries with scent and howl. They hunt primarily ungulates (deer, elk) and smaller mammals, though they will take larger prey and will scavenge. Packs are most active at dawn and dusk but will hunt at any time if prey is available. They communicate through howls, barks, growls, and body language.

## Combat Strategy

A wolf pack's hunting strategy is designed for efficiency and safety—multiple wolves attack from different angles simultaneously, flanking prey and focusing on vulnerable points. If prey escapes, the pack pursues relentlessly, using endurance to tire prey faster than it can run. A single wolf is cautious and will retreat if outnumbered or outmatched; a pack shows far more aggression and commitment. A pack defending its territory or young becomes almost suicidal in its determination.

## Attack Methods

### Powerful Bite

The wolf's bite is designed to puncture and tear—the sharp teeth are meant to lacerate blood vessels and cause shock through blood loss. A wolf will bite and hold, attempting to drag prey down or create space for packmates.

### Pack Coordination

Multiple wolves attack simultaneously from different angles, using confusion and overwhelming numbers to isolate individual targets. The pack works with apparent telepathy, each member anticipating the actions of others.

## Special Abilities

### Pack Tactics

When hunting with other wolves, the pack gains supernatural coordination—they never hesitate or stumble over each other, they read each other's movements perfectly, and they execute tactics that isolate and overwhelm targets. A solitary wolf loses this advantage and becomes noticeably less effective.

### Legendary Endurance

The wolf can pursue prey across vast distances without tiring, running at a steady pace for days if necessary. This endurance allows wolves to wear down prey that cannot sustain such effort.

## Additional Information

A wolf pack's territory can be traversed safely if one understands their behavior and respects their boundaries. Packs generally avoid humans unless desperate or defending territory. A wolf pack that has learned humanoid prey are available will become increasingly bold, potentially attacking settlements. Some cultures venerate wolves as symbols of wildness, loyalty, or hunting prowess.

## Attributes

- **Strength:** 8-13 (1d6+7)

- **Endurance:** 8-13 (1d6+7)

- **Agility:** 12-17 (1d6+11)

- **Perception:** 15-20 (1d6+14)

- **Scent:** 4-7 (1d4+3)

- **Aura:** 3-6 (1d4+2)

- **Will:** 11-16 (1d6+10)

- **Reasoning:** 4-7 (1d4+3)

- **Creativity:** 4-7 (1d4+3)
