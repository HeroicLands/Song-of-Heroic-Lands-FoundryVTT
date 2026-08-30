---
aliases:
  - Raven
tags:
  - animal
name:
  full: Raven
  aliases: []
description: "A large, uncannily intelligent black bird thriving everywhere from deep wilderness to crowded cities, hovering between wild scavenger and civilized companion."
id: anLTCI9lpmxYgalD
img: icons/game-icons/lorc/raven.svg
portrait: images/being/raven-portrait.webp
shortcode: raven
type: being
sohl:
  kbcat: animal
  archetype: 0
  attributes:
    str: 5
    end: 7
    dex: 15
    agl: 16
    per: 14
    aur: 8
    wil: 11
    rea: 9
    cre: 10
  attrRollFormula:
    str: 1d4+2
    end: 1d4+4
    dex: 1d6+11
    agl: 1d6+12
    per: 1d6+10
    aur: 1d4+5
    wil: 1d6+7
    rea: 1d4+6
    cre: 1d4+7
  body:
    structure:
      zones:
        - name: Head
          shortcode: headzone
          probWeight: 1
        - name: Body
          shortcode: torsozone
          probWeight: 1
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
        - name: Left Wing
          shortcode: lwingpart
          bodyZoneCode: headzone
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
          bodyZoneCode: hindqtrzone
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
          probWeight: 3
        - name: Right Leg
          shortcode: rlegpart
          bodyZoneCode: hindqtrzone
          roles:
            - locomotor
            - manipulator
          canHoldItem: false
          probWeight: 3
        - name: Tail
          shortcode: tailpart
          bodyZoneCode: hindqtrzone
          roles: []
          canHoldItem: false
          probWeight: 4
      locations:
        - name: Head
          shortcode: headloc
          bodyPartCode: headpart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 5
          probWeight: 3
          protectionBase:
            blunt: -1
            edged: -2
            piercing: -3
            fire: -1
        - name: Neck
          shortcode: neckloc
          bodyPartCode: headpart
          bleedingSusceptibility: high
          amputability: low
          shockValue: 5
          probWeight: 2
          protectionBase:
            blunt: -1
            edged: -2
            piercing: -3
            fire: -1
        - name: Left Wing
          shortcode: lwingloc
          bodyPartCode: lwingpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 1
          probWeight: 10
          protectionBase:
            blunt: -1
            edged: -2
            piercing: -3
            fire: -1
        - name: Thorax
          shortcode: thoraxloc
          bodyPartCode: torsopart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 4
          probWeight: 6
          protectionBase:
            blunt: -1
            edged: -2
            piercing: -3
            fire: -1
        - name: Abdomen
          shortcode: abdloc
          bodyPartCode: torsopart
          bleedingSusceptibility: high
          amputability: none
          shockValue: 4
          probWeight: 4
          protectionBase:
            blunt: -1
            edged: -2
            piercing: -3
            fire: -1
        - name: Right Wing
          shortcode: rwingloc
          bodyPartCode: rwingpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 1
          probWeight: 10
          protectionBase:
            blunt: -1
            edged: -2
            piercing: -3
            fire: -1
        - name: Left Leg
          shortcode: llegloc
          bodyPartCode: llegpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 2
          probWeight: 10
          protectionBase:
            blunt: -1
            edged: -2
            piercing: -3
            fire: -1
        - name: Right Leg
          shortcode: rlegloc
          bodyPartCode: rlegpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 2
          probWeight: 10
          protectionBase:
            blunt: -1
            edged: -2
            piercing: -3
            fire: -1
        - name: Tail
          shortcode: tailloc
          bodyPartCode: tailpart
          bleedingSusceptibility: none
          amputability: high
          shockValue: 1
          probWeight: 10
          protectionBase:
            blunt: -1
            edged: -2
            piercing: -3
            fire: -1
    weight:
      base: 3
      calc: "3"
    reachBase: 0
    bodyScaleBase: 0.6
    personalFatigue: enc + 5
  currentMoveMedium: terrestrial
  movementProfiles:
    - medium: aerial
      feetPerRound: 80
      leaguesPerWatch: 6
      encumbrance: floor(wt/4)
      strMod: -5 * floor((str - 10) / 2)
      factors: []
      disabled: false
    - medium: terrestrial
      feetPerRound: 20
      leaguesPerWatch: 1
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
        masteryLevelBase: 65
    - shortcode: sprt
      type: mysticalability
      system:
        masteryLevelBase: 27
    - shortcode: init
      type: skill
      system:
        masteryLevelBase: 40
    - shortcode: dge
      type: skill
      system:
        masteryLevelBase: 60
    - shortcode: shok
      type: skill
      system:
        masteryLevelBase: 15
    - name: Swift Peck
      type: skill
      system:
        shortcode: beak
        subType: combattechnique
        masteryLevelBase: 54
        combatCategory: melee
        impairedByRoles:
          - manipulator
        strikeMode:
          type: melee
          shortcode: beak
          name: Swift Peck
          minParts: 1
          assocSkillCode: null
          attack:
            disabled: false
            spread: 1
            modifier: 0
          impactBase:
            numDice: 1
            die: 6
            modifier: -2
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
    - name: Rake
      type: skill
      system:
        shortcode: talon
        subType: combattechnique
        masteryLevelBase: 57
        combatCategory: melee
        impairedByRoles:
          - manipulator
        strikeMode:
          type: melee
          shortcode: talon
          name: Rake
          minParts: 1
          assocSkillCode: null
          attack:
            disabled: false
            spread: 1
            modifier: 0
          impactBase:
            numDice: 1
            die: 8
            modifier: -3
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

The bird tilts its head, watching you with an intensity that feels almost aware, almost calculating. Its feathers are an absolute black, light-devouring obsidian, yet they seem to shimmer with hints of deep purples and greens as the bird shifts. A sound emerges from its throat — not quite a caw, more a ragged croak that sounds disturbingly like a word, barely formed. The beak works methodically, clicking and clacking, and you realize the raven is examining you the way a scholar might examine an artifact, as if considering your value, your weakness, your utility. There is something in that gaze that speaks of intelligence that should not belong to a mere bird.

# Dossier {#dossier}

The raven is a large, highly intelligent bird standing 20-25 inches tall with a wingspan of 3.5-4 feet, distinguished by its entirely black plumage, thick neck, and heavy beak. These adaptable creatures are found throughout the world, thriving in almost every environment from deep wilderness to crowded urban centers, often occupying an uncomfortable middle ground between wild animal and civilized bird. Adventurers encounter ravens frequently — as companions to hermits and sorcerers, as messengers in civilized lands, as harbingers in places of death and darkness, or simply as scavengers following armies and caravans.

## Presentation

The raven's most striking feature is its absolute blackness — feathers that seem to absorb light, creating a silhouette that stands in stark relief against almost any background. The head is proportionally large, with a powerful beak that can pierce leather and crack bone, and dark eyes that hold an unnerving depth of understanding. The neck is thick and capable of turning to nearly impossible angles, allowing the raven to observe from every direction. The wings are broad and powerful, allowing swift flight and surprising maneuverability despite the bird's solid build. The feet are strong and capable of gripping, clutching, or perching indefinitely on harsh surfaces.

## Key Behaviors

Ravens are profoundly intelligent — capable of learning commands, recognizing individual humans, remembering locations of food sources months after a single visit, and even using basic tools. They are highly social birds that maintain complex family bonds and community structures, with ravens communicating through dozens of distinct vocalizations. Ravens are scavengers with an impressive range of diet, eating nearly anything that might provide sustenance, but they are also opportunistic hunters capable of taking small animals. They are fascinated by shiny objects and will steal, cache, and recall the locations of interesting items. Ravens are curious to an almost compulsive degree and will investigate anything novel in their territory. When nesting, ravens become fiercely defensive and protective of eggs and young.

## Combat Strategy

A raven will not engage larger creatures in direct combat, instead using speed and agility for quick strike-and-retreat tactics. The raven dives at a target, attempting to peck or rake with claws, and immediately pulls away to gain altitude. Against much smaller creatures (small animals, insects, children), ravens become more aggressive. A raven defending a nest or young becomes surprisingly combative, dive-bombing and striking repeatedly despite size disparity. Ravens coordinate effectively when hunting together, with multiple birds attacking from different angles.

## Attack Methods

### Swift Peck

The raven darts in with surprising speed and precision, directing its beak at exposed eyes, faces, or unarmored flesh. The peck is sharp and accurate, designed to wound or distract rather than inflict massive injury, followed immediately by the raven pulling back to a safe distance.

### Rake and Claw

If the raven perches on a target's body or shoulders, it can rake with its feet, using sharp talons and powerful leg muscles to tear exposed skin and inflict bleeding wounds. This attack is brief, as the raven will quickly withdraw.

## Special Abilities

### Keen Intelligence

The raven possesses problem-solving capability beyond typical animal instinct. It can learn commands, adapt tactics based on observation, recognize specific individuals, and solve simple puzzles involving cause and effect. Ravens can use tools in simple ways and remember information for extended periods.

### Acute Perception

The raven's vision is extraordinary, allowing it to spot movement from great distances and perceive details that would escape human notice. It can identify specific individuals from far away and navigate in dim light where humans would struggle.

### Complex Vocalizations

The raven can produce dozens of distinct sounds, some nearly resembling human words. This capability allows sophisticated communication with other ravens and — with training or magical enhancement — potential communication with humanoids.

### Adaptable Diet

The raven can survive on nearly any organic material, from carrion to living prey to plant matter, making it independent of specific food sources. This adaptability allows ravens to thrive in environments where specialized creatures would starve.

### Quick Reflexes

Despite not being the fastest creature, the raven's reactions are sharp and allow it to dodge incoming attacks with significant probability of success.

### Additional Information

Ravens form strong bonds with humans who treat them well and will remember acts of kindness or cruelty for years. A raven can be trained to carry messages, steal specific objects, or scout locations. Ravens are attracted to sources of magical power and often gather near sorcerers, fey locations, or areas of intense spiritual significance. In some cultures, ravens are considered prophetic or sacred, and harming one brings supernatural consequences.

## Attributes

- **Strength:** 3-6 (1d4+2)

- **Endurance:** 5-8 (1d4+4)

- **Dexterity:** 12-17 (1d6+11)

- **Agility:** 13-18 (1d6+12)

- **Perception:** 11-16 (1d6+10)

- **Aura:** 6-9 (1d4+5)

- **Will:** 8-13 (1d6+7)

- **Reasoning:** 7-10 (1d4+6)

- **Creativity:** 8-11 (1d4+7)
