---
aliases:
    - Embermaw
tags:
    - elemental
name:
    full: Embermaw
    aliases: []
id: Q2oJByEiRbME0lGy
slug: embermaw
img: icons/game-icons/delapouite/griffin-symbol.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 30
        end: 15
        dex: 9
        agl: 11
        per: 11
        aur: 15
        wil: 13
        rea: 9
        cre: 9
    attrRollFormula:
        str: 1d6+27
        end: 1d4+12
        dex: 1d4+6
        agl: 1d4+8
        per: 1d4+8
        aur: 1d4+12
        wil: 1d4+10
        rea: 1d4+6
        cre: 1d4+6
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 2
                - name: Forelegs
                  shortcode: forelegszone
                  probWeight: 2
                - name: Torso
                  shortcode: torsozone
                  probWeight: 4
                - name: Hindquarters
                  shortcode: hindqtrzone
                  probWeight: 2
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
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 4
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Left Foreleg
                  shortcode: lforelegloc
                  bodyPartCode: lforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Right Foreleg
                  shortcode: rforelegloc
                  bodyPartCode: rforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Thorax
                  shortcode: thoraxloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 5
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 3
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Pelvis
                  shortcode: plvsloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 2
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Left Hind Leg
                  shortcode: lhindlegloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Right Hind Leg
                  shortcode: rhindlegloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Tail
                  shortcode: tailloc
                  bodyPartCode: tailpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 1
                  probWeight: 10
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
        weight:
            base: 2600
            calc: "2600"
        reachBase: 0
        bodyScaleBase: 2.73
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 50
          leaguesPerWatch: 4
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors:
              - scope: surface_cover
                key: wetlands
                mode: override
                textValue: "0"
              - scope: surface_cover
                key: dunes
                mode: override
                textValue: "0"
              - scope: surface_cover
                key: mixed_forest
                mode: override
                textValue: "0"
              - scope: surface_cover
                key: barren
                mode: override
                textValue: "0"
              - scope: surface_cover
                key: ruins
                mode: override
                textValue: "0"
              - scope: hydrology
                key: shallow
                mode: override
                textValue: "0"
              - scope: hydrology
                key: deep
                mode: override
                textValue: "0"
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
              masteryLevelBase: 42
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 44
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 44
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 58
        - name: Ember Bite
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
                  name: Ember Bite
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 2
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 10
                      aspect: fire
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
        - name: Fire Breath
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
                  name: Fire Breath
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 0
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 4
                      modifier: 9
                      aspect: fire
                  projectileType: none
                  maxVolleyMult: 1
                  baseRangeBase: 25
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
                      spread: 4
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 7
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

Before you, the ground itself seems to become molten. A creature writhes upward from heat-shimmer and flame—vaguely reptilian, perhaps twelve feet from snout to tail, composed of roiling lava and burning rock held in a rough dragon shape. Its mouth opens to reveal an interior of pure flame and magma-drip. The heat is overwhelming, a physical force that forces you to squint and turn your face away. With each movement, cracks form in the earth beneath it, glowing orange-red from within.

# Dossier {#dossier}

Embermaws are elementals of pure molten heat and destructive fire, more powerful than their smaller cousins the Emberhounds. They are drawn to volcanic regions and places of extreme geothermal activity, where they feed on the earth's own fire. An Embermaw is driven by hunger and territorial aggression in equal measure. They are not mindless—they plan hunts and understand tactics—but their primary motivation is destruction and consumption. An Embermaw encountered in the wild is almost certainly a threat that will need to be fought or avoided entirely.

## Presentation

An Embermaw is a draconic creature roughly twelve feet long, composed entirely of living lava and burning rock. Its body is a shifting mass of orange-red molten matter held in reptilian shape by forces not entirely understood. Its scales appear to be cooled basalt on the surface but glow orange from cracks where molten interior is visible. Its eyes are pools of white-hot lava that burn with intelligence and hunger. Its mouth opens to reveal an interior filled with flame and dripping magma. Where it moves, the ground cracks and melts, and everything flammable ignites from proximity.

## Key Behaviors

Embermaws are solitary, territorial creatures that claim volcanic regions or places of intense heat as their own. They are extremely aggressive and will attack almost any intrusion into their territory. They hunt actively, pursuing prey across difficult terrain and using the landscape to their advantage. They are drawn to sources of fuel and will consume anything flammable in their path. Unlike smaller fire elementals, they seem to take satisfaction in destruction for its own sake. An Embermaw will often destroy settlements or forests for no reason other than the simple pleasure of immolation. They are intelligent enough to lay ambushes and to understand the weaknesses of their enemies.

## Combat Strategy

An Embermaw fights with relentless aggression, using its strength and size to overwhelm opponents. It attacks from protected positions in lava or among volcanic rock, using terrain as cover and advantage. It is utterly fearless and will pursue a wounded opponent to the death. Against cold and water attacks, it becomes more cautious and may withdraw to deeper heat sources. It fights most effectively in volcanic or heated terrain where it can draw power from the environment. An Embermaw rarely retreats and fights until destroyed or until all enemies flee.

## Attack Methods

### Fire Breath

The Embermaw exhales a torrent of flame and molten lava that devastates everything in its path. The attack is terrifyingly powerful, capable of immolating entire areas and melting armor and weapons. Multiple targets caught in the breath suffer equally, and the lava lingers, creating hazardous terrain.

### Ember Bite

The Embermaw's jaws close with crushing force around a victim, and the victim is simultaneously crushed and immolated. The bite causes terrible physical damage and severe thermal burns, and the victim remains in contact with molten matter while held.

### Magma Spray

The creature rears back and sprays molten magma and burning debris in a wide arc. This attack is less devastating than the breath but covers a wider area and can catch multiple opponents at once.

### Tail Whip

The Embermaw swings its lava-composed tail in wide arcs, striking with tremendous force. The tail leaves trails of burning lava and can ignite surrounding terrain.

## Special Abilities

### Molten Composition

The Embermaw's body is composed of living lava, making it essentially immune to fire damage. It heals from fire-based magic and is harmed primarily by cold and water. Physical weapons are largely ineffective due to the flowing nature of its form.

### Lava Mastery

The Embermaw can move through lava as easily as water, and it draws strength from volcanic activity. In regions of active volcanism, it becomes more powerful and more difficult to harm.

### Heat Aura

The ambient temperature near an Embermaw is extreme. Within fifty feet, the air itself is hot enough to cause pain. Exposed skin burns from proximity, and flammable materials ignite without direct contact.

### Environmental Destruction

Everywhere the Embermaw goes, the landscape is transformed. Forests become ash, water sources are evaporated, and stone cracks and melts. The destruction is not tactical but rather an inevitable consequence of its presence.

### Thermal Regeneration

The Embermaw can regenerate wounds by immersing itself in lava or standing near sources of extreme heat. An Embermaw cornered away from heat sources becomes more vulnerable, but an Embermaw with access to lava can heal injuries at a tremendous rate.

## Additional Information

Cold is the Embermaw's primary weakness. Large bodies of cold water can harm it significantly, and sustained cold-based magic can reduce its effectiveness. An Embermaw cannot remain in frozen terrain for extended periods—the cold causes it to become sluggish and eventually dormant. Some fortifications are built with cold-resistant materials and anti-fire barriers specifically to counter Embermaw threats. An Embermaw destroyed far from volcanic heat may not reform, depending on its origin. One destroyed near lava or in volcanic regions will likely return after several seasons. Permanent destruction requires either taking it far from all heat sources and destroying it, or collapsing its location into deeper magma where it will be carried away into the earth's depths.

## Attributes

- **Strength:** 11-14 (1d4+10)

- **Endurance:** 13-16 (1d4+12)

- **Dexterity:** 7-10 (1d4+6)

- **Agility:** 9-12 (1d4+8)

- **Perception:** 9-12 (1d4+8)

- **Aura:** 13-16 (1d4+12)

- **Will:** 11-14 (1d4+10)

- **Reasoning:** 7-10 (1d4+6)

- **Creativity:** 7-10 (1d4+6)
