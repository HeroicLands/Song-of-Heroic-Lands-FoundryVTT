---
tags:
  - animal
  - image-needed
name:
  full: Condor
  aliases: []
description: "A massive soaring vulture with a ten-foot wingspan, sacred to highland faith, spotting carrion from staggering altitudes above the western peaks."
id: IlgMSpMhh6Hel8gD
img: icons/game-icons/lorc/vulture.svg
portrait: images/being/condor-portrait.webp
shortcode: condor
type: being
sohl:
  kbcat: animal
  archetype: 0
  attrRollFormula:
    str: 1d4+4
    end: 1d6+8
    dex: 1d4+7
    agl: 1d6+12
    per: 1d6+13
    aur: 1d6+8
    wil: 1d4+6
    rea: 1d4+4
    cre: 1d4+3
  body:
    structure:
      zones:
        - name: Head
          shortcode: headzone
          probWeight: 1
        - name: Left Wing
          shortcode: lwingzone
          probWeight: 1
        - name: Body
          shortcode: torsozone
          probWeight: 2
        - name: Right Wing
          shortcode: rwingzone
          probWeight: 1
        - name: Hindquarters
          shortcode: hindqtrzone
          probWeight: 1
      parts:
        - name: Head
          shortcode: headpart
          bodyZoneCode: headzone
          roles:
            - vital
            - manipulator
          canHoldItem: false
          probWeight: 10
        - name: Left Wing
          shortcode: lwingpart
          bodyZoneCode: lwingzone
          roles:
            - locomotor
          canHoldItem: false
          probWeight: 10
        - name: Body
          shortcode: torsopart
          bodyZoneCode: torsozone
          roles:
            - core
          canHoldItem: false
          probWeight: 10
        - name: Right Wing
          shortcode: rwingpart
          bodyZoneCode: rwingzone
          roles:
            - locomotor
          canHoldItem: false
          probWeight: 10
        - name: Left Leg
          shortcode: llegpart
          bodyZoneCode: hindqtrzone
          roles:
            - locomotor
            - manipulator
          canHoldItem: false
          probWeight: 5
        - name: Right Leg
          shortcode: rlegpart
          bodyZoneCode: hindqtrzone
          roles:
            - locomotor
            - manipulator
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
          probWeight: 4
          protectionBase:
            blunt: 2
            edged: 1
            piercing: 0
            fire: 2
        - name: Neck
          shortcode: neckloc
          bodyPartCode: headpart
          bleedingSusceptibility: high
          amputability: low
          shockValue: 5
          probWeight: 6
          protectionBase:
            blunt: 2
            edged: 1
            piercing: 0
            fire: 2
        - name: Left Wing
          shortcode: lwingloc
          bodyPartCode: lwingpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 1
          probWeight: 10
          protectionBase:
            blunt: 2
            edged: 1
            piercing: 0
            fire: 2
        - name: Thorax
          shortcode: thoraxloc
          bodyPartCode: torsopart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 4
          probWeight: 6
          protectionBase:
            blunt: 2
            edged: 1
            piercing: 0
            fire: 2
        - name: Abdomen
          shortcode: abdloc
          bodyPartCode: torsopart
          bleedingSusceptibility: high
          amputability: none
          shockValue: 4
          probWeight: 4
          protectionBase:
            blunt: 2
            edged: 1
            piercing: 0
            fire: 2
        - name: Right Wing
          shortcode: rwingloc
          bodyPartCode: rwingpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 1
          probWeight: 10
          protectionBase:
            blunt: 2
            edged: 1
            piercing: 0
            fire: 2
        - name: Left Leg
          shortcode: llegloc
          bodyPartCode: llegpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 2
          probWeight: 10
          protectionBase:
            blunt: 2
            edged: 1
            piercing: 0
            fire: 2
        - name: Right Leg
          shortcode: rlegloc
          bodyPartCode: rlegpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 2
          probWeight: 10
          protectionBase:
            blunt: 2
            edged: 1
            piercing: 0
            fire: 2
        - name: Tail
          shortcode: tailloc
          bodyPartCode: tailpart
          bleedingSusceptibility: none
          amputability: high
          shockValue: 1
          probWeight: 10
          protectionBase:
            blunt: 2
            edged: 1
            piercing: 0
            fire: 2
    weight:
      base: 25
      calc: "25"
    reachBase: 0
    bodyScaleBase: 0.75
    personalFatigue: enc + 5
  currentMoveMedium: terrestrial
  movementProfiles:
    - medium: aerial
      feetPerRound: 100
      leaguesPerWatch: 10
      encumbrance: floor(wt/4)
      strMod: -5 * floor((str - 10) / 2)
      factors: []
      disabled: false
    - medium: terrestrial
      feetPerRound: 20
      leaguesPerWatch: 1
      encumbrance: floor(wt/4)
      strMod: -5 * floor((str - 10) / 2)
      factors: []
      disabled: false
  defaultCombatGroup: null
  items:
    - { shortcode: str, type: attribute, system: { scoreBase: 7 } }
    - { shortcode: end, type: attribute, system: { scoreBase: 12 } }
    - { shortcode: dex, type: attribute, system: { scoreBase: 10 } }
    - { shortcode: agl, type: attribute, system: { scoreBase: 16 } }
    - { shortcode: per, type: attribute, system: { scoreBase: 17 } }
    - { shortcode: aur, type: attribute, system: { scoreBase: 12 } }
    - { shortcode: wil, type: attribute, system: { scoreBase: 9 } }
    - { shortcode: rea, type: attribute, system: { scoreBase: 7 } }
    - { shortcode: cre, type: attribute, system: { scoreBase: 6 } }
    - { shortcode: awar, type: skill, system: { masteryLevelBase: 65 } }
    - { shortcode: stlth, type: skill, system: { masteryLevelBase: 60 } }
    - { shortcode: sprt, type: mysticalability, system: { masteryLevelBase: 30 } }
    - { shortcode: init, type: skill, system: { masteryLevelBase: 32 } }
    - { shortcode: dge, type: skill, system: { masteryLevelBase: 64 } }
    - { shortcode: shok, type: skill, system: { masteryLevelBase: 25 } }
    - name: Beak Tear
      type: skill
      system:
        shortcode: beak
        subType: combattechnique
        masteryLevelBase: 54
        combatCategory: melee
        impairedByRoles:
          - manipulator
        strikeMode:
          type: melee
          shortcode: beak
          name: Beak Tear
          minParts: 1
          assocSkillCode: null
          attack:
            disabled: false
            spread: 1
            modifier: 0
          impactBase:
            numDice: 1
            die: 6
            modifier: -1
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
    - name: Wing Buffet
      type: skill
      system:
        shortcode: ram
        subType: combattechnique
        masteryLevelBase: 47
        combatCategory: melee
        impairedByRoles:
          - core
        strikeMode:
          type: melee
          shortcode: ram
          name: Wing Buffet
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

You notice the shadow first — a cruciform darkness sliding across the mountainside with impossible slowness, too large to be any bird you know, too steady to be a cloud. You look up, shielding your eyes against the highland sun, and the scale of the thing becomes apparent only by degrees. The wingspan is enormous — ten feet, perhaps more — held rigidly extended in a posture of absolute stillness as the bird rides a thermal updraft without a single wingbeat. The body between those vast wings seems almost incidental: compact, black-feathered, hunched forward in a posture that speaks of patience measured in geological time. The head is bare — wrinkled, dark red skin stretched over a skull that seems too small for the body it commands — and a ruff of white feathers circles the neck like a ceremonial collar. The bird tilts, banks, adjusts an invisible rudder, and sweeps across the face of the cliff with silent authority. The Ki'ichek say the condor carries the souls of the dead to the upper world. Watching it ride the wind above the peaks with that vast, unhurried stillness, you understand why they believe it. Nothing that moves with such certainty through the empty sky could be concerned with the affairs of the living.

# Dossier {#dossier}

The Condor is the largest flying bird in [[doc-kchchkcntnnt|K'ich'chik Continent]] and the most sacred creature of the highland religion — a massive soaring vulture with a wingspan exceeding ten feet that inhabits the highest mountain ranges and deepest canyons of the western continent. Weighing twenty to thirty-three pounds, the condor is a carrion feeder that locates carcasses from extraordinary altitudes using eyesight that can detect a dead animal from miles away. In the [[affiliation-itzanpnthn|Itzáni Pantheon]] cosmology, the condor is the messenger between the mortal world and the upper realm of the sun — the being that carries the dead to their celestial rest and returns with omens for the living. Condor imagery appears on temple walls, ceremonial textiles, and the headdresses of high priests. Condor feathers are sacred objects, and deliberate killing of a condor is one of the most serious religious offenses in Ki'ichek law — punishable by sacrifice. The birds are long-lived, potentially surviving for decades, and breeding pairs are known to individual communities across generations. A condor circling above a settlement is read as an omen, and the direction, duration, and altitude of its flight are interpreted by temple astronomers. Adventurers in highland K'ich'chik encounter condors as constant presences in the mountain sky — distant, enormous, silent, watching.

## Presentation

The condor is a bird of stark, austere grandeur. The plumage is predominantly black, deep and glossy, with striking white panels on the upper wings that are visible only in flight — creating a dramatic flash of contrast as the bird banks and turns. The head and neck are bare of feathers, covered in wrinkled skin that ranges from dark red to purplish-black, with a fleshy comb or caruncle on the crown of males. This bare skin serves a thermoregulatory function but gives the bird an ancient, almost reptilian appearance. A thick ruff of white feathers encircles the base of the neck like a collar. The beak is large, hooked, and powerful — designed for tearing open tough hides that other scavengers cannot breach. The eyes are sharp and intelligent, reddish in males. The feet are large but flat, with blunt claws adapted for walking rather than gripping — unlike eagles and hawks, the condor is not a grasping predator. The wingspan is the defining feature: when fully extended, it exceeds ten feet and can approach eleven, making the condor's silhouette unmistakable against the sky. In flight, the condor holds its wings rigidly extended and soars on thermals for hours without a single wingbeat, covering vast distances with minimal effort.

## Key Behaviors

Condors are social for vultures, roosting communally on cliff ledges and feeding in hierarchical groups at carcasses. They are obligate scavengers — they do not kill prey but locate carrion from extreme altitudes using their extraordinary eyesight, then descend in spiraling circles that serve as signals to other condors across enormous distances. A descending condor attracts others, and a major carcass can draw dozens of birds from across an entire mountain range. At the carcass, a strict dominance hierarchy determines feeding order, with the largest males eating first. Condors are monogamous and breed slowly — a single egg every one to two years — which makes their populations fragile and their individual lives culturally significant. They are long-lived birds, and highland communities track the lifespans of local breeding pairs across human generations. Condors roost on high, inaccessible cliff ledges, often the same sites used for centuries, and the accumulation of droppings, feathers, and bone fragments at these sites makes them identifiable — and sometimes contested, as the feathers and bones are sacred materials.

## Combat Strategy

The condor is not a combative animal. Its beak can deliver a powerful bite capable of tearing through tough hide, but it uses this ability for feeding, not fighting. At carcasses, condors establish dominance through threat displays — spreading wings, hissing, and lunging — rather than physical combat. If threatened by a predator or human, the condor's primary defense is simply to take flight, and once airborne it is beyond the reach of any ground-based threat. A cornered condor that cannot take flight will strike with its beak and buffet with its wings, but this is desperation, not strategy.

## Attack Methods

### Beak Tear

The heavy, hooked beak delivers a tearing bite capable of ripping through tough animal hide. Against human flesh, the beak can cause deep, ragged wounds. This is a feeding adaptation pressed into defensive service.

### Wing Buffet

The enormous wings, driven by powerful flight muscles, can deliver stunning blows at close range. The leading edge of the wing is bony and can bruise or disorient an attacker.

## Special Abilities

### Thermal Mastery

The condor is the supreme soaring bird — capable of riding thermal updrafts for hours without a single wingbeat, covering vast distances with almost no energy expenditure. It can ascend to altitudes where the air is too thin for most birds, surveying enormous swaths of territory from heights that render it invisible to ground observers. This ability makes the condor an unparalleled aerial scout and explains its association with the upper world in Ki'ichek religion.

### Carrion Detection

The condor can detect a carcass from miles away at altitude, using eyesight refined for detecting the subtle signs of death on a landscape — the stillness of a fallen animal, the congregation of smaller scavengers, the dark stain of blood on rock. This ability, combined with its soaring range, means that a condor's descent is itself a signal — to other condors, to ground scavengers, and to Ki'ichek watchers — that something has died.

### Sacred Immunity

In K'ich'chik, the condor's protected religious status creates a practical constraint identical to the crane's in Tānvür or the peacock's in Vedyara: harming a condor is a capital religious offense. Condor roosting sites are sacred ground, condor feathers found naturally are the property of the temple, and interference with nesting condors can provoke armed intervention from temple guardians. A condor that establishes a roost on a building, bridge, or fortification creates an immediate jurisdictional crisis.

## Attributes

- **Strength:** 5-8 (1d4+4) — Modest; beak is powerful for feeding but the bird is not built for combat
- **Endurance:** 9-14 (1d6+8) — Extraordinary soaring stamina; can remain aloft for an entire day
- **Dexterity:** 8-11 (1d4+7) — Adequate in air; clumsy on ground
- **Agility:** 13-18 (1d6+12) — Supreme aerial agility; thermal navigation is an art form
- **Perception:** 14-19 (1d6+13) — Extraordinary high-altitude vision; detects carcasses from miles
- **Aura:** 9-14 (1d6+8) — Sacred messenger of the upper world; profound religious significance
- **Will:** 7-10 (1d4+6) — Patient and persistent; not aggressive
- **Reasoning:** 5-8 (1d4+4) — Social intelligence within feeding hierarchy
- **Creativity:** 4-7 (1d4+3) — Limited
