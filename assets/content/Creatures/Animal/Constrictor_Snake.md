---
aliases:
    - Constrictor Snake
    - creature-cnstrctr
tags:
    - animal
name:
    full: Constrictor Snake
    aliases: []
id: ypPZpDVq1apz4CiH
img: icons/game-icons/lorc/snake.svg
portrait: images/cnstrctr.webp
shortcode: cnstrctr
type: creature
package: sohl
sohl:
    kbcat: animal
    archetype: 0
    attributes:
        str: 14
        end: 12
        agl: 9
        per: 13
        snt: 3
        aur: 2
        wil: 8
        rea: 2
        cre: 2
    attrRollFormula:
        str: 1d6+11
        end: 1d6+9
        agl: 1d4+7
        per: 1d6+10
        snt: 1d4+1
        aur: 1d4
        wil: 1d4+6
        rea: 1d4
        cre: 1d4
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 3
                - name: Forebody
                  shortcode: torsozone
                  probWeight: 11
                - name: Hindbody
                  shortcode: hindbodyzone
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
                - name: Forebody
                  shortcode: forebodypart
                  bodyZoneCode: torsozone
                  roles:
                      - core
                      - locomotor
                  canHoldItem: false
                  probWeight: 10
                - name: Hindbody
                  shortcode: hindbodypart
                  bodyZoneCode: hindbodyzone
                  roles:
                      - core
                      - locomotor
                  canHoldItem: false
                  probWeight: 6
                - name: Tail
                  shortcode: tailpart
                  bodyZoneCode: hindbodyzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 4
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
                      edged: 6
                      piercing: 5
                      fire: 4
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 6
                  protectionBase:
                      blunt: 4
                      edged: 6
                      piercing: 5
                      fire: 4
                - name: Thorax
                  shortcode: thoraxloc
                  bodyPartCode: forebodypart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 10
                  protectionBase:
                      blunt: 4
                      edged: 6
                      piercing: 5
                      fire: 4
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: hindbodypart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 10
                  protectionBase:
                      blunt: 4
                      edged: 6
                      piercing: 5
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
                      edged: 6
                      piercing: 5
                      fire: 4
        weight:
            base: 150
            calc: "150"
        reachBase: 0
        bodyScaleBase: 1.17
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 30
          leaguesPerWatch: 2
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors:
              - scope: surface_cover
                key: wetlands
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
              masteryLevelBase: 55
        - shortcode: stlth
          type: skill
          system:
              masteryLevelBase: 44
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 15
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 20
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 48
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 52
        - name: Bite
          type: skill
          system:
              shortcode: bite
              subType: combattechnique
              masteryLevelBase: 53
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
                      die: 8
                      modifier: 2
                      aspect: piercing
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
                      clench: true
                      armorReduction: 2
        - name: Grab
          type: skill
          system:
              shortcode: grab
              subType: combattechnique
              masteryLevelBase: 73
              combatCategory: melee
              impairedByRoles:
                  - core
              strikeMode:
                  type: melee
                  shortcode: grab
                  name: Grab
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 6
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 14
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
                      constrict: true
---

# Appearance {#appearance}

The pile of coils barely registers as a threat until it moves. The snake is truly enormous—thick as a man's leg, scaled in patterns of dark brown and cream that make it nearly invisible against earth and vegetation. The head is disproportionately small, supported on a neck that seems impossibly slender compared to the vast bulk behind it. Its eyes—dark and deeply set—open as your shadow falls across it, and you see in that moment that this creature is not afraid. The jaw unhinges with a wet pop, wider than seems possible, revealing thin, backward-curving teeth and a pale pink interior. Then the movement begins: sinuous, purposeful, and utterly inexorable.

# Dossier {#dossier}

The Constrictor Snake represents one of nature's most efficient designs: a predator that can kill prey far larger than its own head through sustained pressure and inhuman patience. These non-venomous snakes measure fifteen to twenty-five feet in length, sometimes longer, and weigh forty to two hundred pounds depending on species and individual size. They are found in tropical and subtropical regions worldwide, inhabiting forests, swamps, and grasslands where prey is abundant. A constrictor's hunting strategy is based on ambush, speed, and the ability to apply pressure until prey cannot breathe. Unlike venomous snakes that kill quickly, a constrictor works gradually, tightening its coils with each breath the prey takes until respiration becomes impossible. Adventurers may encounter constrictors while traveling through jungles, sleeping in tents in grasslands, or exploring ruins in tropical regions where snakes have established dens.

## Presentation

An enormous serpent with a body of impressive thickness and length. The head is relatively small and roughly triangular when viewed from above, with the snout tapering to a point. The eyes are positioned laterally and feature vertical pupils—reflective surfaces visible in dim light. The mouth is capable of opening to an extreme angle, the jaw hinging at the rear of the skull. The teeth are small, thin, and curved backward—not designed for biting force but for grip. The body posterior to the head is substantially thicker, muscular, and composed of hundreds of vertebrae surrounding powerful musculature. The scales are keeled (ridged), providing texture and some mechanical advantage during constriction. Coloration ranges from solid earth tones to dramatic patterns of contrasting colors, all serving to blend with soil, vegetation, and shadows. The tail tapers gradually to a point and is prehensile, capable of gripping branches, crevices, or prey. The belly scales are larger than dorsal scales and show wear from traveling across rough terrain.

## Key Behaviors

Constrictor snakes are solitary animals with overlapping home ranges that they patrol seasonally. They are ambush predators that remain nearly motionless for extended periods—sometimes days—waiting for prey to come within striking range. Once they have eaten, they digest slowly, often spending weeks processing a large meal before needing to hunt again. This slow digestion has allowed individual constrictors to have periods of inactivity and reduced feeding frequency. They are more active during warm seasons and may enter reduced-activity states during cool periods. They are sensitive to temperature and prefer warm environments. Interestingly, some snakes have learned to associate human presence with food—a constrictor near a human settlement will become more active during periods when humans are sleeping. They have no maternal care and the young are independent from the moment of birth, receiving no parental protection or training. Constrictors are long-lived animals, sometimes reaching thirty years in age.

## Combat Strategy

A constrictor's preferred hunting strategy is to wait in ambush until prey passes within striking distance. The strike is explosive: the snake launches forward, opens its mouth, and attempts to grab the target around the head, neck, or torso. Once it has bitten and holding its teeth in flesh, the snake immediately coils around the target's body, placing successive coils around the torso and limbs, then tightening all coils progressively. With each breath the prey takes, the constrictor adjusts its coils tighter, reducing the volume of the torso until respiration becomes impossible. The prey loses consciousness within a few minutes and dies shortly after. Against multiple opponents, the constrictor will target the largest or closest threat, attempting to disable that individual while ignoring others. A disturbed constrictor that has not yet eaten will defend itself by striking and coiling, though it prefers to retreat to a hiding place if possible.

## Attack Methods

### Striking Bite and Initial Coiling

The snake accelerates and opens its jaws wide, attempting to strike the target around the head, neck, shoulders, or torso. The backward-curving teeth, while not designed for piercing, dig into flesh and prevent prey escape. The snake immediately begins coiling, wrapping its body around the target with muscular force. The first coil is typically the most constricting, applied to the torso.

### Progressive Constriction

As the prey struggles, the snake adjusts its coils, tightening them with each movement, each breath, each struggle of the victim. The constriction is designed to make breathing progressively more difficult. What was painful initially becomes crushing, then becomes asphyxiating. The snake has effectively unlimited time—its own breathing is not significantly hampered by the coils, and it can sustain pressure until the prey is dead.

### Coil-mediated Bone Crushing

For very large or particularly resistant prey, the snake may apply pressure sufficient to break ribs, crush organs, or break the spine. This is not the primary killing method but occurs when prey is particularly large or resistant. The crushing force is extraordinary—a large constrictor can exert pressure exceeding the breaking strength of human bone.

## Special Abilities

### Crushing Strength and Coiling Efficiency

The muscular power of a large constrictor is extraordinary. The force generated by a single coil can restrict breathing, break ribs, and crush internal organs. Multiple coils can incapacitate prey far larger than the snake's head, allowing it to consume animals weighing far more than itself. Once the snake has established its coils, escape is nearly impossible without external assistance or extraordinary strength.

### Ambush Predator and Patience

A constrictor can remain completely motionless for days or weeks, waiting for prey to come within striking range. This patience, combined with excellent camouflage and positioning, makes constrictors difficult to detect before an attack occurs. Once a constrictor has selected an ambush location, it may wait indefinitely for suitable prey to pass.

### Slow Digestion and Extended Prey Processing

A constrictor can swallow prey with a head width approaching its own body diameter. Once swallowed, digestion proceeds slowly—a large meal may take weeks to process completely. This allows the constrictor to have extended periods of inactivity between kills, reducing the frequency of risky hunting behavior. From a human perspective, a recently fed constrictor is less aggressive than a hungry individual.

### Prehensile Tail and Climbing Ability

The tail is muscular and dexterous, capable of gripping branches, vines, or rocky surfaces. This allows constrictors to navigate vertical terrain with ease and hunt prey in locations humans cannot easily reach. A constrictor can position itself above prey or move between hunting grounds using elevation advantage.

## Attributes

- **Strength:** 12-17 (1d6+11)

- **Endurance:** 10-15 (1d6+9)

- **Agility:** 8-11 (1d4+7)

- **Perception:** 11-16 (1d6+10)

- **Scent:** 2-5 (1d4+1)

- **Aura:** 1-4 (1d4)

- **Will:** 7-10 (1d4+6)

- **Reasoning:** 1-4 (1d4)

- **Creativity:** 1-4 (1d4)
