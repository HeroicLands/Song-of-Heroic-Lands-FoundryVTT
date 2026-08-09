---
aliases:
    - Mirrorling
tags:
    - dreadspawn
name:
    full: Mirrorling
    aliases: []
id: u7FShyu98eDuRwVS
slug: mirrorling
img: icons/game-icons/delapouite/griffin-symbol.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 11
        end: 11
        dex: 15
        agl: 13
        per: 15
        aur: 15
        wil: 13
        rea: 9
        cre: 15
    attrRollFormula:
        str: 1d4+8
        end: 1d4+8
        dex: 1d4+12
        agl: 1d4+10
        per: 1d4+12
        aur: 1d4+12
        wil: 1d4+10
        rea: 1d4+6
        cre: 1d4+12
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
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Left Eye
                  shortcode: leyeloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 15
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Right Eye
                  shortcode: reyeloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 15
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Nose
                  shortcode: noseloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 30
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Left Cheek
                  shortcode: lcheekloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 60
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Right Cheek
                  shortcode: rcheekloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 60
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Left Ear
                  shortcode: learloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 15
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Right Ear
                  shortcode: rearloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 15
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Mouth
                  shortcode: mouthloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 30
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Jaw
                  shortcode: jawloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 60
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
                  probWeight: 200
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Right Shoulder
                  shortcode: rshldloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 3
                  probWeight: 30
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Right Upper Arm
                  shortcode: rupaloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 30
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Right Elbow
                  shortcode: relbloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Right Forearm
                  shortcode: rfraloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 20
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Right Hand
                  shortcode: rhandloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Left Shoulder
                  shortcode: lshldloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 3
                  probWeight: 30
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Left Upper Arm
                  shortcode: lupaloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 30
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Left Elbow
                  shortcode: lelbloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Left Forearm
                  shortcode: lfraloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 20
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Left Hand
                  shortcode: lhandloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Thorax
                  shortcode: thrxloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 40
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Abdomen
                  shortcode: abdmnloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 40
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Pelvis
                  shortcode: plvisloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 20
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Right Thigh
                  shortcode: rthghloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: medium
                  amputability: medium
                  shockValue: 3
                  probWeight: 40
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Right Knee
                  shortcode: rkneeloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 15
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Right Calf
                  shortcode: rcalfloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 30
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Right Foot
                  shortcode: rfootloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 2
                  probWeight: 15
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Left Thigh
                  shortcode: lthghloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: medium
                  amputability: medium
                  shockValue: 3
                  probWeight: 40
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Left Knee
                  shortcode: lkneeloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 15
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Left Calf
                  shortcode: lcalfloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 30
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Left Foot
                  shortcode: lfootloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 2
                  probWeight: 15
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
        weight:
            base: 40
            calc: 40
        reachBase: 0
        bodyScaleBase: 1
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
              masteryLevelBase: 70
        - shortcode: stlth
          type: skill
          system:
              masteryLevelBase: 65
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
              masteryLevelBase: 28
        - name: Reflective Blade Strike
          type: skill
          system:
              shortcode: claw
              subType: combattechnique
              masteryLevelBase: 66
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: claw
                  name: Reflective Blade Strike
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 6
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 8
                      modifier: 0
                      aspect: edged
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

Dozens of versions of you stare back from a perfectly smooth, humanoid surface before you—each reflection fractionally out of sync with the others, as though time itself has splintered. The creature's surface ripples without touching water, light bending across its body in impossible angles that make your eyes water when you try to track its movements. A low, crystalline hum emanates from it, and you realize with creeping dread that one of the reflections isn't reflecting you at all—it's watching you independently, with terrible intelligence.

# Dossier {#dossier}

Mirrorlings are living paradoxes born from the collision of light, memory, and malice—creatures of pure manifestation that exist as much in reflection as in flesh. They are drawn to places where light scatters and multiplies: halls of mirrors, crystal caverns, sunlit waters, and the chambers of vain nobles. A Mirrorling's true nature is to fracture and confuse, using light as a weapon and illusion as a shield. The creature is said to feed not on flesh but on the reflection of violence—the more brutally an opponent attacks and misses, the stronger it becomes. Some believe Mirrorlings are the echoes of mages who gazed too long into their own vanity, corrupted into beings of pure reflection and spite.

## Presentation

A Mirrorling presents an unsettling humanoid form roughly 6 to 8 feet in height, composed entirely of a perfectly reflective, liquid-smooth surface like burnished quicksilver or polished chrome. Its body has defined musculature and articulation, but the joints bend with an unnatural fluidity, as though the thing has no bone or cartilage—just frictionless motion. Its face is a blank, featureless mirror when viewed directly, yet reflections within its surface show eyes of impossible depth, sometimes countless, sometimes singular. The creature moves with liquid grace, its form occasionally seeming to blur or double, and it leaves no footprints or disturbance in its wake. The temperature drops noticeably near a Mirrorling, and the air carries a faint scent of ozone and burned silver.

## Key Behaviors

Mirrorlings are solitary and territorial, claiming reflective spaces as their domains. They are drawn to moments of violence and bloodshed, arriving unbidden to feed on the chaos of conflict. Unlike most predators, they do not hunger for food—instead, they consume the "echo" of an attack: the energy of a blow striking their surface and rebounding. A Mirrorling that has fed on many failed attacks against it grows stronger and faster. They show a perverse curiosity about mortal vanity and will sometimes linger in the chambers of vain nobles, seemingly amused by their prey's futile attempts at self-admiration. A Mirrorling rarely remains in one location indefinitely; after weeks or months, it will disappear into the nearest large body of reflective water or through a shattered mirror, not to be seen again in that place.

## Combat Strategy

A Mirrorling opens combat by using its natural reflectivity to create the illusion of multiple versions of itself, positioning these illusory forms to confuse and misdirect attacks. It moves constantly, using the terrain to maximize reflections and reinforce the illusion of greater numbers. Each strike against the creature that misses strengthens its defenses slightly, and it relies on this feedback loop to outlast opponents. When facing ranged attackers, a Mirrorling may position itself to redirect projectiles back toward the archer. If cornered or facing an opponent who lands consistent hits, it attempts to break line-of-sight and escape into the nearest reflective surface—a mirror, a pool of water, or polished stone.

## Attack Methods

### Reflective Blade Strike

The creature's limbs sharpen into edges of pure crystalline reflection, striking with surprising force and precision. These strikes leave wounds that seem to warp and distort, as though the flesh itself is confused about where it should be.

### Mirrored Retaliation

When an opponent's attack glances off the creature's reflective surface, that same force is redirected back toward the attacker with perfect geometric precision. A sword swing might be sent back as a cutting beam of refracted light; an arrow might be turned aside to strike a nearby ally.

## Special Abilities

### Reflective Embodiment

The creature's body reflects and refracts light with impossible perfection, making it extraordinarily difficult to strike. Physical attacks against it are resolved with disadvantage, and many strikes seem to pass through or around it without landing.

### Fractured Image

The Mirrorling can create illusory duplicates of itself through careful manipulation of light and reflection. At least two of the images will move independently and seem tactilely real, forcing opponents to guess which version is the genuine article.

### Void Reflection

When looking into the Mirrorling's surface, perceptive creatures can glimpse fleeting, disturbing images: scenes of violence, moments of vanity, echoes of the creature's feeding. Those who stare too long find their sense of self becoming distant and unreal.

## Additional Information

Darkness and non-reflective environments pose the greatest challenge to a Mirrorling, negating both its illusory and defensive advantages. Magical attacks that create obscurement or shadow force the creature to fight at near-normal disadvantage. If a Mirrorling is forced to remain in absolute darkness for more than a few minutes, it begins to weaken, its form becoming sluggish and brittle. The creature is vulnerable to spells that damage or cloud reflective surfaces, including rusted metals, broken glass, and muddied water. Some scholars theorize that destroying every mirror in a Mirrorling's territory will starve it, forcing it to move on or perish. The creature's remains—if it is slain—dissolve into mercury-like drops that evaporate within hours, leaving no physical trace.

## Attributes

- **Strength:** 9-12 (1d4+8)

- **Endurance:** 9-12 (1d4+8)

- **Dexterity:** 13-16 (1d4+12)

- **Agility:** 11-14 (1d4+10)

- **Perception:** 13-16 (1d4+12)

- **Aura:** 13-16 (1d4+12)

- **Will:** 11-14 (1d4+10)

- **Reasoning:** 7-10 (1d4+6)

- **Creativity:** 13-16 (1d4+12)
