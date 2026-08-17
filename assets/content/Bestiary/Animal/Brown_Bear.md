---
aliases:
  - Brown Bear
  - creature-brwnbr
tags:
  - animal
name:
  full: Brown Bear
  aliases: []
description: "A colossal, fiercely territorial apex predator of boreal and alpine wilds, the most dangerous large hunter of the northern hemisphere."
id: a9JXetcPtDFkcvRj
img: icons/game-icons/delapouite/bear-head.svg
portrait: images/being/brwnbr-portrait.webp
shortcode: brwnbr
type: creature
package: sohl
sohl:
  kbcat: animal
  archetype: 0
  attributes:
    str: 24
    end: 18
    agl: 12
    per: 14
    snt: 6
    aur: 5
    wil: 13
    rea: 4
    cre: 4
  attrRollFormula:
    str: 1d6+21
    end: 1d6+15
    agl: 1d6+9
    per: 1d6+11
    snt: 1d4+4
    aur: 1d4+3
    wil: 1d6+10
    rea: 1d4+2
    cre: 1d4+2
  body:
    structure:
      zones:
        - name: Head
          shortcode: headzone
          probWeight: 3
        - name: Forelegs
          shortcode: forelegszone
          probWeight: 3
        - name: Torso
          shortcode: torsozone
          probWeight: 6
        - name: Hindquarters
          shortcode: hindqtrzone
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
            blunt: 8
            edged: 7
            piercing: 6
            fire: 8
        - name: Neck
          shortcode: neckloc
          bodyPartCode: headpart
          bleedingSusceptibility: high
          amputability: low
          shockValue: 5
          probWeight: 4
          protectionBase:
            blunt: 8
            edged: 7
            piercing: 6
            fire: 8
        - name: Left Foreleg
          shortcode: lforelegloc
          bodyPartCode: lforelegpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 2
          probWeight: 10
          protectionBase:
            blunt: 8
            edged: 7
            piercing: 6
            fire: 8
        - name: Right Foreleg
          shortcode: rforelegloc
          bodyPartCode: rforelegpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 2
          probWeight: 10
          protectionBase:
            blunt: 8
            edged: 7
            piercing: 6
            fire: 8
        - name: Thorax
          shortcode: thoraxloc
          bodyPartCode: torsopart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 4
          probWeight: 5
          protectionBase:
            blunt: 8
            edged: 7
            piercing: 6
            fire: 8
        - name: Abdomen
          shortcode: abdloc
          bodyPartCode: torsopart
          bleedingSusceptibility: high
          amputability: none
          shockValue: 4
          probWeight: 3
          protectionBase:
            blunt: 8
            edged: 7
            piercing: 6
            fire: 8
        - name: Pelvis
          shortcode: plvsloc
          bodyPartCode: torsopart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 4
          probWeight: 2
          protectionBase:
            blunt: 8
            edged: 7
            piercing: 6
            fire: 8
        - name: Left Hind Leg
          shortcode: lhindlegloc
          bodyPartCode: lhindlegpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 2
          probWeight: 10
          protectionBase:
            blunt: 8
            edged: 7
            piercing: 6
            fire: 8
        - name: Right Hind Leg
          shortcode: rhindlegloc
          bodyPartCode: rhindlegpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 2
          probWeight: 10
          protectionBase:
            blunt: 8
            edged: 7
            piercing: 6
            fire: 8
        - name: Tail
          shortcode: tailloc
          bodyPartCode: tailpart
          bleedingSusceptibility: none
          amputability: high
          shockValue: 1
          probWeight: 10
          protectionBase:
            blunt: 8
            edged: 7
            piercing: 6
            fire: 8
    weight:
      base: 700
      calc: "700"
    reachBase: 0
    bodyScaleBase: 1.66
    personalFatigue: enc + 5
  currentMoveMedium: terrestrial
  movementProfiles:
    - medium: terrestrial
      feetPerRound: 120
      leaguesPerWatch: 5
      encumbrance: floor(wt/4)
      strMod: -5 * floor((str - 10) / 2)
      factors: []
      disabled: false
  defaultCombatGroup: null
  items:
    - shortcode: awar
      type: skill
      system:
        masteryLevelBase: 70
    - shortcode: stlth
      type: skill
      system:
        masteryLevelBase: 65
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
        masteryLevelBase: 52
    - shortcode: shok
      type: skill
      system:
        masteryLevelBase: 76
    - name: Bite
      type: skill
      system:
        shortcode: bite
        subType: combattechnique
        masteryLevelBase: 60
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
            spread: 3
            modifier: 0
          impactBase:
            numDice: 1
            die: 6
            modifier: 7
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
            armorReduction: 1
    - name: Claw
      type: skill
      system:
        shortcode: claw
        subType: combattechnique
        masteryLevelBase: 48
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
            spread: 6
            modifier: 0
          impactBase:
            numDice: 1
            die: 8
            modifier: 6
            aspect: edged
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
---

# Appearance {#appearance}

The earth seems to hold its breath. A mountain of muscle and brown fur emerges from the treeline, each footfall deliberate and heavy. The creature's shoulders rise above your head even as it walks on all fours—a bulk so immense that the forest seems to shrink around it. Its smell precedes it fully: a reek of fish, overturned soil, and something wild and acrid that fills your nostrils and makes your eyes water. When the bear rises on its hind legs, it becomes something impossible—a wall of hair and sinew that blots out the sky. The sound it makes, a deep, chest-rattling roar, resonates through your bones and echoes across the valleys, a declaration that this is its world and you are merely permitted to exist within it.

# Dossier {#dossier}

The brown bear represents apex predation in boreal and alpine regions: a creature of extraordinary size, strength, and predatory intelligence. Standing nine to thirteen feet tall on hind legs and weighing eight hundred to twenty-five hundred pounds, brown bears are the most dangerous large predators in the northern hemisphere. Unlike black bears, brown bears are highly territorial and are far more likely to defend territory and kills against any perceived threat. They are less commonly afraid of humans and more likely to attack on first encounter. Brown bears are solitary animals, typically only gathering during salmon runs or mating season, and they are more aggressive and less afraid than their black cousins. An adult brown bear has no natural predators; it competes only with other bears for resources. Adventurers in northern and alpine regions may encounter brown bears while crossing mountain passes, exploring highlands, fishing salmon-rich streams, or investigating sightings of unusually aggressive predators in settled areas.

## Presentation

A creature of overwhelming physical presence—a massively built quadruped standing on powerful legs, each paw the size of a human hand and armed with claws four to five inches long. The body is thick and muscular, covered in thick fur ranging from tan to dark brown, with longer guard hairs on the shoulders and neck creating a distinctive hump. The head is broad with a pronounced snout longer and more projecting than a black bear's, small dark eyes that miss nothing, and rounded ears set to the sides. The face often bears scars from battles with rival bears—this is normal and marks a successful male. When a brown bear rises on hind legs, it becomes a towering figure that can reach twelve to fourteen feet in height, muscles rippling beneath fur, the full gravity of its physical dominance apparent. The smell is distinctive and carries for considerable distances: a musky, wild odor mixed with earth and the particular scent of whatever food the bear has recently consumed.

## Key Behaviors

Brown bears are fierce, solitary predators with massive territories spanning multiple valleys or coastal regions. A dominant male may control fifteen to fifty square miles of territory, chasing away all competitors including other males and most females. They are seasonal creatures: in summer they feast intensely on salmon, berries, and vegetation; in autumn they gorge themselves preparing for hibernation; in spring they emerge lean and aggressive, having lost a substantial portion of body weight during their winter torpor. During salmon runs, brown bears congregate in tight groups along streams—tolerance increases somewhat, but dominant individuals still claim the best fishing spots and the right to harass subordinates. A female with cubs is the most dangerous bear configuration—the ferocity with which she defends them is absolute. Brown bears have exceptional memories and will remember the locations of previous kills, salmon runs, and territorial boundaries across seasons and years. An individual that has successfully defended a food cache or deterred a human will become progressively bolder, learning that aggression works and escalating threat displays into attacks.

## Combat Strategy

A brown bear's typical response to human presence is territorial aggression. It may charge directly, or it may perform a threat display first: standing tall, huffing and snorting, swatting at nearby vegetation to display its strength. Most bears that display will attack if the threat doesn't back away. The charging attack is meant to overwhelm—the bear accelerates to surprising speed given its mass, attempting to knock opponents down with the force of impact. Once a target is on the ground, the bear uses its weight and jaws to cause maximum damage. Against multiple opponents, a brown bear will focus on the closest threat, attempting to isolate and subdue one individual before dealing with others. A wounded bear becomes more aggressive—pain triggers deeper aggression rather than retreat. Unlike black bears, brown bears do not climb well (their claws are less adapted for climbing) and heavy humans cannot safely escape up trees. A brown bear that has killed a prey animal will defend the carcass ferociously, driving off any and all scavengers and would-be competitors.

## Attack Methods

### Charging Impact

The bear accelerates toward its target with surprising speed, using the full mass of its body as a weapon. The impact is devastating—sufficient to knock armored warriors from their feet and drive smaller individuals several feet backward. The force alone can break ribs and crush internal organs. If the charge lands, the bear often follows immediately with bites or swipes without giving the target time to recover.

### Claw Swipe

Once at close quarters, the bear delivers horizontal slashes with its massive claws, attempting to open deep wounds across the chest, face, or limbs. These attacks can sever arteries and remove entire limbs if sufficiently powerful. The claws are angled slightly downward, which makes overhead attacks against raised arms or shields more likely to slip past defenses.

### Mauling Bite

When an opponent is on the ground or secured within the bear's reach, it bites with devastating force, attempting to seize the head, shoulder, or torso. A bear's bite can crush skull bones and fracture spine—a bear that has secured a kill will shake violently to increase damage and finish wounded prey.

### Blunt-force Pummeling

Using its full weight, the bear may simply throw itself atop a knocked-down opponent, crushing them with body weight and continuing to bite and claw. This attack is less precise but highly effective against armor and multiple opponents.

## Special Abilities

### Overwhelming Strength and Resilience

Brown bears possess not just large muscles but muscle density exceeding most predators. They can flip massive boulders to access grubs, move fallen trees, and physically overpower most animals of equivalent weight. Their bone structure is dense and robust, and wounds that would cripple human-sized creatures are mere minor injuries. They are less vulnerable to blood loss than mammals of similar size, possessing exceptional cardiovascular resilience.

### Keen Senses and Territorial Memory

A brown bear's sense of smell is even more acute than a black bear's—some evidence suggests they can smell food sources from twenty miles away on the wind. Combined with exceptional hearing and a territorial sense that allows them to remember landmarks and previous encounters, this makes brown bears extremely effective predators. They remember productive hunting locations, territorial boundaries, and previous human encounters with remarkable precision.

### Thick Hide and Fur Insulation

The dense fur and thick skin provide substantial protection against slashing weapons and elemental exposure. The fur actually provides some resistance to blunt force trauma, as impact force is distributed across a wider area. Cold and extreme weather have minimal effect on a healthy brown bear due to its metabolic efficiency and insulation.

### Fearlessness and Aggression

Unlike most animals, brown bears do not recognize humans as apex predators to be feared. A brown bear will attack humans with the same tactical calculation it applies to any competitor. This fearlessness, combined with the bear's physical supremacy in most environments, makes brown bears uniquely dangerous. A wounded brown bear will continue attacking rather than retreating; the bear's will to violence does not break easily.

## Attributes

- **Strength:** 22-27 (1d6+21)

- **Endurance:** 16-21 (1d6+15)

- **Agility:** 10-15 (1d6+9)

- **Perception:** 12-17 (1d6+11)

- **Scent:** 5-8 (1d4+4)

- **Aura:** 4-7 (1d4+3)

- **Will:** 11-16 (1d6+10)

- **Reasoning:** 3-6 (1d4+2)

- **Creativity:** 3-6 (1d4+2)
