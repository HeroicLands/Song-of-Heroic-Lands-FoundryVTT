---
aliases:
    - Giant Rat
tags:
    - animal
    - image-needed
name:
    full: Giant Rat
    aliases: []
id: JYYfIP5IvvkQ0oJK
slug: giant-rat
img: icons/game-icons/delapouite/rat.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 7
        end: 8
        dex: 14
        agl: 15
        per: 14
        aur: 5
        wil: 8
        rea: 8
        cre: 7
    attrRollFormula:
        str: 1d4+4
        end: 1d4+5
        dex: 1d6+10
        agl: 1d6+11
        per: 1d6+10
        aur: 1d4+2
        wil: 1d4+5
        rea: 1d4+5
        cre: 1d4+4
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
                - name: Left Foreleg
                  shortcode: lforelegloc
                  bodyPartCode: lforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Right Foreleg
                  shortcode: rforelegloc
                  bodyPartCode: rforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
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
                  probWeight: 5
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
                  probWeight: 3
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Pelvis
                  shortcode: plvsloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 2
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Left Hind Leg
                  shortcode: lhindlegloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Right Hind Leg
                  shortcode: rhindlegloc
                  bodyPartCode: rhindlegpart
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
        bodyScaleBase: 0.75
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 50
          leaguesPerWatch: 2
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
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
              masteryLevelBase: 55
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 18
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 32
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 56
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 20
        - name: Swarming Bite
          type: skill
          system:
              shortcode: bite
              subType: combattechnique
              masteryLevelBase: 70
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: bite
                  name: Swarming Bite
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 1
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: -1
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

The torch catches a pair of eyes in the dark — low, reddish, reflecting the flame with a flat, hungry gleam. Then another pair. Then six more. The scratching sound you dismissed as settling masonry resolves into the rapid clicking of claws on stone, and the first shape emerges into the light: a rat the size of a large dog, its fur coarse and matted, its naked tail dragging behind it like a diseased rope. The incisors are the length of your thumb, yellowed and chisel-edged, protruding from a muzzle scarred by a lifetime of fighting over food. The smell is extraordinary — a concentrated distillation of filth, rot, and ammonia that makes your eyes water and your stomach clench. The creature shows no fear of the light. It shows no fear of you. It has the calm, assessing gaze of something that has learned through long experience that anything can be eaten if there are enough of you, and there are always enough.

# Dossier {#dossier}

The Giant Rat is the universal vermin of civilization — a dog-sized rodent weighing twenty to fifty pounds that infests sewers, cellars, ruins, ship holds, granaries, and anywhere else that darkness and food waste intersect. They are found across every continent and in every settlement large enough to produce garbage. Giant rats are not natural animals — they are the product of magical contamination, alchemical runoff, or simply the accelerated evolution that occurs wherever large quantities of arcane waste accumulate near grain stores. Whatever their origin, they are now permanently established in the ecology of every major city in [[Ankaris_Continent]] and beyond. Individually, a giant rat is a nuisance — aggressive enough to bite, fast enough to be difficult to hit, but too small to pose a serious threat to an armed adult. In packs, they are genuinely dangerous. A dozen giant rats swarming from the darkness in a confined space can overwhelm and kill an armored warrior through sheer numbers, each bite tearing a small wound that bleeds and festers. Giant rats are the first serious combat encounter many adventurers face, and veterans who dismiss them as trivial tend to accumulate scars and infections that teach respect.

## Presentation

The giant rat is a scaled-up horror of the common rat — the same basic body plan made grotesque by size. The body is low-slung and elongated, covered in coarse, greasy fur that ranges from dark brown to gray-black and is perpetually matted with filth. The head is wedge-shaped with a long, pointed muzzle, small dark eyes that reflect light with a reddish gleam, and rounded ears that swivel independently to track sound. The defining feature is the incisors: a pair of upper and lower teeth that grow continuously throughout the animal's life, chisel-edged and strong enough to gnaw through wood, leather, rope, and even soft metal given time. The whiskers are long and constantly in motion, providing spatial awareness in total darkness. The tail is naked, scaly, and prehensile — used for balance and as a rudimentary grip in tight spaces. The paws are dexterous, with sharp claws designed for climbing as much as digging. The entire animal radiates an aura of filth — the fur is perpetually oily, the smell is overpowering, and the creature leaves a trail of grease and droppings wherever it moves.

## Key Behaviors

Giant rats are nocturnal, omnivorous, and opportunistic. They live in warrens — interconnected tunnel systems excavated beneath buildings, in sewer networks, in ship holds, and in the rubble of ruins. A warren houses a colony of twenty to fifty rats organized around a dominance hierarchy maintained through constant, vicious infighting. They eat anything organic: grain, meat, leather, wood, corpses, each other. They breed rapidly and continuously, with females producing multiple litters per year, which makes them virtually impossible to eradicate once established — a colony reduced to a handful of survivors will repopulate within months. Giant rats are intelligent for rodents, capable of learning trap locations, recognizing individual threats, and adapting their routes to avoid danger. They are also disease vectors of extraordinary efficiency, carrying plague, filth fever, and a dozen other illnesses in their saliva, fleas, and droppings.

## Combat Strategy

Giant rats are cowards individually and terrors collectively. A lone rat encountering a threat will flee, squealing alarm calls that summon the colony. A pack of rats attacks from multiple directions simultaneously, swarming into melee range where their small size and numbers make them difficult to engage effectively. They target the feet, ankles, and legs — anything they can reach without climbing — and deliver rapid, slashing bites before darting away. The strategy is attrition: each bite is small, but the cumulative blood loss, pain, and infection risk escalates rapidly. In confined spaces — sewers, cellars, narrow corridors — this swarming tactic is devastating because opponents cannot maneuver, cannot bring heavy weapons to bear effectively, and cannot retreat without exposing their backs. Giant rats will pursue wounded prey but break off if the colony takes significant casualties, retreating into tunnels too small for pursuers to follow.

## Attack Methods

### Swarming Bite

The rat darts in, delivers a rapid slashing bite to the nearest exposed flesh, and retreats. The incisors are sharp enough to cut through cloth and light leather, and the bite is delivered with a twisting motion that tears rather than punctures, creating wounds that bleed freely. Individually minor; collectively lethal.

### Gnawing Attack

When a target is pinned, prone, or unconscious, rats will gnaw — settling their incisors into flesh and working with the same patient, mechanical rhythm they use on wood and grain. This is how giant rats kill: not through dramatic violence but through relentless, grinding consumption.

### Overwhelming Rush

A full colony swarming simultaneously creates a wall of fur, teeth, and claws that is psychologically devastating as much as physically dangerous. The sheer number of bodies can knock opponents off balance, and the noise — dozens of rats squealing, hissing, and scratching simultaneously — can break morale.

## Special Abilities

### Disease Vector

Giant rat bites carry a high risk of infection. Wounds that are not cleaned and treated promptly can develop filth fever, plague, or other diseases transmitted through the rat's contaminated saliva. This makes every bite a delayed threat — a wound that seems minor in combat can kill days later if untreated.

### Darkvision

Giant rats navigate and hunt in total darkness using their whiskers, hearing, and sense of smell. They suffer no penalty for operating in lightless environments, which gives them a significant advantage in their preferred habitats — sewers, cellars, and underground warrens.

### Tunnel Escape

Giant rat warrens include dozens of exit tunnels, many too small for humanoid pursuers to follow. A colony that is losing a fight can melt away into these tunnels in seconds, regrouping elsewhere in the warren to attack again from a different direction — or simply waiting until the intruders leave before reoccupying the space.

## Attributes

- **Strength:** 5-8 (1d4+4) — Modest; jaw is strong for gnawing but the body is small
- **Endurance:** 6-9 (1d4+5) — Decent survivability; disease resistance from constant filth exposure
- **Dexterity:** 11-16 (1d6+10) — Quick and precise; excellent climbers
- **Agility:** 12-17 (1d6+11) — Fast, nimble, and difficult to hit in melee
- **Perception:** 11-16 (1d6+10) — Excellent hearing, smell, and spatial awareness in darkness
- **Aura:** 3-6 (1d4+2) — Universally reviled; no cultural or spiritual value
- **Will:** 6-9 (1d4+5) — Cowardly alone; braver in numbers
- **Reasoning:** 6-9 (1d4+5) — Cunning; learns trap locations and adapts behavior
- **Creativity:** 5-8 (1d4+4) — Some problem-solving; finds new routes and food sources
