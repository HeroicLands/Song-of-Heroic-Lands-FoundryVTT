---
aliases:
    - Monitor Lizard
    - creature-mntrlzrd
tags:
    - animal
name:
    full: Monitor Lizard
    aliases: []
description: "A large, agile reptile five to seven feet long with a camouflaged hide and muscular neck, a lean predator of arid and rocky terrain."
id: buxdi9gtzv4CEBbs
img: icons/game-icons/lorc/gecko.svg
portrait: images/being/mntrlzrd-portrait.webp
shortcode: mntrlzrd
type: creature
package: sohl
sohl:
    kbcat: animal
    archetype: 0
    attributes:
        str: 13
        end: 11
        dex: 13
        agl: 12
        per: 12
        aur: 9
        wil: 11
        rea: 7
        cre: 6
    attrRollFormula:
        str: 1d6+9
        end: 1d6+7
        dex: 1d6+9
        agl: 1d6+8
        per: 1d6+8
        aur: 1d4+6
        wil: 1d6+7
        rea: 1d4+4
        cre: 1d4+3
    body:
        structure:
            zones:
                - name: Forequarters
                  shortcode: fqtrzone
                  probWeight: 1
                - name: Torso
                  shortcode: torsozone
                  probWeight: 1
                - name: Hindquarters
                  shortcode: hindqtrzone
                  probWeight: 1
            parts:
                - name: Head
                  shortcode: headpart
                  bodyZoneCode: fqtrzone
                  roles:
                      - vital
                      - manipulator
                  canHoldItem: false
                  probWeight: 10
                - name: Left Foreleg
                  shortcode: lforelegpart
                  bodyZoneCode: fqtrzone
                  roles: &a1
                      - locomotor
                  canHoldItem: false
                  probWeight: 5
                - name: Right Foreleg
                  shortcode: rforelegpart
                  bodyZoneCode: fqtrzone
                  roles: *a1
                  canHoldItem: false
                  probWeight: 5
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
                  probWeight: 5
                - name: Right Hind Leg
                  shortcode: rhindlegpart
                  bodyZoneCode: hindqtrzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 5
                - name: Tail
                  shortcode: tailpart
                  bodyZoneCode: hindqtrzone
                  roles:
                      - manipulator
                  canHoldItem: false
                  probWeight: 10
            locations:
                - name: Head
                  shortcode: headloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 3
                  protectionBase:
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 4
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 2
                  protectionBase:
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 4
                - name: Left Foreleg
                  shortcode: lforelegloc
                  bodyPartCode: lforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 4
                - name: Right Foreleg
                  shortcode: rforelegloc
                  bodyPartCode: rforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 4
                - name: Thorax
                  shortcode: thoraxloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 5
                  protectionBase:
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 4
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 3
                  protectionBase:
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 4
                - name: Pelvis
                  shortcode: plvsloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 2
                  protectionBase:
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 4
                - name: Left Hind Leg
                  shortcode: lhindlegloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 4
                - name: Right Hind Leg
                  shortcode: rhindlegloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 4
                - name: Tail
                  shortcode: tailloc
                  bodyPartCode: tailpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 1
                  probWeight: 10
                  protectionBase:
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 4
        weight:
            base: 20
            calc: "20"
        reachBase: 0
        bodyScaleBase: 1.11
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
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
              masteryLevelBase: 48
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 30
        - name: Powerful Bite
          type: skill
          system:
              shortcode: bite
              subType: combattechnique
              masteryLevelBase: 64
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: bite
                  name: Powerful Bite
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 1
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 2
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
        - name: Tail Lash
          type: skill
          system:
              shortcode: tail
              subType: combattechnique
              masteryLevelBase: 54
              combatCategory: melee
              impairedByRoles:
                  - locomotor
              strikeMode:
                  type: melee
                  shortcode: tail
                  name: Tail Lash
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 2
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: -1
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

The lizard’s tail is what catches your attention first—a muscular, whip-like appendage that sweeps across the ground with ominous purpose. The body following it is lean and powerful, covered in scales that range from yellow-brown to dark gray depending on how the light hits them. Its head is small but purposeful, with a jaw line that suggests strength, and when it flicks its forked tongue in and out, the motion seems to taste your very fear. Its claws click against stone as it moves with fluid grace. The eyes—small, bright, and utterly focused—never leave you as it approaches.

# Dossier {#dossier}

Monitor lizards are large, agile reptiles measuring 5-7 feet in length and weighing 15-35 pounds, depending on species. Their bodies are covered in rough, scaly hides colored in patterns of yellow, brown, and gray that provide good camouflage in arid or rocky environments. The build is lean but muscular, with powerful musculature concentrated in the neck, shoulders, and tail. The head is proportionally small and tapered, with a strong jaw and small eyes positioned forward.

## Presentation

Monitor lizards display rough, knobbed scales across their entire body, particularly along the spine and tail. The coloration is typically cryptic—browns, grays, and yellows with darker banding or mottling—allowing them to blend with rocky or sandy terrain. The tail comprises nearly half the total body length and is muscular, whip-like, and used for balance, swimming, and combat. The head is triangular when viewed from above, with a powerful jaw line and small, dark eyes. The claws on all four feet are sharp and partially curved, designed for climbing. The tongue is long and forked, used for smelling and tasting the air.

## Key Behaviors

Monitor lizards are opportunistic hunters, equally comfortable hunting terrestrial prey, climbing to raid bird nests, or diving in water after aquatic prey. They are primarily solitary but may gather at carcasses or rich feeding grounds. They are excellent climbers, swimmers, and runners, using speed and agility to capture prey. They have relatively good eyesight and rely on it heavily in hunting. They are active during the day and retreat to burrows or crevices at night or during extreme heat.

## Combat Strategy

Monitor lizards prefer to use speed and agility to advantage, striking from unexpected angles or retreating before a stronger opponent can mount an effective counterattack. They bite and claw at the head and neck of prey to disable it quickly. If facing a larger or more formidable opponent, they rely on hit-and-run tactics, biting and escaping to higher ground. Their tail is used as a secondary weapon to create distance and inflict slashing damage on pursuers.

## Attack Methods

### Powerful Bite

The monitor lizard lunges to clamp its jaws on the target’s head, limb, or body, delivering puncture damage and tearing; the bite can sever fingers or toes and can cause serious bleeding.

### Tail Lash

The lizard sweeps its whip-like tail to strike opponents at distance or to defend itself from threats; the tail strike can knock smaller opponents off balance, disarm weapons, or inflict slashing damage.

## Special Abilities

### Climber’s Grip

Monitor lizards can traverse vertical and inverted surfaces with ease, using their sharp claws for grip; they gain bonuses to climbing and escaping checks, and can retreat to places opponents cannot easily follow.

### Swift Strike

Monitor lizards have quick reflexes and gain bonuses to initiative and to reaction checks; they can sometimes take additional actions during combat due to their speed and agility.

### Aquatic Hunter

Monitor lizards are equally at home in water as on land, able to hold breath for extended periods and move with perfect grace through aquatic environments.

## Attributes

- **Strength:** 10-15 (1d6+9)

- **Endurance:** 8-13 (1d6+7)

- **Dexterity:** 10-15 (1d6+9)

- **Agility:** 9-14 (1d6+8)

- **Perception:** 9-14 (1d6+8)

- **Aura:** 7-10 (1d4+6)

- **Will:** 8-13 (1d6+7)

- **Reasoning:** 5-8 (1d4+4)

- **Creativity:** 4-7 (1d4+3)
