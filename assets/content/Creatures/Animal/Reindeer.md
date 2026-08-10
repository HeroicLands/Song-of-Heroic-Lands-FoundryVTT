---
aliases:
    - Caribou
    - Reindeer
tags:
    - animal
    - image-needed
name:
    full: Reindeer
    aliases: []
id: o5zGvTtdOAvkEa0u
slug: reindeer
img: icons/game-icons/caro-asercion/deer.svg
portrait: ""
shortcode: reindeer
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 12
        end: 14
        dex: 10
        agl: 14
        per: 14
        aur: 8
        wil: 13
        rea: 7
        cre: 6
    attrRollFormula:
        str: 1d6+8
        end: 1d6+10
        dex: 1d4+7
        agl: 1d6+10
        per: 1d6+10
        aur: 1d4+5
        wil: 1d6+9
        rea: 1d4+4
        cre: 1d4+3
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 2
                - name: Forelegs
                  shortcode: forelegszone
                  probWeight: 1
                - name: Torso
                  shortcode: torsozone
                  probWeight: 4
                - name: Hindquarters
                  shortcode: hindqtrzone
                  probWeight: 3
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
            base: 250
            calc: "250"
        reachBase: 0
        bodyScaleBase: 1.06
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 90
          leaguesPerWatch: 6
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
              masteryLevelBase: 30
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 40
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 56
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 33
        - name: Antler Sweep
          type: skill
          system:
              shortcode: gore
              subType: combattechnique
              masteryLevelBase: 65
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: gore
                  name: Antler Sweep
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 2
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 1
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
        - name: Hoofstrike
          type: skill
          system:
              shortcode: kick
              subType: combattechnique
              masteryLevelBase: 58
              combatCategory: melee
              impairedByRoles:
                  - locomotor
              strikeMode:
                  type: melee
                  shortcode: kick
                  name: Hoofstrike
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 4
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: -2
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

The herd appears on the horizon like a dark tide moving across the tundra — hundreds of shapes flowing together with a rhythm that makes the ground itself seem to migrate. As the nearest animals draw close, you see them clearly: sturdy, broad-chested creatures built low and wide for a climate that kills the tall and the lean. Both sexes carry antlers — the males' enormous and sweeping, the females' smaller but no less purposeful. The coats are dense and layered, pale gray-brown fading to white on the chest and belly, and the sound they make is extraordinary — a constant clicking from their ankles, thousands of tendons snapping over bone with every step, so that the herd produces a rhythmic, percussive music that carries across the empty landscape like the heartbeat of the north itself.

# Dossier {#dossier}

The Reindeer is the defining animal of northern [[Kingdom_of_Nordheim]] and its sister kingdoms — the creature around which entire cultures are organized. Standing three to four feet at the shoulder and weighing three hundred to five hundred pounds, reindeer are the only cervids in which both sexes grow antlers. They are supreme cold-weather survivors, possessing adaptations that allow them to thrive in conditions that kill most other large mammals. Wild herds numbering in the thousands migrate across the high interior plateau in seasonal patterns that have been followed for millennia. Domesticated herds provide the Normen and the highland clans with transport, milk, leather, sinew, bone tools, and meat — there is no part of the reindeer that northern peoples do not use. Adventurers encounter reindeer constantly in Nordheim: as pack animals, as wild herds blocking passes, as the economic foundation of every settlement they visit, and occasionally as aggressive bulls during the autumn rut.

## Presentation

The reindeer is built for survival in extreme cold — compact and broad-chested with short, powerful legs that end in wide, splayed hooves designed to act as snowshoes on soft ground and paddles in water. The coat is extraordinarily dense, composed of hollow guard hairs over a thick undercoat that provides insulation sufficient to sleep on open tundra in blizzard conditions. Coloration ranges from dark gray-brown on the back and flanks to pale cream on the chest, belly, and rump. The face is broad with a furred muzzle — unique among cervids — that warms inhaled air before it reaches the lungs. The antlers of mature bulls are massive and complex, sweeping back and upward with multiple tines and a distinctive forward-pointing brow tine that overhangs the face like a visor. Female antlers are smaller but functional, retained through winter when males have shed theirs. The most distinctive feature is the audible clicking of the ankle tendons — a sound that allows herd members to maintain contact in whiteout conditions.

## Key Behaviors

Reindeer are profoundly social herd animals whose lives are governed by seasonal migration. Wild herds follow routes established over centuries, moving between winter forest shelter and summer tundra grazing, covering distances of several hundred miles each way. The migration is led by experienced females who remember the route, the river crossings, and the timing of seasonal changes. Bulls join the herds in autumn for the rut, competing through antler displays and sparring matches that are vigorous but rarely fatal — the winner collects a harem and guards it jealously for the duration of the breeding season. Reindeer are excellent swimmers, crossing wide rivers and even fjord channels during migration. They feed on grasses, sedges, and lichens — their ability to smell and dig through deep snow to reach buried lichen is critical to winter survival and represents an ecological niche no other large herbivore can exploit.

## Combat Strategy

Reindeer are fundamentally non-aggressive outside the rut and prefer flight to confrontation, relying on herd cohesion and sheer numbers for protection. A stampeding herd is itself a weapon — the thundering mass of hundreds of animals will trample anything in its path. During the rut, bulls become territorial and will charge perceived rivals, including humanoids who approach too closely. A bull uses its antlers to sweep and gore, driving with the full force of its stocky body. Females defending calves will kick with sharp hooves and may charge. Domesticated reindeer are generally docile but can become panicked and dangerous if startled, and a sled team in full bolt is extremely difficult to stop.

## Attack Methods

### Antler Sweep

The bull lowers its massive antlers and charges forward, using the broad rack to sweep opponents off their feet or gore them with the tines. The brow tine is particularly dangerous, positioned to catch targets in the face and torso at close range.

### Hoofstrike

The wide, sharp-edged hooves deliver powerful kicks capable of cracking bone. The splayed shape means the strike cuts as well as impacts, and a rearing reindeer can deliver strikes from both forelimbs simultaneously.

### Herd Stampede

When a herd panics, the resulting stampede is a force of nature — hundreds of animals moving as a wall of muscle and antler, trampling everything in their path. The noise alone can disorient, and the dust or snow thrown up reduces visibility to nothing.

## Special Abilities

### Arctic Adaptation

The reindeer's hollow-hair insulation, furred muzzle, and specialized nasal passages allow it to survive temperatures that would kill most mammals within hours. It can sleep in the open during blizzards, swim icy rivers without hypothermia, and maintain activity in conditions where other animals must shelter or die.

### Snow Foraging

Reindeer can detect lichen buried under several feet of snow through scent alone, then dig through the snowpack with their hooves to reach it. This ability makes them the only large herbivore that can sustain itself through northern winters on natural forage, and it makes them invaluable to any group traveling through winter tundra.

### Tendon Click Communication

The distinctive clicking sound produced by the ankle tendons serves as a passive communication system, allowing herd members to maintain cohesion in darkness, fog, or blizzard whiteout conditions. A herd moving at night produces a continuous clicking rhythm that can be heard at significant distance — both a navigation aid for the herd and an early warning to anything in its path.

## Attributes

- **Strength:** 9-14 (1d6+8) — Compact and powerful, built for hauling loads and pushing through deep snow
- **Endurance:** 11-16 (1d6+10) — Exceptional stamina for migration and extreme cold survival
- **Dexterity:** 8-11 (1d4+7) — Adequate but not refined; built for function, not precision
- **Agility:** 11-16 (1d6+10) — Sure-footed across tundra, snowfield, and river crossing
- **Perception:** 11-16 (1d6+10) — Keen senses, particularly smell; can detect lichen under deep snow
- **Aura:** 6-9 (1d4+5) — Respected as the lifeblood of the north, but not spiritually charged
- **Will:** 10-15 (1d6+9) — Migratory determination; domesticated animals are relatively docile
- **Reasoning:** 5-8 (1d4+4) — Standard cervid intelligence
- **Creativity:** 4-7 (1d4+3) — Limited
