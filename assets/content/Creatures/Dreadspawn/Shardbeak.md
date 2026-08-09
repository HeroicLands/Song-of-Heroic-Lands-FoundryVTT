---
aliases:
    - Shardbeak
tags:
    - dreadspawn
name:
    full: Shardbeak
    aliases: []
id: P8wL9XPubsbvSFty
slug: shardbeak
img: icons/game-icons/delapouite/griffin-symbol.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 9
        end: 11
        dex: 13
        agl: 15
        per: 15
        aur: 9
        wil: 11
        rea: 8
        cre: 9
    attrRollFormula:
        str: 1d4+6
        end: 1d4+8
        dex: 1d4+10
        agl: 1d4+12
        per: 1d4+12
        aur: 1d4+6
        wil: 1d4+8
        rea: 1d4+5
        cre: 1d4+6
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 1
                - name: Left Wing
                  shortcode: lwingzone
                  probWeight: 1
                - name: Body
                  shortcode: torsozone
                  probWeight: 2
                - name: Right Wing
                  shortcode: rwingzone
                  probWeight: 1
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
                - name: Left Wing
                  shortcode: lwingpart
                  bodyZoneCode: lwingzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 10
                - name: Body
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
                - name: Left Leg
                  shortcode: llegpart
                  bodyZoneCode: hindqtrzone
                  roles:
                      - locomotor
                      - manipulator
                  canHoldItem: false
                  probWeight: 5
                - name: Right Leg
                  shortcode: rlegpart
                  bodyZoneCode: hindqtrzone
                  roles:
                      - locomotor
                      - manipulator
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
                  probWeight: 4
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
                  probWeight: 6
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 3
                      fire: 5
                - name: Left Wing
                  shortcode: lwingloc
                  bodyPartCode: lwingpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
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
                  probWeight: 6
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
                  probWeight: 4
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 3
                      fire: 5
                - name: Right Wing
                  shortcode: rwingloc
                  bodyPartCode: rwingpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 10
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 3
                      fire: 5
                - name: Left Leg
                  shortcode: llegloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 3
                      fire: 5
                - name: Right Leg
                  shortcode: rlegloc
                  bodyPartCode: rlegpart
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
            base: 30
            calc: 30
        reachBase: 0
        bodyScaleBase: 0.82
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: aerial
          feetPerRound: 80
          leaguesPerWatch: 6
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
        - medium: terrestrial
          feetPerRound: 30
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
              masteryLevelBase: 65
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
              masteryLevelBase: 60
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 25
        - name: Crystal-Beak Strike
          type: skill
          system:
              shortcode: beak
              subType: combattechnique
              masteryLevelBase: 52
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: beak
                  name: Crystal-Beak Strike
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 1
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 0
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
        - name: Shard Barrage
          type: skill
          system:
              shortcode: spray
              subType: combattechnique
              masteryLevelBase: 55
              combatCategory: missile
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: missile
                  shortcode: spray
                  name: Shard Barrage
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 0
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 0
                      aspect: edged
                  projectileType: none
                  maxVolleyMult: 1
                  baseRangeBase: 15
                  drawBase: 0
                  traits: {}
---

# Appearance {#appearance}

Light shatters across your vision as something brilliant and terrible takes flight—a bird of impossible beauty wrought from living crystal. Each movement throws prismatic rainbows across the surrounding stone, and the creature itself seems to sing as it moves, a high, ringing sound like glass vibrating at the edge of breaking. Its beak is a spike of impossible sharpness, and its wings—if they can be called wings—are composed of overlapping crystal shards arranged like feathers, each one perfect and lethal. As it circles, the air seems to hum with power, and you can feel the residual magic crackling off its crystalline form. There is something fundamentally wrong about its beauty—like a living weapon that has become too perfect, too honed.

# Dossier {#dossier}

Shardbeaks are creatures of pure arcane manifestation, birds that seem as much crystal as flesh, existing in the boundary between the natural and magical realms. They are born from concentrations of raw magical energy in places of power—arcane nodes, wizard's towers, and locations where the veil between worlds grows thin. A Shardbeak is drawn inexorably to sources of magical power, feeding on arcane energy the way natural birds feed on seeds. Unlike most dreadspawn, Shardbeaks show little evidence of true malice; rather, they are simply predatory by nature and indifferent to the suffering of lesser creatures. They are found most commonly in arcane deserts, high magical peaks, and the ruins of fallen wizard-holds.

## Presentation

A Shardbeak stands roughly 2 to 3 feet in height with a wingspan of 8 to 12 feet, its body composed primarily of translucent, faceted crystal that ranges in color from deep violet to pale aquamarine or amber. Its entire form appears as though sculpted from a single piece of gemstone, with seams barely visible where segments articulate. Its wings are composed of overlapping crystal shards that refract light into dazzling displays and are sharp enough to cut through leather and cloth with minimal effort. Its head terminates in a long, needle-like beak of crystalline hardness, and its eyes are polished gems that seem to glow faintly with internal light. As it moves, the creature emits a faint, high-pitched singing sound—the harmonic resonance of crystal vibrating at the edge of its tolerances. Where it lands, the ground sometimes remains subtly warped, as though the creature's inherent magical presence has left an imprint.

## Key Behaviors

Shardbeaks are primarily attracted to sources of arcane power and will spend considerable time in or near magical locations, seemingly feeding on the ambient energies present. They are primarily diurnal and seem to become more active and aggressive when exposed to sunlight, as though the light feeds them. They show territorial behavior but far less aggressively than most dreadspawn—two Shardbeaks will chase each other from an area but rarely engage in combat. They are drawn to bright lights, metal, and occasionally to humanoid magic users, though whether this attraction is predatory or something else remains unclear. A Shardbeak's lifespan seems tied to its access to magical energy; in areas of deep magical saturation, they live for decades or centuries, while in areas of low magical presence, they slowly weaken and die.

## Combat Strategy

A Shardbeak attacks from the air, diving and striking with incredible speed and precision. It uses its agility to stay out of reach, relying on speed and ranged attacks rather than prolonged melee. The creature is aware enough to recognize weapons and tactics that threaten it and will adjust its attacks accordingly—it will avoid heavy, blunt weapons and instead target creatures wielding them with crystalline shard attacks from distance. If wounded, a Shardbeak will attempt to flee to the nearest source of magical energy, where it can regenerate and regain strength. Only if cornered or defending a particularly rich source of magical power will it engage in combat to the point of death.

## Attack Methods

### Crystal-Beak Strike

The Shardbeak dives and drives its needle-like beak into its target with tremendous force, capable of piercing armor. The beak itself is so sharp that even glancing blows can cause serious wounds.

### Shard Barrage

The creature flares its wings, launching hundreds of razor-sharp crystal fragments in a cone pattern. These shards are small enough to pass through most armor gaps and can cause numerous deep cuts.

### Prismatic Dazzle

The creature's crystalline body refracts and magnifies light to blinding intensity, filling an area with overwhelming radiance that blinds and disorients all creatures unfortunate enough to be in range.

## Special Abilities

### Arcane Affinity

The Shardbeak is drawn to and feeds on magical energy. It can sense sources of magic at considerable distance and is strengthened by proximity to arcane power, gaining bonuses to healing and to all physical abilities while in areas of magical concentration.

### Crystal Armor

The creature's crystalline form is resistant to slashing and piercing damage, though it is remarkably fragile against blunt force and sonic attacks, which can shatter its protective shell.

### Prismatic Refraction

The Shardbeak's crystalline surface causes all light to refract in unpredictable ways, making it difficult to focus on or target. Attacks against it suffer disadvantage unless the attacker is particularly observant or uses magical means to track it.

## Additional Information

Shardbeaks are extremely vulnerable to sonic attacks, which can shatter their crystalline bodies. Thunder and vibration-based magic is particularly effective. They are also weak to cold, which can cause their crystal to become brittle and prone to cracking. Blunt force trauma is also effective—while slashing weapons glance off their smooth surfaces, heavy hammers and mauls can deal serious damage. In areas where magic is suppressed or nullified, a Shardbeak will slowly weaken and eventually die from lack of sustenance. The creature's corpse, if preserved carefully, retains value—its crystalline components can be fashioned into gems of unusual properties, used in magical foci, or ground into components for potion creation. Some alchemists prize Shardbeak crystal above diamonds for its inherent magical reactivity.

## Attributes

- **Strength:** 7-10 (1d4+6)

- **Endurance:** 9-12 (1d4+8)

- **Dexterity:** 11-14 (1d4+10)

- **Agility:** 13-16 (1d4+12)

- **Perception:** 13-16 (1d4+12)

- **Aura:** 7-10 (1d4+6)

- **Will:** 9-12 (1d4+8)

- **Reasoning:** 6-9 (1d4+5)

- **Creativity:** 7-10 (1d4+6)
