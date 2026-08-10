---
aliases:
    - Giant Hedgehog
tags:
    - animal
name:
    full: Giant Hedgehog
    aliases: []
id: DWJU5xSE5N4KxtaN
slug: giant-hedgehog
img: icons/game-icons/caro-asercion/hedgehog.svg
portrait: ""
shortcode: gnthdghg
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 11
        end: 13
        dex: 12
        agl: 10
        per: 13
        aur: 9
        wil: 12
        rea: 7
        cre: 6
    attrRollFormula:
        str: 1d6+7
        end: 1d6+9
        dex: 1d6+8
        agl: 1d4+7
        per: 1d6+9
        aur: 1d4+6
        wil: 1d6+8
        rea: 1d4+4
        cre: 1d4+3
    body:
        structure:
            zones:
                - name: Forequarters
                  shortcode: fqtrzone
                  probWeight: 2
                - name: Torso
                  shortcode: torsozone
                  probWeight: 2
                - name: Hindquarters
                  shortcode: hindqtrzone
                  probWeight: 2
            parts:
                - name: Head
                  shortcode: headpart
                  bodyZoneCode: fqtrzone
                  roles:
                      - vital
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
                  probWeight: 3
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 4
                      fire: 6
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 2
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 4
                      fire: 6
                - name: Left Foreleg
                  shortcode: lforelegloc
                  bodyPartCode: lforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 4
                      fire: 6
                - name: Right Foreleg
                  shortcode: rforelegloc
                  bodyPartCode: rforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 4
                      fire: 6
                - name: Thorax
                  shortcode: thoraxloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 5
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 4
                      fire: 6
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 3
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 4
                      fire: 6
                - name: Pelvis
                  shortcode: plvsloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 2
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 4
                      fire: 6
                - name: Left Hind Leg
                  shortcode: lhindlegloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 4
                      fire: 6
                - name: Right Hind Leg
                  shortcode: rhindlegloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 4
                      fire: 6
                - name: Tail
                  shortcode: tailloc
                  bodyPartCode: tailpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 1
                  probWeight: 10
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 4
                      fire: 6
        weight:
            base: 30
            calc: "30"
        reachBase: 0
        bodyScaleBase: 1
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
              masteryLevelBase: 65
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
              masteryLevelBase: 40
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 44
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 30
        - name: Quill Volley
          type: skill
          system:
              shortcode: quill
              subType: combattechnique
              masteryLevelBase: 57
              combatCategory: melee
              impairedByRoles:
                  - core
              strikeMode:
                  type: melee
                  shortcode: quill
                  name: Quill Volley
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 1
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 0
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
        - name: Charging Gore
          type: skill
          system:
              shortcode: ram
              subType: combattechnique
              masteryLevelBase: 50
              combatCategory: melee
              impairedByRoles:
                  - core
              strikeMode:
                  type: melee
                  shortcode: ram
                  name: Charging Gore
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 2
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 0
                      aspect: blunt
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

Your foot nearly comes down on it before you see it: a rounded form the size of a large boar, covered in spines that stand nearly vertical from its body. The quills catch the light and gleam like steel, and when you shift your weight, the entire creature rattles—a warning sound like a thousand dice tumbling in a barrel. A long, pointed snout pokes forward and sniffs the air, and small dark eyes lock onto you. The smell is earthy and rank. The creature seems utterly unimpressed by your presence, but those quills continue to rattle, each spine gleaming with a wickedness that promises serious harm.

# Dossier {#dossier}

The Giant Hedgehog is a bulky, heavily-quilled creature standing three feet tall and extending six feet or more in length. These are solitary, nocturnal foragers that spend their time rooting through leaf litter and soil in search of grubs, insects, and roots. Despite their herbivorous preference, they are dangerous to encounter due to their covered armor of razor-sharp spines. Adventurers most commonly encounter them when traveling through woodlands at night or when camping in territory where hedgehogs forage.

## Presentation

The Giant Hedgehog is a rotund creature built like a mobile fortress—short, powerful legs support a large, barrel-shaped body covered entirely in spines. The quills are impressive: each one up to a foot in length, thick and sharp, arranged in overlapping rows across the dorsal surface and sides. The underside is slightly less spiny but still formidable. The head is relatively small, tapered to a long, flexible snout equipped with keen olfactory organs and small teeth suitable for grubbing in soil. The eyes are small, dark, and set on the sides of the head, providing good lateral vision but limited forward sight. The creature moves with ponderous deliberation, but its quills create a constant whispering rattle as they shift and resonate with each step. The coloration is typically brown or gray, often caked with soil.

## Key Behaviors

Giant Hedgehogs are solitary creatures that establish feeding territories but rarely interact with other hedgehogs except during breeding season. They are nocturnal and most active during warm, damp nights when invertebrates are abundant. A hedgehog spends much of the night rooting and snuffling through forest floor debris, consuming large quantities of grubs, insects, and plant matter. They are primarily herbivorous but will consume any protein-rich food they encounter. They are methodical and patient creatures, showing no particular fear of larger animals—their armor is their confidence. During winter or cold weather, they seek shelter in burrows and become less active.

## Combat Strategy

A Giant Hedgehog’s primary defense is to curl into a ball, presenting only quills to all potential attackers. In this posture, the hedgehog is nearly invulnerable and can remain indefinitely. If further threatened or if the threat becomes immediate, the hedgehog actively launches quills—shaking its body to dislodge spines that fly at attackers with considerable force. A hedgehog will rarely uncurl and attack directly but may charge if defending young or if cornered. The charge is surprisingly fast for a creature of its bulk, and the impact can be punishing.

## Attack Methods

### Quill Volley

The hedgehog shakes its body with muscular contractions that dislodge quills—these projectiles fly at attackers with enough force to pierce light armor and flesh alike. Multiple quills can be launched in rapid succession, and the barrage can target a single opponent or spread across an area.

### Charging Gore

Rarely, a hedgehog will charge at a threat—using its armored body as a weapon and attempting to gore with the concentrated mass of forward-facing quills. A charge is powerful but slow and telegraphed.

## Special Abilities

### Quill Armor

Any creature that strikes the hedgehog in melee combat risks its own injury—the quills penetrate flesh and draw blood, and a creature in prolonged contact with the hedgehog suffers cumulative damage. The belly and underside have fewer quills and are more vulnerable than the back.

### Defensive Curl

When curled into a ball, the hedgehog becomes nearly indestructible—attacks from most angles are harmlessly deflected by the quills. Only attacks from the underside (which is accessible only if the hedgehog is flipped or lifted) can cause real damage.

## Additional Information

A giant hedgehog’s quills have value—they can be crafted into projectile weapons or worked into armor. Harvesting quills requires care to avoid the creature’s spines. A living giant hedgehog can sometimes be tamed through food and gentle handling, though they remain wild and unpredictable. A hibernating hedgehog can be approached without threat if one is careful to avoid sudden movements.

## Attributes

- **Strength:** 8-13 (1d6+7)

- **Endurance:** 10-15 (1d6+9)

- **Dexterity:** 9-14 (1d6+8)

- **Agility:** 8-11 (1d4+7)

- **Perception:** 10-15 (1d6+9)

- **Aura:** 7-10 (1d4+6)

- **Will:** 9-14 (1d6+8)

- **Reasoning:** 5-8 (1d4+4)

- **Creativity:** 4-7 (1d4+3)
