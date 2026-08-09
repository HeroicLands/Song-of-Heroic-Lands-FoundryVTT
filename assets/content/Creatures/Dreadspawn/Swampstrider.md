---
aliases:
    - Swampstrider
tags:
    - dreadspawn
name:
    full: Swampstrider
    aliases: []
id: nx1JBaUtNq1pa3Ki
slug: swampstrider
img: icons/game-icons/delapouite/griffin-symbol.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 14
        end: 16
        dex: 16
        agl: 18
        per: 14
        aur: 10
        wil: 14
        rea: 12
        cre: 14
    attrRollFormula:
        str: 1d6+10
        end: 1d4+13
        dex: 1d4+13
        agl: 1d6+14
        per: 1d6+10
        aur: 1d6+6
        wil: 1d6+10
        rea: 1d4+9
        cre: 1d6+10
    body:
        structure:
            zones:
                - name: Forequarters
                  shortcode: fqtrzone
                  probWeight: 3
                - name: Torso
                  shortcode: torsozone
                  probWeight: 3
                - name: Hindquarters
                  shortcode: hindqtrzone
                  probWeight: 3
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
                      - manipulator
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
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 4
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 2
                  protectionBase:
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 4
                - name: Left Foreleg
                  shortcode: lforelegloc
                  bodyPartCode: lforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 4
                - name: Right Foreleg
                  shortcode: rforelegloc
                  bodyPartCode: rforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 4
                - name: Thorax
                  shortcode: thoraxloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 5
                  protectionBase:
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 4
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 3
                  protectionBase:
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 4
                - name: Pelvis
                  shortcode: plvsloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 2
                  protectionBase:
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 4
                - name: Left Hind Leg
                  shortcode: lhindlegloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 4
                - name: Right Hind Leg
                  shortcode: rhindlegloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 4
                      edged: 3
                      piercing: 2
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
                      edged: 3
                      piercing: 2
                      fire: 4
        weight:
            base: 200
            calc: 200
        reachBase: 0
        bodyScaleBase: 1.27
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 50
          leaguesPerWatch: 3
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
              masteryLevelBase: 70
        - shortcode: stlth
          type: skill
          system:
              masteryLevelBase: 80
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 36
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 52
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 64
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 38
        - name: Crushing Bite
          type: skill
          system:
              shortcode: bite
              subType: combattechnique
              masteryLevelBase: 76
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: bite
                  name: Crushing Bite
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 2
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 2
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
        - name: Prehensile Tongue
          type: skill
          system:
              shortcode: tentacle
              subType: combattechnique
              masteryLevelBase: 76
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: tentacle
                  name: Prehensile Tongue
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 4
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 1
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
        - name: Leap and Ram
          type: skill
          system:
              shortcode: ram
              subType: combattechnique
              masteryLevelBase: 66
              combatCategory: melee
              impairedByRoles:
                  - core
              strikeMode:
                  type: melee
                  shortcode: ram
                  name: Leap and Ram
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 4
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 1
                      aspect: blunt
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

A bulge in the water ahead moves with terrible purpose—not a ripple but an intentional disturbance. Then the creature simply appears, rising from the murk as though materializing from shadow: an amphibian the size of a horse, its hide mottled green and brown, glistening with moisture and something slick that reflects light wrongly. Its enormous eyes bulge from a flattened head, and as it regards you, you see intelligence there—calculating, patient, hungry. Long, muscular legs coil beneath its body, and as you watch, you see them tense with terrifying potential. Then, faster than your mind can process, the creature's mouth opens to reveal a tongue of impossible length and elasticity, writhing with the promise of adhesive horror. The air around it smells of stagnant water and something acrid—venom, perhaps, or something worse.

# Dossier {#dossier}

Swampstriders are apex predators of wetland environments, massive amphibians evolved or corrupted to supernatural intelligence and power. They are ambush hunters of preternatural skill, creatures that seem to anticipate their prey's movements and position themselves perfectly for devastating attacks. A Swampstrider hunts alone, claiming a stretch of swamp as its personal hunting ground, and it becomes increasingly dangerous and aggressive as it grows older and more practiced at the hunt. These creatures seem to have no fixed territory in the way that land-based predators do—instead, they move through interconnected waterways, following prey populations and seasons, though an individual Swampstrider may return to a particular region repeatedly.

## Presentation

A Swampstrider measures roughly 12 to 18 feet in length, with a muscular, low-slung amphibian body built for explosive speed and jumping power. Its hide is mottled in shades of green, brown, and murky gray, textured to provide perfect camouflage in swamp water and vegetation. Its skin is constantly moist and glistening, covered in a thin layer of secreted slime that contains its toxins. Its head is flattened and broad, with enormous, bulging eyes set toward the top of its skull, giving it exceptional forward and lateral vision. Its mouth is enormous and stretches wider than seems physically possible, and from within that cavernous mouth, a tongue of incredible length can be extended—a muscular, prehensile appendage that is covered in adhesive secretions and lined with barb-like protrusions. Its legs are coiled springs of muscle, capable of explosive power. The creature makes almost no sound as it moves through water, and its presence is often announced only by a sudden disturbance in water or a premonition of danger.

## Key Behaviors

A Swampstrider is a patient, solitary hunter that understands predatory strategy in sophisticated ways. It learns prey behavior, predicts movement patterns, and sets itself in ambush positions with preternatural accuracy. The creature will wait motionlessly for hours or days for a single opportunity, and when it strikes, the velocity of the attack is almost impossible to evade. It hunts a territory roughly ten miles or more in length, following waterways and knowing every pool, every channel, and every likely location where prey will congregate. The creature seems to breed rarely, and gravid females are said to defend nesting sites with absolute ferocity.

## Combat Strategy

A Swampstrider initiates combat by launching itself at tremendous speed from water or concealment, attempting to capture prey with its adhesive tongue before engaging in direct combat. Once a victim is restrained by the tongue, it attempts to drag them into deeper water or to pull them close enough for a massive bite. The creature is agile enough to adjust its attacks mid-leap, and it demonstrates tactical awareness—if a tongue-grab fails, it may use the momentum to ram or slash with its limbs instead. The creature can also create massive disruptive splashes by inflating its body, a tactic that startles and disorients prey. If severely injured or facing overwhelming force, a Swampstrider will retreat into deep water where it has overwhelming advantage.

## Attack Methods

### Prehensile Tongue Strike

The creature's tongue lashes out with adhesive power and surprising strength, attempting to capture prey or drag it closer. Victims caught by the tongue find escape nearly impossible and will be drawn toward the creature's massive jaws.

### Crushing Bite

Once prey is within range, the Swampstrider's jaws snap down with power comparable to a bear trap, capable of causing catastrophic damage or severing limbs.

### Powerful Leap and Ram

The creature's hind legs can propel it with explosive force across or through water, allowing it to ram opponents with shoulder or head strikes of devastating power.

## Special Abilities

### Toxic Secretions

The Swampstrider's skin secretes a potent neurotoxin that affects anything it touches. Victims of the sticky tongue or who are grappled begin to experience numbness and eventual paralysis as the toxin spreads.

### Amphibious Adaptation

The Swampstrider moves with equal ease in deep water and on land, though it is somewhat slower on land than in its native element. It can hold its breath indefinitely and sees perfectly in complete darkness.

### Predatory Cunning

The Swampstrider demonstrates genuine tactical intelligence, learning prey patterns and adapting its hunting strategies. It understands concepts like luring prey or herding them into kill zones.

## Additional Information

Extreme heat and desiccation are the Swampstrider's primary weaknesses—the creature cannot survive indefinitely out of water, and prolonged exposure to dry conditions will eventually kill it. Its toxins can be extracted and preserved, though doing so is extraordinarily dangerous and requires specialized knowledge. The creature's hide, if harvested carefully, can be fashioned into water-resistant armor of exceptional quality. The adhesive secretions from its tongue are highly prized by craftspeople and can be used in numerous specialized applications. Hunting a Swampstrider is considered a dangerous undertaking, and those few who succeed in killing one are celebrated throughout the region. The creature's remains are valuable enough that expeditions have been mounted purely to claim them, though most such expeditions end without a successful kill.

## Attributes

- **Strength:** 11-16 (1d6+10)

- **Endurance:** 14-17 (1d4+13)

- **Dexterity:** 14-17 (1d4+13)

- **Agility:** 15-20 (1d6+14)

- **Perception:** 11-16 (1d6+10)

- **Aura:** 7-12 (1d6+6)

- **Will:** 11-16 (1d6+10)

- **Reasoning:** 10-13 (1d4+9)

- **Creativity:** 11-16 (1d6+10)
