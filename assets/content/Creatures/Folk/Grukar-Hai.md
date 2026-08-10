---
aliases:
    - Grukar-Hai
tags:
    - folk
name:
    full: Grukar-Hai
    aliases: []
id: NVtoBlsW4OFbRG4i
slug: grukar-hai
img: icons/game-icons/delapouite/orc-head.svg
portrait: ""
shortcode: grkrh
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 16
        end: 18
        dex: 9
        agl: 8
        per: 11
        aur: 11
        wil: 17
        rea: 7
        cre: 6
    attrRollFormula:
        str: 1d6+13
        end: 1d6+14
        dex: 1d4+6
        agl: 1d4+5
        per: 1d4+8
        aur: 1d4+8
        wil: 1d4+14
        rea: 1d4+4
        cre: 1d4+3
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 1
                - name: Arms
                  shortcode: armszone
                  probWeight: 4
                - name: Torso
                  shortcode: torsozone
                  probWeight: 4
                - name: Legs
                  shortcode: legszone
                  probWeight: 6
            parts:
                - name: Head
                  shortcode: headpart
                  bodyZoneCode: headzone
                  roles:
                      - vital
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
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Left Eye
                  shortcode: leyeloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 15
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Right Eye
                  shortcode: reyeloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 15
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Nose
                  shortcode: noseloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 30
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Left Cheek
                  shortcode: lcheekloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 60
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Right Cheek
                  shortcode: rcheekloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 60
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Left Ear
                  shortcode: learloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 15
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Right Ear
                  shortcode: rearloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 15
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Mouth
                  shortcode: mouthloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 30
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Jaw
                  shortcode: jawloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 60
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
                  probWeight: 200
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Right Shoulder
                  shortcode: rshldloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 3
                  probWeight: 30
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Right Upper Arm
                  shortcode: rupaloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 30
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Right Elbow
                  shortcode: relbloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Right Forearm
                  shortcode: rfraloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 20
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Right Hand
                  shortcode: rhandloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Left Shoulder
                  shortcode: lshldloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 3
                  probWeight: 30
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Left Upper Arm
                  shortcode: lupaloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 30
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Left Elbow
                  shortcode: lelbloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Left Forearm
                  shortcode: lfraloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 20
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Left Hand
                  shortcode: lhandloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Thorax
                  shortcode: thrxloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 40
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Abdomen
                  shortcode: abdmnloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 40
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Pelvis
                  shortcode: plvisloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 20
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Right Thigh
                  shortcode: rthghloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: medium
                  amputability: low
                  shockValue: 3
                  probWeight: 40
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Right Knee
                  shortcode: rkneeloc
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
                - name: Right Calf
                  shortcode: rcalfloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 30
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Right Foot
                  shortcode: rfootloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: none
                  amputability: medium
                  shockValue: 2
                  probWeight: 20
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Left Thigh
                  shortcode: lthghloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: medium
                  amputability: low
                  shockValue: 3
                  probWeight: 40
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Left Knee
                  shortcode: lkneeloc
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
                - name: Left Calf
                  shortcode: lcalfloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 30
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Left Foot
                  shortcode: lfootloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: none
                  amputability: medium
                  shockValue: 2
                  probWeight: 20
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
        weight:
            base: 172
            calc: (9 * str) + 50
        reachBase: 0
        bodyScaleBase: 1.28
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 50
          leaguesPerWatch: 5
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
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
              masteryLevelBase: 60
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 42
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 48
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 36
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 43
        - shortcode: bflkbite
          type: skill
        - shortcode: bflkgrab
          type: skill
        - shortcode: bflkheadbutt
          type: skill
        - shortcode: bflkkick
          type: skill
        - shortcode: bflklmbblk
          type: skill
        - shortcode: bflkpress
          type: skill
        - shortcode: bflkpunch
          type: skill
        - shortcode: bflktrip
          type: skill
---

# Appearance {#appearance}

The thing that fills the doorway is not merely large — it is a statement of violence made flesh. A Grukar-Hai stands six feet tall or more, a towering slab of gray-green muscle and scarred hide, broader across the shoulders than any two men standing abreast. Its jaw juts forward beneath a pair of cracked, yellowed tusks, and its small, deep-set eyes burn with a hatred so pure it seems almost sacred. Every inch of its body tells a story of combat: old wounds healed into ridges of pale scar tissue, chunks bitten from its ears, knuckles swollen and misshapen from a lifetime of breaking things. The massive weapon it carries — a brutal cleaver of black iron, or a war-club studded with jagged bone — looks as though it was made for something even larger, yet the creature wields it with a terrible, easy strength. When a Grukar-Hai looks at you, it is not sizing you up. It has already decided you are beneath it. It is merely deciding how slowly you will die.

# Dossier {#dossier}

The Grukar-Hai are the apex predators of Grukar-kind — the largest, the strongest, and by far the most dangerous of the three subspecies. Standing between five and a half and six and a half feet tall, they tower over their lesser kin and would be an overwhelming military force if not for one critical flaw: they cannot abide one another. The Grukar-Hai are driven by an all-consuming need for dominance that extends to every creature they encounter, including — especially — other Grukar-Hai. When two meet, the result is almost invariably a fight to the death. This ceaseless fratricide ensures that only the most fearsome specimens survive, but it also keeps their numbers brutally thin, comprising perhaps five percent of any Grukar population. A single Grukar-Hai is a terrifying opponent, capable of cutting through multiple trained soldiers. Two Grukar-Hai in the same warband is a volatile situation. Three is a disaster waiting to happen. They are not stupid — they possess a brutal, animal cunning — but they lack the patience or temperament for strategy, planning, or cooperation. They rule through fear and violence alone, and they are obeyed because the alternative is death.

## Presentation

Grukar-Hai stand between 5.5 and 6.5 feet tall and are built with a density that seems to defy their already imposing stature. Their bodies are slabs of corded muscle layered over heavy, thick bones, giving them a weight and solidity that makes the ground creak beneath their tread. Their skin ranges from dark gray-green to a mottled brown-black, and is invariably a patchwork of ritual scars, bite marks, and poorly healed battle wounds — each one a trophy of dominance. Their faces are heavy-browed and brutal, dominated by a pronounced underbite from which cracked tusks protrude. Their eyes are small, deep-set, and possessed of a smouldering, feral intelligence. They wear armor forged from scavenged metal and bone, often hung with grisly trophies — severed fingers, teeth, scraps of enemy banners. They carry oversized weapons: greatswords, cleavers, massive axes, and war-clubs that no human could lift, let alone swing.

## Key Behaviors

A Grukar-Hai recognizes only one law: the strong rule, and the weak serve or die. There is no hierarchy among them beyond the immediate, visceral question of who can kill whom. When a Grukar-Hai encounters another of its subspecies, dominance must be established — through posturing if possible, through lethal combat if not. This makes them natural warlords over the lesser Grukar subspecies, but terrible peers to one another. A tribe rarely supports more than one or two Grukar-Hai at a time, and even then the arrangement is a powder keg. They do not negotiate, they do not compromise, and they do not forgive. The only Grukar they tolerate are Grukar-Sha clever enough to make themselves indispensable, and Grukar-Uk craven enough to grovel. A Grukar-Hai encountered alone is paradoxically the most dangerous and the most approachable — without rivals to provoke its territorial fury, it may deign to speak before it kills, particularly if it senses strength worth testing.

## Combat Strategy

A Grukar-Hai fights with devastating directness and relentless pressure. They push opponents, wear them down through sustained assault, and seek to break their will and body simultaneously. They use their strength to control the battlefield—sweeping weapons clear paths, bodies become obstacles, wounds accumulate. They are disciplined enough to follow strategic commands and to coordinate with other Grukar, but they fundamentally prefer direct, sustained combat over tactics of evasion or cunning. They wear heavy armor and focus on dealing tremendous damage rather than avoiding it. Multiple Grukar-Hai fighting together coordinate shield walls and overlapping coverage, making them incredibly difficult to break through.

## Attack Methods

### Greatsword or Axe Strike

A devastating swing of a massive weapon powered by supernatural strength. A single strike can cleave through armor and bone, killing a human with one blow or catastrophically wounding them. Multiple strikes are pressed in rapid succession until the target falls.

### Hammer Strike

Some Grukar-Hai favor war hammers or mauls. These weapons cause impact damage that bypasses some armor protections, crushing bones and rupturing organs beneath protective plates.

### Shield Bash

A massive shield wielded with enough force to knock opponents off their feet or through obstacles. The shield is used both defensively and as a weapon.

### Sustained Assault

The Grukar-Hai presses relentless attacks, seeking not to toy with an opponent but to overwhelm them through continuous pressure, wearing down their stamina and forcing mistakes.

## Special Abilities

### Supernatural Strength

The Grukar-Hai possesses strength beyond what their physical size suggests. They can wield weapons that would require two humans, and their grip is difficult to escape.

### Martial Discipline

A Grukar-Hai is trained extensively in combat and follows orders with military precision. They understand tactics, formation fighting, and coordinated assault.

### Battle Endurance

A Grukar-Hai can sustain combat far longer than a human of equivalent size. They seem to grow less tired rather than more so as a battle continues, as though combat itself energizes them.

### Will to Fight

The Grukar-Hai possesses supernatural willpower that allows them to continue fighting through wounds that would drop other species. Only death or complete incapacitation stops a determined Grukar-Hai.

## Additional Information

The greatest weakness of the Grukar-Hai is each other. A warband led by a single Grukar-Hai is a devastating force; a warband containing two is a civil war in waiting. Wise commanders who face a Grukar horde know that the surest path to victory is patience — given time, the Grukar-Hai will turn on one another, and the lesser Grukar will scatter without their terrifying overlords. A lone Grukar-Hai is still immensely dangerous but may be the most approachable, as it lacks rivals to provoke its competitive fury. They can sometimes be engaged through demonstrations of raw strength or fearlessness — a warrior who stands their ground and refuses to show terror earns a grudging moment of consideration before the violence begins. They cannot be bribed, reasoned with through logic, or appealed to through mercy. They understand only strength, and they respect only those who can survive their attention. Multiple Grukar-Hai fighting together is vanishingly rare and represents a crisis-level threat, typically only occurring when an external enemy is so overwhelming that even their fratricidal instincts are temporarily overridden.

## Attributes

- **Strength:** 14-19 (1d6+13)

- **Endurance:** 15-20 (1d6+14)

- **Dexterity:** 7-10 (1d4+6)

- **Agility:** 6-9 (1d4+5)

- **Perception:** 9-12 (1d4+8)

- **Aura:** 9-12 (1d4+8)

- **Will:** 15-18 (1d4+14)

- **Reasoning:** 5-8 (1d4+4)

- **Creativity:** 4-7 (1d4+3)
