---
aliases:
    - Ratter
tags:
    - animal
name:
    full: Ratter
    aliases: []
id: 1rt4bCbVyGDW9hKA
img: icons/game-icons/lorc/hound.svg
portrait: ""
shortcode: ratter
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 4
        end: 7
        agl: 13
        per: 18
        snt: 5
        aur: 4
        wil: 13
        rea: 6
        cre: 7
    attrRollFormula:
        str: 1d4+2
        end: 1d4+5
        agl: 1d6+10
        per: 1d6+15
        snt: 1d4+3
        aur: 1d4+2
        wil: 1d6+10
        rea: 1d4+4
        cre: 1d4+5
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
                      blunt: -1
                      edged: -2
                      piercing: -3
                      fire: -1
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 2
                  protectionBase:
                      blunt: -1
                      edged: -2
                      piercing: -3
                      fire: -1
                - name: Left Foreleg
                  shortcode: lforelegloc
                  bodyPartCode: lforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: -1
                      edged: -2
                      piercing: -3
                      fire: -1
                - name: Right Foreleg
                  shortcode: rforelegloc
                  bodyPartCode: rforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: -1
                      edged: -2
                      piercing: -3
                      fire: -1
                - name: Thorax
                  shortcode: thoraxloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 5
                  protectionBase:
                      blunt: -1
                      edged: -2
                      piercing: -3
                      fire: -1
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 3
                  protectionBase:
                      blunt: -1
                      edged: -2
                      piercing: -3
                      fire: -1
                - name: Pelvis
                  shortcode: plvsloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 2
                  protectionBase:
                      blunt: -1
                      edged: -2
                      piercing: -3
                      fire: -1
                - name: Left Hind Leg
                  shortcode: lhindlegloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: -1
                      edged: -2
                      piercing: -3
                      fire: -1
                - name: Right Hind Leg
                  shortcode: rhindlegloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: -1
                      edged: -2
                      piercing: -3
                      fire: -1
                - name: Tail
                  shortcode: tailloc
                  bodyPartCode: tailpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 1
                  probWeight: 10
                  protectionBase:
                      blunt: -1
                      edged: -2
                      piercing: -3
                      fire: -1
        weight:
            base: 20
            calc: "20"
        reachBase: 0
        bodyScaleBase: 0.52
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 90
          leaguesPerWatch: 3
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
    defaultCombatGroup: null
    items:
        - shortcode: awar
          type: skill
          system:
              masteryLevelBase: 80
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
              masteryLevelBase: 50
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 60
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 25
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
                      spread: 1
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: -4
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
---

# Appearance {#appearance}

The wiry frame of the dog is perpetual motion, almost vibrating with barely contained energy. Its nose works constantly, vacuuming scents from the ground in quick, efficient sweeps, its body language screaming intensity and focus. The short coat is weathered and practical, often stained with earth or whatever quarry it has recently pursued. Its eyes are bright and alert, darting constantly, noting everything. You can sense the coiled spring in its muscles — this is not a dog content to lie still, but rather a creature engineered for tireless pursuit and efficient violence against creatures smaller than itself.

# Dossier {#dossier}

Ratters are small, wiry hunting dogs selectively bred for efficiency in hunting rodents and small game, typically standing 12-18 inches tall and weighing 10-20 pounds. These energetic, intelligent dogs are found throughout settled lands wherever vermin control is needed or wherever humans establish farms, mills, and grain stores. An adventuring party might encounter a ratter as a working animal attached to a settlement, as a traveling companion with a rural guide, or abandoned in a dungeon or settlement where rodent infestation has become unbearable.

## Presentation

The ratter presents a compact, muscular frame built for efficiency rather than size. The body is lean, with powerful hindquarters and a deep chest, all contained in a small package that allows access to tight spaces where vermin hide. The coat is typically short and hard, often brown, tan, white, or multicolored with minimal grooming required. The head is disproportionately intelligent-looking for a dog, with alert eyes, pointed ears, and a long muzzle designed for probing into holes and crevices. The tail is typically short and carried high, flagging the dog's constant state of excitement. The paws are surprisingly large for the body size, with strong claws suitable for digging and climbing.

## Key Behaviors

Ratters are obsessive, almost monomaniacal in their focus on hunting small prey. Once a ratter catches the scent of a rodent, it becomes nearly impossible to distract — the dog will pursue that quarry relentlessly through any terrain, burrow, or building. They are fiercely loyal to their handlers and owners, developing strong attachments and becoming deeply distressed by separation. Ratters are pack hunters when multiple dogs work together, coordinating drives and ambushes with remarkable sophistication. They are intelligent enough to learn the geography of their assigned territory and to remember productive hunting grounds. Despite their size, they are fearless and will readily attack creatures larger than themselves if their territory or owner is threatened.

## Combat Strategy

The ratter's strategy against creatures of similar or smaller size is ferocious intensity: dash in with maximum speed, bite and shake, and disengage before the opponent can retaliate. Against larger opponents, the ratter uses speed and agility to dart in for quick bites at vulnerable areas — the heels, the back of the legs, the hands — while maintaining mobility to avoid being caught. If cornered or protecting young or owner, the ratter becomes suicidally brave, attacking much larger opponents with bites and shaking, trying to inflict as much damage as possible despite the massive size disadvantage.

## Attack Methods

### Swift Bite

The ratter darts forward at high speed and delivers a quick, powerful bite directed at exposed flesh, joints, or the back legs of larger opponents. The bite is precise and effective, and the ratter immediately withdraws to attack distance rather than engaging in prolonged melee.

### Shake and Tear

Once the ratter has secured a bite on small prey, it shakes violently, using its strength and the small creature's size to inflict terrible damage. This technique is used primarily on creatures small enough to be shaken — mice, rats, small birds, or very small humanoids.

### Pack Coordination

When multiple ratters hunt together, they execute coordinated attacks, with one dog driving prey toward another's position or multiple dogs attacking from different directions simultaneously. This coordination makes packs surprisingly effective against creatures larger than individuals.

## Special Abilities

### Rodent Hunter Specialization

The ratter is superlatively effective against small creatures — rats, mice, rabbits, and similar prey are dispatched with frightening efficiency. Against small targets, the ratter gains significant advantage in attack rolls and movement speed.

### Keen Olfaction

The ratter's sense of smell is extraordinarily acute, allowing it to track small creatures through undergrowth, detect them in burrows or enclosed spaces, and follow scent trails that are days old. The ratter can locate food, people, and other animals through scent alone.

### Tireless Energy

The ratter can maintain high-intensity activity for extended periods without significant fatigue. It can chase prey for hours, dig through soil for much of a day, and remain alert and focused throughout the process.

### Small Size Advantage

The ratter's diminutive size allows it to access spaces larger creatures cannot reach — burrows, crawlways, gaps in construction — making it impossible to trap or prevent from reaching prey in such spaces.

### Courageous Loyalty

Despite its small size, the ratter will fiercely defend its handler or territory against much larger threats. This loyalty is absolute and not diminished by rational assessment of the danger involved.

### Additional Information

A ratter can be trained to hunt specific quarry types — some specialize in rats, others in mice, still others in rabbits. Ratters lose drive and become depressed if separated from their handlers for extended periods. A ratter trained to one type of game will hunt other small creatures with less efficiency and reliability. In a settlement with severe vermin problems, ratters become local heroes, treated well by residents who depend on their pest control services.

## Attributes

- **Strength:** 3-6 (1d4+2)

- **Endurance:** 6-9 (1d4+5)

- **Agility:** 11-16 (1d6+10)

- **Perception:** 16-21 (1d6+15)

- **Scent:** 4-7 (1d4+3)

- **Aura:** 3-6 (1d4+2)

- **Will:** 11-16 (1d6+10)

- **Reasoning:** 5-8 (1d4+4)

- **Creativity:** 6-9 (1d4+5)
