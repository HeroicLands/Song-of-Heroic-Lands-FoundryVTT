---
aliases:
    - Ice Bear
    - Polar Bear
tags:
    - animal
    - image-needed
name:
    full: Polar Bear
    aliases: []
id: gFFrYYtroCDjUsx4
img: icons/game-icons/cathelineau/polar-bear.svg
portrait: ""
shortcode: plrbr
type: creature
package: sohl
sohl:
    kbcat: animal
    archetype: 0
    attributes:
        str: 28
        end: 21
        agl: 10
        per: 14
        snt: 7
        aur: 5
        wil: 15
        rea: 5
        cre: 5
    attrRollFormula:
        str: 1d6+25
        end: 1d6+18
        agl: 1d6+7
        per: 1d6+11
        snt: 1d4+5
        aur: 1d4+3
        wil: 1d6+12
        rea: 1d4+3
        cre: 1d4+3
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 4
                - name: Forelegs
                  shortcode: forelegszone
                  probWeight: 4
                - name: Torso
                  shortcode: torsozone
                  probWeight: 8
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
                      blunt: 10
                      edged: 9
                      piercing: 8
                      fire: 10
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 4
                  protectionBase:
                      blunt: 10
                      edged: 9
                      piercing: 8
                      fire: 10
                - name: Left Foreleg
                  shortcode: lforelegloc
                  bodyPartCode: lforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 10
                      edged: 9
                      piercing: 8
                      fire: 10
                - name: Right Foreleg
                  shortcode: rforelegloc
                  bodyPartCode: rforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 10
                      edged: 9
                      piercing: 8
                      fire: 10
                - name: Thorax
                  shortcode: thoraxloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 5
                  protectionBase:
                      blunt: 10
                      edged: 9
                      piercing: 8
                      fire: 10
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 3
                  protectionBase:
                      blunt: 10
                      edged: 9
                      piercing: 8
                      fire: 10
                - name: Pelvis
                  shortcode: plvsloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 2
                  protectionBase:
                      blunt: 10
                      edged: 9
                      piercing: 8
                      fire: 10
                - name: Left Hind Leg
                  shortcode: lhindlegloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 10
                      edged: 9
                      piercing: 8
                      fire: 10
                - name: Right Hind Leg
                  shortcode: rhindlegloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 10
                      edged: 9
                      piercing: 8
                      fire: 10
                - name: Tail
                  shortcode: tailloc
                  bodyPartCode: tailpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 1
                  probWeight: 10
                  protectionBase:
                      blunt: 10
                      edged: 9
                      piercing: 8
                      fire: 10
        weight:
            base: 1000
            calc: "1000"
        reachBase: 0
        bodyScaleBase: 1.84
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 90
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
              masteryLevelBase: 70
        - shortcode: stlth
          type: skill
          system:
              masteryLevelBase: 60
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
              masteryLevelBase: 48
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 84
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
                      spread: 4
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 9
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
                      spread: 8
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 8
                      modifier: 8
                      aspect: edged
                  lengthBase: 4
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

The ice field is empty. You are certain of this. You scanned it not thirty seconds ago and there was nothing — nothing but white on white, pressure ridges and blown snow, and the gray sky pressing down. Then a shape stands up sixty paces away, and the world rearranges itself around the fact that the largest land predator in Nordheim has been watching you for some time. The fur is not white — not truly. It is pale yellow, cream, the color of old ivory, and against the snow it simply ceases to exist until the animal chooses to move. It is enormous. Taller than a brown bear, longer, leaner, built along lines that speak of distance and patience and a hunger that never fully abates. The head swings toward you on a neck longer than any bear's should be, and the black nose works the air with visible, deliberate attention. The eyes are dark and calm. There is no threat display. No warning. It has already decided what you are.

# Dossier {#dossier}

The Polar Bear is the apex predator of the arctic reaches of [[Kingdom_of_Nordheim]] — a solitary, patient, supremely dangerous hunter adapted for life on ice and in freezing water. Males stand five feet at the shoulder and can reach ten feet when rearing, weighing between nine hundred and fifteen hundred pounds of lean, cold-adapted muscle. Unlike the brown bear, which is an omnivorous opportunist, the polar bear is a dedicated carnivore — a pure predator that hunts seals, fish, walrus calves, and anything else it can catch, including humans. The polar bear possesses the keenest nose of any land predator, capable of detecting prey from miles away and through feet of ice. It is an exceptional swimmer, capable of crossing open water for dozens of miles. Among the Normen of the far north, the ice bear is regarded with a mixture of terror and spiritual reverence — it is the embodiment of the killing cold, and its pelt is among the most valued trophies a hunter can claim. Adventurers encounter polar bears on arctic coastlines, on sea ice, in far-northern settlements where bears scavenge, and during winter expeditions into the deep north.

## Presentation

The polar bear is built along different lines than its brown cousin — longer, leaner, more hydrodynamic. The body is elongated and streamlined, with a long neck that gives the head reach and flexibility unusual in bears. The skull is narrower and more predatory than a brown bear's, the muzzle longer, the jaw designed for gripping and killing rather than the omnivorous crushing of the brown bear. The fur appears white or cream but is actually composed of hollow, transparent guard hairs over black skin — a thermal engineering system that channels sunlight to the skin while trapping body heat. The paws are enormous — up to twelve inches across — and partially webbed, functioning as paddles in water and snowshoes on soft snow. The soles are covered in small, soft papillae that provide grip on ice. The overall impression is of something designed by the cold itself: efficient, patient, and built to kill in an environment where nothing else can.

## Key Behaviors

Polar bears are solitary obligate carnivores that spend most of their lives on or near sea ice, where they hunt seals at breathing holes and along ice edges. A hunting polar bear will locate a seal's breathing hole by scent, then wait — motionless, silent, for hours — until the seal surfaces to breathe. The strike is explosive and precise: a single blow from a forepaw that can shatter a seal's skull through the ice. When sea ice retreats in summer, polar bears move to land, where they become scavengers, eating carrion, bird eggs, and berries while waiting for the ice to return. Hungry bears in this period are the most dangerous to humans — they actively investigate settlements, camps, and boats as potential food sources. Polar bears are powerful swimmers and have been documented swimming continuously for days, covering enormous distances between ice floes. They are intelligent, curious, and persistent — a polar bear that has identified potential prey will follow it for miles with tireless patience.

## Combat Strategy

The polar bear does not bluff. Unlike brown bears, which often charge as a threat display, a polar bear that charges intends to kill. It approaches with deceptive calm — walking steadily, sometimes circling to cut off retreat — then accelerates into a devastating rush. The initial attack is typically a forepaw strike of enormous power, aimed at the head or shoulders to stun or kill outright. If the first strike fails, the bear continues pressing, using its jaws and claws with relentless, methodical aggression. It does not roar or posture during combat — it fights in focused silence. A polar bear will pursue fleeing prey across ice and through water, and it will not abandon a hunt that it has committed to. In water, it is even more dangerous: faster than any swimming human, capable of attacking from below, and able to pull opponents off ice floes or out of boats.

## Attack Methods

### Skull-Crushing Paw Strike

The polar bear's primary killing method — a single, devastating blow from the forepaw, delivered with the full force of the shoulder behind it. This strike is powerful enough to shatter a seal's skull through several inches of ice. Against humanoid targets, it can crush helmets, break necks, and kill instantly.

### Predatory Bite

The jaws close on the neck, skull, or spine with focused, killing pressure. The bite is not the wild mauling of a brown bear but a precise, targeted kill — the polar bear bites to sever the spine or crush the windpipe. The narrow skull allows it to reach into spaces a brown bear's broader head cannot.

### Drag and Drown

In water or near water's edge, the polar bear seizes prey and pulls it into the water, where its swimming superiority is absolute. The victim is held under until drowned. This tactic is used against large prey that the bear cannot kill outright on the ice.

## Special Abilities

### Scent Beyond Measure

The polar bear's olfactory system is the most acute of any land predator. It can detect a seal through three feet of ice and packed snow, smell carrion from miles downwind, and track prey across featureless ice fields where no visible trail exists. It is virtually impossible to hide from a polar bear by scent alone.

### Ice Camouflage

The polar bear's translucent fur renders it nearly invisible against snow and ice. A motionless polar bear on a white background is effectively undetectable by sight at any distance beyond a few dozen paces. Bears have been observed covering their black noses with a paw while stalking — whether this is deliberate camouflage or coincidence remains debated.

### Aquatic Endurance

The polar bear is a tireless swimmer, capable of sustaining continuous swimming for days and covering distances that would exhaust any terrestrial animal. Its partially webbed paws, streamlined body, and thick blubber layer make it as comfortable in freezing water as on ice. It can dive, surface silently, and attack from the water with minimal warning.

## Attributes

- **Strength:** 26-31 (1d6+25)

- **Endurance:** 19-24 (1d6+18)

- **Agility:** 8-13 (1d6+7)

- **Perception:** 12-17 (1d6+11)

- **Scent:** 6-9 (1d4+5)

- **Aura:** 4-7 (1d4+3)

- **Will:** 13-18 (1d6+12)

- **Reasoning:** 4-7 (1d4+3)

- **Creativity:** 4-7 (1d4+3)
