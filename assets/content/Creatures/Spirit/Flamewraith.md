---
aliases:
    - Flamewraith
tags:
    - spirit
name:
    full: Flamewraith
    aliases: []
id: IkisGKow2uz3lPSw
slug: flamewraith
img: icons/game-icons/lorc/spectre.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 9
        end: 11
        dex: 15
        agl: 17
        per: 11
        aur: 15
        wil: 13
        rea: 9
        cre: 11
    attrRollFormula:
        str: 1d4+6
        end: 1d4+8
        dex: 1d4+12
        agl: 1d4+14
        per: 1d4+8
        aur: 1d4+12
        wil: 1d4+10
        rea: 1d4+6
        cre: 1d4+8
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 1
                - name: Arms
                  shortcode: armszone
                  probWeight: 4
                - name: Torso
                  shortcode: torsozone
                  probWeight: 4
                - name: Legs
                  shortcode: legszone
                  probWeight: 6
            parts:
                - name: Head
                  shortcode: headpart
                  bodyZoneCode: headzone
                  roles:
                      - vital
                      - manipulator
                  canHoldItem: false
                  probWeight: 1
                - name: Right Arm
                  shortcode: rarmpart
                  bodyZoneCode: armszone
                  roles:
                      - manipulator
                  canHoldItem: true
                  probWeight: 2
                - name: Left Arm
                  shortcode: larmpart
                  bodyZoneCode: armszone
                  roles:
                      - manipulator
                  canHoldItem: true
                  probWeight: 2
                - name: Torso
                  shortcode: torsopart
                  bodyZoneCode: torsozone
                  roles:
                      - core
                  canHoldItem: false
                  probWeight: 4
                - name: Right Leg
                  shortcode: rlegpart
                  bodyZoneCode: legszone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 3
                - name: Left Leg
                  shortcode: llegpart
                  bodyZoneCode: legszone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 3
            locations:
                - name: Skull
                  shortcode: skullloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: low
                  amputability: none
                  shockValue: 5
                  probWeight: 500
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Left Eye
                  shortcode: leyeloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 15
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Right Eye
                  shortcode: reyeloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 15
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Nose
                  shortcode: noseloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 30
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Left Cheek
                  shortcode: lcheekloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 60
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Right Cheek
                  shortcode: rcheekloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 60
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Left Ear
                  shortcode: learloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 15
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Right Ear
                  shortcode: rearloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 15
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Mouth
                  shortcode: mouthloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 30
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Jaw
                  shortcode: jawloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 60
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 200
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Right Shoulder
                  shortcode: rshldloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 3
                  probWeight: 30
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Right Upper Arm
                  shortcode: rupaloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 30
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Right Elbow
                  shortcode: relbloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Right Forearm
                  shortcode: rfraloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 20
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Right Hand
                  shortcode: rhandloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Left Shoulder
                  shortcode: lshldloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 3
                  probWeight: 30
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Left Upper Arm
                  shortcode: lupaloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 30
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Left Elbow
                  shortcode: lelbloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Left Forearm
                  shortcode: lfraloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 20
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Left Hand
                  shortcode: lhandloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Thorax
                  shortcode: thrxloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 40
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Abdomen
                  shortcode: abdmnloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 40
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Pelvis
                  shortcode: plvisloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 20
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Right Thigh
                  shortcode: rthghloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: medium
                  amputability: medium
                  shockValue: 3
                  probWeight: 40
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Right Knee
                  shortcode: rkneeloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 15
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Right Calf
                  shortcode: rcalfloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 30
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Right Foot
                  shortcode: rfootloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 2
                  probWeight: 15
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Left Thigh
                  shortcode: lthghloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: medium
                  amputability: medium
                  shockValue: 3
                  probWeight: 40
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Left Knee
                  shortcode: lkneeloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 15
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Left Calf
                  shortcode: lcalfloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 30
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Left Foot
                  shortcode: lfootloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 2
                  probWeight: 15
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
        weight:
            base: 0
            calc: 0
        reachBase: 0
        bodyScaleBase: 0.88
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 50
          leaguesPerWatch: 5
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
              masteryLevelBase: 75
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
              masteryLevelBase: 56
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 25
        - name: Incendiary Touch
          type: skill
          system:
              shortcode: punch
              subType: combattechnique
              masteryLevelBase: 74
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: punch
                  name: Incendiary Touch
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 3
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: -1
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
        - name: Fireball
          type: skill
          system:
              shortcode: spray
              subType: combattechnique
              masteryLevelBase: 74
              combatCategory: missile
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: missile
                  shortcode: spray
                  name: Fireball
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
                      aspect: fire
                  projectileType: none
                  maxVolleyMult: 1
                  baseRangeBase: 15
                  drawBase: 0
                  traits: {}
---

# Appearance {#appearance}

Before you materializes a dancer of flame—a form that is less body than burning intention. The air itself warps and shimmers, bending light into distorted waves; you feel the heat on your skin from several paces away, like standing too close to a furnace. Where it moves, embers trail and scatter, sizzling against stone and wood. The creature's limbs form and dissolve like water running upward, and where they should be a face, there is only a churning vortex of orange and white fire that seems to regard you with terrible intelligence.

# Dossier {#dossier}

Flamewraiths are the tortured remnants of pyromancers who died consumed by their own infernos—or sometimes spirits summoned into the material world and bound to burning objects by dark rituals. They are volatile by nature, drawn to sources of flame and destruction. A Flamewraith encountered in the wild may have escaped its binding, making it a threat to entire regions; one called forth by a sorcerer will obey until released or its anchor is shattered. They are not mindless—they hunt with cunning and patience, and they learn.

## Presentation

The Flamewraith resembles a humanoid figure roughly six feet tall, composed entirely of roiling fire. Its body is not truly solid; it flickers and shifts constantly, with edges that blur and reform. Its surface ranges in color from deep orange and crimson to white-hot intensity at its core. No two moments show the same silhouette. The creature moves with liquid grace, sometimes gliding across surfaces, sometimes climbing vertical walls as though gravity is merely one option among many. It radiates intense heat sufficient to cause burns from ten feet away, and it leaves no tracks—only scorched earth and melted stone.

## Key Behaviors

Flamewraiths are driven by a hunger for fuel and a compulsive need to consume. Most are found in places of destruction—ruins of burned settlements, volcanic regions, or around fire-touched sites. They do not sleep; they either rage across the landscape or fall into a kind of stupor near their binding object if one anchors them. When undisturbed, a Flamewraith may remain in a single place for weeks, slowly expanding a perimeter of scorched earth. Solitary creatures by nature, they become territorial and violent when encountered by others of their kind. They seem to regard living beings with a mix of hunger and contempt—food, but unworthy food.

## Combat Strategy

Flamewraiths fight without fear of pain or death, knowing they can reform from their binding object if destroyed. They abuse their mobility, circling opponents and striking from multiple vectors. When facing a foe that cannot harm them with physical weapons, they become almost casual, toying with their opponent before the killing blow. If confronted with cold or water, they retreat if possible; these are the only things that seem to cause them true distress. They rarely flee combat entirely, preferring to become more evasive and ranged-focused. In groups, Flamewraiths still fight independently, though they may coordinate to herd prey into killing positions.

## Attack Methods

### Incendiary Touch

The creature makes contact with flesh or fabric and the temperature spikes instantly to agony. This is not merely heat—it is the inverse of freezing, a burning that penetrates through armor and cloth alike, searing muscle beneath. On a successful strike, the victim suffers severe thermal burns and ongoing damage from internal heat.

### Fireball

The Flamewraith coalesces, drawing in its scattered form, and then explodes outward in a violent burst of flame. Nearby creatures are engulfed in a wave of heat and burning debris. Multiple opponents can be targeted by a single Fireball if they cluster; the creature seems to understand geometry and positioning instinctively.

## Special Abilities

### Incorporeal Form

The Flamewraith can pass through solid matter as though it were mist. It can phase slightly out of synchronization with the material world, making it resistant to physical weapon strikes and able to retreat through stone and wood. Cold and water-touched attacks are still dangerous to it, however; even when phased, such elements harm it.

### Binding Anchor

The Flamewraith's true existence is tied to a single object—usually a cursed artifact, enchanted weapon, or focus item. While that object remains intact, the Flamewraith cannot be permanently destroyed; after three days, it reforms fully. Only destruction of the binding object kills it permanently.

### Heat Aura

Simply existing near a Flamewraith is dangerous. The ambient temperature rises markedly within a thirty-foot radius, and exposed skin burns over prolonged exposure. Flammable materials spontaneously ignite if too close. Metal weapons become too hot to hold comfortably.

## Additional Information

Flamewraiths are profoundly weakened by cold and water. A sufficiently large body of water can immobilize one, and sustained cold-based magic may reduce its power significantly. They are drawn instinctively to sources of flame—they will abandon a hunt if they sense a large fire nearby. This can be exploited by clever opponents. Their binding objects vary; some are grotesque (a charred bone), others beautiful (a gemstone that never cools). The object must be destroyed through normal means—typically, it requires great force or the right magical technique. A Flamewraith destroyed permanently leaves behind only ash and the binding object itself, which may be worth salvaging depending on its original nature.

## Attributes

- **Strength:** 7-10 (1d4+6)

- **Endurance:** 9-12 (1d4+8)

- **Dexterity:** 13-16 (1d4+12)

- **Agility:** 15-18 (1d4+14)

- **Perception:** 9-12 (1d4+8)

- **Aura:** 13-16 (1d4+12)

- **Will:** 11-14 (1d4+10)

- **Reasoning:** 7-10 (1d4+6)

- **Creativity:** 9-12 (1d4+8)

## Lineage Notes

_The following notes are inherited from the original lineage description._

Before you materializes a dancer of flame—a form that is less body than burning intention. The air warps and shimmers, bending light into distorted waves where the figure stands. Six feet tall and composed entirely of roiling fire, its edges blur and reform constantly, never quite settling into shape.

## Description

The flamewraith is a humanoid figure roughly six feet tall, composed entirely of roiling fire, with edges that blur and reform constantly. It possesses bioluminescent eyes burning with sickly luminescence and an aura of wrongness that warps the air around it.

## Key Behaviors

Flamewraiths are driven by compulsive hunger for fuel and the need to consume. They do not sleep but either rage across the landscape or fall into stupor near their binding object. When undisturbed, they may remain in single places for weeks, slowly expanding a perimeter of scorched earth.

## Relations

Flamewraiths are universally feared and hunted. A flamewraith escaped from its binding becomes a direct threat to entire regions. Some deeply desperate communities have negotiated with bound flamewraiths, but such arrangements are viewed with moral ambiguity.

## Special Abilities

### Incorporeal Form

Flamewraiths radiate intense heat, move through the air with liquid grace, and are resistant to physical weapon strikes through their incorporeal form.

### Binding Anchor

Flamewraiths are tied to binding objects and cannot be permanently destroyed while those objects remain intact.

### Environmental Alteration

Flamewraiths raise the ambient temperature around them, causing burns from a distance and igniting flammable materials in their presence.
