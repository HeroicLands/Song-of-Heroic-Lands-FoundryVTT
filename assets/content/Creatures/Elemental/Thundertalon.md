---
aliases:
    - Thundertalon
tags:
    - elemental
name:
    full: Thundertalon
    aliases: []
id: BER0R5sENldRKjgM
slug: thundertalon
img: icons/game-icons/delapouite/griffin-symbol.svg
portrait: ""
shortcode: thndrtln
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 15
        end: 15
        dex: 13
        agl: 17
        per: 17
        aur: 15
        wil: 13
        rea: 9
        cre: 13
    attrRollFormula:
        str: 1d4+12
        end: 1d4+12
        dex: 1d4+10
        agl: 1d4+14
        per: 1d4+14
        aur: 1d4+12
        wil: 1d4+10
        rea: 1d4+6
        cre: 1d4+10
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 3
                - name: Left Wing
                  shortcode: lwingzone
                  probWeight: 3
                - name: Body
                  shortcode: torsozone
                  probWeight: 6
                - name: Right Wing
                  shortcode: rwingzone
                  probWeight: 3
                - name: Hindquarters
                  shortcode: hindqtrzone
                  probWeight: 3
            parts:
                - name: Head
                  shortcode: headpart
                  bodyZoneCode: headzone
                  roles:
                      - vital
                      - manipulator
                  canHoldItem: false
                  probWeight: 10
                - name: Left Wing
                  shortcode: lwingpart
                  bodyZoneCode: lwingzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 10
                - name: Body
                  shortcode: torsopart
                  bodyZoneCode: torsozone
                  roles:
                      - core
                  canHoldItem: false
                  probWeight: 10
                - name: Right Wing
                  shortcode: rwingpart
                  bodyZoneCode: rwingzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 10
                - name: Left Leg
                  shortcode: llegpart
                  bodyZoneCode: hindqtrzone
                  roles:
                      - locomotor
                      - manipulator
                  canHoldItem: false
                  probWeight: 5
                - name: Right Leg
                  shortcode: rlegpart
                  bodyZoneCode: hindqtrzone
                  roles:
                      - locomotor
                      - manipulator
                  canHoldItem: false
                  probWeight: 5
                - name: Tail
                  shortcode: tailpart
                  bodyZoneCode: hindqtrzone
                  roles: []
                  canHoldItem: false
                  probWeight: 10
            locations:
                - name: Head
                  shortcode: headloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 4
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
                  probWeight: 6
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Left Wing
                  shortcode: lwingloc
                  bodyPartCode: lwingpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 10
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Thorax
                  shortcode: thoraxloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 6
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 4
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Right Wing
                  shortcode: rwingloc
                  bodyPartCode: rwingpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 10
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Left Leg
                  shortcode: llegloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Right Leg
                  shortcode: rlegloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Tail
                  shortcode: tailloc
                  bodyPartCode: tailpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 1
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
        bodyScaleBase: 1.22
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: aerial
          feetPerRound: 100
          leaguesPerWatch: 10
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
              masteryLevelBase: 68
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 38
        - name: Lightning-Charged Talons
          type: skill
          system:
              shortcode: talon
              subType: combattechnique
              masteryLevelBase: 59
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: talon
                  name: Lightning-Charged Talons
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
                      aspect: fire
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
        - name: Lightning Bolt
          type: skill
          system:
              shortcode: bolt
              subType: combattechnique
              masteryLevelBase: 59
              combatCategory: missile
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: missile
                  shortcode: bolt
                  name: Lightning Bolt
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 0
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 5
                      aspect: fire
                  projectileType: none
                  maxVolleyMult: 1
                  baseRangeBase: 120
                  drawBase: 0
                  traits: {}
---

# Appearance {#appearance}

The sky darkens around it. What descends is magnificent and terrifying—an eagle the size of a great horse, wreathed in storm clouds and alive with crackling electricity. Its feathers are not feathers but formations of electrical discharge, each one glowing with electric blue. Its talons are points of pure lightning, and its eyes burn with intelligence and predatory purpose. When it moves, the air itself screams, and thunder follows its passage. The static electricity in the air becomes palpable, making hair stand on end and forcing breath to come in shallow gasps.

# Dossier {#dossier}

A Thundertalon is a storm elemental of tremendous power and intelligence. Unlike smaller air elementals, a Thundertalon is a conscious predator with clear motivations and tactics. It is drawn to high peaks and open skies, and it hunts both mundane prey and any creature foolish enough to climb into its domain. A Thundertalon views creatures of the earth and sea as primitives, and it will attack them on sight, viewing them as intruders in its rightful domain. Some Thundertalons have been known to develop territories and protect them across years.

## Presentation

A Thundertalon resembles an enormous eagle, with a wingspan approaching thirty feet. Its body is composed of electrical energy and storm given form, with feathers that crackle and spark with electricity. Its talons are pure lightning, and they glow with an intense electric-blue light. Its eyes are storm-gray and far more intelligent than any natural bird. Where it flies, the air becomes charged with static, and the smell of ozone grows strong. It moves with grace and power, and its presence causes atmospheric disturbance.

## Key Behaviors

Thundertalons are territorial and intelligent. They understand human settlement patterns and will attack humans attempting to climb mountains or enter sky-regions they have claimed. They hunt regularly and seem to prefer hunting from the air, diving at prey with tremendous speed. They show remarkable memory and will remember individuals who have threatened them. Multiple Thundertalons in a region may coordinate or may fight for territorial dominance. They seem to grow stronger during storms and may position themselves in locations where violent weather is developing.

## Combat Strategy

A Thundertalon fights from the air with tactical precision. It uses its speed to attack and withdraw before enemies can retaliate. It combines physical talon attacks with lightning strikes, and it can create localized storms to increase environmental hazards. It will attempt to drive opponents off cliffs or into dangerous terrain. Against opponents with earth-based magic or electrical protection, it becomes more aggressive, viewing them as worthy threats. A Thundertalon will fight to the death if protecting territory or young.

## Attack Methods

### Lightning-Charged Talons

The Thundertalon dives and strikes with talons of pure electrical energy. The strike combines physical damage from talon impact with electrical burns that penetrate even armored opponents. Victims struck experience muscle paralysis and nerve damage.

### Lightning Bolt

The Thundertalon summons a bolt of electricity from the sky that strikes a target with devastating precision. The bolt can strike multiple times if the Thundertalon maintains focus, turning a single target into a conduit for repeated electrical damage.

### Thunderclap

The Thundertalon beats its wings and generates a shockwave of sonic and electrical force. The effect is deafening and knocks opponents off their feet. It can be used both as attack and as defense to create distance.

### Storm Creation

The Thundertalon can cause localized storms to develop rapidly, complete with lightning, heavy rain, and severe wind. The storm is centered on the creature and can last as long as the Thundertalon maintains focus.

## Special Abilities

### Aerial Dominance

The Thundertalon is supremely skilled in aerial combat and maneuvers with incredible precision and speed in open sky. In aerial combat, it gains overwhelming advantages against ground-based opponents.

### Electrical Form

The Thundertalon is partially composed of electrical energy and is resistant to electrical damage. It is harmed primarily by earth-based magic and by grounding effects that dissipate its electrical charge.

### Lightning Summoning

The Thundertalon can call down lightning from storm clouds with precision. It seems to have an almost supernatural ability to direct electricity from the sky.

### Feather Projectiles

The Thundertalon can shed feathers of pure electrical energy that function as projectiles, arcing through the air and striking targets with surprising accuracy.

### Storm Attunement

The Thundertalon grows stronger during storms and draws power from electrical discharges in its environment. In a region of active thunderstorms, it becomes nearly unstoppable.

## Additional Information

Earth-based magic and grounding effects are most effective against a Thundertalon. Materials designed to conduct electricity safely—proper grounding rods and metal frameworks—can reduce the threat of its lightning. A Thundertalon destroyed far from electrical sources may not reform. One destroyed during a storm will likely return. Settlement threats from a Thundertalon can sometimes be resolved by offering alternative territory or by avoiding areas the creature has claimed. Some rare individuals have trained to fight Thundertalons and have survived such encounters through use of proper grounding equipment and earth-based magic.

## Attributes

- **Strength:** 13-16 (1d4+12)

- **Endurance:** 13-16 (1d4+12)

- **Dexterity:** 11-14 (1d4+10)

- **Agility:** 15-18 (1d4+14)

- **Perception:** 15-18 (1d4+14)

- **Aura:** 13-16 (1d4+12)

- **Will:** 11-14 (1d4+10)

- **Reasoning:** 7-10 (1d4+6)

- **Creativity:** 11-14 (1d4+10)
