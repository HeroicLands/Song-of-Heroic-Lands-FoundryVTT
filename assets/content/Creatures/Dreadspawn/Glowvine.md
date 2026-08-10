---
aliases:
    - Glowvine
tags:
    - dreadspawn
name:
    full: Glowvine
    aliases: []
id: dQx4jt8bWKxTwaOT
slug: glowvine
img: icons/game-icons/delapouite/griffin-symbol.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 14
        end: 14
        dex: 12
        agl: 10
        per: 12
        aur: 12
        wil: 10
        rea: 8
        cre: 10
    attrRollFormula:
        str: 1d6+10
        end: 1d6+10
        dex: 1d4+9
        agl: 1d6+6
        per: 1d4+9
        aur: 1d4+9
        wil: 1d6+6
        rea: 1d6+4
        cre: 1d6+6
    body:
        structure:
            zones:
                - name: Crown
                  shortcode: crownzone
                  probWeight: 2
                - name: Stem
                  shortcode: stemzone
                  probWeight: 4
                - name: Tendrils
                  shortcode: tendrilzone
                  probWeight: 3
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
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 4
                - name: Stem
                  shortcode: stemloc
                  bodyPartCode: stempart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 10
                  protectionBase:
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 4
                - name: Left Tendrils
                  shortcode: ltendrilloc
                  bodyPartCode: ltendrilpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 4
                - name: Right Tendrils
                  shortcode: rtendrilloc
                  bodyPartCode: rtendrilpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 4
        weight:
            base: 150
            calc: 150
        reachBase: 0
        bodyScaleBase: 1.27
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
              masteryLevelBase: 55
        - shortcode: stlth
          type: skill
          system:
              masteryLevelBase: 50
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 33
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 36
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 44
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 35
        - name: Constricting Tendril
          type: skill
          system:
              shortcode: grab
              subType: combattechnique
              masteryLevelBase: 65
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: grab
                  name: Constricting Tendril
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 4
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 14
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
                      constrict: true
        - name: Thorned Whipping
          type: skill
          system:
              shortcode: tentacle
              subType: combattechnique
              masteryLevelBase: 60
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: tentacle
                  name: Thorned Whipping
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 4
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 1
                      aspect: blunt
                  lengthBase: 3
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

Light blooms in the darkness—soft, beautiful, almost inviting. A pulse of bioluminescence traces along what you thought was a vine hanging from the canopy above. Except there are vines everywhere, dozens of them, and they’re all moving toward you with deliberate slowness. Gem-like nodes of light pulse along their length, each one mesmerizing to watch. The light is hypnotic, entrancing, and you don’t quite notice when the nearest vine is close enough to touch until it does—and then it pulls tight.

# Dossier {#dossier}

Glowvines are predatory plants corrupted by dark magic, creatures that use beauty and bioluminescence as weapons. These animated tendrils dwell in deep forests and cavern systems where light is scarce and prey is unwary. Adventurers encounter them in forests touched by shadow-magic, in deep caves, and in places where plant-life has become weaponized.

## Presentation

The Glowvine appears as a mass of animated tendrils, each one two to four feet long and covered in small but sharp thorns. The entire structure is vaguely circular, with tendrils extending in all directions from a central mass. The tendrils are dark green fading to black, but bioluminescent beads of light—gem-like and mesmerizing—pulse along their length in hypnotic patterns. These lights range in color from green to blue to a sickly purple. The overall effect is beautiful and deeply wrong simultaneously. Movement is smooth and sinuous when unthreatening but becomes rapid and violent when striking. The plant constantly exudes a faint stench of rot mixed with something sweet and floral.

## Key Behaviors

The Glowvine is rooted or semi-rooted in place, moving through writhing motion rather than locomotion. It dwells in forest canopies, cave ceilings, or dense undergrowth where its bioluminescence provides maximum advantage for ambush hunting. The creature is patient, remaining still for extended periods while its glowing tendrils dangle like lures. When prey—drawn by the hypnotic beauty of the light—draws close, the vines strike with sudden violence. The creature shows no interest in hunting large prey; it specializes in small creatures, insects, and small animals, but it will attempt to ensnare humanoids if they come within reach. It appears to be slowly mobile, capable of moving from one location to another over days and weeks, seeking optimal hunting positions.

## Combat Strategy

The Glowvine does not actively pursue prey. Instead, it uses its bioluminescence to lure prey into range, then grapples with tendrils when a target draws close. Multiple tendrils can ensnare simultaneously, attempting to immobilize and pull the target against the central mass. Once grappled, the creature applies constriction and acid damage while releasing spores. The vines themselves are relatively fragile; if a victim breaks free or the grapple fails, the Glowvine has limited offensive options and relies on its bioluminescence to re-lure prey or on spore clouds to affect escape attempts.

## Attack Methods

### Constricting Tendril Grapple

Multiple tendrils wrap around the target simultaneously, attempting to immobilize and pull the victim toward the central mass. Grappled targets take ongoing constriction damage and cannot easily break free.

### Thorned Whipping

The tendrils lash with their sharp thorns, attempting to slash and wound targets before or after grappling. The thorns can penetrate light armor and cause bleeding.

### Corrosive Acid Secretion

Once a target is grappled, the tendrils exude a corrosive acid that burns exposed flesh and deteriorates armor and sohl. This acid weakens materials and living tissue alike.

## Special Abilities

### Bioluminescent Lure

The Glowvine’s bioluminescent beads pulse in hypnotic patterns that draw the attention and curiosity of creatures. This effect is not directly compulsive but is deeply captivating; creatures drawn by the light gain disadvantage on perception checks and suffer penalties to noticing danger.

### Hallucinogenic Spores

The creature can release clouds of spores into the air that induce hallucinations, distorted perception, and vulnerability to further attacks. Spores are most effective in enclosed spaces or where air circulation is limited.

### Verdant Resilience

The plant structure is flexible and resilient, though not armored. It resists cutting and piercing attacks through its sinuous form but is vulnerable to fire and destructive force.

### Regeneration in Darkness

When growing in dark environments with adequate moisture, the Glowvine slowly regenerates damage. Prolonged exposure to bright light halts regeneration; sustained burning destroys the creature entirely.

## Additional Information

Fire is highly effective against Glowvines, as it destroys the plant structure and halts regeneration. Sustained bright light can drive the creature away or make it dormant. The spores released are not inherently lethal but are disorienting and can mask the creature’s position. Creating wind or air circulation can disperse spores and make them less effective. Glowvines show no interest in moving from optimal hunting positions—static traps rather than mobile predators.

## Attributes

- **Strength:** 11-16 (1d6+10)

- **Endurance:** 11-16 (1d6+10)

- **Dexterity:** 10-13 (1d4+9)

- **Agility:** 7-12 (1d6+6)

- **Perception:** 10-13 (1d4+9)

- **Aura:** 10-13 (1d4+9)

- **Will:** 7-12 (1d6+6)

- **Reasoning:** 5-10 (1d6+4)

- **Creativity:** 7-12 (1d6+6)
