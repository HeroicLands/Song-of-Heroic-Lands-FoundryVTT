---
aliases:
    - Frostmaw
tags:
    - elemental
name:
    full: Frostmaw
    aliases: []
id: eUOcXzXo2vWIG2sf
slug: frostmaw
img: icons/game-icons/delapouite/griffin-symbol.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 17
        end: 17
        dex: 9
        agl: 9
        per: 9
        aur: 9
        wil: 15
        rea: 8
        cre: 8
    attrRollFormula:
        str: 1d4+14
        end: 1d4+14
        dex: 1d4+6
        agl: 1d4+6
        per: 1d4+6
        aur: 1d4+6
        wil: 1d4+12
        rea: 1d4+5
        cre: 1d4+5
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
                      blunt: 9
                      edged: 8
                      piercing: 7
                      fire: 9
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 4
                  protectionBase:
                      blunt: 9
                      edged: 8
                      piercing: 7
                      fire: 9
                - name: Left Foreleg
                  shortcode: lforelegloc
                  bodyPartCode: lforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 9
                      edged: 8
                      piercing: 7
                      fire: 9
                - name: Right Foreleg
                  shortcode: rforelegloc
                  bodyPartCode: rforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 9
                      edged: 8
                      piercing: 7
                      fire: 9
                - name: Thorax
                  shortcode: thoraxloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 5
                  protectionBase:
                      blunt: 9
                      edged: 8
                      piercing: 7
                      fire: 9
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 3
                  protectionBase:
                      blunt: 9
                      edged: 8
                      piercing: 7
                      fire: 9
                - name: Pelvis
                  shortcode: plvsloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 2
                  protectionBase:
                      blunt: 9
                      edged: 8
                      piercing: 7
                      fire: 9
                - name: Left Hind Leg
                  shortcode: lhindlegloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 9
                      edged: 8
                      piercing: 7
                      fire: 9
                - name: Right Hind Leg
                  shortcode: rhindlegloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 9
                      edged: 8
                      piercing: 7
                      fire: 9
                - name: Tail
                  shortcode: tailloc
                  bodyPartCode: tailpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 1
                  probWeight: 10
                  protectionBase:
                      blunt: 9
                      edged: 8
                      piercing: 7
                      fire: 9
        weight:
            base: 0
            calc: 0
        reachBase: 0
        bodyScaleBase: 1.55
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 50
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
              masteryLevelBase: 60
        - shortcode: stlth
          type: skill
          system:
              masteryLevelBase: 60
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
              masteryLevelBase: 36
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 43
        - name: Crushing Bite
          type: skill
          system:
              shortcode: bite
              subType: combattechnique
              masteryLevelBase: 58
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
                      spread: 4
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 4
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
        - name: Freezing Breath
          type: skill
          system:
              shortcode: breath
              subType: combattechnique
              masteryLevelBase: 61
              combatCategory: missile
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: missile
                  shortcode: breath
                  name: Freezing Breath
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 0
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 4
                      modifier: 5
                      aspect: fire
                  projectileType: none
                  maxVolleyMult: 1
                  baseRangeBase: 60
                  drawBase: 0
                  traits: {}
        - name: Glacial Crush
          type: skill
          system:
              shortcode: ram
              subType: combattechnique
              masteryLevelBase: 48
              combatCategory: melee
              impairedByRoles:
                  - core
              strikeMode:
                  type: melee
                  shortcode: ram
                  name: Glacial Crush
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 8
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 3
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

The world stops being warm. What emerges from the blizzard is massive, easily thirty feet in length, a thing of solid ice that catches and refracts light in terrible ways. It is roughly bear-shaped but wrong in proportion, built for strength and destruction rather than natural grace. Its breath is visible as it moves—not mist but crystalline air that spreads cold like a plague. Where its weight settles, the earth becomes brittle and cracks. When it opens its mouth, you see not teeth but formations of ice hanging like stalactites, and the air that flows from it is the breath of a world without sun.

# Dossier {#dossier}

A Frostmaw is an elemental force of pure glacial destruction, more powerful than smaller ice creatures. It is drawn to deep cold and frozen wastes, and it may remain in a single region for years, slowly deepening winter and expanding the frozen territory. Some Frostmaws are bound to serve, but most roam wild, driven by hunger and the simple imperative to spread cold and ice. An encounter with a Frostmaw in the depths of winter is a genuine existential threat.

## Presentation

A Frostmaw is massive, roughly thirty feet in length, and vaguely bear-like in shape. Its body is composed entirely of solid, blue-white ice, each surface carved with geometric patterns that seem to shift and realign themselves. Its musculature is visible as layers within the ice, and it moves with surprising grace for something so massive and dense. Its eyes are the only clearly animated feature—bright, cold sapphire that burns with awareness and hunger. Its mouth is a cavern lined with ice formations like teeth or stalactites. Where it moves, the temperature drops precipitously, and the ground beneath it becomes brittle and prone to cracking.

## Key Behaviors

Frostmaws are solitary and territorial, claiming vast glacial regions as their hunting grounds. They are driven by hunger for heat and life—they pursue warm-blooded creatures with single-minded determination. They are intelligent enough to plan hunts and understand tactics, but they are also driven by instinct and rage that overcomes thought. A Frostmaw in a region will slowly transform that region into deeper and deeper winter, expanding the area of extreme cold over seasons. They seem to take satisfaction in this transformation beyond simple necessity.

## Combat Strategy

A Frostmaw fights with terrible directness, charging opponents and using its massive strength to overwhelm them. It employs its freezing breath as both weapon and environmental control, transforming battlefields into icy hazards. It is utterly fearless and will pursue prey to exhaustion. Against fire and heat, it becomes more careful but does not flee—it adapts, using cold to counter heat and attempting to overwhelm the source of warmth. A Frostmaw rarely retreats and fights until destroyed or until enemies flee far enough away.

## Attack Methods

### Crushing Bite

The Frostmaw's jaws close with devastating force, and victims are simultaneously crushed and frozen. The bite is difficult to escape because the creature's strength is enormous, and the cold makes the victim sluggish and desperate.

### Freezing Breath

The Frostmaw exhales a torrent of sub-zero air and crystalline ice that can freeze entire areas solid. The breath is devastatingly powerful, capable of immobilizing multiple opponents and transforming liquid water into ice.

### Falling Ice

The Frostmaw causes the air itself to crystallize into falling shards of ice that strike like weapons. These shards spread additional cold and can cause lacerations from their edges.

### Glacial Crush

The Frostmaw strikes the frozen ground with its massive weight, causing the ice beneath to crack and explode outward. The attack can knock opponents off their feet and fill an area with sharp ice fragments.

## Special Abilities

### Glacial Regeneration

The Frostmaw can repair its form by drawing moisture from the air and freezing it onto its body. In cold or damp environments, it heals at a remarkable rate. This makes it nearly impossible to outlast in its native habitat.

### Frozen Mastery

The Frostmaw exerts absolute control over ice and snow in its territory. It can thicken ice, create new frozen obstacles, and use the environment as both shield and weapon.

### Extreme Cold

The temperature around a Frostmaw is lethal. Within one hundred feet, exposed flesh freezes in minutes. The extreme cold makes movement difficult and reduces the effectiveness of most physical actions.

### Hibernation Cycle

A Frostmaw can enter a kind of hibernation where it becomes dormant and nearly impossible to distinguish from a natural glacier. It will awaken with the coming of winter or if disturbed.

## Additional Information

Fire is the Frostmaw's only serious weakness. A large, sustained source of heat can harm it significantly. Warm-based magic is effective. However, even against fire, a Frostmaw will fight with determined aggression. A Frostmaw destroyed far from cold sources or in extreme heat may not reform. One destroyed in its native glacial territory will likely return after several seasons. Permanent destruction requires either sustained exposure to extreme heat or collapsing it into warm water or underground geothermal regions. Some settlements in frozen lands have learned to coexist with a Frostmaw by offering it hunting territories separate from human habitation. Such arrangements are delicate and may break at any time.

## Attributes

- **Strength:** 15-18 (1d4+14)

- **Endurance:** 15-18 (1d4+14)

- **Dexterity:** 7-10 (1d4+6)

- **Agility:** 7-10 (1d4+6)

- **Perception:** 7-10 (1d4+6)

- **Aura:** 7-10 (1d4+6)

- **Will:** 13-16 (1d4+12)

- **Reasoning:** 6-9 (1d4+5)

- **Creativity:** 6-9 (1d4+5)
