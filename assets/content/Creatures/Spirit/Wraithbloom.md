---
aliases:
    - Wraithbloom
tags:
    - spirit
name:
    full: Wraithbloom
    aliases: []
id: NZjkwSdqmk6Tuf64
slug: wraithbloom
img: icons/game-icons/lorc/werewolf.svg
portrait: ""
shortcode: wrthblm
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 6
        end: 9
        dex: 11
        agl: 13
        per: 15
        aur: 11
        wil: 9
        rea: 8
        cre: 9
    attrRollFormula:
        str: 1d4+3
        end: 1d4+6
        dex: 1d4+8
        agl: 1d4+10
        per: 1d4+12
        aur: 1d4+8
        wil: 1d4+6
        rea: 1d4+5
        cre: 1d4+6
    body:
        structure:
            zones:
                - name: Crown
                  shortcode: crownzone
                  probWeight: 1
                - name: Stem
                  shortcode: stemzone
                  probWeight: 2
                - name: Tendrils
                  shortcode: tendrilzone
                  probWeight: 2
            parts:
                - name: Crown
                  shortcode: crownpart
                  bodyZoneCode: crownzone
                  roles:
                      - vital
                  canHoldItem: false
                  probWeight: 10
                - name: Stem
                  shortcode: stempart
                  bodyZoneCode: stemzone
                  roles:
                      - core
                  canHoldItem: false
                  probWeight: 10
                - name: Left Tendrils
                  shortcode: ltendrilpart
                  bodyZoneCode: tendrilzone
                  roles:
                      - locomotor
                      - manipulator
                  canHoldItem: false
                  probWeight: 5
                - name: Right Tendrils
                  shortcode: rtendrilpart
                  bodyZoneCode: tendrilzone
                  roles:
                      - locomotor
                      - manipulator
                  canHoldItem: false
                  probWeight: 5
            locations:
                - name: Crown
                  shortcode: crownloc
                  bodyPartCode: crownpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 10
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Stem
                  shortcode: stemloc
                  bodyPartCode: stempart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 10
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Left Tendrils
                  shortcode: ltendrilloc
                  bodyPartCode: ltendrilpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Right Tendrils
                  shortcode: rtendrilloc
                  bodyPartCode: rtendrilpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
        weight:
            base: 0
            calc: 0
        reachBase: 0
        bodyScaleBase: 0.67
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 20
          leaguesPerWatch: 1
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors:
              - scope: surface_cover
                key: mixed_forest
                mode: add
                textValue: "0"
              - scope: surface_cover
                key: needleleaf_forest
                mode: add
                textValue: "0"
              - scope: surface_cover
                key: woodland
                mode: add
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
              masteryLevelBase: 55
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
              masteryLevelBase: 56
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 20
        - name: Spectral Vines
          type: skill
          system:
              shortcode: tentacle
              subType: combattechnique
              masteryLevelBase: 66
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: tentacle
                  name: Spectral Vines
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

At the edge of the clearing stands a bloom that should not exist in this season, in this place. It hovers above the ground without roots or support, its petals translucent and glowing with a light that seems to come from within rather than reflected. As you watch, the petals move with grace, as though dancing to music only it can hear. The beauty of it is almost painful—it draws the eye and stirs something deep in the chest, an ache that is part longing and part dread. When you take a step forward, you are not entirely sure why.

# Dossier {#dossier}

Wraithblooms are the spirits of ancient plants—flowers and vines from places where magic saturated the earth so completely that death became merely another form of growth. They are not creatures in the traditional sense but animated expressions of the places they inhabit. A Wraithbloom is often found in old, magical groves or sacred gardens where the barrier between the living and spirit realms has worn thin. They are neither hostile nor benign but rather indifferent to human presence. They will defend their territory if threatened, but otherwise they seem content to exist in their own form of slow meditation.

## Presentation

A Wraithbloom is a hovering assemblage of spectral plants—translucent petals forming a corona around a central cluster of ghostly vines and stamens. The whole construction is roughly three to five feet in diameter and floats a few feet above the ground, though it sometimes descends to brush its vines across soil or flower. The petals glow softly in shades of pale blue, lavender, or sickly green, and this light shifts subtly moment to moment. The central bloom contains eyes or at least optical organs—two pale luminescent points that regard observers with what seems like curiosity or judgment. The creature smells faintly of flowers and decay in equal measure, and pollen drifts from it constantly, creating a visible haze in still air.

## Key Behaviors

Wraithblooms are rooted to locations—not physically, but spiritually. A particular Wraithbloom will haunt the same grove or garden for years or decades, slowly expanding its presence, encouraging the growth of more plants and trees. They are drawn to areas of natural beauty and to places where humans have tended gardens with love. They are most active at night and in shade, becoming more ethereal and less visible in bright sunlight. They seem to perceive and remember individual humans, responding differently to repeat visitors. A human who tends the garden and shows respect will be largely ignored; one who damages plants or shows disrespect will be actively opposed.

## Combat Strategy

Wraithblooms do not seek combat but will engage if their territory is threatened. They use their mobility and spectral nature to evade attacks while employing their pollen and vines to disable or entangle opponents. They are not vicious—they seek to drive away intruders rather than to kill them. Against opponents who persist in damaging the garden or themselves, they become more aggressive. They are intelligent enough to recognize when an opponent is too dangerous and will retreat into the deepest parts of their territory or even phase partially into the spirit realm.

## Attack Methods

### Spectral Vines

The Wraithbloom extends thorny, spectral vines that wind around victims, constricting and drawing them toward the flower's central bloom. The vines pass through normal armor partially, and victims report feeling both physical entanglement and a draining sensation as the plant draws their life energy through the thorns.

### Toxic Pollen

The Wraithbloom releases clouds of luminescent pollen that induces hallucinations, drowsiness, and confusion. Those who inhale deeply find themselves lost in waking dreams, unable to distinguish reality from vision. Prolonged exposure can lead to complete incapacitation.

### Life Drain

When a victim is entangled by vines or thoroughly inhales the pollen, the Wraithbloom begins drawing their life force directly. The process is slow but inexorable—victims feel their strength and will diminishing over time, as if the plant is feeding on their essence.

## Special Abilities

### Spectral Nature

The Wraithbloom is partially incorporeal and resistant to physical weapon strikes. Weapons pass through it with reduced effectiveness. However, fire, sunlight, and radiant magic all harm it significantly.

### Pollen Cloud

The creature can release its pollen in a controlled cloud that fills a specific area. Those within the cloud experience hallucinations drawn from their own fears and desires. The pollen also causes drowsiness and reduced mental acuity.

### Plant Regeneration

The Wraithbloom can draw energy from plants in its vicinity to heal wounds and restore itself. In a garden or forest, this ability makes it almost impossible to outlast in combat.

### Territorial Bond

The Wraithbloom is deeply connected to a specific place and gains strength when within its territory. Outside its original location, it becomes weaker and more vulnerable. It cannot truly leave—if separated too far from its location, it begins to fade.

## Additional Information

Fire is the most effective weapon against a Wraithbloom, as it destroys the plant matter that comprises its form. Sunlight also harms it significantly, and radiant magic is effective. A Wraithbloom can sometimes be negotiated with if approached respectfully. It seems to understand human speech, though it does not speak in return. A human who tends the garden, removes invasive species, and shows respect for the space may actually gain the Wraithbloom's protection. Some rangers and druids have formed symbiotic relationships with Wraithblooms, allowing the spirit to nourish their plants in exchange for protection and care. A Wraithbloom is difficult to kill permanently because it is tied to the location it inhabits—killing it merely causes it to reform after several seasons. True destruction requires either burning the location and removing all plant life, or cleansing the land through ritual so that the magic sustaining the spirit dissipates.

## Attributes

- **Strength:** 4-7 (1d4+3)

- **Endurance:** 7-10 (1d4+6)

- **Dexterity:** 9-12 (1d4+8)

- **Agility:** 11-14 (1d4+10)

- **Perception:** 13-16 (1d4+12)

- **Aura:** 9-12 (1d4+8)

- **Will:** 7-10 (1d4+6)

- **Reasoning:** 6-9 (1d4+5)

- **Creativity:** 7-10 (1d4+6)
