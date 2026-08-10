---
aliases:
    - Gloomhound
tags:
    - spirit
name:
    full: Gloomhound
    aliases: []
id: ldVaPfqXY1Mh4tK4
slug: gloomhound
img: icons/game-icons/lorc/hound.svg
portrait: ""
shortcode: glmhnd
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 12
        end: 14
        dex: 16
        agl: 18
        per: 16
        aur: 14
        wil: 12
        rea: 10
        cre: 12
    attrRollFormula:
        str: 1d4+9
        end: 1d6+10
        dex: 1d4+13
        agl: 1d6+14
        per: 1d4+13
        aur: 1d6+10
        wil: 1d4+9
        rea: 1d6+6
        cre: 1d4+9
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 1
                - name: Forelegs
                  shortcode: forelegszone
                  probWeight: 1
                - name: Torso
                  shortcode: torsozone
                  probWeight: 3
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
                  probWeight: 4
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Left Foreleg
                  shortcode: lforelegloc
                  bodyPartCode: lforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Right Foreleg
                  shortcode: rforelegloc
                  bodyPartCode: rforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
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
                  probWeight: 5
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
                  probWeight: 3
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Pelvis
                  shortcode: plvsloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 2
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Left Hind Leg
                  shortcode: lhindlegloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Right Hind Leg
                  shortcode: rhindlegloc
                  bodyPartCode: rhindlegpart
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
        bodyScaleBase: 1.06
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 70
          leaguesPerWatch: 5
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors:
              - scope: surface_cover
                key: wetlands
                mode: override
                textValue: "0"
              - scope: surface_cover
                key: dunes
                mode: override
                textValue: "0"
              - scope: surface_cover
                key: mixed_forest
                mode: override
                textValue: "0"
              - scope: surface_cover
                key: barren
                mode: override
                textValue: "0"
              - scope: surface_cover
                key: ruins
                mode: override
                textValue: "0"
              - scope: hydrology
                key: shallow
                mode: override
                textValue: "0"
              - scope: hydrology
                key: deep
                mode: override
                textValue: "0"
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
              masteryLevelBase: 75
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 39
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
              masteryLevelBase: 33
        - name: Ethereal Bite
          type: skill
          system:
              shortcode: bite
              subType: combattechnique
              masteryLevelBase: 76
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: bite
                  name: Ethereal Bite
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 1
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 1
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
        - name: Shadow Strike
          type: skill
          system:
              shortcode: claw
              subType: combattechnique
              masteryLevelBase: 76
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: claw
                  name: Shadow Strike
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 2
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 8
                      modifier: 0
                      aspect: edged
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
---

# Appearance {#appearance}

From the darkness comes a sound like no sound at all—a silence so absolute it presses against your ears. A shape coalesces, canine in outline but composed of shadow and void. Its eyes burn with a pale amber light, fixed on you with an animal’s hunger and something more—a predator’s calculation. The cold intensifies as it moves, and for just a moment you see its silhouette printed on the ground in frost that shouldn’t exist.

# Dossier {#dossier}

Gloomhounds are spectral predators born from the shadow realm, drawn to this world by dark ritual or lingering in places where death runs deep. They are semi-corporeal creatures that hunt in coordinated packs, using their strange connection to darkness and stone to ambush prey. Though they are primarily nocturnal, they may hunt in deep shadow or underground where darkness is constant. A Gloomhound encountered alone is likely driven or trapped; more often they come in threes or fours, each keenly aware of the others’ position without visible communication. They are intelligent creatures—they learn, they plan, and they understand vulnerability.

## Presentation

Each Gloomhound resembles a lean, wolf-like creature eight to nine feet from snout to tail tip, but composed of something between shadow and smoke. The body is only partially solid; light passes through it in strange ways, and edges blur and soften as though the creature exists slightly out of phase with the world. Its eyes are the only clearly solid feature—bright amber or pale yellow, unblinking and aware. The fur, if it can be called that, ripples like water when the creature moves. In bright light, the Gloomhound becomes more distinct, more material; in shadow, it becomes nearly invisible. Its paws leave no prints on most surfaces, but on stone or metal, they leave faint impressions as though the creature briefly became denser at contact point.

## Key Behaviors

Gloomhounds are pack hunters with a sophisticated social structure. They are most active in darkness but are not bound to it; they seem equally at home in caves, catacombs, and deep woods. When hunting, they move with eerie coordination, sometimes splitting to herd prey into waiting jaws. They do not kill wastefully—they understand the concept of exhausting prey before making the final attack. A pack will follow a injured creature for hours or days, allowing it to weaken from blood loss and terror before striking. They show strong territorial behavior and will defend their hunting grounds viciously against both other predators and humans.

## Combat Strategy

Gloomhounds use their semi-corporeal nature to devastating advantage. They dart through solid matter to flank opponents, move through walls to split a party, and withdraw through stone when a fight turns against them. Against light or radiant magic, they become more cautious, relying on darkness and concealment rather than direct assault. In a pack, they coordinate their strikes—one attacks from the front while others position for flanking moves. They are smart enough to recognize weakness and will focus on isolated or injured opponents while avoiding those dealing radiant damage. When faced with multiple opponents wielding stone or holy weapons, they attempt to fragment the group and engage them separately.

## Attack Methods

### Ethereal Bite

The Gloomhound’s jaws close around a victim and the bite feels wrong—not normal tissue tearing, but a cold draining sensation as if something vital flows away. The wound is minor physically but the victim feels weakened at a fundamental level.

### Shadow Strike

A raking attack with shadow-wreathed claws that passes partially through armor and cloth. Where it strikes, the victim’s strength seems to diminish and their resolve wavers.

### Coordinated Ambush

The pack uses its telepathic bond to strike from multiple angles simultaneously. One attacks from the front while others emerge from stone or shadow to strike from flanking positions, overwhelming a single opponent.

## Special Abilities

### Phase Through Solid Matter

The Gloomhound can move through stone, wood, and worked metal as easily as walking through air. It can emerge from a wall mid-combat or retreat through solid ground. However, large quantities of stone—bedrock, living rock, naturally formed stone—slow or block its passage. Worked stone is no barrier, but unworked stone channels its movement.

### Telepathic Coordination

Pack members maintain a constant, silent communication that allows them to coordinate attacks without signal or sound. An individual Gloomhound separated from its pack loses this ability and becomes noticeably less effective.

### Shadow Form

In darkness or shadow, the Gloomhound is nearly invisible. In bright light, it becomes solid and distinct. The creature seems to partially exist in shadow rather than fully in the material world.

### Life Drain

Attacks by the Gloomhound do not merely wound—they drain vitality. Victims feel a cold lethargy settle into their bones, their strength ebbing. This is more than physical injury; it is a sapping of the life force itself.

## Additional Information

Gloomhounds are profoundly weakened by radiant energy and bright light. Holy magic burns them nearly as painfully as fire burns flesh. Stone weapons—especially naturally formed stone—disrupt their ability to phase through matter, leaving them more vulnerable. They can be deterred or driven off by sacred sites or places sanctified by priests of good-natured faiths. Creating areas of bright illumination can force them to retreat or become fully corporeal and vulnerable. Despite their predatory nature, Gloomhounds are not evil—they are simply hungry creatures following their nature. Some rangers have reported that a Gloomhound can be reasoned with, especially if its pack bonds are respected. A solitary Gloomhound may accept territory boundaries and leave isolated settlements alone if properly negotiated with. This is rare, but not unheard of.

## Attributes

- **Strength:** 10-13 (1d4+9)

- **Endurance:** 11-16 (1d6+10)

- **Dexterity:** 14-17 (1d4+13)

- **Agility:** 15-20 (1d6+14)

- **Perception:** 14-17 (1d4+13)

- **Aura:** 11-16 (1d6+10)

- **Will:** 10-13 (1d4+9)

- **Reasoning:** 7-12 (1d6+6)

- **Creativity:** 10-13 (1d4+9)
