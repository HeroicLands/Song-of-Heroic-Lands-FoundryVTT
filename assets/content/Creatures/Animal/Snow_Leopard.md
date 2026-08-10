---
aliases:
    - Snow Leopard
tags:
    - animal
name:
    full: Snow Leopard
    aliases: []
id: LMyTG1K48t5guDBD
slug: snow-leopard
img: icons/game-icons/delapouite/feline.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 15
        end: 13
        dex: 19
        agl: 19
        per: 15
        aur: 8
        wil: 13
        rea: 9
        cre: 9
    attrRollFormula:
        str: 1d4+12
        end: 1d4+10
        dex: 1d4+16
        agl: 1d4+16
        per: 1d4+12
        aur: 1d4+5
        wil: 1d4+10
        rea: 1d4+6
        cre: 1d4+6
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 1
                - name: Forelegs
                  shortcode: forelegszone
                  probWeight: 1
                - name: Torso
                  shortcode: torsozone
                  probWeight: 3
                - name: Hindquarters
                  shortcode: hindqtrzone
                  probWeight: 1
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
                  probWeight: 4
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
                - name: Thorax
                  shortcode: thoraxloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 5
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
                  probWeight: 3
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Pelvis
                  shortcode: plvsloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 2
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
                  probWeight: 10
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
                  probWeight: 10
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
            base: 60
            calc: "60"
        reachBase: 0
        bodyScaleBase: 1.36
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 70
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
              masteryLevelBase: 80
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 30
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 44
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 68
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 35
        - name: Suffocating Bite
          type: skill
          system:
              shortcode: bite
              subType: combattechnique
              masteryLevelBase: 78
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: bite
                  name: Suffocating Bite
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 1
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 3
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
        - name: Claw Rake
          type: skill
          system:
              shortcode: claw
              subType: combattechnique
              masteryLevelBase: 78
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: claw
                  name: Claw Rake
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
                      aspect: edged
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
---

# Appearance {#appearance}

The snow itself seems to move, and for a moment you cannot distinguish the creature from the background until the eyes open — pale, blue-green, and regarding you with ancient predatory certainty. The color is nearly perfect camouflage: smoky-gray fur with darker rosette patterning that dissolves into the snowscape, making it seem as though the creature is merely a fold in the terrain. The build is deceptive — the legs are more powerful than their appearance suggests, and the long, bushy tail wraps around its body like an additional layer of insulation. There is no aggression in its bearing, only calm patience and the confidence of something that has hunted these mountains for generations.

# Dossier {#dossier}

The Snow Leopard is a solitary apex predator of high-altitude mountains, standing 2.5-3 feet at the shoulder and reaching 4-5 feet in length, distinguished by its thick insulating coat and exceptional climbing ability. These elusive predators hunt in mountainous terrain where no other large predators compete, specializing in mountain goats and sheep but capable of taking larger prey. Adventurers encounter snow leopards while traveling mountain passes, establishing camps in high-altitude terrain, or exploring remote mountain peaks.

## Presentation

The Snow Leopard is a muscular feline with a build slightly more compact than a true leopard, optimized for movement across snow and rocky mountain terrain. The coat is thick and insulating, with fur that ranges from smoky gray to pale cream, marked with darker rosettes and irregular spots that provide extraordinary camouflage against snow, rock, and shadows. The eyes are pale blue-green and positioned forward-facing for predatory vision. The face is broad and powerful-jawed, with a strong jaw capable of delivering lethal bites. The limbs are proportionally longer than typical leopards, adapted for climbing steep terrain and leaping across crevasses. The paws are large and heavily furred on the bottom, providing grip on snow and ice and insulation against cold. The tail is long, bushy, and often wrapped around the body for insulation.

## Key Behaviors

Snow Leopards are solitary creatures establishing exclusive high-altitude territories where prey is scarce and encounters between individuals are minimal. They are most active during twilight and early morning, resting during the hottest parts of the day and the cold nights. They hunt primarily mountain goats and sheep but will consume almost any meat available, including smaller predators and humanoid prey. They are relatively fearless of humans unless provoked or defending territory. Snow Leopards are capable of descending to lower elevations in severe winters when prey moves to lower altitudes but prefer the high mountains where food is scare but hunters are scarce. The creatures are intelligent and capable of learning, remembering dangerous hunters and productive hunting grounds.

## Combat Strategy

The snow leopard ambushes prey using terrain to close distance undetected, then launches an explosive attack using powerful hind legs to leap toward the target. Once engaged, the leopard uses its strength and claws to grapple and its powerful jaw to deliver a killing bite to the throat or spine. If the initial attack fails, the leopard may retreat to high ground where pursuit is difficult. A snow leopard defending territory or young becomes more aggressive and persistent but still prefers to fight on terrain of its choosing.

## Attack Methods

### Explosive Pounce

The snow leopard launches from a distance using powerful hind legs, covering surprising distance in a single leap. The attack combines momentum with claws and jaws for maximum impact and is designed to knock prey off balance and position the leopard for a killing bite.

### Suffocating Bite

Once engaged, the snow leopard attempts to bite the throat or neck, using its powerful jaw to cut off air and blood flow. The bite is precise and powerful, capable of severing the carotid artery or crushing the trachea.

### Claw Rake

During grappling, the snow leopard uses its powerful forelimbs and sharp claws to rake and tear at opponents, creating additional trauma and wounds. The claws can penetrate leather and light armor.

### Crushing Body Weight

The snow leopard uses its muscular body to pin opponents, relying on weight and strength to hold prey in place while attempting a killing bite.

## Special Abilities

### Mountain Camouflage

The snow leopard's coloration is extraordinarily effective in alpine environments. The creature gains significant advantage on stealth checks in mountainous terrain, particularly in snow and among rocks.

### Expert Climber

The snow leopard is supremely adapted to vertical and near-vertical terrain, capable of scaling sheer cliffs and boulders that humanoids would find impossible. The creature fights with advantage when on steep or uneven terrain.

### Cold Adaptation

The snow leopard is perfectly adapted to freezing conditions and suffers no penalty for extreme cold. The thick fur provides insulation equivalent to heavy winter clothing.

### Explosive Power

The snow leopard's hind legs are extraordinarily powerful, allowing it to leap extraordinary distances and heights. The creature's jumping and climbing abilities far exceed what humanoids can achieve.

### Keen Senses

The snow leopard's hearing, vision, and smell are all adapted for mountain hunting. The creature can detect movement and scent across significant distances.

### Additional Information

Snow Leopards are most dangerous in their native mountain terrain where they maintain overwhelming advantage. In open or low-altitude terrain, the creature's advantage diminishes significantly. The creatures are solitary and avoiding already-claimed territory prevents encounters. A snow leopard that has successfully hunted humanoids becomes more bold in approaching humans, making it a potential threat to isolated mountain settlements. The creature's pelt is extraordinarily valuable and can be harvested after death to create winter clothing or insulation.

## Attributes

- **Strength:** 13-16 (1d4+12)

- **Endurance:** 11-14 (1d4+10)

- **Dexterity:** 17-20 (1d4+16)

- **Agility:** 17-20 (1d4+16)

- **Perception:** 13-16 (1d4+12)

- **Aura:** 6-9 (1d4+5)

- **Will:** 11-14 (1d4+10)

- **Reasoning:** 7-10 (1d4+6)

- **Creativity:** 7-10 (1d4+6)
