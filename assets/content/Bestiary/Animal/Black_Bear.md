---
aliases:
  - Black Bear
  - creature-blckbr
tags:
  - animal
name:
  full: Black Bear
  aliases: []
description: "A strong, surprisingly intelligent forest predator and scavenger of temperate woods that usually avoids humans but turns dangerous when provoked."
id: 8ZGl0AAQhCMIrz8h
img: icons/game-icons/delapouite/bear-head.svg
portrait: images/being/blckbr-portrait.webp
shortcode: blckbr
type: creature
package: sohl
sohl:
  kbcat: animal
  archetype: 0
  attributes:
    str: 16
    end: 12
    agl: 13
    per: 14
    snt: 6
    aur: 4
    wil: 12
    rea: 5
    cre: 5
  attrRollFormula:
    str: 1d6+13
    end: 1d6+9
    agl: 1d6+10
    per: 1d6+11
    snt: 1d4+4
    aur: 1d4+2
    wil: 1d6+9
    rea: 1d4+3
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
          probWeight: 4
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
      base: 300
      calc: "300"
    reachBase: 0
    bodyScaleBase: 1.28
    personalFatigue: enc + 5
  currentMoveMedium: terrestrial
  movementProfiles:
    - medium: terrestrial
      feetPerRound: 100
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
        masteryLevelBase: 65
    - shortcode: stlth
      type: skill
      system:
        masteryLevelBase: 65
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
        masteryLevelBase: 52
    - shortcode: shok
      type: skill
      system:
        masteryLevelBase: 56
    - name: Bite
      type: skill
      system:
        shortcode: bite
        subType: combattechnique
        masteryLevelBase: 65
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
            spread: 2
            modifier: 0
          impactBase:
            numDice: 1
            die: 6
            modifier: 3
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
            armorReduction: 1
    - name: Claw
      type: skill
      system:
        shortcode: claw
        subType: combattechnique
        masteryLevelBase: 52
        combatCategory: melee
        impairedByRoles:
          - manipulator
        strikeMode:
          type: melee
          shortcode: claw
          name: Claw
          minParts: 1
          assocSkillCode: null
          attack:
            disabled: false
            spread: 4
            modifier: 0
          impactBase:
            numDice: 1
            die: 8
            modifier: 2
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

The smell reaches you first—a sharp, musky odor mixed with the reek of overturned soil and crushed berries. The creature emerges from the tree line with deceptive grace, its glossy black coat catching dappled sunlight. Its head swings toward you, and you see small, intelligent eyes set above a blunt muzzle. The forest floor trembles with each heavy-footed step, and when the bear rises onto its hind legs, muscles ripple beneath its dense fur. The sound it makes—a low, rumbling huffing—vibrates in your chest.

# Dossier {#dossier}

The black bear is a forest predator and scavenger of remarkable strength and surprising intelligence. Standing five to six feet tall on its hind legs and weighing four hundred to six hundred pounds, it is one of the most common large carnivores adventurers will encounter in temperate and boreal regions. Despite their fearsome reputation, black bears are opportunistic and typically avoid humans when they can. However, they are fiercely protective of food sources and offspring, making them dangerous when startled, hungry, or defending cubs. A bear that has learned humans carry food becomes increasingly bold and increasingly dangerous. Adventurers may encounter them in forests, near campsites, around berry-rich clearings, or at carrion sites.

## Presentation

A powerfully built mammal standing on short, sturdy legs. Its coat is thick and glossy, typically jet black but sometimes dark brown or cinnamon. The head is broad with rounded ears set midway back, and its face tapers to a shorter muzzle than most canines. Small, dark eyes convey surprising intelligence. Its paws are large, each equipped with five long, curved claws—formidable tools for climbing, digging, and combat. Despite its mass, the bear moves with a deceptive grace, capable of surprising speed in short bursts. The most distinctive feature is the character of the animal's scent, a complex musk that fills an entire area when the bear is agitated.

## Key Behaviors

Black bears are primarily solitary animals, though females with cubs are occasionally seen in small family groups. They are prolific foragers, capable of deriving sustenance from dozens of different food sources: berries, nuts, roots, insects, fish, small mammals, and carrion. This dietary flexibility allows them to thrive in diverse environments. They have exceptional memories and learn quickly—a bear that discovers a rich food source will return to it repeatedly, and a bear that has stolen food from humans will continue attempting to do so until the behavior is harshly punished. Black bears are stronger swimmers than brown bears and will spend considerable time in water during salmon runs or in hot weather. They build dens for winter hibernation, choosing protected cave sites or hollow trees, and enter a torpor state that lasts several months. Cubs remain with their mother for one to two years, learning essential survival skills, and mothers are extraordinarily protective during this period. Any perceived threat to cubs will trigger an immediate and savage response.

## Combat Strategy

A black bear's strategy depends on context. If cornered or defending food or cubs, it will attack with overwhelming ferocity, using its weight and strength to overpower and immobilize threats. Against multiple opponents, it may charge the closest one with intent to seize and crush, ignoring other attackers temporarily. It will rear onto its hind legs to maximize reach and striking power, then crash down in powerful swipes. Bears are also excellent climbers despite their mass—a wounded or threatened bear may retreat up a tree to escape threats or ambush from an elevated position. In forests, bears use terrain to their advantage, attacking from behind obstacles or using dense vegetation to conceal approach.

## Attack Methods

### Claw Swipe

The bear rises slightly and delivers a devastating horizontal slash with one foreleg, its claws raking across multiple targets or concentrating force on a single opponent. The force is sufficient to penetrate armor and cause severe lacerations. A bear skilled in combat (usually from repeated encounters with humans) will often lead with this attack, clearing space and assessing the opponent's defenses.

### Mauling Charge

The bear lowers its head and charges forward with full weight behind it, intending to knock the target down and maul it while it's prone. The impact alone can break bones, and once an opponent is on the ground, the bear uses its weight and claws to inflict maximum damage.

### Bite

When at close quarters, the bear snaps with powerful jaws, attempting to seize a limb, shoulder, or head. Its bite force is sufficient to crush bone and tear large amounts of meat. A bear that has subdued an opponent may bite and shake violently, multiplying the damage.

## Special Abilities

### Exceptional Strength and Resilience

Black bears possess powerful muscles and dense bone structure. They are capable of moving boulders weighing hundreds of pounds to access roots and insects beneath, and their physical resilience allows them to absorb impacts that would disable human-sized opponents. Blunt force trauma is notably less effective than cutting or piercing attacks.

### Keen Senses

A bear's sense of smell is legendary—it can detect food sources miles away on the wind and can distinguish scents that would be undetectable to humans. Its hearing is equally acute, capable of detecting the crackle of a campfire or the rustle of prey in undergrowth. Vision is the weakest sense, but it remains adequate for detecting movement and estimating distance.

### Climbing and Swimming

Despite their mass, black bears are surprisingly agile climbers. They can ascend trees to pursue prey, escape threats, or forage for nuts and insects. They are also strong swimmers and will pursue prey into water. A wounded bear may retreat into water to cool its body and clean wounds, then hunt from the shoreline or mid-stream.

### Thick Hide and Fat Layer

A bear's skin is tough and its body is insulated by a thick layer of subcutaneous fat that provides both thermal protection and trauma resistance. Slashing weapons are less effective than piercing attacks, and the fat layer provides some resistance to blood loss.

## Attributes

- **Strength:** 14-19 (1d6+13)

- **Endurance:** 10-15 (1d6+9)

- **Agility:** 11-16 (1d6+10)

- **Perception:** 12-17 (1d6+11)

- **Scent:** 5-8 (1d4+4)

- **Aura:** 3-6 (1d4+2)

- **Will:** 10-15 (1d6+9)

- **Reasoning:** 4-7 (1d4+3)

- **Creativity:** 4-7 (1d4+3)
