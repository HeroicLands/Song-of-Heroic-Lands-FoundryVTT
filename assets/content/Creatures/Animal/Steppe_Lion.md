---
aliases:
    - Steppe Lion
tags:
    - animal
name:
    full: Steppe Lion
    aliases: []
id: qzveOIr4oOPGkWen
slug: steppe-lion
img: icons/game-icons/lorc/lion.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 15
        end: 13
        dex: 14
        agl: 15
        per: 16
        aur: 10
        wil: 13
        rea: 8
        cre: 7
    attrRollFormula:
        str: 1d6+11
        end: 1d6+9
        dex: 1d6+10
        agl: 1d6+11
        per: 1d6+12
        aur: 1d4+7
        wil: 1d6+9
        rea: 1d4+5
        cre: 1d4+4
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
            base: 150
            calc: "150"
        reachBase: 0
        bodyScaleBase: 1.22
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 80
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
              masteryLevelBase: 75
        - shortcode: stlth
          type: skill
          system:
              masteryLevelBase: 70
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
              masteryLevelBase: 60
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 35
        - name: Devastating Bite
          type: skill
          system:
              shortcode: bite
              subType: combattechnique
              masteryLevelBase: 70
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: bite
                  name: Devastating Bite
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
        - name: Raking Claw
          type: skill
          system:
              shortcode: claw
              subType: combattechnique
              masteryLevelBase: 70
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: claw
                  name: Raking Claw
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
---

# Appearance {#appearance}

The golden color shifts with the creature's movement, and suddenly you realize what you're looking at is not mere terrain — it's a predator so perfectly matched to its environment that separation from background requires active thought. The mane is dark and full, framing a head that turns slowly to assess you with amber eyes that hold genuine intelligence and hunger. The body beneath is pure, coiled power, muscles moving beneath fur in patterns that suggest strength far beyond what appearance alone would indicate. As the creature shifts weight, you see the claws extend and retract in unconscious gesture, and you understand with sudden, terrible clarity that this is one of the apex predators of these lands.

# Dossier {#dossier}

The Steppe Lion is a massive solitary predator standing 4-5 feet at the shoulder and reaching 10-12 feet in length, found in grasslands, rocky steppes, and open forests across temperate to semi-arid regions. These apex hunters are ambush specialists that maintain enormous territories and defend them aggressively. Adventurers encounter steppe lions while traveling steppes, camping in territories the lions claim, or hunting game in areas where the cats also hunt.

## Presentation

The Steppe Lion is a vision of predatory perfection and muscular power. The coat is golden-tan to pale brown with darker mottling and faint striping, particularly evident near the tail and on the legs, providing camouflage across grasslands and rocky terrain. The distinctive feature is the thick, dark mane that frames the head and extends down the neck and onto the chest, likely serving both territorial display and protection of vital areas. The face is broad and powerful, with forward-facing amber eyes suited for predatory vision, strong jaw muscles, and teeth designed for killing and eating large prey. The body is compact and heavily muscled, with shoulders and foreparts more heavily developed than hindquarters. The claws are large and curved, capable of slashing and gripping. The tail is long and muscular, used for balance and communication.

## Key Behaviors

Steppe Lions are solitary hunters that establish and defend enormous territories spanning dozens of square miles. They are ambush specialists that spend much of their time resting in vegetation or rocky cover while maintaining surveillance of likely prey areas. They mark territory through claw marks on rocks and trees and scent deposits. Lions are most active during cooler times of day and during night, resting during peak heat. They are intelligent and capable of learning hunting strategies, remembering productive areas and dangerous hunters. Outside of mating season, lions are solitary and intolerant of other lions on their claimed territory. Mating season brings temporary tolerance and social interaction, but post-mating separation is absolute.

## Combat Strategy

The steppe lion's primary strategy is patience and positioning — the creature waits for prey to pass within range, then attacks with explosive power and speed. The initial strike is designed to kill quickly through catastrophic injury to the neck or spine. If the attack succeeds, the lion feeds. If the initial strike fails, the lion may pursue or may retreat, depending on the threat posed by the prey. Once engaged with a threat it cannot immediately kill, the lion fights ferociously, using claws and teeth to inflict maximum damage while maintaining positioning. A wounded lion becomes more aggressive and dangerous.

## Attack Methods

### Devastating Bite

The steppe lion latches onto prey with its powerful jaw, attempting to sever the carotid artery or crush the trachea through direct throat attack. Alternatively, it bites at the base of the skull, attempting to sever the spinal cord. The bite is powerful enough to puncture bone.

### Raking Claw Attack

Using its powerful forelimbs, the lion slashes with claws capable of tearing through leather and light armor, creating deep lacerations that bleed profusely. Multiple rakes in rapid succession can cause disembowelment.

### Crushing Body Slam

The lion uses its massive weight and momentum to knock opponents off balance or directly to the ground, positioning for follow-up attacks.

## Special Abilities

### Steppe Camouflage

The lion's coloration is extraordinarily effective in grasslands and rocky terrain. The creature gains significant advantage on stealth checks in steppe environments and can remain nearly invisible when still.

### Explosive Speed

Despite its size, the steppe lion can accelerate rapidly over short distances, allowing it to close distance on fleeing prey. The initial pounce is devastating in effectiveness.

### Ambush Predator

The lion is superlatively effective when attacking from cover or from a position of advantage. The creature gains significant bonus to attack rolls and damage when striking from ambush or hidden position.

### Devastating Strength

A creature of such size and muscle possesses overwhelming strength. The lion can knock large animals and armored humanoids off balance or directly to the ground.

### Territorial Dominance

Within its claimed territory, the lion fights with enhanced confidence and aggression, knowing the terrain and having established superiority in the region.

### Additional Information

Steppe lions are most dangerous in grasslands and open terrain where they maintain complete advantage. In dense vegetation or confined spaces, their dominance is reduced. The creatures are primarily nocturnal and avoid humans except during times of severe hunger or territorial intrusion. A steppe lion that has successfully hunted humanoids becomes more bold and likely to target humans in future encounters. The creature's hide is extraordinarily valuable and can be harvested after death to create armor or other protective items. A lion defending a fresh kill or established territory fights with suicidal determination.

## Attributes

- **Strength:** 12-17 (1d6+11)

- **Endurance:** 10-15 (1d6+9)

- **Dexterity:** 11-16 (1d6+10)

- **Agility:** 12-17 (1d6+11)

- **Perception:** 13-18 (1d6+12)

- **Aura:** 8-11 (1d4+7)

- **Will:** 10-15 (1d6+9)

- **Reasoning:** 6-9 (1d4+5)

- **Creativity:** 5-8 (1d4+4)
