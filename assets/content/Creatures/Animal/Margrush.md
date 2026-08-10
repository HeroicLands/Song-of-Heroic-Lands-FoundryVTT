---
aliases:
    - Margrush
tags:
    - animal
name:
    full: Margrush
    aliases: []
id: hfTq2IglUl64LTn9
slug: margrush
img: icons/game-icons/lorc/paw-print.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 17
        end: 18
        dex: 10
        agl: 11
        per: 15
        aur: 11
        wil: 16
        rea: 8
        cre: 6
    attrRollFormula:
        str: 1d6+13
        end: 1d6+14
        dex: 1d4+7
        agl: 1d6+7
        per: 1d6+11
        aur: 1d6+7
        wil: 1d6+12
        rea: 1d4+5
        cre: 1d4+3
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
                  probWeight: 4
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
            base: 300
            calc: "300"
        reachBase: 0
        bodyScaleBase: 1.55
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
              masteryLevelBase: 80
        - shortcode: stlth
          type: skill
          system:
              masteryLevelBase: 65
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 39
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 48
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 52
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 45
        - name: Powerful Bite
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
                  name: Powerful Bite
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 2
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 4
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
        - name: Claw Rake
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
                  name: Claw Rake
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 4
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 8
                      modifier: 3
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

The low growl reaches you before you see the creature—a sound that vibrates through bone and stone alike. From beneath the ferns and leaf litter, a broad, flattened head emerges, its eyes set high and keen, watching with predatory patience. The creature’s body is a mass of coiled muscle covered in thick, leathery skin bristling with fur, colored to match the forest floor so perfectly that you almost missed it until it moved. Its claws dig into the earth as it advances, and you realize with creeping dread that this is no ambush—it has known of your presence all along, and now it is simply deciding whether to strike.

# Dossier {#dossier}

The Margrush is a formidable terrestrial predator, measuring 7 to 8 feet in body length and weighing 350-450 pounds. Its body is covered in tough, leathery skin interspersed with patches of bristly fur colored from dark brown to nearly black, providing excellent camouflage in forest and swamp environments. The head is broad and flattened, and the powerful jaws are filled with serrated teeth designed for gripping and tearing flesh. Its eyes are positioned high on the skull, allowing it to observe surroundings while the body remains low to the ground.

## Presentation

Margrushes display a low, ground-hugging profile with stocky, powerfully muscled legs ending in large clawed paws. The tail is long, thick, and used for balance and balance-assisted turning. The fur coloration ranges from dark brown to black with occasional lighter mottling that aids camouflage. The face is somewhat flattened, with the eyes set to allow good lateral vision while remaining high. The ears are small and rounded, positioned at the sides of the head. The skin shows visible folds and wrinkles, particularly around the neck and shoulders, and is covered in scars from countless territorial disputes. The musk that surrounds them is distinctive and pungent.

## Key Behaviors

Margrushes are highly territorial, actively and aggressively defending a large domain against intruders. They mark territory with scent markings, claw scratches on trees, and physical rearrangement of forest floor debris. They are primarily nocturnal, taking advantage of their excellent night vision to hunt during darkness and resting in burrows or dense thickets during the day. Despite their bulk, they move with remarkable stealth and can remain motionless for hours, waiting for prey. They have excellent senses of smell and hearing, allowing them to detect prey from considerable distances. Their metabolism is elevated and they require frequent, substantial meals to maintain their condition.

## Combat Strategy

Margrushes are ambush predators par excellence. They position themselves along known animal trails or near water sources and remain motionless, using their camouflage and low profile to become nearly invisible. When prey comes within striking distance, they explode into motion with terrifying speed, attempting to close distance and deliver a devastating bite to the throat or belly. If they successfully land a bite, they shake their victim to inflict additional damage and tighten their grip. Against multiple opponents or when facing something that resists the initial attack, they rely on their strength and ferocity, using their claws and jaws to make the fight as brutal as possible.

## Attack Methods

### Powerful Bite

The Margrush lunges with jaws agape, aiming for the throat, belly, or limbs, and clamps down with incredible force capable of crushing bone; once the bite is secured, the creature shakes violently to cause additional damage.

### Claw Rake

The Margrush uses its powerful front legs to slash with claws, creating deep lacerations and inflicting serious bleeding injuries; these attacks can also knock smaller opponents prone or disarm weapons.

## Special Abilities

### Ambush Master

The Margrush excels at remaining undetected in natural terrain and gains substantial bonuses to stealth, hiding, and attack rolls when striking from surprise; it can remain motionless for hours without detection.

### Powerful Jaws

The Margrush’s bite delivers crushing force capable of breaking bone, shattering light armor, and pinning an opponent in place; a victim successfully bitten must make a strength check to break free or suffer additional shaking damage each round.

### Excellent Night Vision

The Margrush hunts effectively in complete darkness and gains bonuses to perception and combat in low-light or nocturnal conditions, making it particularly dangerous after nightfall.

### Territorial Fury

When defending its territory or den, the Margrush gains increased damage and to-hit bonuses, and it will continue fighting even when severely wounded, using its territorial fury to overcome pain and damage.

## Additional Information

Margrushes are solitary creatures and establish territories measured in square miles. Once embedded in a territory, they rarely venture far beyond its boundaries, following predictable patrol routes. This can be exploited by savvy adventurers to avoid confrontation or to predict where the creature will be. The Margrush’s thick hide is prized for leather goods and provides excellent protection. The liver of a Margrush is believed by some cultures to grant strength and stamina, though these properties are likely superstition or at best psychological.
