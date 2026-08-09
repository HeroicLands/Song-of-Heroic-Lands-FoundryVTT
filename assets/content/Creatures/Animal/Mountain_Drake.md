---
aliases:
    - Mountain Drake
tags:
    - animal
name:
    full: Mountain Drake
    aliases: []
id: LtrwdR2jwzBxLm9J
slug: mountain-drake
img: icons/game-icons/faithtoken/dragon-head.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 14
        end: 13
        dex: 14
        agl: 15
        per: 14
        aur: 10
        wil: 13
        rea: 9
        cre: 7
    attrRollFormula:
        str: 1d6+10
        end: 1d6+9
        dex: 1d6+10
        agl: 1d6+11
        per: 1d6+10
        aur: 1d4+7
        wil: 1d6+9
        rea: 1d4+6
        cre: 1d4+4
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 4
                - name: Wings
                  shortcode: wingszone
                  probWeight: 4
                - name: Forelegs
                  shortcode: forelegszone
                  probWeight: 2
                - name: Torso
                  shortcode: torsozone
                  probWeight: 6
                - name: Hindquarters
                  shortcode: hindqtrzone
                  probWeight: 4
            parts:
                - name: Head
                  shortcode: headpart
                  bodyZoneCode: headzone
                  roles:
                      - vital
                  canHoldItem: false
                  probWeight: 10
                - name: Left Wing
                  shortcode: lwingpart
                  bodyZoneCode: wingszone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 5
                - name: Right Wing
                  shortcode: rwingpart
                  bodyZoneCode: wingszone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 5
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
                  probWeight: 8
                - name: Right Hind Leg
                  shortcode: rhindlegpart
                  bodyZoneCode: hindqtrzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 8
                - name: Tail
                  shortcode: tailpart
                  bodyZoneCode: hindqtrzone
                  roles:
                      - manipulator
                  canHoldItem: false
                  probWeight: 4
            locations:
                - name: Head
                  shortcode: headloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 6
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
                  probWeight: 4
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Left Wing
                  shortcode: lwingloc
                  bodyPartCode: lwingpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 10
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Right Wing
                  shortcode: rwingloc
                  bodyPartCode: rwingpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 10
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
                - name: Thorax
                  shortcode: thoraxloc
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
                - name: Left Hind Leg
                  shortcode: lhindlegloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
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
                  probWeight: 10
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
            base: 1000
            calc: "1000"
        reachBase: 0
        bodyScaleBase: 1.27
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 60
          leaguesPerWatch: 5
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
        - medium: aerial
          feetPerRound: 120
          leaguesPerWatch: 12
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
    defaultCombatGroup: null
    items:
        - name: Raking Claws
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
                  name: Raking Claws
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 8
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 8
                      modifier: 1
                      aspect: edged
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
        - name: Tail Strike
          type: skill
          system:
              shortcode: tail
              subType: combattechnique
              masteryLevelBase: 60
              combatCategory: melee
              impairedByRoles:
                  - locomotor
              strikeMode:
                  type: melee
                  shortcode: tail
                  name: Tail Strike
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 8
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: -1
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

The drake is barely visible until it moves—a granite-gray shape pressed against stone, utterly motionless. Then a claw flexes against rock, and suddenly its form resolves: a sinuous reptilian body built low and powerful, spines running down its spine like a ridgeline in miniature. Curved horns catch the light, and its amber eyes are neither animal nor lifeless, but something in between. When it shifts position on its perch, the movement is economical and precise, and the view of the tiny vestigial wings folded against its sides suggests a creature that perhaps remembers larger ancestors—or dreams of becoming one.

# Dossier {#dossier}

The Mountain Drake is a mid-sized reptilian predator measuring 7-8 feet in length and weighing 60-100 pounds. Its body is lean and muscular, built for climbing and navigating rocky terrain. The scales are colored in shades of gray-brown and granite-gray, providing excellent camouflage against mountain stone. A series of spines runs down the back from neck to tail. The head is broader than the body, crowned with a pair of small, curved horns, and the eyes are bright amber with vertical pupils. Small, vestigial wings protrude from the sides, capable of controlled gliding but not true flight.

## Presentation

Mountain Drakes display rough, scaly hide in cryptic stone tones—granite gray, pale brown, darker charcoal, with lighter patches providing disruptive coloration against rocky backgrounds. The limbs are heavily muscled and end in sharp claws designed for climbing and gripping stone. The tail is nearly as long as the body, muscular and used for balance and combat. The head features a strong jaw line and forward-facing eyes that give excellent binocular vision. The spines along the back are sharp and can inflict damage if pressed against. Small, useless-looking wings fold tight against the sides of the body, barely visible until the drake shifts position. A distinctive sulfur-like smell surrounds them.

## Key Behaviors

Mountain Drakes are territorial predators establishing and defending large ranges across high-altitude environments. They prefer caves, high crevices, and cliff-side lairs where they can rest and store prey. They are primarily diurnal hunters, taking advantage of good visibility to hunt small mammals, birds, and young mountain goats or sheep. While they cannot achieve true flight, they are excellent climbers and can glide considerable distances from high vantage points, allowing them to approach prey from unexpected angles. They are somewhat solitary but may gather in areas of high prey abundance or during mating season.

## Combat Strategy

Mountain Drakes strike swiftly using speed and agility to advantage, attacking from above whenever possible. They use their claws and teeth for direct combat, but if faced with overwhelming opposition, they use terrain knowledge to retreat to their lair. Within their chosen territory, they have the advantage of knowing every crevice and cliff edge. They employ environmental tactics, dislodging rocks and triggering small avalanches or rockfalls to damage opponents or force them into disadvantageous positions. If an opponent proves too strong, the drake will use its gliding ability to escape to higher ground where pursuers cannot easily follow.

## Attack Methods

### Raking Claws

The drake strikes with its sharp claws, either in a frontal assault or by pouncing from above; these attacks can tear through flesh and light armor, and the drake often aims for the face, neck, or shoulders to cause maximum damage.

### Tail Strike

The drake lashes its muscular tail to knock opponents back, knock weapons from their hands, or inflict slashing damage; the tail can also be used as a grappling weapon to entangle or throw smaller opponents.

## Special Abilities

### Gliding Master

The Mountain Drake can leap from high ledges and glide considerable distances, allowing it to travel quickly across mountainous terrain or dive onto prey from unexpected angles; this grants bonuses to surprise attacks and allows the drake to reach terrain that non-flying creatures cannot.

### Environmental Exploitation

Within its chosen territory, the drake can trigger small avalanches, dislodge boulders, or cause rockfalls to damage opponents or obstruct movement; these environmental attacks can inflict significant area damage and may cause opponents to be buried or trapped.

### Mountain Camouflage

The drake's coloration provides excellent concealment in rocky terrain, and it gains bonuses to stealth checks in mountainous environments.

## Attributes

- **Strength:** 11-16 (1d6+10)

- **Endurance:** 10-15 (1d6+9)

- **Dexterity:** 11-16 (1d6+10)

- **Agility:** 12-17 (1d6+11)

- **Perception:** 11-16 (1d6+10)

- **Aura:** 8-11 (1d4+7)

- **Will:** 10-15 (1d6+9)

- **Reasoning:** 7-10 (1d4+6)

- **Creativity:** 5-8 (1d4+4)
