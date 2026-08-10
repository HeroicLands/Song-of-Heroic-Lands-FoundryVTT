---
aliases:
    - Old Ice Dragon
    - Frost Wyrm
tags:
    - mythic
    - image-needed
name:
    full: Old Ice Dragon
    aliases: []
id: IHBBFMFd2LieAudc
slug: old-ice-dragon
img: icons/game-icons/faithtoken/dragon-head.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 60
        end: 45
        dex: 8
        agl: 8
        per: 15
        snt: 3
        aur: 14
        wil: 21
        rea: 17
        cre: 13
        emp: 13
        elo: 17
    attrRollFormula:
        str: 1d6+57
        end: 1d6+42
        dex: 1d4+6
        agl: 1d4+6
        per: 1d6+12
        snt: 1d4+1
        aur: 1d6+11
        wil: 1d6+18
        rea: 1d6+14
        cre: 1d6+10
        emp: 1d6+10
        elo: 1d6+14
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 16
                - name: Forelegs
                  shortcode: forelegszone
                  probWeight: 16
                - name: Left Wing
                  shortcode: lwingzone
                  probWeight: 12
                - name: Torso
                  shortcode: torsozone
                  probWeight: 16
                - name: Right Wing
                  shortcode: rwingzone
                  probWeight: 12
                - name: Hindquarters
                  shortcode: hindqtrzone
                  probWeight: 16
                - name: Tail
                  shortcode: tailzone
                  probWeight: 12
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
                  roles:
                      - locomotor
                      - manipulator
                  canHoldItem: false
                  probWeight: 1
                - name: Right Foreleg
                  shortcode: rforelegpart
                  bodyZoneCode: forelegszone
                  roles:
                      - locomotor
                      - manipulator
                  canHoldItem: false
                  probWeight: 1
                - name: Left Wing
                  shortcode: lwingpart
                  bodyZoneCode: lwingzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 10
                - name: Torso
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
                - name: Left Hind Leg
                  shortcode: lhindlegpart
                  bodyZoneCode: hindqtrzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 1
                - name: Right Hind Leg
                  shortcode: rhindlegpart
                  bodyZoneCode: hindqtrzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 1
                - name: Tail
                  shortcode: tailpart
                  bodyZoneCode: tailzone
                  roles:
                      - locomotor
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
                  protectionBase: &a1
                      blunt: 28
                      edged: 30
                      piercing: 29
                      fire: 27
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 7
                  protectionBase: *a1
                - name: Left Foreleg
                  shortcode: lforelegloc
                  bodyPartCode: lforelegpart
                  bleedingSusceptibility: medium
                  amputability: medium
                  shockValue: 3
                  probWeight: 7
                  protectionBase: &a2
                      blunt: 28
                      edged: 30
                      piercing: 29
                      fire: 27
                - name: Left Fore Foot
                  shortcode: lfftloc
                  bodyPartCode: lforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 3
                  protectionBase: &a3
                      blunt: 26
                      edged: 28
                      piercing: 27
                      fire: 25
                - name: Right Foreleg
                  shortcode: rforelegloc
                  bodyPartCode: rforelegpart
                  bleedingSusceptibility: medium
                  amputability: medium
                  shockValue: 3
                  probWeight: 7
                  protectionBase: *a2
                - name: Right Fore Foot
                  shortcode: rfftloc
                  bodyPartCode: rforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 3
                  protectionBase: *a3
                - name: Left Wing
                  shortcode: lwingloc
                  bodyPartCode: lwingpart
                  bleedingSusceptibility: none
                  amputability: low
                  shockValue: 1
                  probWeight: 10
                  protectionBase: &a5
                      blunt: 22
                      edged: 24
                      piercing: 23
                      fire: 21
                - name: Thorax
                  shortcode: thoraxloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 7
                  protectionBase: &a4
                      blunt: 28
                      edged: 30
                      piercing: 29
                      fire: 27
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 3
                  protectionBase: *a4
                - name: Right Wing
                  shortcode: rwingloc
                  bodyPartCode: rwingpart
                  bleedingSusceptibility: none
                  amputability: low
                  shockValue: 1
                  probWeight: 10
                  protectionBase: *a5
                - name: Left Hind Leg
                  shortcode: lhindlegloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: medium
                  amputability: low
                  shockValue: 3
                  probWeight: 7
                  protectionBase: &a6
                      blunt: 28
                      edged: 30
                      piercing: 29
                      fire: 27
                - name: Left Hind Foot
                  shortcode: lhftloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 3
                  protectionBase: &a7
                      blunt: 26
                      edged: 28
                      piercing: 27
                      fire: 25
                - name: Right Hind Leg
                  shortcode: rhindlegloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: medium
                  amputability: low
                  shockValue: 3
                  probWeight: 7
                  protectionBase: *a6
                - name: Right Hind Foot
                  shortcode: rhftloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 3
                  protectionBase: *a7
                - name: Tail
                  shortcode: tailloc
                  bodyPartCode: tailpart
                  bleedingSusceptibility: none
                  amputability: medium
                  shockValue: 1
                  probWeight: 10
                  protectionBase:
                      blunt: 26
                      edged: 28
                      piercing: 27
                      fire: 25
        weight:
            base: 8000
            calc: "8000"
        reachBase: 0
        bodyScaleBase: 5.45
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
        - medium: aerial
          feetPerRound: 180
          leaguesPerWatch: 18
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
    defaultCombatGroup: null
    items:
        - shortcode: awar
          type: skill
          system:
              masteryLevelBase: 90
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 95
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 90
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 93
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 68
        - name: Bite
          type: skill
          system:
              shortcode: bite
              subType: combattechnique
              masteryLevelBase: 84
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
                      spread: 12
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 8
                      modifier: 25
                      aspect: piercing
                  lengthBase: 10
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
                      armorReduction: 3
        - name: Claw
          type: skill
          system:
              shortcode: claw
              subType: combattechnique
              masteryLevelBase: 80
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
                      spread: 24
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 10
                      modifier: 24
                      aspect: edged
                  lengthBase: 9
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
        - name: Tail
          type: skill
          system:
              shortcode: tail
              subType: combattechnique
              masteryLevelBase: 75
              combatCategory: melee
              impairedByRoles:
                  - locomotor
              strikeMode:
                  type: melee
                  shortcode: tail
                  name: Tail
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 32
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 23
                      aspect: blunt
                  lengthBase: 11
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
        - name: Breath
          type: skill
          system:
              shortcode: breath
              subType: combattechnique
              masteryLevelBase: 96
              combatCategory: missile
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: missile
                  shortcode: breath
                  name: Breath
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 0
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 4
                      modifier: 19
                      aspect: fire
                  projectileType: none
                  maxVolleyMult: 1
                  baseRangeBase: 80
                  drawBase: 0
                  traits:
                      breath: true
                      impactBands: 19 · 15 · 11 · 7
---

# Appearance {#appearance}

There is no temperature. There is no breath. There is no thought. There is only cold—an absolute, final, suffocating cold that precedes even the notion of suffering. Your consciousness fragments into a thousand scattered pieces as you realize, in what remains of your mind, that the old ice dragon does not kill. It erases. What hovers above the glacier is not a creature of flesh and scales but an incarnation of winter itself, vast beyond measure—perhaps forty feet from snout to tail, with wings spanning fifty feet or more, weighing as much as a merchant galleon. It is old beyond reckoning, its scales the color of the deep ice found only in glaciers untouched since before man's civilization. The dragon simply exists, and existence itself becomes unbearable in its presence. This is not rage. This is not hunger. This is the end of things, patient and inevitable, watching you with eyes that contain the memory of ten thousand frozen winters. The old ice dragon does not need to move. By the time you perceive it, you are already dying—and have been dying, slowly, your entire existence, waiting for this moment when winter finally comes to collect.

# Dossier {#dossier}

The old ice dragon is the antithesis of mercy and the embodiment of inhuman patience stretched across centuries of predatory existence. Spanning thirty-two to forty-eight feet in length with wingspans exceeding sixty feet, and weighing between six thousand and twelve thousand pounds, these creatures have transcended even the formidable power of their younger kin. An old ice dragon has witnessed the rise and fall of dynasties. It has watched civilizations build and crumble. It is itself a monument to cold and endurance.

An old ice dragon has lived for four to eight centuries or longer, making it old by the standards of even the longest-lived mortal races. Multiple entire bloodlines of warriors and heroes have attempted to slay such creatures; perhaps one in ten thousand survived the attempt. The dragon's territory is typically a vast mountain range or a chain of glacier systems spanning hundreds of miles. It maintains a primary lair of such grandeur and complexity that human miners could spend lifetimes mapping its depths, with chambers of impossible size and ice so ancient it glows with its own phosphorescent light.

The old ice dragon has transcended predation. Where younger dragons hunt to feed, old dragons hunt for purposes beyond sustenance. Some maintain elaborate political arrangements with human kingdoms, playing dynasties against each other for entertainment. Others cultivate solitude so complete that legends of their existence persist but proof remains elusive. Still others have achieved something approaching philosophical transcendence, moving through the world with an almost meditative detachment.

The cold aura surrounding an old ice dragon is not merely lethal—it is absolute. Unprotected flesh dies within minutes of exposure. Magical wards begin to fail under its intensity. The dragon's breath weapon, perfected across centuries of use, can flash-freeze an entire army in seconds, creating a macabre glacier of frozen corpses.

## Presentation

An old ice dragon's scales are predominantly midnight blue deepening to pure black along the spine, with the deep color of ancient glacial ice. The edges of the scales are perfectly transparent, and light seems to pass through them as if entering another dimension entirely. The scales are massive—some individual scales are the size of a man—and utterly smooth, bearing no imperfections. Scars exist on the dragon's hide, but they are few; a creature this old has learned to avoid most injury through means beyond mere combat skill.

The dragon's eyes are luminescent pale silver, containing swirling patterns of distant frost and crystalline geometry. Its breath mists perpetually, and ice forms constantly in its immediate vicinity—the ground beneath the dragon becomes an actively growing glacier as standing water freezes and frozen water fractures deeper. The dragon's voice, when it speaks, carries overtones of avalanches, of glaciers groaning under the weight of millennia, and of wind that has never encountered obstruction.

Rime extends from the dragon's scales in delicate crystalline formations—not frost, but perfectly ordered geometric structures that seem to defy natural law. During flight, the dragon trails ribbons of supercooled mist that persist long after the dragon has passed. Where the dragon's claws touch stone, the stone becomes brittle and cracks propagate like spiderwebs.

## Key Behaviors

An old ice dragon's territory is effectively absolute. The dragon maintains awareness of everything within its claimed range through means that transcend conventional sensation—perhaps through the vibration of glacial ice, perhaps through psychic connection to the cold itself. Prey cannot move through the dragon's territory without the dragon knowing of it.

The old dragon's interactions with lesser creatures range from complete indifference to elaborate psychological manipulation. Some old dragons maintain written treaties with human rulers, sending formal correspondence carried by servants who have learned to operate in temperatures that would kill most creatures. Others have simply withdrawn from the world entirely, existing in frozen solitude at the poles or in the highest mountain peaks.

The old dragon's patience is beyond measure. It will wait a century for a specific circumstance to arrange itself according to its desire. It will move glaciers through sheer indefatigable will, one increment of movement at a time across decades. It remembers every injustice committed against it, and when it finally moves to enact vengeance, the vengeance is something that shakes the world.

## Combat Strategy

An old ice dragon approaches combat with devastating efficiency born from centuries of experience. It does not engage in the acrobatic maneuvering of younger dragons. Instead, it moves with deliberate precision, every motion calculated to inflict maximum devastation. The dragon prefers to engage enemies at a distance, using its breath weapon and the raw pressure of its draconic presence to demoralize and weaken prey before closing.

The dragon recognizes that direct melee engagement is beneath its station. It will maneuver to ensure that enemies approach it on ground of the dragon's choosing, often terrain made treacherous by cold. It will separate vulnerable targets from their protectors through calculated movement. It will wait for allies to overextend before trapping them. The dragon thinks in terms of entire armies rather than individual opponents.

An old ice dragon in combat is not trying to win—it is managing the rate at which the opposition dies. It fights with the patience of inevitability.

## Attack Methods

### Bite

The dragon's jaws are forces of nature unto themselves, capable of crushing through armor and bone with contemptuous ease. Damage inflicted is catastrophic, and victims bitten by an old ice dragon suffer extreme cold damage as the dragon's breath mingles with the bite wound.

### Claw Rake

Each claw is the size of a sword and harder than any forge-worked steel. A claw rake can target multiple enemies and inflicts mutilating wounds that freeze solid, preventing healing through conventional means. The dragon's claws can rake across castle walls and leave claw marks in solid stone.

### Wing Buffet

The dragon's wings, folded and snapped outward, create a shockwave of force equivalent to a small avalanche. Everything within a thirty-foot radius takes bludgeoning damage and is knocked prone and potentially hurled backward. Trees snap. Structures crack. Creatures are simply erased from the battlefield.

### Tail Sweep

The tail, as thick as a man's torso and nearly as long as the dragon's body, moves with terrible deliberation. Targets in the tail's path take damage and must resist or fall prone. The tail can topple towers, collapse fortifications, or simply clear an entire area of opposition.

### Frost Breath

The dragon exhales in a sixty-foot cone of supercooled crystalline mist so intense and so cold that it flash-freezes living flesh instantly. Targets in the cone die in moments unless blessed with supernatural resilience. Corpses left in the aftermath are perfectly preserved in glacial ice. The dragon can use this ability multiple times, and its breath weapon is hot enough to ignite through solid protection.

## Special Abilities

### Frost Breath

The old dragon's breath weapon represents the pinnacle of cold weaponization. The mist is so supercooled that it appears to glow with its own light. It is flash-freezing in absolute terms—ice crystals form in living tissue in heartbeats. The breath weapon persists for several rounds after the dragon uses it, creating lingering zones of lethal cold.

### Flight

The old dragon is not merely a flier—it is a master of the aerial domain. It can hover indefinitely, perform maneuvers that seem physically impossible for something its mass, and dive with the speed of a plummeting stone before pulling up at the last moment with no apparent deceleration.

### Armored Scales

The old dragon's scales are near-impervious to damage of any conventional nature. Swords shatter. Arrows ricochet. Even magical weapons struggle to penetrate. The dragon's scales are nearly as hard as diamond and have been refined by centuries of exposure to the harshest conditions on Thalorna.

### Cold Aura

The old dragon's aura is lethal at two hundred feet distance. Unprotected creatures take cold damage every round. Magical protection against cold begins to fail in proximity to the dragon—the dragon's cold is too absolute for mere magic to fully shield against. The aura warps light and sound, creating mirages and distortions.

### Draconic Presence

The old dragon's presence induces not merely despair but genuine madness in those who perceive it. Creatures must resist or suffer disadvantage on all actions. Weaker creatures may become catatonic. Heroes of exceptional will may function normally, but even they sense the weight of ages and the futility of resistance.

### Cold Immunity

The dragon is immune to all cold, magical or otherwise. In fact, extreme cold strengthens the dragon. Blizzards, ice storms, and frozen wastelands are not merely survivable for the old dragon—they are nourishing.

### Spell Resistance

The old dragon has lived long enough to develop resistance to magical effects. Spells find it difficult to affect the dragon directly. Only magic of exceptional power or performed by casters of legendary ability can pierce this resistance reliably.

### Lair Awareness

Within its lair, the old dragon achieves a form of omniscience. It is aware of the position and condition of every creature within the lair's boundaries. It can sense vibrations through the ice and stone. It can perceive through the ice itself as if through transparent glass. The dragon fights with perfect knowledge of the terrain and the positions of all opposition.

## Attributes

- **Strength:** 58-63 (1d6+57)

- **Endurance:** 43-48 (1d6+42)

- **Dexterity:** 7-10 (1d4+6)

- **Agility:** 7-10 (1d4+6)

- **Perception:** 13-18 (1d6+12)

- **Scent:** 2-5 (1d4+1)

- **Aura:** 12-17 (1d6+11)

- **Will:** 19-24 (1d6+18)

- **Reasoning:** 15-20 (1d6+14)

- **Creativity:** 11-16 (1d6+10)

- **Empathy:** 11-16 (1d6+10)

- **Eloquence:** 15-20 (1d6+14)
