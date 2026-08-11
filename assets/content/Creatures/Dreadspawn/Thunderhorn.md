---
aliases:
    - Thunderhorn
tags:
    - dreadspawn
name:
    full: Thunderhorn
    aliases: []
id: AimHPopglSXjxhWa
img: icons/game-icons/delapouite/griffin-symbol.svg
portrait: ""
shortcode: thndrhrn
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 17
        end: 17
        dex: 8
        agl: 9
        per: 9
        aur: 11
        wil: 13
        rea: 8
        cre: 8
    attrRollFormula:
        str: 1d4+14
        end: 1d4+14
        dex: 1d4+5
        agl: 1d4+6
        per: 1d4+6
        aur: 1d4+8
        wil: 1d4+10
        rea: 1d4+5
        cre: 1d4+5
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 4
                - name: Forelegs
                  shortcode: forelegszone
                  probWeight: 2
                - name: Torso
                  shortcode: torsozone
                  probWeight: 8
                - name: Hindquarters
                  shortcode: hindqtrzone
                  probWeight: 6
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
                  probWeight: 4
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
                  probWeight: 6
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Left Foreleg
                  shortcode: lforelegloc
                  bodyPartCode: lforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Right Foreleg
                  shortcode: rforelegloc
                  bodyPartCode: rforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Flank
                  shortcode: flkloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 6
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 4
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Left Quarter
                  shortcode: lqtrloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 3
                  probWeight: 5
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Left Hind Leg
                  shortcode: lhindlegloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 4
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Right Quarter
                  shortcode: rqtrloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 3
                  probWeight: 5
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Right Hind Leg
                  shortcode: rhindlegloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 4
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Tail
                  shortcode: tailloc
                  bodyPartCode: tailpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 1
                  probWeight: 10
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
        weight:
            base: 2000
            calc: 2000
        reachBase: 0
        bodyScaleBase: 1.33
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 70
          leaguesPerWatch: 5
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
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
              masteryLevelBase: 55
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 36
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 44
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 36
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 43
        - name: Electrified Charge
          type: skill
          system:
              shortcode: ram
              subType: combattechnique
              masteryLevelBase: 48
              combatCategory: melee
              impairedByRoles:
                  - core
              strikeMode:
                  type: melee
                  shortcode: ram
                  name: Electrified Charge
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 8
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 3
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
        - name: Thunderous Stomp
          type: skill
          system:
              shortcode: kick
              subType: combattechnique
              masteryLevelBase: 48
              combatCategory: melee
              impairedByRoles:
                  - locomotor
              strikeMode:
                  type: melee
                  shortcode: kick
                  name: Thunderous Stomp
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 8
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
        - name: Electrical Discharge
          type: skill
          system:
              shortcode: bolt
              subType: combattechnique
              masteryLevelBase: 58
              combatCategory: missile
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: missile
                  shortcode: bolt
                  name: Electrical Discharge
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 0
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 6
                      aspect: fire
                  projectileType: none
                  maxVolleyMult: 1
                  baseRangeBase: 180
                  drawBase: 0
                  traits: {}
---

# Appearance {#appearance}

The air crackles with static before you see it—the hair on your arms stands on end and the smell of ozone floods your senses. Then it appears, rising like a storm made flesh: a creature vaguely rhinoceros-like but far larger, its hide the color of weathered storm clouds, dark gray and deep blue shot through with veins of sickly phosphorescence. Spiraling horns rise from its head, each one thick as a man's arm and wreathed in constant, writhing bolts of blue-white electricity that fork and branch into the air with terrible beauty. Its eyes are those of an ancient, intelligent creature, and they burn with the pale fire of lightning trapped in flesh. Each movement it makes seems to disrupt the air itself, creating pressure waves and small arcs of electrical discharge. The sound it makes is like distant thunder, and the ground trembles beneath its hooves.

# Dossier {#dossier}

Thunderhorns are creatures of electrical power and territorial fury, massive beasts that seem to have been infused with the lightning of storms. They roam tempestuous highlands and storm-swept plateaus where regular lightning strikes are common, seemingly feeding on the electrical energy of thunderstorms. A Thunderhorn's presence is often announced by changes in weather—sudden electric static in the air, the smell of ozone, and the sight of lightning arcing between ground and sky. These creatures are generally solitary and temperamental, becoming ferociously aggressive when threatened or when their territory is invaded. Some ancient Thunderhorns are said to be powerful enough to call down lightning strikes at will, though whether this is truth or legend remains unclear.

## Presentation

A Thunderhorn measures roughly 15 to 22 feet in length with a height of 10 to 14 feet, with a massively muscled body resembling a rhinoceros or buffalo crossed with something more primal and terrible. Its hide is thick and tough, the color of storm clouds—dark gray, deep blue, and purple-black—with veins of sickly luminescence running through it that glow faintly in darkness. Its defining features are its horns: two massive, spiraling appendages of tremendous length and sharpness, wreathed in constant, living arcs of electricity. These horns are so saturated with electrical charge that they seem to vibrate at the edge of physical reality, and they discharge bolts of lightning continuously into the surrounding air. Its eyes are pale, almost white, and they burn with contained electricity. Its hooves are heavy and black as charred coal, and where it walks, the ground is sometimes fused and cracked from the heat of its electrical discharge.

## Key Behaviors

A Thunderhorn claims a territory of considerable size—usually several miles of highland or exposed plateau—and it patrols its domain regularly. The creature seems attracted to storms and high places where lightning is common, as though feeding on the electrical energy present. It is generally solitary and does not seem to breed frequently, though during breeding season multiple Thunderhorns may appear in a region, creating hazardous conditions as they compete for mates and territory. The creature is intelligent enough to understand concepts like intrusion and threat, and it has been observed to deliberately move toward weather patterns it seems to desire.

## Combat Strategy

A Thunderhorn initiates combat by charging with its full mass and speed, attempting to gore opponents on its electrified horns or to ram them with shoulder and body. The creature's electrical discharge is as much a weapon as its physical form, dealing damage even to targets that avoid direct contact. It is slow and ponderous but possesses such strength that its attacks are nearly impossible to defend against through ordinary means. The creature seems immune to its own electrical discharges and resistant to external electrical attacks, relying on these advantages to dominate opponents. A wounded Thunderhorn becomes more aggressive, charging with less tactical awareness and more reckless power. Only truly overwhelming force will convince one to retreat, and even then it will attempt to take its attacker with it.

## Attack Methods

### Electrified Charge

The Thunderhorn lowers its horns and charges with terrible speed and force, attempting to gore the target. The horns discharge massive amounts of electrical energy simultaneously, and the impact combines both crushing physical force and electrical trauma.

### Thunderous Stomp

The creature raises one of its massive hooves and brings it down with devastating force, creating a shockwave that radiates outward. The impact is accompanied by a burst of electrical discharge that radiates outward in a cone.

### Electrical Discharge

Without charging, the Thunderhorn can channel electricity through its body and horns, creating a sphere or cone of electrical energy that damages everything in the area.

## Special Abilities

### Electrical Embodiment

The Thunderhorn is composed partially of electrical energy and is highly resistant to electrical damage. Lightning strikes provide it sustenance, and thunderstorms energize it, making it faster and stronger during inclement weather.

### Lightning Authority

The Thunderhorn can call lightning from storm clouds, though this ability seems limited and requires several rounds of concentration. The creature is most likely to use this ability in open terrain during active storms.

### Primal Fury

When injured or cornered, the Thunderhorn's electrical discharge increases dramatically, and it enters a state of heightened aggression where it attacks with reckless abandon, electrical damage increasing but tactical sense decreasing.

## Additional Information

Earth-based magic and grounding effects are the Thunderhorn's primary weakness, as they can dissipate or redirect its electrical discharges and prevent it from building up charge. The creature is also vulnerable to water, which conducts electricity away and can short-circuit its natural abilities if sufficient quantities are applied. The creature's horns, if somehow harvested from a slain Thunderhorn, retain electrical charge for years or even longer, making them extraordinarily valuable for crafting weapons or foci of electrical magic. The hide can be fashioned into armor that retains some electrical resistance. Hunting a Thunderhorn is considered an exceptionally dangerous undertaking, and most communities in Thunderhorn territory learn to simply avoid the creatures' ranges rather than attempting to oppose them.

## Attributes

- **Strength:** 15-18 (1d4+14)

- **Endurance:** 15-18 (1d4+14)

- **Dexterity:** 6-9 (1d4+5)

- **Agility:** 7-10 (1d4+6)

- **Perception:** 7-10 (1d4+6)

- **Aura:** 9-12 (1d4+8)

- **Will:** 11-14 (1d4+10)

- **Reasoning:** 6-9 (1d4+5)

- **Creativity:** 6-9 (1d4+5)
