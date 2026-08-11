---
aliases:
    - Howler Monkey
tags:
    - animal
    - image-needed
name:
    full: Howler Monkey
    aliases: []
id: hakoBzpOt5uPwWkv
img: icons/game-icons/lorc/monkey.svg
portrait: ""
shortcode: hwlrmnky
type: creature
package: sohl
sohl:
    kbcat: animal
    archetype: 0
    attributes:
        str: 7
        end: 8
        dex: 15
        agl: 16
        per: 14
        aur: 9
        wil: 9
        rea: 10
        cre: 8
    attrRollFormula:
        str: 1d4+4
        end: 1d4+5
        dex: 1d6+11
        agl: 1d6+12
        per: 1d6+10
        aur: 1d4+6
        wil: 1d4+6
        rea: 1d6+6
        cre: 1d4+5
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 1
                - name: Arms
                  shortcode: armszone
                  probWeight: 1
                - name: Torso
                  shortcode: torsozone
                  probWeight: 2
                - name: Legs
                  shortcode: legszone
                  probWeight: 2
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
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Left Eye
                  shortcode: leyeloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 15
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Right Eye
                  shortcode: reyeloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 15
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Nose
                  shortcode: noseloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 30
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Left Cheek
                  shortcode: lcheekloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 60
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Right Cheek
                  shortcode: rcheekloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 60
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Left Ear
                  shortcode: learloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 15
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Right Ear
                  shortcode: rearloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 15
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Mouth
                  shortcode: mouthloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 30
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Jaw
                  shortcode: jawloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 60
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 200
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Right Shoulder
                  shortcode: rshldloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 3
                  probWeight: 30
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Right Upper Arm
                  shortcode: rupaloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 30
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Right Elbow
                  shortcode: relbloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Right Forearm
                  shortcode: rfraloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 20
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Right Hand
                  shortcode: rhandloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Left Shoulder
                  shortcode: lshldloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 3
                  probWeight: 30
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Left Upper Arm
                  shortcode: lupaloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 30
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Left Elbow
                  shortcode: lelbloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Left Forearm
                  shortcode: lfraloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 20
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Left Hand
                  shortcode: lhandloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Thorax
                  shortcode: thrxloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 40
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Abdomen
                  shortcode: abdmnloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 40
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Pelvis
                  shortcode: plvisloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 20
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Right Thigh
                  shortcode: rthghloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: medium
                  amputability: medium
                  shockValue: 3
                  probWeight: 40
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Right Knee
                  shortcode: rkneeloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 15
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Right Calf
                  shortcode: rcalfloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 30
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Right Foot
                  shortcode: rfootloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 2
                  probWeight: 15
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Left Thigh
                  shortcode: lthghloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: medium
                  amputability: medium
                  shockValue: 3
                  probWeight: 40
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Left Knee
                  shortcode: lkneeloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 15
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Left Calf
                  shortcode: lcalfloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 30
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Left Foot
                  shortcode: lfootloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 2
                  probWeight: 15
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
        weight:
            base: 20
            calc: "20"
        reachBase: 0
        bodyScaleBase: 0.75
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 30
          leaguesPerWatch: 2
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
              masteryLevelBase: 60
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 27
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
              masteryLevelBase: 20
        - name: Canine Bite
          type: skill
          system:
              shortcode: bite
              subType: combattechnique
              masteryLevelBase: 72
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: bite
                  name: Canine Bite
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 1
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
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
---

# Appearance {#appearance}

The sound begins before dawn — a noise so deep and so vast that your first instinct is geological, as though the mountain itself is groaning. It builds in waves, a rolling, resonant roar that seems to come from everywhere at once, filling the jungle canopy with vibration you can feel in your teeth and your sternum. Then another voice joins, and another, and the separate calls merge into a wall of sound that carries for miles through the humid air, drowning out every other forest voice. You look up and see them: dark shapes sitting in the upper canopy, bearded and heavy, mouths open wide, the sound pouring from throats that seem impossibly large for animals weighing less than twenty pounds. The howler monkey's call is the loudest sound produced by any land animal, and hearing it for the first time — feeling it roll through the forest like distant thunder made personal — you understand why the Ki'ichek associate these creatures with the voice of the gods and the scribes of the underworld. The monkey nearest you pauses its calling and turns to regard you with calm, amber eyes. The face is dark and intelligent, framed by a thick beard and an expression of settled, philosophical disdain. It has been watching you since before you noticed it. It will be watching you long after you have passed.

# Dossier {#dossier}

The Howler Monkey is the dominant primate of [[K'ich'chik]]'s lowland and cloud forests — a large, heavily built New World monkey famous for producing the loudest vocalization of any land animal. Weighing fifteen to twenty-two pounds with a body length of two feet plus a prehensile tail of equal length, the howler is a folivorous canopy-dweller that lives in troops of ten to twenty individuals. The howl — produced by a specialized hyoid bone in the throat that amplifies sound to extraordinary volume — carries for three miles or more through dense jungle and serves as a territorial declaration, a dawn census, and a means of spacing troops across the forest without physical confrontation. In Ki'ichek culture, the howler monkey is associated with scribes, artists, and the arts of communication — the connection between the monkey's world-filling voice and the human power of language and writing. Howler monkey imagery appears in the decoration of libraries, scriptoria, and the workshops of artisan castes. The monkey god associated with writing and record-keeping is depicted with howler monkey features. Adventurers in K'ich'chik's jungles will hear howler monkeys long before seeing them — the dawn chorus is one of the defining sounds of the lowland forest, and its sudden absence is an ominous sign that something has disturbed the canopy.

## Presentation

The howler monkey is a stocky, powerfully built primate with a body designed for an arboreal, sedentary lifestyle. The fur is typically dark brown to black, dense and coarse, with a distinctive beard of longer hair framing the face in males. The face is bare, dark-skinned, and set with forward-facing eyes of amber or brown that convey an impression of weary intelligence. The most notable anatomical feature is invisible from the outside: the hyoid bone in the throat is enlarged into a hollow, resonating chamber that amplifies the monkey's calls to a volume that defies the animal's modest size. The jaw is correspondingly large and prominent, giving the face a heavy, projecting appearance. The body is compact and muscular, with short, strong limbs adapted for slow, deliberate movement through the canopy rather than the acrobatic leaping of smaller monkeys. The prehensile tail is the howler's fifth limb — strong enough to support the animal's full weight, sensitive enough to serve as a tactile probe, and used constantly for gripping branches, stabilizing posture, and freeing the hands for feeding.

## Key Behaviors

Howler monkeys are social, territorial, and conspicuously vocal. The dawn howling chorus begins before sunrise and can last for thirty minutes or more, as troops across the forest declare their positions and negotiate spacing without physical contact. This behavior is remarkably energy-efficient — by advertising their location vocally, troops avoid the caloric cost and injury risk of direct territorial confrontation. Howlers are primarily folivorous (leaf-eating), supplemented by fruits, flowers, and occasional insects. Their leaf-heavy diet provides relatively little energy, which explains their sedentary lifestyle — howler monkeys move less than any other primate of comparable size, spending much of the day resting and digesting. Troops are organized around a dominant male and several females, with younger males either subordinate within the troop or expelled to form bachelor groups. Howlers are not aggressive toward humans unless provoked, but they express displeasure by defecating and urinating on intruders from above — a behavior that is more effective and more unpleasant than it sounds.

## Combat Strategy

Howler monkeys avoid physical confrontation whenever possible. Their primary defense is the howl itself — the sheer volume and deep resonance of the call is disorienting at close range and serves as an effective deterrent. If physically threatened, a troop will retreat through the canopy, where their arboreal agility makes pursuit by ground-based predators impossible. A cornered howler will bite — the jaw is powerful and the canine teeth are long — and a troop defending young will mob a threat with biting, scratching, and the targeted dropping of branches and fecal matter.

## Attack Methods

### Canine Bite

The howler's enlarged jaw houses long, sharp canine teeth capable of inflicting deep puncture wounds. The bite is powerful for an animal of its size and is used primarily in intra-troop disputes and self-defense.

### Arboreal Bombardment

A troop of howlers will drop branches, fruit, and fecal matter on intruders below. While individually these projectiles are not dangerous, the combined effect of a dozen monkeys simultaneously targeting a single individual is disorienting, disgusting, and surprisingly effective at driving away threats.

## Special Abilities

### World's Loudest Voice

The howler monkey's call, amplified by the specialized hyoid bone, is the loudest sound produced by any land animal — audible at distances of three miles or more through dense forest. At close range (within a few dozen paces), the sound is physically disorienting, vibrating in the chest cavity and making concentration difficult. The dawn chorus of multiple troops calling simultaneously creates an auditory landscape that dominates the forest.

### Prehensile Tail

The howler's tail is a fully functional fifth limb — strong enough to support the animal's full body weight, dexterous enough to manipulate small objects, and sensitive enough to serve as a tactile probe in the dark canopy. This adaptation gives the howler a degree of arboreal security that makes it virtually impossible to dislodge from a tree.

### Silence Warning

The sudden cessation of howler monkey calling is one of the most reliable indicators of danger in the K'ich'chik jungle. Experienced forest travelers know that when the howlers go silent, something has entered the canopy that frightens even the loudest voice in the forest — typically a jaguar, a large raptor, or something worse.

## Attributes

- **Strength:** 5-8 (1d4+4) — Modest; strong jaw but small body
- **Endurance:** 6-9 (1d4+5) — Sedentary lifestyle; low-energy diet limits sustained activity
- **Dexterity:** 12-17 (1d6+11) — Excellent arboreal manipulation; prehensile tail adds versatility
- **Agility:** 13-18 (1d6+12) — Sure and confident in the canopy; clumsy on the ground
- **Perception:** 11-16 (1d6+10) — Good forest senses; alert to predators
- **Aura:** 7-10 (1d4+6) — Cultural association with scribes and the arts; not sacred but respected
- **Will:** 7-10 (1d4+6) — Territorial through voice rather than violence
- **Reasoning:** 7-12 (1d6+6) — Primate intelligence; social complexity; learns territory and seasonal patterns
- **Creativity:** 6-9 (1d4+5) — Some behavioral flexibility; problem-solving within arboreal context
