---
aliases:
    - Destrier
tags:
    - animal
name:
    full: Destrier
    aliases: []
id: AYrEr6jrDy802WIf
slug: destrier
img: icons/game-icons/delapouite/horse-head.svg
portrait: ""
shortcode: destrier
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 30
        end: 12
        agl: 10
        per: 17
        snt: 4
        aur: 4
        wil: 12
        rea: 5
        cre: 5
    attrRollFormula:
        str: 1d6+27
        end: 1d6+9
        agl: 1d6+7
        per: 1d6+14
        snt: 1d4+2
        aur: 1d4+2
        wil: 1d6+9
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
                      blunt: 6
                      edged: 5
                      piercing: 3
                      fire: 5
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 6
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 3
                      fire: 5
                - name: Left Foreleg
                  shortcode: lforelegloc
                  bodyPartCode: lforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 3
                      fire: 5
                - name: Right Foreleg
                  shortcode: rforelegloc
                  bodyPartCode: rforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 3
                      fire: 5
                - name: Flank
                  shortcode: flkloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 6
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 3
                      fire: 5
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 4
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 3
                      fire: 5
                - name: Left Quarter
                  shortcode: lqtrloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 3
                  probWeight: 5
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 3
                      fire: 5
                - name: Left Hind Leg
                  shortcode: lhindlegloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 4
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 3
                      fire: 5
                - name: Right Quarter
                  shortcode: rqtrloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 3
                  probWeight: 5
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 3
                      fire: 5
                - name: Right Hind Leg
                  shortcode: rhindlegloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 4
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 3
                      fire: 5
                - name: Tail
                  shortcode: tailloc
                  bodyPartCode: tailpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 1
                  probWeight: 10
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 3
                      fire: 5
        weight:
            base: 1400
            calc: "1400"
        reachBase: 0
        bodyScaleBase: 1.92
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 120
          leaguesPerWatch: 8
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors:
              - scope: surface_cover
                key: mixed_forest
                mode: add
                textValue: "-3"
              - scope: surface_cover
                key: needleleaf_forest
                mode: add
                textValue: "-2"
              - scope: surface_cover
                key: dunes
                mode: add
                textValue: "-3"
              - scope: topography
                key: steep
                mode: add
                textValue: "-3"
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
              masteryLevelBase: 52
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 24
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 53
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 59
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 75
        - name: Kick
          type: skill
          system:
              shortcode: kick
              subType: combattechnique
              masteryLevelBase: 68
              combatCategory: melee
              impairedByRoles:
                  - locomotor
              strikeMode:
                  type: melee
                  shortcode: kick
                  name: Kick
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 8
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 7
                      aspect: blunt
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
        - name: Bite
          type: skill
          system:
              shortcode: bite
              subType: combattechnique
              masteryLevelBase: 62
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
                      die: 4
                      modifier: 5
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
---

# Appearance {#appearance}

The ground shakes before you see the creature. What emerges is a mountain of controlled power: a horse of extraordinary size, nearly eighteen hands tall, built on a frame of pure muscular strength. The chest is as broad as a shield, the neck as thick as a tree, the legs like pillars of living iron. Beneath the weight of armor and rider, lesser horses would stumble; this creature bears them with the indifference of something engineered specifically for this burden. When it moves, the earth acknowledges its passage. When it rears, it becomes a statue of equine fury, twenty feet tall, muscles rippling beneath armor and hide. The sound it makes—a deep, resonant neigh—carries across battlefields and silences lesser threats through sheer presence.

# Dossier {#dossier}

The Destrier is the apex of warhorse evolution: a creature engineered through centuries of selective breeding to be a mobile fortress, a living tank, a partner in the most violent conflicts humans can create. Standing seventeen to eighteen hands tall and weighing eighteen hundred to twenty-four hundred pounds, a Destrier carries its rider and full plate armor as though the rider were a feather. These horses are not fast—they cannot match a Courser's speed or even a Charger's acceleration—but they possess extraordinary strength and immovable resilience. A Destrier trained for war is a creature of singular purpose: to advance, to break through obstacles, to carry its rider into the enemy line and plant it there unshakably. Destriers are most commonly found with wealthy nobility, military leaders, and elite knights who can afford both the horse and the expertise to ride it. Their presence on a battlefield is a statement of power—a single Destrier can break a cavalry charge, and a line of Destriers can shatter infantry formations. Adventurers riding Destriers are rare, as the cost and expertise required is beyond most people's resources, but when they appear, the Destrier's presence cannot be ignored.

## Presentation

An enormous equine built for maximum weight and strength rather than grace or speed. The frame is broader and stockier than other horse breeds, with particularly pronounced chest, shoulder, and haunch development. The legs are not merely thick but are engineered with different biomechanics than lighter horses—the joints are stronger, the bones denser, the muscles more powerful. The head is proportionally large and somewhat blocky, with a straight or slightly convex profile. The neck is unusually thick and carries muscle from jaw to shoulder. The back is strong and compact, designed to bear weight without sagging. The hooves are large and hard, capable of digging into soft ground for traction without sinking. The coat is typically solid colors: black, bay, gray, or chestnut. Scars from previous battles are common, particularly around the face and shoulders. Many Destriers have their ears cropped short and squared, a practical and terrifying battlefield modification. The overall presentation is of a creature built for one purpose: overwhelming force.

## Key Behaviors

Destriers bond intensely with their riders, often forming lifelong partnerships. They are sensitive to the emotional state of the rider and will respond to barely perceptible weight shifts and rein movements from experienced handlers. They require extensive training to develop the discipline to advance into chaos, to charge at what lesser horses would flee from, to stand firm when terrified. Only horses with temperament suitable to this training survive the selection process. Destriers are notably more aggressive than civilian horses, and males in particular will challenge other horses and establish dominance. They are territorial and will defend space they have claimed. They consume tremendous quantities of food—a Destrier requires more than double the feed of a lighter horse to maintain its size and strength. They are long-lived, sometimes reaching thirty years, and develop increasingly strong personalities and preferences as they age. An experienced Destrier can anticipate its rider's intentions and act before commands are fully communicated.

## Combat Strategy

A Destrier's primary strategy is to advance—the horse charges, collides, and breaks through obstacles or enemies using pure mass and strength. At impact, the collision force is extraordinary, sufficient to knock mounted knights from lighter horses, to break through fortifications, to trample enemies under hoof. In sustained combat, a Destrier uses its strength to maintain position, its hooves to trample, and its sheer presence to dominate. Multiple Destriers in formation can become an unstoppable force, breaking through defenses and scattering enemies. A wounded Destrier becomes more aggressive, not less. The horse has been trained to ignore pain signals and continue advancing. A Destrier with a dying rider will sometimes continue executing its last commands, oblivious to the loss of the rider.

## Attack Methods

### Charging Impact

The Destrier accelerates and collides with full force, using the combined mass of horse, rider, armor, and momentum as a weapon. The force is extraordinary—sufficient to break bones, crush ribs, and knock even armored opponents from their feet or from other horses. The collision impact is often fatal to smaller or less armored opponents.

### Hoof Strikes and Stomping

Once engaged, the Destrier delivers powerful strikes with its hooves, focusing on downed opponents or opponents pinned against obstacles. Each hoof strike carries the full weight of the animal concentrated into a small area, capable of crushing armor and bone.

### Biting and Rearing

When fighting on foot or when forced into hand-to-hand with unmounted opponents, the Destrier will bite with power greater than lighter horses. When reared, the Destrier becomes a towering weapon, front hooves capable of striking from above with force that crushes whatever they contact.

### Charging Through Obstacles

A Destrier will accelerate directly through obstacles that would stop lighter horses: wooden fortifications, hastily-erected barricades, even structures built to stop cavalry. The sheer mass and momentum overwhelm most obstacles, allowing the Destrier and its rider to break through.

## Special Abilities

### Overwhelming Strength and Collision Force

A Destrier's physical power is legendary. It can carry weight that would cripple lighter horses, accelerate to devastating speed despite its mass, and deliver impacts with the force of siege weapons. In direct collision, a Destrier is virtually unstoppable—few things in nature can withstand the impact of a Destrier-mounted knight charging at full gallop.

### Discipline and Battle-Hardness

A Destrier has been trained from youth to advance into chaos, to ignore pain and fear, to execute commands even in the face of death. This discipline is absolute—a properly trained Destrier will charge into fire, over obstacles, through storms of arrows, and into melee combat without hesitation. This unwavering commitment makes the Destrier exponentially more valuable than an untrained horse of similar size.

### Resilience and Endurance

Despite their size, Destriers have remarkable endurance for their weight. They can march for days, sustain combat for hours, and recover from injuries that would disable lighter horses. The dense bone and muscle structure provides natural armor, making them more resistant to injury than their weight alone would suggest.

### Battlefield Presence and Psychological Impact

The presence of a Destrier on a battlefield carries psychological weight far exceeding its physical threat. Lesser cavalry will often break and flee rather than engage a Destrier directly. Infantry facing Destrier charges often panic and disorder before the impact occurs. This psychological dominance has decided many battles independently of the physical destruction the horse causes.

## Attributes

- **Strength:** 28-33 (1d6+27)

- **Endurance:** 10-15 (1d6+9)

- **Agility:** 8-13 (1d6+7)

- **Perception:** 15-20 (1d6+14)

- **Scent:** 3-6 (1d4+2)

- **Aura:** 3-6 (1d4+2)

- **Will:** 10-15 (1d6+9)

- **Reasoning:** 4-7 (1d4+3)

- **Creativity:** 4-7 (1d4+3)
