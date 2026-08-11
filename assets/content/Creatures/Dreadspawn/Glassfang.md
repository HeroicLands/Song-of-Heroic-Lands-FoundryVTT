---
aliases:
    - Glassfang
tags:
    - dreadspawn
name:
    full: Glassfang
    aliases: []
id: ehEf5wCFXsQmP6pd
img: icons/game-icons/delapouite/griffin-symbol.svg
portrait: ""
shortcode: glssfng
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        end: 6
        dex: 15
        agl: 15
        per: 11
        aur: 11
        wil: 9
        rea: 8
        cre: 11
        str: 8
    attrRollFormula:
        end: 1d4+3
        dex: 1d4+12
        agl: 1d4+12
        per: 1d4+8
        aur: 1d4+8
        wil: 1d4+6
        rea: 1d4+5
        cre: 1d4+8
        str: 1d4+6
    body:
        structure:
            zones:
                - name: Forequarters
                  shortcode: fqtrzone
                  probWeight: 2
                - name: Torso
                  shortcode: torsozone
                  probWeight: 2
                - name: Hindquarters
                  shortcode: hindqtrzone
                  probWeight: 2
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
                  probWeight: 2
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
            base: 80
            calc: 80
        reachBase: 0
        bodyScaleBase: 0.81
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
              masteryLevelBase: 50
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
              masteryLevelBase: 36
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 52
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 18
        - name: Crystalline Bite
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
                  name: Crystalline Bite
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 1
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 8
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
                      poison: true
        - name: Shard Release
          type: skill
          system:
              shortcode: spray
              subType: combattechnique
              masteryLevelBase: 70
              combatCategory: missile
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: missile
                  shortcode: spray
                  name: Shard Release
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 0
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: -1
                      aspect: edged
                  projectileType: none
                  maxVolleyMult: 1
                  baseRangeBase: 15
                  drawBase: 0
                  traits: {}
---

# Appearance {#appearance}

Nothing is there, and then something is—a shimmer of light bending wrong, a shadow that isn’t quite transparent enough. You see it only when it moves, and when it does, your breath catches: the thing is made of glass, or ice, or something harder than either. Curved fangs catch light even though they shouldn’t be visible. It’s the size of a hunting cat, sleek and lethal, and it moves faster than thought toward your throat with predatory focus utterly clear in eyes like crystal slivers.

# Dossier {#dossier}

Glassfangs are magical predators born where light magic concentrates in the physical world, small hunters of terrible speed and lethality. These creatures hunt in places of bright light and magical radiation, moving through the world nearly invisible. Adventurers encounter them in crystalline caverns, in places of high magical concentration, near ancient magical sites, and in areas where light refracts unpredictably.

## Presentation

The Glassfang is a small predator, roughly the size of a large cat or small dog, composed almost entirely of transparent crystalline material. Its body is sleek and aerodynamic, optimized for speed. Its scales are smooth yet razor-edged, capable of cutting on contact. Its most distinctive feature is its mouth—full of curved fangs made of crystal so clear they’re nearly invisible, yet capable of piercing through most materials. Its eyes are the only opaque features: small, dark points within the crystal body that burn with intelligent predatory focus. The creature produces a faint chiming sound as it moves, like wind-chimes or crystal striking crystal. In bright light, it becomes almost completely invisible, visible only as a shimmer or distortion of light. In dim light, it is somewhat more visible.

## Key Behaviors

The Glassfang is a solitary, highly active hunter that spends most of its time in motion, stalking prey. It prefers bright environments where its near-invisibility is most effective, but it will hunt in lower light if prey is available. It demonstrates considerable intelligence in understanding prey behavior and setting ambushes. The creature shows no territorial behavior—it simply hunts where prey exists. It feeds frequently, consuming small creatures and the life-force of magical beings. It shows no social behavior and exhibits no interest in other Glassfangs beyond territorial avoidance. When injured, it becomes erratic and aggressive rather than cautious.

## Combat Strategy

The Glassfang relies absolutely on surprise and invisibility. It stalks prey until certain of advantage, then strikes with explosive speed and ferocity. Its opening attack is a bite from concealment, aiming for vital areas. If that initial strike does not immediately incapacitate prey, it attacks again in rapid succession, using speed and invisibility to prevent retaliation. If it takes significant damage, it attempts to break contact and flee, using its speed to escape. It does not engage in prolonged combat with anything that matches its physical durability. If pursued, it uses light refraction and terrain knowledge to break line of sight and escape.

## Attack Methods

### Crystalline Bite

The Glassfang lunges with tremendous speed, attempting to bite the target with its razor-edged fangs. The bite is designed to cause bleeding and open severe wounds; the fang edges can penetrate armor that would stop normal teeth.

### Venomous Injection

The fangs themselves secrete a magical venom that courses through the bitten victim’s bloodstream. The venom causes progressive weakness and potential paralysis with repeated applications.

### Crystalline Shard Release

When threatened or injured, the Glassfang can deliberately dislodge shards of its body and propel them toward threats. These shards are razor-sharp and travel with surprising speed; the creature can release multiple shards in succession.

## Special Abilities

### Transparency

The Glassfang’s crystalline body refracts light in ways that render it nearly invisible. In bright environments, it is effectively invisible unless moving rapidly. In dim light, it is difficult to see but not impossible. It gains massive advantage on stealth and concealment checks and can approach prey without detection even in relatively open ground.

### Crystalline Fragility

The Glassfang’s transparency and hardness come at the cost of brittleness. While it resists slashing and piercing damage (the edges of its scales deflecting blades), it is extremely vulnerable to blunt-force trauma, sonics, and vibration. A single solid hit from a hammer or blunt weapon can crack or shatter sections of its body, severely impairing function.

### Light Refraction

The Glassfang can deliberately bend light around itself, creating distortion effects that confuse visual predators. It can create blinding flashes of refracted light to disorient pursuers or prey.

### Predatory Acceleration

The creature’s physical form allows for sustained high-speed movement. It can sprint at great speed without tiring and can maintain that speed for extended periods, making pursuit nearly impossible for normal creatures.

## Additional Information

Glassfangs are vulnerable to sonic and vibration-based attacks, which shatter their crystalline structure. Blunt-force weapons are more effective than blades. The creature’s near-invisibility makes it exceptionally dangerous in small spaces where escape is difficult—in open ground, prey can potentially flee into areas where their higher endurance provides advantage. Some wizards and mages specifically protect their laboratories with anti-Glassfang wards, suggesting these creatures are drawn to sources of magical radiation.

## Attributes

- **Endurance:** 4-7 (1d4+3)

- **Dexterity:** 13-16 (1d4+12)

- **Agility:** 13-16 (1d4+12)

- **Perception:** 9-12 (1d4+8)

- **Aura:** 9-12 (1d4+8)

- **Will:** 7-10 (1d4+6)

- **Reasoning:** 6-9 (1d4+5)

- **Creativity:** 9-12 (1d4+8)
