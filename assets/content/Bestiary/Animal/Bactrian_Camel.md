---
aliases:
  - Bactrian Camel
  - being-bctrncml
tags:
  - animal
name:
  full: Bactrian Camel
  aliases: []
description: "A hardy, two-humped pack animal of remarkable endurance, carrying merchants and soldiers across frozen passes and bitter deserts."
id: 4MkB6ybeaITI3ntC
img: icons/game-icons/delapouite/camel-head.svg
portrait: images/being/bctrncml-portrait.webp
shortcode: bctrncml
type: being
sohl:
  kbcat: animal
  archetype: 0
  attributes:
    str: 16
    end: 19
    dex: 10
    agl: 9
    per: 12
    aur: 8
    wil: 13
    rea: 7
    cre: 6
  attrRollFormula:
    str: 1d6+12
    end: 1d6+15
    dex: 1d4+7
    agl: 1d4+6
    per: 1d6+8
    aur: 1d4+5
    wil: 1d6+9
    rea: 1d4+4
    cre: 1d4+3
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
          probWeight: 6
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
        - name: Flank
          shortcode: flkloc
          bodyPartCode: torsopart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 4
          probWeight: 6
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
          probWeight: 4
          protectionBase:
            blunt: 3
            edged: 2
            piercing: 1
            fire: 3
        - name: Left Quarter
          shortcode: lqtrloc
          bodyPartCode: lhindlegpart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 3
          probWeight: 5
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
          probWeight: 4
          protectionBase:
            blunt: 3
            edged: 2
            piercing: 1
            fire: 3
        - name: Right Quarter
          shortcode: rqtrloc
          bodyPartCode: rhindlegpart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 3
          probWeight: 5
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
          probWeight: 4
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
      base: 1100
      calc: "1100"
    reachBase: 0
    bodyScaleBase: 1.28
    personalFatigue: enc + 5
  currentMoveMedium: terrestrial
  movementProfiles:
    - medium: terrestrial
      feetPerRound: 70
      leaguesPerWatch: 8
      encumbrance: floor(wt/4)
      strMod: -5 * floor((str - 10) / 2)
      factors:
        - scope: surface_cover
          key: dunes
          mode: add
          textValue: "0"
        - scope: hydrology
          key: shallow
          mode: add
          textValue: "0"
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
        masteryLevelBase: 40
    - shortcode: shok
      type: skill
      system:
        masteryLevelBase: 45
    - name: Kick
      type: skill
      system:
        shortcode: kick
        subType: combattechnique
        masteryLevelBase: 48
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
            modifier: 0
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
        masteryLevelBase: 58
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
            die: 6
            modifier: 3
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

The creature regards you with weary, liquid eyes set high in a long, narrow face. Two broad humps rise above its shoulders like dunes made flesh, covered in shaggy wool the color of dried grass matted and stained with dust. The air around it carries a thick, rank smell—sweat and something acidic, bitter. Its breath steams faintly in the cold air, and when it shifts its weight, you can hear the creak of sinew and the grinding of joint against bone.

# Dossier {#dossier}

The Bactrian camel is an ungulate of remarkable endurance, built to thrive in the harshest, coldest environments where other beasts would perish. Standing seven to eleven feet tall at the shoulder and weighing upward of a thousand pounds, these two-humped creatures are primarily transport animals for merchants and soldiers traversing frozen mountain passes, wind-scoured plateaus, and bitter deserts. Unlike their single-humped cousins, Bactrian camels are notably more docile and less aggressive, though a threatened or startled individual can be as dangerous as any hoofed animal. Adventurers may encounter them as pack animals with caravans, in herds on open grasslands, or abandoned and feral in regions where trade routes have fallen into disuse.

## Presentation

A long-necked, long-legged animal with a compact but muscular body. Two prominent humps rise high above its shoulders, stored with fat for sustenance during lean periods and harsh seasons. Its coat is thick and shaggy, typically dun, brown, or gray, and shedding in matted clumps during warm seasons. The face is long and narrow with a pronounced cleft upper lip, high-set eyes that are dark and surprisingly intelligent, and small, pointed ears. The feet are broad and two-toed, with leathery pads that grip rocky ground and snow with equal facility. The smell is distinctive and unpleasant—a combination of sweat, urine, and acidic saliva that becomes more pronounced when the animal is agitated.

## Key Behaviors

Bactrian camels exist in herds or as beasts of burden. In the wild, they graze on low shrubs and tough grasses that few other animals will eat, showing remarkable ability to extract nutrition from marginal vegetation. Females are protective of calves but will flee rather than fight if escape is possible. Males are more territorial and aggressive, particularly during rut (autumn), when they mark territory with loud bellows and engage in dramatic neck-wrestling contests. Domesticated Bactrians that have returned to feral life often gather in small groups of five to fifteen individuals. They are long-lived creatures, sometimes reaching fifty years or more, and develop strong social bonds. An animal separated from its herd will search actively, and losing a companion may drive a Bactrian into a state of deep distress that makes it dangerous and unpredictable.

## Combat Strategy

A Bactrian camel is generally passive and prefers flight to fight. Only when cornered, protecting offspring, or defending a herd does it become aggressive. When it does attack, it does so with the force of an animal many times larger than it: the full weight of its body and the power of legs built to traverse mountains. An aggressor should expect powerful kicks aimed at the legs and torso, and bites delivered with surprising force. Multiple Bactrians acting together are a serious threat—they may surround a mounted rider and work to unseat or injure the horse as well as the human. In mountainous terrain, a frightened herd can trigger rockslides or avalanches, making the camel itself incidental to the real danger.

## Attack Methods

### Hind-leg Kick

With a warning bellow and a slight rear, the camel drives both hind legs backward in a devastating double kick. The force is enough to knock a mounted rider from a saddle or topple an unarmored human entirely. These kicks are often preceded by a brief moment of stillness, giving attackers a split second to recognize the danger before the camel moves.

### Neck and Shoulder Slam

The Bactrian swings its long neck with surprising force, using its considerable mass to batter an opponent against its shoulder or slam them directly with the meaty part of its neck. This attack is less precise than a bite but effective against multiple foes in close quarters.

### Bite

When pressed into close combat, a Bactrian will bite with considerable force. Its teeth are blunt enough to crush bone, and its jaw leverage allows it to hang onto an opponent and shake violently.

## Special Abilities

### Cold Resistance and Endurance

A Bactrian camel's thick double coat and efficient metabolism allow it to thrive in frozen environments where other beasts quickly succumb to cold. It requires far less water and food than animals of comparable size, storing energy in its humps with remarkable efficiency. This makes it an invaluable desert or mountain animal, capable of surviving weeks with minimal sustenance.

### Keen Senses and Navigation

Despite appearing placid, Bactrian camels possess excellent hearing and a keen sense of smell. They can navigate by scent and sound alone, finding water sources from miles away and detecting threats long before they become visible. In desert or mountain environments, a herd of these creatures is often more reliable than a human scout.

### Thick Hide

Generations of natural selection for harsh environments have resulted in thick, tough skin overlaid with protective fur. Slashing weapons are notably less effective than piercing attacks, and the animal's sheer bulk gives it significant resilience to blunt trauma.

## Attributes

- **Strength:** 13-18 (1d6+12)

- **Endurance:** 16-21 (1d6+15)

- **Dexterity:** 8-11 (1d4+7)

- **Agility:** 7-10 (1d4+6)

- **Perception:** 9-14 (1d6+8)

- **Aura:** 6-9 (1d4+5)

- **Will:** 10-15 (1d6+9)

- **Reasoning:** 5-8 (1d4+4)

- **Creativity:** 4-7 (1d4+3)
