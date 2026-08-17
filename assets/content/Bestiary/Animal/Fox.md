---
aliases:
  - Fox
  - creature-fox
tags:
  - animal
name:
  full: Fox
  aliases: []
description: "A small, cunning solitary carnivore of forests and settlement margins, notorious for raiding coops and outwitting traps and hounds."
id: Z7axZ4NaELTtdReY
img: icons/game-icons/caro-asercion/fox.svg
portrait: images/being/fox-portrait.webp
shortcode: fox
type: creature
package: sohl
sohl:
  kbcat: animal
  archetype: 0
  attributes:
    str: 3
    end: 10
    agl: 15
    per: 16
    snt: 4
    aur: 4
    wil: 14
    rea: 7
    cre: 8
  attrRollFormula:
    str: 1d4+1
    end: 1d6+7
    agl: 1d6+12
    per: 1d6+13
    snt: 1d4+2
    aur: 1d4+2
    wil: 1d6+11
    rea: 1d4+5
    cre: 1d4+6
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
            - manipulator
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
            blunt: -3
            edged: -4
            piercing: -5
            fire: -3
        - name: Neck
          shortcode: neckloc
          bodyPartCode: headpart
          bleedingSusceptibility: high
          amputability: low
          shockValue: 5
          probWeight: 2
          protectionBase:
            blunt: -3
            edged: -4
            piercing: -5
            fire: -3
        - name: Left Foreleg
          shortcode: lforelegloc
          bodyPartCode: lforelegpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 2
          probWeight: 10
          protectionBase:
            blunt: -3
            edged: -4
            piercing: -5
            fire: -3
        - name: Right Foreleg
          shortcode: rforelegloc
          bodyPartCode: rforelegpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 2
          probWeight: 10
          protectionBase:
            blunt: -3
            edged: -4
            piercing: -5
            fire: -3
        - name: Thorax
          shortcode: thoraxloc
          bodyPartCode: torsopart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 4
          probWeight: 5
          protectionBase:
            blunt: -3
            edged: -4
            piercing: -5
            fire: -3
        - name: Abdomen
          shortcode: abdloc
          bodyPartCode: torsopart
          bleedingSusceptibility: high
          amputability: none
          shockValue: 4
          probWeight: 3
          protectionBase:
            blunt: -3
            edged: -4
            piercing: -5
            fire: -3
        - name: Pelvis
          shortcode: plvsloc
          bodyPartCode: torsopart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 4
          probWeight: 2
          protectionBase:
            blunt: -3
            edged: -4
            piercing: -5
            fire: -3
        - name: Left Hind Leg
          shortcode: lhindlegloc
          bodyPartCode: lhindlegpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 2
          probWeight: 10
          protectionBase:
            blunt: -3
            edged: -4
            piercing: -5
            fire: -3
        - name: Right Hind Leg
          shortcode: rhindlegloc
          bodyPartCode: rhindlegpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 2
          probWeight: 10
          protectionBase:
            blunt: -3
            edged: -4
            piercing: -5
            fire: -3
        - name: Tail
          shortcode: tailloc
          bodyPartCode: tailpart
          bleedingSusceptibility: none
          amputability: high
          shockValue: 1
          probWeight: 10
          protectionBase:
            blunt: -3
            edged: -4
            piercing: -5
            fire: -3
    weight:
      base: 15
      calc: "15"
    reachBase: 0
    bodyScaleBase: 0.43
    personalFatigue: enc + 5
  currentMoveMedium: terrestrial
  movementProfiles:
    - medium: terrestrial
      feetPerRound: 100
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
        masteryLevelBase: 75
    - shortcode: stlth
      type: skill
      system:
        masteryLevelBase: 60
    - shortcode: sprt
      type: mysticalability
      system:
        masteryLevelBase: 27
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
        masteryLevelBase: 24
    - name: Bite
      type: skill
      system:
        shortcode: bite
        subType: combattechnique
        masteryLevelBase: 75
        combatCategory: melee
        impairedByRoles:
          - manipulator
        strikeMode:
          type: melee
          shortcode: bite
          name: Bite
          minParts: 1
          assocSkillCode: null
          attack:
            disabled: false
            spread: 1
            modifier: 0
          impactBase:
            numDice: 1
            die: 6
            modifier: -6
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
    - name: Claw
      type: skill
      system:
        shortcode: claw
        subType: combattechnique
        masteryLevelBase: 60
        combatCategory: melee
        impairedByRoles:
          - manipulator
        strikeMode:
          type: melee
          shortcode: claw
          name: Claw
          minParts: 1
          assocSkillCode: null
          attack:
            disabled: false
            spread: 1
            modifier: 0
          impactBase:
            numDice: 1
            die: 8
            modifier: -7
            aspect: edged
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

Movement catches your eye—a flicker of rust-colored fur and a dark flash of motion at the edge of the underbrush. Then it pauses, and you see it clearly: a slim, elegant animal no higher than your knee, ears pricked forward and absolutely still. Its bushy tail, tipped with white, curls around its haunches, and its eyes—sharp and amber-bright—meet yours for just a fraction of a second. In that look is pure calculation, a weighing and measuring of risk versus reward. Then, as if reaching an internal conclusion, the fox turns and melts back into the brush with barely a whisper of movement, leaving only the faint musk of its passage.

# Dossier {#dossier}

The fox is a small, intelligent carnivore that thrives in diverse environments from temperate forests to grassland margins and even the edges of human settlement. These creatures are solitary hunters with a reputation for remarkable cunning—they are known to raid chicken coops, outsmart traps, and appear to mock pursuing dogs through sheer agility and wit. Adventurers most often encounter foxes as nuisances around settlements, as omens of mischief in folklore, or as rare companions for those with the patience and ingenuity to befriend them.

## Presentation

A fox stands roughly 12 to 15 inches at the shoulder and rarely weighs more than 12 or 13 pounds, making it far smaller than most predators of the region. Its coat is typically a rich russet or rust-orange with white underside, and the ears are large and pointed, positioned high on the skull for excellent directional hearing. The tail is long, bushy, and often tipped with white or black. The face is narrow and tapered, with a sharp muzzle and amber or golden eyes that suggest considerable intelligence. The build is lean and muscular, adapted for the quick bursts of speed and agility that characterize the fox's hunting style. The overall impression is one of elegance and cunning.

## Key Behaviors

Foxes are primarily nocturnal or crepuscular, most active in the hours around dawn and dusk when prey is abundant and visibility is poor enough to favor the predator's keener senses. They are solitary except during mating season, when pairs form temporary bonds. A fox establishes a home range and hunts primarily small mammals (rodents, rabbits, hares) and birds, though they are opportunistic scavengers and will take insects, fruit, and discarded food. They are noted for their intelligence—they remember trap locations, avoid obvious dangers, and seem to deliberately test the boundaries of their environments. A fox watching a dog or human will often appear to be mocking them, leading pursuers on wild chases before slipping away without apparent effort.

## Combat Strategy

A fox's only honest combat strategy is immediate flight. Foxes are built for speed and agility, not for sustained combat, and they will abandon engagement with any creature that poses serious threat. If truly cornered or defending a den with young, a fox will fight desperately with bites and scratches, but such desperation is rare. A hunted fox may deliberately lead pursuers through terrain that disadvantages larger bodies—between rocks, through dense brush, across streams—wearing out the pursuer through exhaustion rather than direct engagement.

## Attack Methods

### Quick Bite

A snapping attack using the fox's sharp teeth to bite at limbs, throat, or anything accessible. The fox relies on speed and multiple strikes rather than a single powerful bite.

### Scratching Rake

Using the sharp claws on its paws, the fox rakes at a target's face, legs, or exposed flesh. This is primarily a defensive measure when escape is impossible.

## Special Abilities

### Cunning Escape

The fox possesses a remarkable ability to understand and exploit terrain in its favor. It knows escape routes, hiding places, and can navigate broken ground at full speed while larger creatures stumble. A fox pursued by humanoids or dogs will often lead pursuers in loops and spirals before disappearing entirely.

### Keen Senses

Sharp ears that swivel independently to pinpoint sound sources, excellent low-light vision, and a keen sense of smell give the fox advantages in hunting and in noticing approaching threats before other creatures. A fox can detect movement from a considerable distance and can often tell the nature of an intruder (human, animal, known or unknown) by scent alone.

## Additional Information

Foxes in human-occupied territory often become semi-tame, stealing food but avoiding direct contact with humans. Some characters have successfully befriended foxes through offering consistent food and gentle treatment, eventually training a fox as a companion. A fox's pelt is valuable for clothing and trade. Foxes are featured prominently in folklore and old stories as tricksters and wise advisors—some cultures consider them sacred or taboo to hunt.

## Attributes

- **Strength:** 2-5 (1d4+1)

- **Endurance:** 8-13 (1d6+7)

- **Agility:** 13-18 (1d6+12)

- **Perception:** 14-19 (1d6+13)

- **Scent:** 3-6 (1d4+2)

- **Aura:** 3-6 (1d4+2)

- **Will:** 12-17 (1d6+11)

- **Reasoning:** 6-9 (1d4+5)

- **Creativity:** 7-10 (1d4+6)
