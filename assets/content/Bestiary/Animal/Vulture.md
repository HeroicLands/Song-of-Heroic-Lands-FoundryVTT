---
aliases:
  - Vulture
tags:
  - animal
  - image-needed
name:
  full: Vulture
  aliases: []
description: "A massive soaring desert scavenger with a nine-foot wingspan, riding thermals for hours to feast wherever death visits the steppe."
id: CDvOpm9UbhRybcAy
img: icons/game-icons/lorc/vulture.svg
portrait: images/being/vulture-portrait.webp
shortcode: vulture
type: being
sohl:
  kbcat: animal
  archetype: 0
  attributes:
    str: 6
    end: 9
    dex: 14
    agl: 15
    per: 18
    aur: 8
    wil: 12
    rea: 8
    cre: 6
  attrRollFormula:
    str: 1d4+3
    end: 1d4+6
    dex: 1d6+10
    agl: 1d6+11
    per: 1d6+14
    aur: 1d4+5
    wil: 1d6+8
    rea: 1d4+5
    cre: 1d4+3
  body:
    structure:
      zones:
        - name: Head
          shortcode: headzone
          probWeight: 1
        - name: Body
          shortcode: torsozone
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
          bodyZoneCode: headzone
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
          bodyZoneCode: hindqtrzone
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
          probWeight: 3
        - name: Right Leg
          shortcode: rlegpart
          bodyZoneCode: hindqtrzone
          roles:
            - locomotor
            - manipulator
          canHoldItem: false
          probWeight: 3
        - name: Tail
          shortcode: tailpart
          bodyZoneCode: hindqtrzone
          roles: []
          canHoldItem: false
          probWeight: 4
      locations:
        - name: Head
          shortcode: headloc
          bodyPartCode: headpart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 5
          probWeight: 3
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
          probWeight: 2
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
      base: 15
      calc: "15"
    reachBase: 0
    bodyScaleBase: 0.67
    personalFatigue: enc + 5
  currentMoveMedium: terrestrial
  movementProfiles:
    - medium: aerial
      feetPerRound: 90
      leaguesPerWatch: 8
      encumbrance: floor(wt/4)
      strMod: -5 * floor((str - 10) / 2)
      factors: []
      disabled: false
    - medium: terrestrial
      feetPerRound: 25
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
        masteryLevelBase: 75
    - shortcode: stlth
      type: skill
      system:
        masteryLevelBase: 65
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
        masteryLevelBase: 64
    - shortcode: shok
      type: skill
      system:
        masteryLevelBase: 20
    - name: Beak Strike
      type: skill
      system:
        shortcode: beak
        subType: combattechnique
        masteryLevelBase: 52
        combatCategory: melee
        impairedByRoles:
          - manipulator
        strikeMode:
          type: melee
          shortcode: beak
          name: Beak Strike
          minParts: 1
          assocSkillCode: null
          attack:
            disabled: false
            spread: 1
            modifier: 0
          impactBase:
            numDice: 1
            die: 6
            modifier: -2
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

They circle so high they are barely more than specks — black crosses inscribed against a sky the color of bleached bone, turning in slow, patient spirals that tighten imperceptibly as the hours pass. You have been watching them since morning and they have been watching you longer. There are six of them now where there were two at dawn, drawn from miles in every direction by whatever signal passes between them — a tilt of wings, a shift in the spiral, some vocabulary of flight that communicates the presence of opportunity below. The nearest one descends close enough to reveal details: a wingspan wider than a man is tall, primary feathers spread like dark fingers against the thermals, and a head that is naked, wrinkled, and ugly — stripped of feathers to prevent the fouling that comes from reaching deep into carcasses. The eyes are surprisingly calm, almost gentle, set in that grotesque bald head with an expression that suggests infinite patience. It is in no hurry. It has learned that everything, eventually, lies still.

# Dossier {#dossier}

The Vulture is the great scavenger of the Khazryn Desert — a massive soaring bird found wherever death occurs across the steppe, desert margins, and caravan routes of central Ankaris. An adult vulture weighs fifteen to twenty-five pounds but carries a wingspan of seven to nine feet, an enormous sail of dark feathers that allows the bird to ride thermals for hours without a single wingbeat. Vultures are obligate scavengers — they do not kill their own prey but locate and consume carrion, performing an ecological function without which the desert would be choked with rotting carcasses and the disease they breed. They locate food primarily through extraordinary eyesight — a vulture circling at altitude can spot a dead gazelle from miles away — and through observation of other vultures, creating a cascading information network where the descent of one bird draws others from across the horizon. In Khazryn culture, vultures occupy an ambiguous spiritual position. They are associated with death and the transition between worlds, respected for their role in returning flesh to the earth, but also feared as omens — a gathering of vultures over a caravan route is read as prophecy of disaster, and their presence above a settlement is cause for unease. For adventurers, vultures are a constant presence in the Khazryn — circling overhead during desert crossings, gathered in grotesque congregations at kill sites and battlefields, and roosting on cliff faces near oases where they wait for the desert to provide.

## Presentation

A very large bird with a heavy body, broad wings, and a distinctive silhouette — the small, naked head projecting forward from a ruff of pale feathers at the base of the neck, the wings held flat or in a shallow dihedral during soaring flight, the short tail fanned for steering. The plumage is dark brown to black across the wings and body, with paler feathers on the underside and a conspicuous ruff of white or cream around the neck. The head and upper neck are bare — covered in wrinkled, pinkish-gray skin rather than feathers — an adaptation that prevents the fouling that would come from plunging the head into carcasses. The beak is large, hooked, and powerful, designed for tearing tough hide and sinew rather than killing. The feet are relatively weak compared to eagles — vultures are not built for seizing prey but for standing on carcasses and bracing against resistance while tearing flesh. The eyes are dark and remarkably sharp, set in that naked, crinkled face with an expression of calm assessment. On the ground, vultures are ungainly and awkward, hopping and shuffling with wings half-spread. In the air, they are among the most graceful and efficient fliers in the world, riding thermals for hours with minimal effort.

## Key Behaviors

Vultures are social scavengers, roosting communally on cliff faces and in dead trees, and gathering in groups at carcasses. They are primarily diurnal, launching from roosts shortly after dawn when thermals begin to develop and soaring until late afternoon. A vulture's day consists almost entirely of searching for food — circling at altitude, scanning the ground below, and watching other vultures for signs that food has been located. When one vulture begins to descend, others converge from miles around, creating the characteristic spiral of circling birds that marks a carcass location. At a carcass, vultures establish a rough dominance hierarchy based on size and aggression, with the largest individuals feeding first and smaller birds waiting at the periphery. Feeding is frantic and competitive — vultures gorge as rapidly as possible, filling their crops with several pounds of meat in minutes, because time at a carcass means exposure to larger predators that may arrive to claim the kill. Vultures are surprisingly long-lived, with individuals surviving decades, and they form loose social bonds within roosting colonies. They are silent in flight but produce hissing, grunting, and bill-clattering sounds at feeding sites during competitive interactions.

## Combat Strategy

Vultures are not combatants and will flee from any serious threat. Their defensive responses are limited to aggressive posturing — spreading wings, hissing, and lunging with the beak — against rivals at a carcass or against smaller animals attempting to steal food. When threatened by a predator or human at a feeding site, vultures will typically take flight, though gorged birds that have eaten heavily may be temporarily unable to fly and will instead retreat on foot with an ungainly, shuffling run. A vulture's only genuinely dangerous defensive behavior occurs when cornered — the bird may strike with its heavy beak, which is capable of tearing flesh and inflicting painful wounds, though this is a last resort. Vultures also employ a particularly unpleasant defensive mechanism: when stressed or threatened, they may regurgitate their stomach contents at the aggressor, producing a stream of partially digested carrion that is both revolting and mildly caustic.

## Attack Methods

### Beak Strike

A defensive attack only. The vulture lunges with its heavy, hooked beak, targeting hands, faces, and eyes. The beak is designed for tearing tough hide and can inflict deep, ragged wounds, but the vulture lacks the foot strength and killing instinct of a true raptor. This attack is reserved for situations where the vulture cannot flee.

### Defensive Regurgitation

When cornered or severely stressed, a vulture vomits the contents of its crop at the threat — a stream of partially digested, strongly acidic carrion that is viscerally repulsive and can cause chemical burns to eyes and exposed skin. This behavior also lightens the bird for emergency takeoff.

## Special Abilities

### Supreme Eyesight

The vulture possesses the sharpest distance vision of any creature in the Khazryn. From soaring altitude — thousands of feet — a vulture can detect a carcass the size of a gazelle on the ground below and can observe the behavior of other vultures across distances measured in miles. This eyesight functions as an early warning system for desert travelers: vultures circling and descending indicate a carcass, which may indicate predator activity, a recent battle, or an abandoned campsite. Experienced Khazryn nomads read vulture behavior as fluently as they read tracks.

### Thermal Soaring

Vultures are masters of energy-efficient flight, exploiting rising columns of warm air to gain altitude and then gliding for miles without a single wingbeat. A vulture can cover enormous distances — fifty miles or more in a day — while expending almost no energy, an adaptation that allows it to search vast areas of desert for the widely scattered carcasses on which it depends. This efficiency means vultures can appear over a fresh kill within minutes of death, seemingly materializing from empty sky.

### Information Network

Vultures watch each other. When one bird begins to descend, others that can see it adjust their flight paths to converge on the same location. This creates a cascading effect where vultures across dozens of miles are drawn to a single carcass, each bird following the movements of its nearest neighbor. For desert travelers, this network is a readable map of death — the convergence point of vulture spirals marks the location of carrion with reliable accuracy.

### Carrion Immunity

Vultures possess an extraordinary resistance to pathogens. Their stomach acid is potent enough to neutralize anthrax, botulism, and other toxins that would kill most other animals. They can consume meat in advanced stages of decomposition without ill effect, filling an ecological niche that no other large animal can occupy. This immunity extends to a degree to the diseases carried by the parasites that infest carcasses, making vultures nearly immune to the plagues that follow battlefields, famines, and mass die-offs.

## Attributes

- **Strength:** 4-7 (1d4+3)

- **Endurance:** 7-10 (1d4+6)

- **Dexterity:** 11-16 (1d6+10)

- **Agility:** 12-17 (1d6+11)

- **Perception:** 15-20 (1d6+14)

- **Aura:** 6-9 (1d4+5)

- **Will:** 9-14 (1d6+8)

- **Reasoning:** 6-9 (1d4+5)

- **Creativity:** 4-7 (1d4+3)
