---
aliases:
    - Ratter
tags:
    - animal
name:
    full: Ratter
    aliases: []
id: 1rt4bCbVyGDW9hKA
slug: ratter
img: icons/game-icons/lorc/hound.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 7
        end: 11
        dex: 14
        agl: 15
        per: 16
        aur: 8
        wil: 12
        rea: 9
        cre: 8
    attrRollFormula:
        str: 1d4+4
        end: 1d6+7
        dex: 1d6+10
        agl: 1d6+11
        per: 1d6+12
        aur: 1d4+5
        wil: 1d6+8
        rea: 1d4+6
        cre: 1d4+5
    body:
        structure:
            zones: []
            parts: []
            locations: []
        weight:
            base: 10
            calc: 10
        reachBase: 0
        bodyScaleBase: 1.0
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 60
          leaguesPerWatch: 3
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
    defaultCombatGroup: null
    items: []
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

- **Strength:** 5-8 (1d4+4)

- **Endurance:** 8-13 (1d6+7)

- **Dexterity:** 11-16 (1d6+10)

- **Agility:** 12-17 (1d6+11)

- **Perception:** 13-18 (1d6+12)

- **Aura:** 6-9 (1d4+5)

- **Will:** 9-14 (1d6+8)

- **Reasoning:** 7-10 (1d4+6)

- **Creativity:** 6-9 (1d4+5)
