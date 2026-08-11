---
aliases:
    - Grey Seal
tags:
    - animal
    - image-needed
name:
    full: Seal
    aliases: []
id: TvRddodNaxRqAUmo
img: icons/game-icons/lorc/paw-print.svg
portrait: ""
shortcode: seal
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 9
        end: 12
        dex: 14
        agl: 13
        per: 14
        aur: 7
        wil: 9
        rea: 8
        cre: 6
    attrRollFormula:
        str: 1d4+6
        end: 1d6+8
        dex: 1d6+10
        agl: 1d6+9
        per: 1d6+10
        aur: 1d4+4
        wil: 1d4+6
        rea: 1d4+5
        cre: 1d4+3
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 3
                - name: Body
                  shortcode: torsozone
                  probWeight: 5
                - name: Tail
                  shortcode: tailzone
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
                - name: Body
                  shortcode: torsopart
                  bodyZoneCode: torsozone
                  roles:
                      - core
                  canHoldItem: false
                  probWeight: 10
                - name: Left Fin
                  shortcode: lfinpart
                  bodyZoneCode: torsozone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 2
                - name: Right Fin
                  shortcode: rfinpart
                  bodyZoneCode: torsozone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 2
                - name: Tail
                  shortcode: tailpart
                  bodyZoneCode: tailzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 10
            locations:
                - name: Head
                  shortcode: headloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 6
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Gills
                  shortcode: gillloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 4
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Body
                  shortcode: bodyloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 6
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Underbelly
                  shortcode: underbellyloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 4
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Left Fin
                  shortcode: lfinloc
                  bodyPartCode: lfinpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Right Fin
                  shortcode: rfinloc
                  bodyPartCode: rfinpart
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
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
        weight:
            base: 400
            calc: "400"
        reachBase: 0
        bodyScaleBase: 0.88
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 30
          leaguesPerWatch: 1
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors:
              - scope: hydrology
                key: shallow
                mode: add
                textValue: "0"
          disabled: false
        - medium: aquatic
          feetPerRound: 80
          leaguesPerWatch: 8
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
              masteryLevelBase: 55
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 24
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
              masteryLevelBase: 28
        - name: Defensive Bite
          type: skill
          system:
              shortcode: bite
              subType: combattechnique
              masteryLevelBase: 61
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: bite
                  name: Defensive Bite
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 2
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 0
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
---

# Appearance {#appearance}

The rocks are alive with them. Dozens of sleek, mottled bodies draped across the shoreline like discarded gray cloaks, their wet fur catching the pale northern light. The nearest one lifts its head and regards you with enormous dark eyes that hold an expression so human it is briefly unsettling — curious, wary, and faintly melancholic, as if it knows something about the world that you have not yet learned. The body is a streamlined torpedo of muscle and blubber, perfectly smooth, every line curved for speed through water. On land it moves with an ungainly, lurching shuffle, propelling itself with rippling contractions of its torso. But when the nearest animal slides into the water at your approach, the transformation is instantaneous — the awkward slug becomes a silver arrow, rolling and diving with fluid grace, its wake a brief ripple on dark water before it vanishes entirely.

# Dossier {#dossier}

The Seal is the common marine mammal of [[Kingdom_of_Nordheim]]'s coastlines, fjords, and island chains — a sleek, fish-eating pinniped weighing between one hundred fifty and six hundred pounds depending on species and sex. Seals are the everyday subsistence animal of coastal Normen communities: their meat feeds families through winter, their blubber provides lamp oil and waterproofing, their hides make durable leather for clothing and boat-skins, and their bones and sinew serve a hundred practical purposes. Where reindeer define highland and tundra culture, seals define coastal life. They congregate in breeding colonies on rocky shorelines and haul-out sites, and their seasonal movements along the coast dictate the fishing and hunting calendar of every fjord settlement. Seals are also the primary prey of the polar bear, and their breathing holes in sea ice are the focal points of the most dangerous predator-prey interaction in the north. Adventurers encounter seals during coastal travel, at fishing settlements, and occasionally in sea caves or on ice floes where their colonies provide unexpected obstacles or opportunities.

## Presentation

The seal's body is a masterwork of hydrodynamic design — a smooth, tapered cylinder with no protruding ears, no external limbs to create drag, and a layer of dense, close-fitting fur over a thick blubber layer that provides both insulation and streamlining. The coat is typically mottled gray to dark brown with irregular spots and blotches that provide camouflage against rocky shorelines and dappled water. The head is round with large, forward-facing eyes adapted for underwater vision in low light — dark, liquid, and remarkably expressive. The whiskers are long and extraordinarily sensitive, capable of detecting the hydrodynamic wake of a fish swimming nearby. The forelimbs are short flippers used primarily for steering, while the rear flippers provide the powerful thrust that drives the animal through water at speeds no human swimmer can match. On land, the seal moves by hunching its body in caterpillar-like undulations, hauling itself across rock and sand with patient determination.

## Key Behaviors

Seals are gregarious animals that gather in colonies for breeding, pupping, and resting, but hunt individually in the water. They are primarily fish-eaters, pursuing cod, herring, and other schooling fish with speed and agility in three-dimensional underwater chases. They can dive to considerable depths and hold their breath for extended periods, though most feeding dives are relatively shallow. Breeding colonies form on rocky islands and remote shorelines, where bulls compete for territory and access to females through vocal displays and physical confrontations. Pups are born on land and nursed for several weeks before being weaned and left to fend for themselves. Seals are curious and relatively fearless of humans in areas where they are not heavily hunted, approaching boats and swimmers with apparent interest. In hunted areas, they become wary and difficult to approach.

## Combat Strategy

Seals are not aggressive toward humans and will flee from any threat they can escape. On land, their only strategy is to reach the water — once swimming, they are effectively untouchable by any land-based pursuer. A cornered seal will bite defensively, and the bite of a large bull is powerful enough to sever fingers or inflict deep wounds. Females defending pups are more aggressive, and a breeding colony that perceives a threat to its young will produce a collective response of barking, lunging, and biting that can drive off predators through sheer numbers and noise. In water, a seal simply outruns any threat.

## Attack Methods

### Defensive Bite

The seal's jaws are strong and lined with sharp, conical teeth designed for gripping slippery fish. When cornered, the bite is delivered with a sharp, snapping motion and can inflict serious puncture and tearing wounds. A large bull's bite can break small bones.

### Flee to Water

The seal's primary defensive action is to reach the water as quickly as possible. On land, this means a lurching, surprisingly fast scramble toward the nearest water's edge. Once in the water, the seal can outswim any natural predator except the orca.

## Special Abilities

### Aquatic Grace

In water, the seal is transformed from an ungainly land creature into one of the most agile and graceful swimmers in the northern seas. It can accelerate, turn, dive, and surface with a precision and speed that makes underwater pursuit futile. The contrast between its land and water capabilities is extreme.

### Deep Diving

Seals can dive to depths and hold their breath for durations that exceed most marine mammals of their size. Their physiology includes specialized oxygen-storing proteins in the blood and muscles, a collapsible rib cage that resists pressure at depth, and the ability to slow their heart rate dramatically during dives.

### Whisker Sensitivity

The seal's vibrissae can detect the hydrodynamic wake of a fish swimming nearby, even in total darkness or murky water. This allows the seal to hunt effectively in the perpetual twilight of northern winter waters and under sea ice where visibility is negligible.

## Attributes

- **Strength:** 7-10 (1d4+6) — Adequate for their size; jaws are strong but body is built for speed, not power
- **Endurance:** 9-14 (1d6+8) — Good cold tolerance and diving stamina; blubber reserves for lean seasons
- **Dexterity:** 11-16 (1d6+10) — Superb in water; capable of precision swimming and fish capture
- **Agility:** 10-15 (1d6+9) — Excellent in water; clumsy on land
- **Perception:** 11-16 (1d6+10) — Extraordinary underwater senses; large eyes for low-light vision
- **Aura:** 5-8 (1d4+4) — Common and familiar; no special spiritual significance
- **Will:** 7-10 (1d4+6) — Mild-tempered; prefers flight to fight
- **Reasoning:** 6-9 (1d4+5) — Curious and somewhat intelligent; learns to avoid hunters
- **Creativity:** 4-7 (1d4+3) — Limited
