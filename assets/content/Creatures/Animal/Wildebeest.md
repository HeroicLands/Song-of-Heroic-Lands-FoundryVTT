---
aliases:
    - Gnu
    - Wildebeest
tags:
    - animal
    - image-needed
name:
    full: Wildebeest
    aliases: []
id: fWFF00Xq9zTzMq0Z
slug: wildebeest
img: icons/game-icons/lorc/paw-print.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 14
        end: 14
        dex: 12
        agl: 13
        per: 14
        aur: 7
        wil: 12
        rea: 7
        cre: 6
    attrRollFormula:
        str: 1d6+10
        end: 1d6+10
        dex: 1d6+8
        agl: 1d6+9
        per: 1d6+10
        aur: 1d4+4
        wil: 1d6+8
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
            base: 1500
            calc: "1500"
        reachBase: 0
        bodyScaleBase: 1.27
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 60
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
              masteryLevelBase: 60
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 27
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 40
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 52
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 35
        - name: Horn Sweep
          type: skill
          system:
              shortcode: gore
              subType: combattechnique
              masteryLevelBase: 63
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: gore
                  name: Horn Sweep
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 4
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 2
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
        - name: Trample
          type: skill
          system:
              shortcode: ram
              subType: combattechnique
              masteryLevelBase: 56
              combatCategory: melee
              impairedByRoles:
                  - core
              strikeMode:
                  type: melee
                  shortcode: ram
                  name: Trample
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 8
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 1
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

You hear the migration before you see it. A low rumbling — not thunder, not drums, but the sound of a hundred thousand hooves on hard earth, a vibration that comes up through the soles of your boots and into your teeth. Then the dust. A wall of ochre haze rising along the southern horizon like smoke from a fire that stretches wider than your eye can measure. Then they come out of the dust, and the scale of what you are seeing breaks something in your ability to process numbers. The herd fills the plain from horizon to horizon. The animals are dark and shaggy and ungainly, a strange assemblage of parts — the forequarters heavy and humped, the hindquarters lean and sloping, the head broad and bearded, the horns curving outward like a pair of hooks. Individually, a wildebeest looks like something assembled from the leftover parts of better animals. But you are not looking at an individual. You are looking at what might be every wildebeest that has ever lived, a river of dark bodies flowing across the grassland with a momentum that has nothing to do with the will of any single animal and everything to do with a force as old and unstoppable as the seasons. They will be passing for three days.

# Dossier {#dossier}

The Wildebeest — also called the gnu — is the great herd animal of the Xerathian savannahs, a large, shaggy bovine that forms the migratory herds whose annual movement across the grasslands is the defining ecological event of southern [[Xerathia_Continent]]. An adult wildebeest stands four to four and a half feet at the shoulder and weighs three hundred and fifty to six hundred pounds, placing it between a stag and an aurochs in size. Individually, the wildebeest is an unremarkable animal — tough, moderately fast, moderately alert, and not particularly dangerous. Collectively, the wildebeest is the most important animal on the continent. The great herds number in the hundreds of thousands, and their annual migration — following the rains across the savanna in a circuit of hundreds of miles — sustains every predator, every scavenger, and every human culture that depends on the grassland ecosystem.

The migration is the axis around which southern Xerathian life turns. The nomadic hunter-tribes of the savanna follow the herds, timing their own movements to the wildebeest's seasonal cycle. The herds provide meat, hide, bone, sinew, and horn — the raw materials of survival on the open grassland. The dung fertilizes the grass that feeds the next year's growth. The river crossings, where the herds funnel through narrow passages and swim across crocodile-infested water, are annual gatherings of both predators and peoples, events of both ecological significance and cultural ritual. To understand the southern Xerathian savannahs, you must understand the wildebeest, because without the herds, the grasslands are an empty stage.

Adventurers crossing the Xerathian savannahs will encounter wildebeest constantly — scattered grazing groups during the dry season, and the staggering spectacle of the full migration during the wet season. The herds are not dangerous in themselves (a wildebeest will not attack a human), but the migration's scale creates hazards: stampedes that can crush anything in their path, river crossings that churn the water into a chaos of drowning animals and feeding crocodiles, and the cloud of predators — lions, hyenas, painted dogs, cheetahs, vultures — that accompanies the herds at every stage.

## Presentation

The wildebeest is one of nature's less elegant designs. The body is distinctly front-heavy: the forequarters are high, humped, and heavily muscled, carrying a mane of coarse, dark hair that runs from the nape to the withers and gives the front half of the animal a shaggy, bison-like bulk. The hindquarters, by contrast, are lean, sloping, and almost delicate, giving the whole animal an off-balance, cobbled-together appearance. The legs are relatively thin for the body mass, ending in pointed, cloven hooves. The coat is short and gray-brown to dark slate, with faint vertical striping on the flanks that is barely visible except in certain light.

The head is broad, flat-fronted, and heavy, with a wide muzzle, small dark eyes, and a chin fringe of coarse, dark hair that forms a straggling beard. Both sexes carry horns — smooth, curving outward and then upward in a shape often compared to parentheses — that are heavy, bony, and functional weapons, though used more in male-on-male contest than in predator defense. The horns of old bulls are heavily bossed at the base, the two horn plates nearly meeting across the forehead in a ridge of dense bone.

In motion, the wildebeest moves with a characteristic rocking canter, the heavy forequarters rolling with each stride. At speed, the gait smooths into a sustained gallop that is faster than it looks — a wildebeest can run at speeds that test a horse and maintain the pace over open ground for miles. The overall impression is of an animal designed entirely for function rather than form: tough, utilitarian, and built to cover ground in a body that will never win an aesthetic competition but has outsurvived every more elegant creature that shared its habitat.

## Key Behaviors

Wildebeest are obligate herd animals — their entire survival strategy is built around numbers. A solitary wildebeest is a dead wildebeest; a herd of ten thousand is effectively immune to predation at the population level, even if individuals are taken daily. The herds are not organized around a leader — there is no dominant bull that directs movement, no matriarch that decides the route. Instead, the herd moves by consensus: individuals at the front begin walking, others follow, and the herd flows across the landscape like water finding its level. The direction of movement is driven by the rains — wildebeest follow the smell of distant rain and the fresh grass it produces, navigating across hundreds of miles of featureless savanna to arrive at greening pastures with a reliability that suggests senses or instincts beyond simple memory.

The annual cycle follows a predictable pattern: the herds concentrate on the short-grass plains during the wet season, where calving occurs in a synchronized burst — hundreds of thousands of calves born within a few weeks, overwhelming predators through sheer numbers. As the dry season advances and the short-grass plains lose moisture, the herds begin moving, flowing northwest toward woodlands and permanent water. The migration route crosses several major rivers, creating the famous river crossings — terrifying, chaotic events where tens of thousands of animals funnel into narrow crossing points and throw themselves into the water, fighting current, crocodiles, and each other to reach the far bank. Thousands drown at every major crossing. The survivors press on.

Wildebeest are constant grazers, feeding on the short grasses of the savanna and maintaining the grassland ecosystem through their grazing pressure — they crop the grass short, stimulating new growth that feeds the next wave of grazers. Their dung returns nutrients to the soil, and the sheer volume of the herds' passage shapes the landscape itself, creating trails, wallows, and crossing points that persist between migrations.

Males are territorial during the breeding season, establishing small patches of ground that they defend with posturing, bellowing, and brief horn-clashing contests. These territories are tiny and temporary — the male holds his patch for as long as the herd is passing through, mating with receptive females that cross his ground, and abandons it when the herd moves on. The bellowing of territorial males — a resonant, nasal grunting call that sounds like "gnu, gnu" and gives the animal its common name — is one of the signature sounds of the migration, a continuous, low chorus that accompanies the herds from dawn to dark.

## Combat Strategy

A wildebeest does not seek combat and will flee from any predator it detects. The survival strategy is entirely collective: run with the herd, stay in the center, and trust that the sheer number of animals around you makes the odds of being the individual selected by a predator statistically tolerable. Wildebeest that are isolated from the herd — by injury, confusion, or deliberate separation by a hunting predator — panic and attempt to rejoin the nearest group at any cost, running directly toward other wildebeest with a single-mindedness that ignores terrain, obstacles, and occasionally cliffs.

A cornered wildebeest, or one defending a calf, will stand and fight with its horns — lowering the heavy head and sweeping sideways, using the curved horns to hook and slash. The attack is more dangerous than it appears: the horns are heavy and the neck muscles are powerful, and a wildebeest's horn sweep can gut a hunting dog or break a hyena's jaw. Bulls in rut also spar with each other, dropping to their knees and pushing head-to-head in shoving contests that test strength but rarely cause serious injury.

The most dangerous aspect of wildebeest is not the individual but the herd in motion. A stampeding herd of wildebeest is a wall of bodies weighing thousands of tons collectively, and anything in its path — human, horse, camp, or small structure — is simply crushed. Stampedes are triggered by predator attacks, sudden noise, and sometimes by nothing apparent, and the blind momentum of the running herd carries it over cliffs, into rivers, and through terrain where the front ranks die and the rear ranks trample over them. River crossings are stampedes compressed into bottlenecks, and the drowning toll is as much from the crush of bodies as from the water itself.

## Attack Methods

### Horn Sweep

A defensive attack used when cornered or defending young. The wildebeest lowers its head and sweeps the curved horns laterally, hooking at whatever is within range. The horns are not sharp-tipped but the sweeping force, driven by the heavy neck, is sufficient to knock a human off their feet, break ribs, and cause deep bruising or tearing wounds where the horn's curve catches flesh. Against smaller predators — jackals, painted dogs, lone hyenas — the horn sweep is genuinely dangerous and can be lethal.

### Herd Stampede

Not an intentional attack but the most lethal phenomenon associated with wildebeest. When the herd panics, the stampede that results is an unstoppable force: thousands of animals running flat-out in the same direction, each one following the animal ahead of it, with no individual capable of stopping or turning against the flow. Anything in the path of a wildebeest stampede — including other wildebeest — is trampled. The force is equivalent to a flash flood of flesh and bone, and escape requires getting to the side of the flow, never to the front.

## Special Abilities

### Migration Instinct

The wildebeest possesses an innate navigational ability that allows herds to follow the rains across hundreds of miles of featureless savanna with remarkable accuracy. They detect distant rainfall through senses that may include smell (the scent of rain on dry earth carries for miles), hearing (distant thunder), or some form of atmospheric pressure sensitivity. This instinct is not learned — calves born in captivity and released onto the savanna will orient toward distant rain without instruction. For the nomadic peoples who follow the herds, the wildebeest's direction of travel is a more reliable weather forecast than any human method.

### Synchronized Calving

Wildebeest females give birth in a synchronized burst, with the majority of the year's calves born within a two-to-three-week window. This strategy overwhelms predators: even if lions, hyenas, and painted dogs hunt continuously during the calving season, they cannot consume more than a tiny fraction of the calves produced. The surviving calves are on their feet and running within minutes of birth — the fastest development of any large ungulate — and within days they are capable of keeping pace with the herd. This synchronized survival strategy is the wildebeest's answer to the predation pressure that accompanies them at every stage of their lives.

### Herd Dilution

The wildebeest's primary survival mechanism. In a herd of fifty thousand, the probability that any individual wildebeest is the one selected by a predator is vanishingly small. This statistical protection is the reason wildebeest form such enormous aggregations — the larger the herd, the safer each individual. The strategy works at the population level even though it fails for the individuals that are taken, and the wildebeest's entire biology is oriented toward herd membership: they are calmer in groups, more alert in groups, and physiologically stressed when isolated.

### Grassland Shaper

The wildebeest migration is not merely an animal event but a geological and ecological force. The herds' grazing maintains the savanna's grassland character by preventing woody vegetation from establishing. Their dung fertilizes millions of acres annually, and the nutrients deposited at river crossings (from the thousands of carcasses that accumulate each year) create localized zones of extraordinary fertility. The trails worn by the migration route persist between years, creating pathways that other animals and humans follow. The wildebeest does not merely inhabit the savanna — it creates and maintains it.

## Attributes

- **Strength:** 11-16 (1d6+10)

- **Endurance:** 11-16 (1d6+10)

- **Dexterity:** 9-14 (1d6+8)

- **Agility:** 10-15 (1d6+9)

- **Perception:** 11-16 (1d6+10)

- **Aura:** 5-8 (1d4+4)

- **Will:** 9-14 (1d6+8)

- **Reasoning:** 5-8 (1d4+4)

- **Creativity:** 4-7 (1d4+3)
