---
aliases:
    - Shadow Lynx
tags:
    - animal
name:
    full: Shadow Lynx
    aliases: []
id: i1hrH7tYkoFMzTzq
slug: shadow-lynx
img: icons/game-icons/delapouite/lynx-head.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 13
        end: 11
        dex: 15
        agl: 16
        per: 16
        aur: 9
        wil: 12
        rea: 8
        cre: 7
    attrRollFormula:
        str: 1d6+9
        end: 1d6+7
        dex: 1d6+11
        agl: 1d6+12
        per: 1d6+12
        aur: 1d4+6
        wil: 1d6+8
        rea: 1d4+5
        cre: 1d4+4
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 1
                - name: Forelegs
                  shortcode: forelegszone
                  probWeight: 1
                - name: Torso
                  shortcode: torsozone
                  probWeight: 3
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
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 4
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Left Foreleg
                  shortcode: lforelegloc
                  bodyPartCode: lforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Right Foreleg
                  shortcode: rforelegloc
                  bodyPartCode: rforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Thorax
                  shortcode: thoraxloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 5
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 3
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Pelvis
                  shortcode: plvsloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 2
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Left Hind Leg
                  shortcode: lhindlegloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Right Hind Leg
                  shortcode: rhindlegloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Tail
                  shortcode: tailloc
                  bodyPartCode: tailpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 1
                  probWeight: 10
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
        weight:
            base: 60
            calc: "60"
        reachBase: 0
        bodyScaleBase: 1.18
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 70
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
              masteryLevelBase: 70
        - shortcode: stlth
          type: skill
          system:
              masteryLevelBase: 70
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 30
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 40
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 64
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 30
        - name: Precision Bite
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
                  name: Precision Bite
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
        - name: Raking Claws
          type: skill
          system:
              shortcode: claw
              subType: combattechnique
              masteryLevelBase: 72
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
                      spread: 2
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 8
                      modifier: 1
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

Something stirs in the darkness — barely more than a shadow among shadows, yet conscious and aware. The undergrowth doesn't part so much as accommodate the creature's passage, as if shadow itself is flowing through the ferns and leaf litter. The eyes open like green coals in the dimness, and your vision suddenly focuses on what you somehow knew was there all along: a sleek, dark form that would be nearly invisible in full daylight, let alone this gathering dusk. The ears twitch once, twice, and you realize the creature has locked onto you through sound alone. There is no haste in its movement, only certainty — the confidence of a predator that has already decided the outcome.

# Dossier {#dossier}

The Shadow Lynx is an ambush predator of deep forests and dense woodlands, standing 2-3 feet tall at the shoulder with a body length of 3-4 feet plus a short, tufted tail. These nocturnal hunters are specialized for stealth and precision, preferring to hunt alone and maintaining exclusive territories. Adventurers encounter shadow lynxes while traveling forests at night, camping in lynx territory, or exploring old ruins where populations have established.

## Presentation

The Shadow Lynx is a sleek, muscular feline with a build optimized for stealth rather than raw power. The fur is dark, ranging from charcoal gray to deep brown with subtle mottling and striations that provide extraordinary camouflage in forest shadows. Characteristic lynx features include pointed ears tipped with tufts of hair, a compact body with powerful hind legs, a relatively short tail with a dark tip, and large paws with retractable claws. The face is proportionally round and flat-featured, with large forward-facing eyes that glow faintly green in dim light. The whiskers are long and sensitive, capable of detecting minute air movements and vibrations. The overall build speaks of an animal designed for silent movement and explosive power across short distances.

## Key Behaviors

Shadow Lynxes are nocturnal and most active during dusk and night hours, resting in sheltered locations during daylight. They are solitary and territorial, with each lynx maintaining exclusive hunting grounds marked by scent deposits and claw marks on trees. They communicate primarily through vocalizations — yowls, growls, and chirps — that carry across forest distances. Shadow lynxes hunt primarily small mammals and birds, occasionally taking larger prey if opportunity presents. They are intelligent and capable of learning, remembering dangerous hunters and locations where game is abundant. The creatures are patient predators willing to wait for extended periods for prey to appear.

## Combat Strategy

The shadow lynx's strategy is ambush and precision — the creature stalks prey with supernatural silence, positions itself for a killing strike, and launches a sudden explosive attack intended to kill quickly. If the initial strike fails, the lynx retreats into terrain and shadow it knows intimately, repositioning to strike again from a new angle. The creature avoids prolonged physical combat, preferring to kill through surprise and positioning rather than through sustained engagement. If cornered or defending young, the lynx becomes more aggressive but still prefers disengagement when possible.

## Attack Methods

### Explosive Pounce

The shadow lynx launches from concealment with explosive speed, using its hind legs to propel its entire body at a target. The pounce is intended to knock smaller prey off balance and to position the lynx for a killing bite. The attack combines momentum with claws and jaws for maximum impact.

### Precision Bite

Once engaged, the lynx attempts to bite at vital areas — the throat, the spine, or the base of the skull — using its powerful jaw and sharp teeth to inflict lethal injury. The bite is precise and delivered only after the lynx has positioned itself for maximum effect.

### Raking Claws

The lynx uses its powerful forelimbs and retractable claws to rake and slash at exposed flesh, creating wounds and establishing dominance in physical engagement. The claws are capable of tearing through light leather and inflicting serious bleeding wounds.

## Special Abilities

### Forest Camouflage

The shadow lynx's coloration and fur patterning are so effective in forest environments that the creature is nearly invisible when still or moving slowly through undergrowth. The lynx gains significant advantage on stealth checks in forest terrain.

### Silent Movement

The shadow lynx can move with remarkable silence, even across terrain that would normally produce significant noise. The creature's paws are padded and its muscle control is precise, allowing it to approach prey without detection. The lynx gains advantage on stealth checks while moving.

### Acute Hearing and Whisker Sensitivity

The shadow lynx's hearing is extraordinarily acute, and its long whiskers detect minute vibrations and air movements. The creature can locate prey through sound and vibration even in complete darkness, making it an effective hunter in any light condition.

### Explosive Acceleration

Despite its modest size, the shadow lynx can achieve rapid acceleration over short distances, giving it advantage in catching prey that attempts to flee. The creature's initial attack is significantly more likely to succeed than sustained combat.

### Territorial Knowledge

The shadow lynx's familiarity with its own territory provides it with advantage in combat within its established range — the lynx can use terrain tactically while opponents are unfamiliar with the landscape.

### Additional Information

Shadow lynxes are most dangerous at night and in forest environments, where their natural advantages are maximized. In open ground or bright daylight, the creatures become significantly less confident. A lynx that has successfully hunted humanoids becomes more likely to target humans in future encounters. Young lynxes are vulnerable and mothers defending kittens become extremely aggressive and dangerous. The creatures can be tracked by their claw marks and scent deposits, allowing careful hunters to avoid established lynx territories. A shadow lynx's fur is valuable and can be harvested after death to create camouflage cloaks and other items.

## Attributes

- **Strength:** 10-15 (1d6+9)

- **Endurance:** 8-13 (1d6+7)

- **Dexterity:** 12-17 (1d6+11)

- **Agility:** 13-18 (1d6+12)

- **Perception:** 13-18 (1d6+12)

- **Aura:** 7-10 (1d4+6)

- **Will:** 9-14 (1d6+8)

- **Reasoning:** 6-9 (1d4+5)

- **Creativity:** 5-8 (1d4+4)
