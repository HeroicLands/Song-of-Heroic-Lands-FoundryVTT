---
tags:
  - animal
name:
  full: Great White Shark
  aliases: []
description: "An apex ocean predator exceeding twenty feet and several tons, a solitary killing machine that patrols deep and shallow waters unchanged for millions of years."
id: 7rJxMeCW3TSzstw6
img: icons/game-icons/lorc/shark-jaws.svg
portrait: images/being/grtwhtsh-portrait.webp
shortcode: grtwhtsh
type: being
sohl:
  kbcat: animal
  archetype: 0
  attrRollFormula:
    str: 1d6+15
    end: 1d6+12
    dex: 1d6+7
    agl: 1d6+9
    per: 1d6+12
    aur: 1d6+8
    wil: 1d6+10
    rea: 1d4+4
    cre: 1d4+2
  body:
    structure:
      zones:
        - name: Head
          shortcode: headzone
          probWeight: 5
        - name: Body
          shortcode: torsozone
          probWeight: 11
        - name: Tail
          shortcode: tailzone
          probWeight: 4
      parts:
        - name: Head
          shortcode: headpart
          bodyZoneCode: headzone
          roles:
            - vital
            - manipulator
          canHoldItem: false
          probWeight: 10
        - name: Body
          shortcode: torsopart
          bodyZoneCode: torsozone
          roles:
            - core
          canHoldItem: false
          probWeight: 10
        - name: Left Fin
          shortcode: lfinpart
          bodyZoneCode: torsozone
          roles:
            - locomotor
          canHoldItem: false
          probWeight: 2
        - name: Right Fin
          shortcode: rfinpart
          bodyZoneCode: torsozone
          roles:
            - locomotor
          canHoldItem: false
          probWeight: 2
        - name: Tail
          shortcode: tailpart
          bodyZoneCode: tailzone
          roles:
            - locomotor
          canHoldItem: false
          probWeight: 10
      locations:
        - name: Head
          shortcode: headloc
          bodyPartCode: headpart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 5
          probWeight: 6
          protectionBase:
            blunt: 5
            edged: 4
            piercing: 3
            fire: 5
        - name: Gills
          shortcode: gillloc
          bodyPartCode: headpart
          bleedingSusceptibility: high
          amputability: low
          shockValue: 5
          probWeight: 4
          protectionBase:
            blunt: 5
            edged: 4
            piercing: 3
            fire: 5
        - name: Body
          shortcode: bodyloc
          bodyPartCode: torsopart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 4
          probWeight: 6
          protectionBase:
            blunt: 5
            edged: 4
            piercing: 3
            fire: 5
        - name: Underbelly
          shortcode: underbellyloc
          bodyPartCode: torsopart
          bleedingSusceptibility: high
          amputability: none
          shockValue: 4
          probWeight: 4
          protectionBase:
            blunt: 5
            edged: 4
            piercing: 3
            fire: 5
        - name: Left Fin
          shortcode: lfinloc
          bodyPartCode: lfinpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 2
          probWeight: 10
          protectionBase:
            blunt: 5
            edged: 4
            piercing: 3
            fire: 5
        - name: Right Fin
          shortcode: rfinloc
          bodyPartCode: rfinpart
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
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 2
          probWeight: 10
          protectionBase:
            blunt: 5
            edged: 4
            piercing: 3
            fire: 5
    weight:
      base: 2000
      calc: "2000"
    reachBase: 0
    bodyScaleBase: 1.43
    personalFatigue: enc + 5
  currentMoveMedium: terrestrial
  movementProfiles:
    - medium: aquatic
      feetPerRound: 100
      leaguesPerWatch: 10
      encumbrance: floor(wt/4)
      strMod: -5 * floor((str - 10) / 2)
      factors: []
      disabled: false
  defaultCombatGroup: null
  items:
    - { shortcode: str, type: attribute, system: { scoreBase: 19 } }
    - { shortcode: end, type: attribute, system: { scoreBase: 16 } }
    - { shortcode: dex, type: attribute, system: { scoreBase: 11 } }
    - { shortcode: agl, type: attribute, system: { scoreBase: 13 } }
    - { shortcode: per, type: attribute, system: { scoreBase: 16 } }
    - { shortcode: aur, type: attribute, system: { scoreBase: 12 } }
    - { shortcode: wil, type: attribute, system: { scoreBase: 14 } }
    - { shortcode: rea, type: attribute, system: { scoreBase: 7 } }
    - { shortcode: cre, type: attribute, system: { scoreBase: 5 } }
    - { shortcode: awar, type: skill, system: { masteryLevelBase: 75 } }
    - { shortcode: stlth, type: skill, system: { masteryLevelBase: 65 } }
    - { shortcode: sprt, type: mysticalability, system: { masteryLevelBase: 39 } }
    - { shortcode: init, type: skill, system: { masteryLevelBase: 44 } }
    - { shortcode: dge, type: skill, system: { masteryLevelBase: 56 } }
    - { shortcode: shok, type: skill, system: { masteryLevelBase: 45 } }
    - name: Devastating Bite
      type: skill
      system:
        shortcode: bite
        subType: combattechnique
        masteryLevelBase: 61
        combatCategory: melee
        impairedByRoles:
          - manipulator
        strikeMode:
          type: melee
          shortcode: bite
          name: Devastating Bite
          minParts: 1
          assocSkillCode: null
          attack:
            disabled: false
            spread: 4
            modifier: 0
          impactBase:
            numDice: 1
            die: 6
            modifier: 5
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
    - name: Ramming Charge
      type: skill
      system:
        shortcode: ram
        subType: combattechnique
        masteryLevelBase: 51
        combatCategory: melee
        impairedByRoles:
          - core
        strikeMode:
          type: melee
          shortcode: ram
          name: Ramming Charge
          minParts: 1
          assocSkillCode: null
          attack:
            disabled: false
            spread: 8
            modifier: 0
          impactBase:
            numDice: 1
            die: 6
            modifier: 4
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

The water around you grows cold. You see the shadow first—an enormous silhouette gliding beneath the surface with terrible grace. Then the shark itself rises: a creature of pure predatory design, gray above and white below, its body a hydrodynamic perfection built for nothing but hunting. The eyes are cold and reptilian, utterly without mercy or concern. When the shark opens its jaws, you see rows of serrated teeth sharp enough to shred armor, and the mouth is large enough to swallow a humanoid whole. The fin cuts the water, and you feel with bone-deep certainty that you are in the presence of something utterly beyond your capacity to resist.

# Dossier {#dossier}

The Great White Shark is an apex ocean predator, a creature that has remained virtually unchanged for millions of years because it is perfectly suited to hunting in its domain. These solitary hunters patrol deep and shallow waters, killing anything that enters their territory. A great white shark can exceed twenty feet in length and weighs several tons—a creature built entirely for hunting and killing with maximum efficiency. Adventurers encounter them only when sailing or swimming in shark territory, and such encounters typically end in disaster.

## Presentation

The Great White Shark is a masterwork of predatory design: a streamlined body tapering from broad shoulders to a powerful tail, covered in smooth gray skin above and white below. The coloring provides counterillumination camouflage, making the shark nearly invisible from above against the dark depths and from below against the light surface. The head tapers to a pointed snout (the rostrum) with nostrils positioned to sample water chemistry. The eyes are small and positioned to the sides of the head, providing good lateral vision but limited forward binocular sight. The mouth is enormous and filled with serrated teeth arranged in multiple rows—functional teeth positioned further back and replacement teeth gradually moving forward as older teeth wear away. The dorsal fin is distinctive—large and triangular, used for stability and steering. The tail is crescent-shaped and powerful, generating the force for movement and attack.

## Key Behaviors

Great White Sharks are solitary hunters that patrol vast territories, using their extraordinary senses to detect prey. They hunt seals, dolphins, large fish, and anything else that enters their domain. They hunt primarily through ambush from below—approaching prey from depths where they cannot be seen, then striking with explosive force. They are sensitive to electrical fields (generated by muscle contractions in other creatures) and can detect movement from considerable distances. They feed infrequently (every few weeks or months for large prey) and digest slowly over extended periods.

## Combat Strategy

A Great White's attack is designed for one-hit killing—the initial bite is intended to be catastrophic, severing limbs or killing instantly. If the initial strike succeeds, the shark retreats to wait for the prey to weaken before feeding. If the strike fails or if the prey survives, the shark may make additional strikes, though it generally does not engage in prolonged combat. A shark in confined space (like a ship or shallow water) becomes more predictable and aggressive, making repeated attacks rather than retreating.

## Attack Methods

### Devastating Bite

The shark's bite is one of the most powerful in the animal kingdom—rows of serrated teeth deliver crushing force capable of severing limbs, smashing bone, and inflicting catastrophic trauma. A successful bite is nearly always fatal or crippling.

### Ramming Charge

The shark uses its massive body weight and speed to ram prey, knocking them off balance or into deeper water. The impact alone can cause serious injury.

## Special Abilities

### Apex Hunter

The shark's senses are supremely keen—it can detect electrical fields, smell blood from miles away, and sense movement through water vibrations. The shark is nearly impossible to surprise in water.

### Aquatic Mastery

In water, the Great White is supremely graceful and fast, capable of striking faster than humanoid reflexes can follow. Out of water, the shark is helpless.

## Additional Information

A Great White Shark's territory should be avoided—the risk is simply too great. Some cultures revere sharks as embodiments of power or hunting prowess. A dead shark's teeth can be worked into weapons or jewelry. The jaw of a great white shark is legendary.

## Attributes

- **Strength:** 16-21 (1d6+15)

- **Endurance:** 13-18 (1d6+12)

- **Dexterity:** 8-13 (1d6+7)

- **Agility:** 10-15 (1d6+9)

- **Perception:** 13-18 (1d6+12)

- **Aura:** 9-14 (1d6+8)

- **Will:** 11-16 (1d6+10)

- **Reasoning:** 5-8 (1d4+4)

- **Creativity:** 3-6 (1d4+2)
