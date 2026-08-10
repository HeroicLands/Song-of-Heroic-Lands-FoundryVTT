---
aliases:
    - Celestial Crane
tags:
    - animal
    - image-needed
name:
    full: Crane
    aliases: []
id: i63ZifkjQf8TYoHl
slug: crane
img: icons/game-icons/lorc/paw-print.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 5
        end: 8
        dex: 14
        agl: 15
        per: 15
        aur: 13
        wil: 9
        rea: 7
        cre: 6
    attrRollFormula:
        str: 1d4+2
        end: 1d4+5
        dex: 1d6+10
        agl: 1d6+11
        per: 1d6+11
        aur: 1d6+9
        wil: 1d4+6
        rea: 1d4+4
        cre: 1d4+3
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 1
                - name: Body
                  shortcode: torsozone
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
                  bodyZoneCode: headzone
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
                  bodyZoneCode: hindqtrzone
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
                  probWeight: 3
                - name: Right Leg
                  shortcode: rlegpart
                  bodyZoneCode: hindqtrzone
                  roles:
                      - locomotor
                      - manipulator
                  canHoldItem: false
                  probWeight: 3
                - name: Tail
                  shortcode: tailpart
                  bodyZoneCode: hindqtrzone
                  roles: []
                  canHoldItem: false
                  probWeight: 4
            locations:
                - name: Head
                  shortcode: headloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 3
                  protectionBase:
                      blunt: -1
                      edged: -2
                      piercing: -3
                      fire: -1
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 2
                  protectionBase:
                      blunt: -1
                      edged: -2
                      piercing: -3
                      fire: -1
                - name: Left Wing
                  shortcode: lwingloc
                  bodyPartCode: lwingpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 10
                  protectionBase:
                      blunt: -1
                      edged: -2
                      piercing: -3
                      fire: -1
                - name: Thorax
                  shortcode: thoraxloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 6
                  protectionBase:
                      blunt: -1
                      edged: -2
                      piercing: -3
                      fire: -1
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 4
                  protectionBase:
                      blunt: -1
                      edged: -2
                      piercing: -3
                      fire: -1
                - name: Right Wing
                  shortcode: rwingloc
                  bodyPartCode: rwingpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 10
                  protectionBase:
                      blunt: -1
                      edged: -2
                      piercing: -3
                      fire: -1
                - name: Left Leg
                  shortcode: llegloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: -1
                      edged: -2
                      piercing: -3
                      fire: -1
                - name: Right Leg
                  shortcode: rlegloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: -1
                      edged: -2
                      piercing: -3
                      fire: -1
                - name: Tail
                  shortcode: tailloc
                  bodyPartCode: tailpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 1
                  probWeight: 10
                  protectionBase:
                      blunt: -1
                      edged: -2
                      piercing: -3
                      fire: -1
        weight:
            base: 12
            calc: "12"
        reachBase: 0
        bodyScaleBase: 0.45
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: aerial
          feetPerRound: 80
          leaguesPerWatch: 8
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
        - medium: terrestrial
          feetPerRound: 50
          leaguesPerWatch: 3
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
              masteryLevelBase: 33
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 32
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 60
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 18
        - name: Beak Stab
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
                  name: Beak Stab
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 1
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: -2
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
        - name: Wing Buffet
          type: skill
          system:
              shortcode: ram
              subType: combattechnique
              masteryLevelBase: 45
              combatCategory: melee
              impairedByRoles:
                  - core
              strikeMode:
                  type: melee
                  shortcode: ram
                  name: Wing Buffet
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 2
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: -3
                      aspect: blunt
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

The bird stands in the shallows of the imperial lake, motionless, and for a moment you mistake it for a statue — some artisan's offering placed at the water's edge. It is nearly as tall as a man, balanced on legs as thin and straight as calligraphy strokes, its body a study in restrained elegance: white plumage so clean it seems to generate its own light, a long neck curved in a line that no brush could improve upon, and a crown of bare crimson skin on the skull that burns like a coal against the white. Then the bird moves, and the illusion of stillness becomes an illusion of dance — each step placed with deliberate, measured grace, the neck extending and retracting in slow arcs, the entire body flowing through the shallow water as if choreographed to music only it can hear. When it calls, the sound is extraordinary — a clear, ringing trumpet that echoes across the water and seems to resonate in the chest, a sound of such piercing beauty that the courtiers on the far bank stop mid-conversation and turn to listen. The [[Empire of Tānvür|Tānvürans]] say the crane's call is the voice of heaven announcing that the cosmic order still holds. Standing here, watching the bird move through light and water, you find it difficult to disagree.

# Dossier {#dossier}

The Crane is the most culturally significant bird in the [[Empire of Tānvür|Empire of Tānvür]] — a tall, elegant wading bird that has been woven so deeply into the imperial culture that harming one carries legal consequences. Standing four to five feet tall with a wingspan of seven to eight feet, the crane is found in wetlands, river margins, and imperial lakes throughout Tānvür's temperate and subtropical regions. Cranes mate for life and can live for decades — qualities that have made them symbols of fidelity, longevity, and cosmic order in the [[Tëngvōk Vān Lëi]] tradition. The crane appears on imperial documents, on the robes of the [[Tānthëi|Celestial Scholars]], on temple banners, and in the formal dances performed at court. Crane imagery is so pervasive in Tānvüran culture that it functions almost as a national symbol. Wild cranes are protected on imperial lands, and deliberate killing of a crane can result in severe punishment — a fact that creates practical complications when the birds establish nesting territories in inconvenient locations, as no official dares order their removal. Adventurers in Tānvür encounter cranes in wetland areas, on imperial estates, at temples, and in the elaborate court rituals where trained cranes or crane imagery features prominently.

## Presentation

The crane is a bird of extraordinary visual elegance — tall and slender, with proportions that seem designed by an aesthetician rather than by nature. The plumage is primarily white or pale gray, immaculately clean, with contrasting black flight feathers visible only when the wings are spread. The most distinctive feature is the bare patch of crimson skin on the crown of the head — a vivid splash of color against the white that intensifies during courtship displays and emotional arousal. The neck is long and sinuous, held in graceful curves while standing and extended to its full length during flight, where the crane presents a silhouette of outstretched neck and trailing legs that is immediately recognizable. The legs are long, thin, and dark, ending in feet adapted for wading in soft mud and shallow water. The beak is long, straight, and dagger-like — a precision tool for spearing fish, frogs, and invertebrates. The overall impression is one of restrained, almost austere beauty — the crane is not showy like the peacock but carries itself with a dignity that has inspired poets and painters for centuries.

## Key Behaviors

Cranes are monogamous and mate for life — pairs that lose a partner may remain solitary for years or permanently. This fidelity is the foundation of their cultural significance. Pairs maintain territories around nesting sites, which they defend with aggressive displays and, if necessary, physical confrontation. The crane's courtship dance is the behavior that has most captivated Tānvüran culture: an elaborate, ritualized performance in which pairs bow, leap, spread their wings, toss vegetation, and trumpet in coordinated sequences that can last for extended periods. These dances are performed not only during courtship but throughout the year, apparently as a means of strengthening the pair bond. Cranes are migratory, moving between breeding grounds in the northern provinces and wintering areas in the southern wetlands, and their seasonal arrival and departure is marked in the Tānvüran calendar as an event of cosmological significance. They feed on fish, frogs, insects, grain, and small mammals, wading through shallow water with slow, deliberate steps and striking with their dagger-beak at sudden speed.

## Combat Strategy

Cranes are not aggressive toward humans and will generally retreat from confrontation by taking flight. When defending a nest, however, they become fierce — a nesting crane will spread its wings to appear larger, trumpet loudly, and strike with its beak at the eyes and face of any intruder. The beak is a genuine weapon: sharp, driven by the muscular neck with stabbing force, and aimed with precision at vulnerable areas. A pair defending a nest will coordinate their attacks, with one bird distracting while the other strikes from the flank. Against natural predators such as foxes or small cats, this defense is remarkably effective.

## Attack Methods

### Beak Stab

The crane drives its long, sharp beak forward with the full extension of its neck, targeting the eyes, face, or other vulnerable areas. The strike is fast and precise, and the beak is sharp enough to draw blood and potentially blind an attacker.

### Wing Buffet

The crane strikes with the leading edge of its spread wing — a bony joint that delivers a surprisingly forceful blow capable of stunning small predators and disorienting larger ones.

## Special Abilities

### Courtship Dance

The crane's dance is not merely mating behavior — in the context of Tānvüran culture, it has acquired almost ritual significance. Cranes that dance on the grounds of temples or imperial estates are interpreted as auspicious omens, and their movements are studied by the [[Tānthëi|Celestial Scholars]] for cosmological meaning. A pair of cranes establishing a nesting territory near a settlement is considered a blessing.

### Trumpeting Call

The crane's call is a clear, resonant trumpet produced by an elongated, coiled trachea that amplifies the sound. The call carries for miles across flat terrain and has a distinctive, piercing quality that is impossible to mistake for any other bird. In practical terms, cranes serve as effective sentinels — their alarm calls alert an area to the presence of predators or intruders.

### Sacred Protection

In Tānvür, the crane's protected legal status creates a practical game mechanic: harming or killing a crane within imperial jurisdiction is a serious offense. This protection extends to nesting sites, meaning that a crane nesting in an inconvenient location — a bridge, a granary, a military fortification — creates a genuine bureaucratic crisis that no official wants to resolve by ordering the nest removed.

## Attributes

- **Strength:** 3-6 (1d4+2) — Minimal; a wading bird, not built for power
- **Endurance:** 6-9 (1d4+5) — Decent migratory stamina; can fly long distances
- **Dexterity:** 11-16 (1d6+10) — Precise beak strikes and delicate wading movements
- **Agility:** 12-17 (1d6+11) — Graceful in air and on ground; the dance requires remarkable coordination
- **Perception:** 12-17 (1d6+11) — Alert sentinel; excellent vision and hearing
- **Aura:** 10-15 (1d6+9) — Profound cultural and spiritual significance; symbol of cosmic order
- **Will:** 7-10 (1d4+6) — Determined nest defenders; otherwise peaceful
- **Reasoning:** 5-8 (1d4+4) — Intelligent bird; recognizes individual humans and remembers locations
- **Creativity:** 4-7 (1d4+3) — Limited
