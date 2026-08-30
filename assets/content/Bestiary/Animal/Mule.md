---
aliases:
  - Mule
tags:
  - animal
name:
  full: Mule
  aliases: []
description: "A sturdy donkey-horse hybrid combining a donkey's compact toughness with a horse's muscular agility, a hardy pack and draft animal of surefooted temperament."
id: aquEJHnE8u8I9pur
img: icons/game-icons/skoll/donkey.svg
portrait: images/being/mule-portrait.webp
shortcode: mule
type: being
sohl:
  kbcat: animal
  archetype: 0
  attributes:
    str: 25
    end: 12
    agl: 12
    per: 17
    snt: 3
    aur: 4
    wil: 12
    rea: 5
    cre: 6
  attrRollFormula:
    str: 1d6+22
    end: 1d6+9
    agl: 1d6+9
    per: 1d6+14
    snt: 1d4+1
    aur: 1d4+2
    wil: 1d6+9
    rea: 1d4+3
    cre: 1d4+4
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
            blunt: 4
            edged: 3
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
            blunt: 4
            edged: 3
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
            blunt: 4
            edged: 3
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
            blunt: 4
            edged: 3
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
            blunt: 4
            edged: 3
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
            blunt: 4
            edged: 3
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
            blunt: 4
            edged: 3
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
            blunt: 4
            edged: 3
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
            blunt: 4
            edged: 3
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
            blunt: 4
            edged: 3
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
            blunt: 4
            edged: 3
            piercing: 1
            fire: 3
    weight:
      base: 900
      calc: "900"
    reachBase: 0
    bodyScaleBase: 1.71
    personalFatigue: enc + 5
  currentMoveMedium: terrestrial
  movementProfiles:
    - medium: terrestrial
      feetPerRound: 120
      leaguesPerWatch: 7
      encumbrance: floor(wt/4)
      strMod: -5 * floor((str - 10) / 2)
      factors:
        - scope: topography
          key: moderate
          mode: add
          textValue: "0"
        - scope: topography
          key: steep
          mode: add
          textValue: "0"
        - scope: topography
          key: extreme
          mode: add
          textValue: "-2"
        - scope: surface_cover
          key: alpine
          mode: add
          textValue: "0"
        - scope: surface_cover
          key: barren
          mode: add
          textValue: "-1"
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
        masteryLevelBase: 56
    - shortcode: sprt
      type: mysticalability
      system:
        masteryLevelBase: 24
    - shortcode: init
      type: skill
      system:
        masteryLevelBase: 27
    - shortcode: dge
      type: skill
      system:
        masteryLevelBase: 62
    - shortcode: shok
      type: skill
      system:
        masteryLevelBase: 39
    - name: Kick
      type: skill
      system:
        shortcode: kick
        subType: combattechnique
        masteryLevelBase: 60
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
            modifier: 4
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
        masteryLevelBase: 48
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
            die: 4
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

The mule stands with quiet dignity, its lean, muscular body built low and compact. Large ears rotate constantly, tracking sounds you cannot hear, and its intelligent dark eyes watch with the wariness of something that has learned not to trust easily. When it shifts its weight, you see the power coiled in its compact frame—not the showy strength of a horse, but something more pragmatic and enduring. A faint dust rises from its rough coat as it moves, and its very posture suggests an animal utterly practical and utterly unmoved by pretension or panic.

# Dossier {#dossier}

The mule is a hybrid animal, the offspring of a male donkey and a female horse, measuring 4-5 feet at the shoulder and weighing 450-600 pounds. The body combines the compact, sturdy build of a donkey with the muscular frame and agility of a horse. The coat is short and coarse, typically colored in shades of bay, gray, or sorrel, with a lighter colored muzzle. The ears are long and mobile, larger and more mobile than a horse's, and the tail is somewhat sparse and donkey-like. The head is proportionally larger than a horse's, with a straight profile and intelligent dark eyes.

## Presentation

Mules display an unusual physical profile, combining equine and asinine traits in a unique way. The head is broad and angular, with a pronounced jaw and large, expressive ears capable of extreme mobility. The eyes are dark, intelligent, and set to allow nearly 360-degree vision. The body is compact and heavily muscled, with a deep chest and powerful hindquarters. The legs are sturdy and relatively short, ending in tough, hard hooves rarely in need of shoes. The tail is sparse compared to a horse's, and the mane is coarse and short. The coat is rough and coarse compared to a horse's finer hair. Individual mules often bear calluses, scars, and brands from years of work.

## Key Behaviors

Mules are hardy, intelligent animals with exceptional memory and judgment. They are used extensively for packing, carrying supplies over difficult and rough terrain where horses would struggle. Mules are remarkably surefootedted and will refuse to cross truly dangerous ground, making them safer partners than horses in treacherous environments. They are less temperamental than donkeys and more independent than horses, making their own judgments about situations rather than blindly following commands. They form strong bonds with handlers and other pack animals they have worked with. They are capable of working long hours on minimal food and water, and have exceptionally long working lives.

## Combat Strategy

Mules are not combat animals and strongly prefer to flee or retreat from danger. When cornered or when defending young, they become surprisingly dangerous, delivering powerful kicks with their hind legs and biting if opponents come within reach. A mule's kick can break bones or disarm opponents. They do not charge or pursue; instead, they create distance and, given opportunity, escape. They will repeatedly kick in the direction of a threat if unable to flee.

## Attack Methods

### Hind-Leg Kick

When threatened or cornered, the mule delivers a powerful kick with both hind legs simultaneously, capable of breaking bones or shattering light armor; these kicks are delivered when the opponent is at medium range and can be devastating if both land.

### Defensive Bite

If grappled or if an opponent comes within reach, the mule will bite—not with the killing intent of a predator, but with the defensive fury of a prey animal; the bite can cause serious injury and infection.

## Special Abilities

### Sure-Footed

The mule's exceptional sense of balance and hoof placement grants it bonuses to checks to avoid slipping, falling, or being knocked prone; mules will refuse to cross truly treacherous ground and can navigate terrain that would be impassable for horses.

### Hybrid Endurance

The mule combines the strength and speed of the horse with the endurance and durability of the donkey; it can work long hours with minimal food or water, gains bonuses to endurance checks, and can carry loads that would exhaust horses.

### Intelligent Judgment

Mules have excellent memories and make independent judgments about situations; a mule cannot be forced to cross truly dangerous terrain or to perform obviously suicidal actions, and they often warn handlers to danger through refusal or agitation.

## Attributes

- **Strength:** 23-28 (1d6+22)

- **Endurance:** 10-15 (1d6+9)

- **Agility:** 10-15 (1d6+9)

- **Perception:** 15-20 (1d6+14)

- **Scent:** 2-5 (1d4+1)

- **Aura:** 3-6 (1d4+2)

- **Will:** 10-15 (1d6+9)

- **Reasoning:** 4-7 (1d4+3)

- **Creativity:** 5-8 (1d4+4)
