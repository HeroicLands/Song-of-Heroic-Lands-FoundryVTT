---
aliases:
    - Emberhound
tags:
    - elemental
name:
    full: Emberhound
    aliases: []
id: WGeazrSoyg3VKwns
img: icons/game-icons/lorc/hound.svg
portrait: ""
shortcode: embrhnd
type: creature
package: sohl
sohl:
    kbcat: elemental
    archetype: 0
    attributes:
        str: 13
        end: 15
        dex: 13
        agl: 11
        per: 13
        aur: 9
        wil: 15
        rea: 9
        cre: 8
    attrRollFormula:
        str: 1d4+10
        end: 1d4+12
        dex: 1d4+10
        agl: 1d4+8
        per: 1d4+10
        aur: 1d4+6
        wil: 1d4+12
        rea: 1d4+6
        cre: 1d4+5
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
                  roles:
                      - manipulator
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
                      blunt: 5
                      edged: 4
                      piercing: 3
                      fire: 5
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 4
                  protectionBase:
                      blunt: 5
                      edged: 4
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
                      blunt: 5
                      edged: 4
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
                      blunt: 5
                      edged: 4
                      piercing: 3
                      fire: 5
                - name: Thorax
                  shortcode: thoraxloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 5
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 3
                      fire: 5
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 3
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 3
                      fire: 5
                - name: Pelvis
                  shortcode: plvsloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 2
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 3
                      fire: 5
                - name: Left Hind Leg
                  shortcode: lhindlegloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 3
                      fire: 5
                - name: Right Hind Leg
                  shortcode: rhindlegloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 5
                      edged: 4
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
                      blunt: 5
                      edged: 4
                      piercing: 3
                      fire: 5
        weight:
            base: 300
            calc: "300"
        reachBase: 0
        bodyScaleBase: 1.11
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: aerial
          feetPerRound: 70
          leaguesPerWatch: 5
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
              masteryLevelBase: 36
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 48
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 48
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 35
        - name: Fiery Bite
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
                  name: Fiery Bite
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 1
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 2
                      aspect: fire
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
        - name: Flaming Breath
          type: skill
          system:
              shortcode: breath
              subType: combattechnique
              masteryLevelBase: 65
              combatCategory: missile
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: missile
                  shortcode: breath
                  name: Flaming Breath
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 0
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 4
                      modifier: 3
                      aspect: fire
                  projectileType: none
                  maxVolleyMult: 1
                  baseRangeBase: 15
                  drawBase: 0
                  traits: {}
        - name: Tail Whip
          type: skill
          system:
              shortcode: tail
              subType: combattechnique
              masteryLevelBase: 52
              combatCategory: melee
              impairedByRoles:
                  - locomotor
              strikeMode:
                  type: melee
                  shortcode: tail
                  name: Tail Whip
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 2
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: -1
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

The stone beneath your feet grows uncomfortably warm. A shape emerges from the heat-haze of the horizon—four-legged, wolf-like, but composed of fire and ember rather than flesh. Its eyes are steady yellow flames that fix on you with predatory intelligence. Where its paws strike the ground, the earth blackens and cracks. The heat it radiates is palpable and growing stronger, and your skin begins to feel the burn of a forge drawing near.

# Dossier {#dossier}

Emberhounds are elementals of pure fire given temporary animal form, most often summoned by ancient sorcerers or bound to places of power. They are not mindless—they think, they hunt, and they understand tactics. An Emberhound is as much predator as elemental, combining the cunning of a beast with the destructive force of living flame. Some are bound to serve as guardians; others roam wild, driven by hunger for fuel. A lone Emberhound is dangerous; a pack is a force of nature.

## Presentation

An Emberhound resembles a large, muscular hound eight to ten feet in length, but composed entirely of living flame and burning coal. Its body is a constantly shifting mass of orange, yellow, and white fire held in the rough shape of a canine. Its eyes are solid yellow flames that burn with unwavering intelligence. Its fur appears to be made of embers that glow and flare with its movements. Where it passes, the ground blackens and cracks from heat. It leaves no paw prints—only scorch marks and sometimes small fires that spread from the intensity of its passage.

## Key Behaviors

Emberhounds are territorial and aggressive, claiming hunting grounds and defending them against all intruders. They hunt actively, pursuing prey across open ground and cornering them with cunning. They seem to require fuel to sustain themselves—they are drawn to areas of combustible material and will consume fire where they find it, growing stronger from it. They are intelligent enough to understand human commands if taught during binding or if treated as partners rather than mere beasts. Most wild Emberhounds are driven by hunger and will attack on sight, but an Emberhound that respects a human master will follow their commands with ferocious loyalty.

## Combat Strategy

Emberhounds fight with aggressive directness, pursuing prey with relentless determination. They use their speed and strength to close distance quickly, then overwhelm opponents with powerful bites and burning attacks. They show no fear of fire-based magic and will actually move toward such attacks to absorb them. Against cold or water-based magic, they become more cautious and evasive. In a territory where fire has spread, they fight more effectively, growing stronger from the flames around them. They are intelligent enough to recognize a losing battle and will flee if seriously wounded, retreating to cool water or difficult terrain.

## Attack Methods

### Fiery Bite

The Emberhound's jaws clamp down with crushing force, and the victim is seared by the intense heat of flames in their mouth. The bite causes both physical damage from the force of the bite and severe thermal burns from the flames, leaving the victim scorched and weakened.

### Flaming Breath

The Emberhound exhales a cone of flames that engulfs everything in its path. The attack is devastating to multiple targets and can ignite surrounding materials, spreading fire through an area and creating additional hazards.

### Tail Whip

The creature swings its burning tail like a weapon, striking with surprising force and leaving trails of flame. The tail can knock a person off their feet or ignite their clothing and armor.

## Special Abilities

### Fire Absorption

The Emberhound can absorb fire-based magical attacks and heal from them. A fireball or flame strike that would harm another creature instead restores the Emberhound's vitality. This makes most fire-based magic tactics ineffective.

### Thermal Resistance

The Emberhound is naturally resistant to physical damage, and its fiery form makes it difficult for normal weapons to strike effectively. Fire cannot harm it at all; cold and water-based magic are the primary things that can hurt it.

### Heat Aura

Simply existing near an Emberhound is dangerous. The ambient temperature rises dramatically within thirty feet, and exposed skin burns from proximity. Flammable materials ignite if too close. Metal weapons become too hot to hold, and prolonged exposure can cause heat exhaustion.

### Ember Trail

Where the Emberhound moves, fire follows. Its passage leaves burning marks on the ground and sets combustible materials aflame. In a dry environment, these scattered fires can combine into a significant conflagration.

## Additional Information

Cold and water are the Emberhound's greatest weaknesses. A large enough body of water can immobilize one, and sustained cold-based magic can reduce its power. An Emberhound cannot cross a barrier of cold iron, and some defensive fortifications use this fact. An Emberhound that is offered respect and allowed to consume fuel may become less aggressive and more predictable. Some organizations bind Emberhounds as guardians, feeding them regularly in exchange for their protection. An Emberhound destroyed in water or extreme cold may not reform, depending on how it was created. One destroyed in its natural territory will reform after several days unless the source of its power is explicitly severed.

## Attributes

- **Strength:** 11-14 (1d4+10)

- **Endurance:** 13-16 (1d4+12)

- **Dexterity:** 11-14 (1d4+10)

- **Agility:** 9-12 (1d4+8)

- **Perception:** 11-14 (1d4+10)

- **Aura:** 7-10 (1d4+6)

- **Will:** 13-16 (1d4+12)

- **Reasoning:** 7-10 (1d4+6)

- **Creativity:** 6-9 (1d4+5)
