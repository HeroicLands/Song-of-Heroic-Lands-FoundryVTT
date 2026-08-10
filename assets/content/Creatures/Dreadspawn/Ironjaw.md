---
aliases:
    - Ironjaw
tags:
    - dreadspawn
name:
    full: Ironjaw
    aliases: []
id: HKFCGWSqLCYSzPqf
slug: ironjaw
img: icons/game-icons/delapouite/griffin-symbol.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 15
        end: 15
        dex: 9
        agl: 11
        per: 11
        aur: 9
        wil: 13
        rea: 8
        cre: 8
    attrRollFormula:
        str: 1d4+12
        end: 1d4+12
        dex: 1d4+6
        agl: 1d4+8
        per: 1d4+8
        aur: 1d4+6
        wil: 1d4+10
        rea: 1d4+5
        cre: 1d4+5
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
                      - manipulator
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
                      blunt: 10
                      edged: 9
                      piercing: 8
                      fire: 10
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 4
                  protectionBase:
                      blunt: 10
                      edged: 9
                      piercing: 8
                      fire: 10
                - name: Left Foreleg
                  shortcode: lforelegloc
                  bodyPartCode: lforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 10
                      edged: 9
                      piercing: 8
                      fire: 10
                - name: Right Foreleg
                  shortcode: rforelegloc
                  bodyPartCode: rforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 10
                      edged: 9
                      piercing: 8
                      fire: 10
                - name: Thorax
                  shortcode: thoraxloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 5
                  protectionBase:
                      blunt: 10
                      edged: 9
                      piercing: 8
                      fire: 10
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 3
                  protectionBase:
                      blunt: 10
                      edged: 9
                      piercing: 8
                      fire: 10
                - name: Pelvis
                  shortcode: plvsloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 2
                  protectionBase:
                      blunt: 10
                      edged: 9
                      piercing: 8
                      fire: 10
                - name: Left Hind Leg
                  shortcode: lhindlegloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 10
                      edged: 9
                      piercing: 8
                      fire: 10
                - name: Right Hind Leg
                  shortcode: rhindlegloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 10
                      edged: 9
                      piercing: 8
                      fire: 10
                - name: Tail
                  shortcode: tailloc
                  bodyPartCode: tailpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 1
                  probWeight: 10
                  protectionBase:
                      blunt: 10
                      edged: 9
                      piercing: 8
                      fire: 10
        weight:
            base: 250
            calc: 250
        reachBase: 0
        bodyScaleBase: 1.36
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
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
              masteryLevelBase: 44
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 44
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 38
        - name: Metal-Edged Bite
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
                  name: Metal-Edged Bite
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 2
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 3
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
        - name: Raking Claws
          type: skill
          system:
              shortcode: claw
              subType: combattechnique
              masteryLevelBase: 62
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: claw
                  name: Raking Claws
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 4
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 8
                      modifier: 2
                      aspect: edged
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
        - name: Armour Charge
          type: skill
          system:
              shortcode: ram
              subType: combattechnique
              masteryLevelBase: 52
              combatCategory: melee
              impairedByRoles:
                  - core
              strikeMode:
                  type: melee
                  shortcode: ram
                  name: Armour Charge
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 4
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 2
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

The thing moves like a wolf but built from armor and malice. Its entire body is covered in interlocking metal scales that catch light with a dull, threatening gleam. The jaw juts forward unnaturally, lined with teeth that gleam like steel and appear far too numerous for any natural animal. Its eyes are cold and bright, burning with a hunger that feels deliberate and cruel. When it breathes, sparks catch in its nostrils. It walks with deliberate slowness, utterly confident, each step sinking slightly into the ground under its weight.

# Dossier {#dossier}

Ironjaws are predatory, pack-based hunters corrupted by dark magic and fused with metallic material, creatures of burden and violence. These armored predators hunt in coordinated packs across mountain regions and industrial wastelands, following territories marked by claw-scratches and the bones of previous kills. Adventurers encounter them in mountains, abandoned mines, stone deserts, and places where corruption has taken hold of wildlife.

## Presentation

The Ironjaw resembles a large hunting dog or wolf in basic shape, but it is covered entirely in overlapping metal scales that appear fused to its skin. The scales range in color from cold gray to bronze to sickly verdigris—some are polished and gleaming, others are corroded and pitted. The creature's head is disproportionately large, dominated by a protruding jaw lined with teeth that appear metallic and far too numerous for any natural animal. The jaws themselves are capable of closing with grinding, metal-on-metal force. Its eyes burn with intelligence and malevolence, bright points of unnatural color. Its claws are metal-edged, capable of sparking off stone. The creature's entire body radiates heat—its breath carries warmth and the scent of forge-smoke. When it moves, metal grinds against metal in a sound like distant war.

## Key Behaviors

Ironjaws hunt in organized packs of four to eight individuals, coordinating tactics with surprising sophistication. They are absolutely territorial and will attack anything that enters their claimed regions with relentless determination. They mark territory through claw-scratchings on stone and the deliberate scattering of bones. The creatures are intelligent enough to recognize individuals and remember previous conflicts. They hunt actively, pursuing prey relentlessly once engaged. When pack members are killed, the survivors show apparent grief-like responses before attacking with increased ferocity. Outside their territories, they become less aggressive; they will flee to home ground rather than pursue indefinitely.

## Combat Strategy

Ironjaws use coordinated pack tactics, attempting to surround prey and drive it toward chosen kill zones. The pack's strategy is to wound and exhaust prey, with multiple members attacking in rotation while others circle to prevent escape. Individual Ironjaws, separated from pack support, rely on brute strength and durability to overcome opponents. The creatures charge when they judge themselves to have advantage, using their heavy weight as a weapon. When badly wounded, a separated Ironjaw may retreat to rejoin pack support; if pack support cannot reach the isolated creature, it fights with desperate ferocity until destroyed or victorious.

## Attack Methods

### Metal-Edged Bite

The Ironjaw's jaws snap forward with tremendous force, capable of crushing through bone and armor. The metallic nature of the teeth and jaw structure allows it to bite through materials that would blunt normal fangs.

### Armor Charge

The creature lowers its head and charges at high speed, using its metallic armor as both battering ram and blade. Targets struck take impact damage and are knocked prone; the charge can drive targets backward into hazards.

### Raking Claw Strikes

The Ironjaw slashes with its metal-edged claws, attempting to open wounds and tear armor apart. The metal edges catch and catch on armor, potentially ripping away pieces.

## Special Abilities

### Metallic Plating

The Ironjaw's scales are fused with metallic material, providing exceptional protection against physical attacks. Slashing and piercing attacks have significantly reduced effectiveness; blunt force and crushing attacks are more effective.

### Pack Coordination

Pack members gain advantage on all tactics and coordinated attacks when operating within visual or auditory range of other pack members. The death of a pack leader causes temporary coordination loss; the pack reestablishes hierarchy and regains coordination over several rounds.

### Heat Resistance

The Ironjaw's internal nature allows it to function in high-temperature environments and to resist fire and heat-based damage. However, extreme cold damages the metallic structure and degrades the creature's performance.

### Temporary Hardening

The creature can deliberately reinforce its metallic scales, increasing its resistance to damage. This ability lasts for a limited duration; once used, it requires time to recharge.

## Additional Information

Acid and corrosion-based attacks are particularly effective against Ironjaws, as they degrade the metallic components of the creature's armor. Extreme cold similarly weakens performance and can cause structural failure. Separating pack members and preventing coordination significantly reduces their effectiveness. Some evidence suggests Ironjaws can survive for extended periods with significant structural damage, as long as their central vital areas remain intact.

## Attributes

- **Strength:** 13-16 (1d4+12)

- **Endurance:** 13-16 (1d4+12)

- **Dexterity:** 7-10 (1d4+6)

- **Agility:** 9-12 (1d4+8)

- **Perception:** 9-12 (1d4+8)

- **Aura:** 7-10 (1d4+6)

- **Will:** 11-14 (1d4+10)

- **Reasoning:** 6-9 (1d4+5)

- **Creativity:** 6-9 (1d4+5)
