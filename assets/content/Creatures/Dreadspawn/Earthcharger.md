---
aliases:
    - Earthcharger
tags:
    - dreadspawn
name:
    full: Earthcharger
    aliases: []
id: u8zP1zROlFGp2zuv
slug: earthcharger
img: icons/game-icons/delapouite/griffin-symbol.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 19
        end: 18
        dex: 10
        agl: 10
        per: 12
        aur: 10
        wil: 18
        rea: 8
        cre: 6
    attrRollFormula:
        str: 1d6+15
        end: 1d6+14
        dex: 1d6+7
        agl: 1d6+7
        per: 1d6+9
        aur: 1d6+7
        wil: 1d6+15
        rea: 1d6+5
        cre: 1d4+3
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 5
                - name: Thorax
                  shortcode: thoraxzone
                  probWeight: 6
                - name: Abdomen
                  shortcode: abdomenzone
                  probWeight: 5
            parts:
                - name: Head
                  shortcode: headpart
                  bodyZoneCode: headzone
                  roles:
                      - vital
                      - manipulator
                  canHoldItem: false
                  probWeight: 10
                - name: Thorax
                  shortcode: thoraxpart
                  bodyZoneCode: thoraxzone
                  roles:
                      - core
                  canHoldItem: false
                  probWeight: 10
                - name: Left Legs
                  shortcode: llegspart
                  bodyZoneCode: thoraxzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 3
                - name: Right Legs
                  shortcode: rlegspart
                  bodyZoneCode: thoraxzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 3
                - name: Abdomen
                  shortcode: abdomenpart
                  bodyZoneCode: abdomenzone
                  roles:
                      - core
                  canHoldItem: false
                  probWeight: 10
            locations:
                - name: Head
                  shortcode: headloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 7
                  protectionBase:
                      blunt: 9
                      edged: 8
                      piercing: 7
                      fire: 9
                - name: Mandibles
                  shortcode: mandibloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: low
                  amputability: high
                  shockValue: 2
                  probWeight: 3
                  protectionBase:
                      blunt: 9
                      edged: 8
                      piercing: 7
                      fire: 9
                - name: Thorax
                  shortcode: thoraxloc
                  bodyPartCode: thoraxpart
                  bleedingSusceptibility: low
                  amputability: none
                  shockValue: 4
                  probWeight: 10
                  protectionBase:
                      blunt: 9
                      edged: 8
                      piercing: 7
                      fire: 9
                - name: Left Legs
                  shortcode: llegsloc
                  bodyPartCode: llegspart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 9
                      edged: 8
                      piercing: 7
                      fire: 9
                - name: Right Legs
                  shortcode: rlegsloc
                  bodyPartCode: rlegspart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 9
                      edged: 8
                      piercing: 7
                      fire: 9
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: abdomenpart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 10
                  protectionBase:
                      blunt: 9
                      edged: 8
                      piercing: 7
                      fire: 9
        weight:
            base: 1500
            calc: 1500
        reachBase: 0
        bodyScaleBase: 1.73
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 80
          leaguesPerWatch: 6
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
              masteryLevelBase: 70
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 42
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 52
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 44
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 48
        - name: Crushing Mandibles
          type: skill
          system:
              shortcode: mandible
              subType: combattechnique
              masteryLevelBase: 52
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: mandible
                  name: Crushing Mandibles
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 3
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 5
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
        - name: Carapace Charge
          type: skill
          system:
              shortcode: ram
              subType: combattechnique
              masteryLevelBase: 42
              combatCategory: melee
              impairedByRoles:
                  - core
              strikeMode:
                  type: melee
                  shortcode: ram
                  name: Carapace Charge
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 6
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 4
                      aspect: blunt
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

The stone scrapes before you see it. A wall of chitinous armor pushes out of the cavern's mouth—a beetle the size of a wagon, its carapace gleaming black like obsidian in lamplight. Its mandibles are the length of a man's arm each, lined with serrated edges and stained dark from old kills. Antennae twitch and wave, sampling air and vibration. The creature doesn't move quickly, but every movement carries the inevitability of an oncoming cart of stone. Where it has passed, the ground is gouged by chitinous claws and the air is thick with a dry, mineral musk.

# Dossier {#dossier}

Earthchargers are apex predators of caverns and underground passages — heavily armored arthropods driven by ancient hunger and territorial absolutism. They are living battering rams of the deep places, capable of breaking through brush, wooden doors, weakened stonework, and many fortified barricades with patient, unstoppable force, though intact dressed masonry will still hold them out. Adventurers encounter them in deep caverns, stone-wrought labyrinths, and the wider underground passages where their bulk can pass.

## Presentation

The Earthcharger is a massive beetle, ten to twelve feet in length and weighing eight hundred to fifteen hundred pounds — comparable in mass to a large draft ox, but compressed into the broader, lower silhouette of an arthropod. Its carapace is composed of multiple overlapping plates of black chitin flecked with iridescent copper and deep blue. The shell is scarred, cracked in places, repaired through heavy use. Its mandibles are enormous — each as long as a man's arm and lined with serrated cutting edges capable of shearing through limbs. It has six thick, columnar legs that support its weight on stone with no apparent strain; each foot is a complex structure of hard points and softer pads. Long antennae extend from its head, constantly twitching and sensing. The creature moves with slow, relentless determination, the scrape of chitin against stone carrying clearly through the surrounding rock and the impact of each step felt as a faint tremor underfoot.

## Key Behaviors

The Earthcharger is a solitary, hyperterritorial creature that claims a section of cavern or tunnel network as its exclusive domain. It dwells in deep passages where few predators challenge it, emerging periodically to hunt or expand its territory through violent assertion. The creature exhibits intelligent recognition of boundaries and threats; it remembers the locations of previous conflicts and will actively seek to eliminate rivals and threats. Despite its bulk, it is capable of long-duration pursuit when angered. It feeds infrequently — when it does hunt, it consumes large quantities. Between hunts, it remains dormant for extended periods, barely moving. It shows no sign of social behavior or family structure.

## Combat Strategy

The Earthcharger employs a simple but devastating strategy: it charges. It builds momentum on its powerful legs and crashes into opposition with the force of a battering ram. Once engaged, it relies on its mandibles and the crushing weight of its body to break opponents. It does not employ tactics or positioning—it advances and crushes. If something threatens it seriously, it responds with mindless fury, attacking everything nearby. It will pursue fleeing prey if the prey is moving away from its lair; it will not pursue into confined spaces it cannot fit through or away from its claimed territory.

## Attack Methods

### Crushing Mandible Bite

The creature's massive jaws open wide and snap shut with bone-shearing force, easily severing limbs or breaking ribs through armor. Targets caught in the bite take heavy trauma damage; if the creature successfully grapples, it can maintain the grip across multiple rounds, slowly crushing the victim.

### Carapace Charge

The Earthcharger lowers its armored head and charges, using its full weight and bulk as a weapon. The impact throws targets backward and prone; the creature's momentum carries it forward, potentially trampling additional targets.

### Trample Attack

The creature uses its massive feet to crush opponents beneath it. After engaging with mandible attacks or charges, it can deliberately trample anything beneath its body.

## Special Abilities

### Heavy Chitin

The Earthcharger's natural armor is exceptionally tough. Slashing and piercing attacks against the carapace are largely deflected or absorbed; only well-placed strikes against the joints between plates land cleanly. Blunt-force trauma — heavy hammers, falling rock, siege weaponry — is more effective but still significantly resisted by the layered plates.

### Territorial Aggression

The creature's will is absolute within its claimed territory. All its attacks gain bonus damage when fighting within territory it recognizes as its own. It fights with increasing fury if its lair is threatened, becoming more aggressive and less rational.

### Hardened Mass

The creature's combination of mass and chitin allows it to shoulder through wooden doors, weakened stonework, palisades, and most fortifications short of dressed-stone masonry. Against intact ashlar walls it is merely persistent rather than unstoppable, but against most lesser barriers it advances at a walking pace as if they were not there. Its weight also makes it extremely difficult to move against its will.

## Additional Information

Fire-based attacks are notably effective against the Earthcharger, as heat can damage and weaken its chitin, soften the joints between armor plates, and cause pain that affects its behavior. Explosive forces similarly exploit the joints between carapace segments. The Earthcharger is slow over open ground and can be outdistanced at a sustained run, but it is a tireless pursuer over distance and most parties cannot easily climb out of its path; evasion depends on finding terrain too narrow for it to pass through, vertical surfaces it cannot climb, or water deep enough to break its footing. Earthchargers leave distinctive territorial markings — gouged ground, scored walls, pheromone trails — that indicate their presence and boundaries.

## Attributes

- **Strength:** 16-21 (1d6+15)

- **Endurance:** 15-20 (1d6+14)

- **Dexterity:** 8-13 (1d6+7)

- **Agility:** 8-13 (1d6+7)

- **Perception:** 10-15 (1d6+9)

- **Aura:** 8-13 (1d6+7)

- **Will:** 16-21 (1d6+15)

- **Reasoning:** 6-11 (1d6+5)

- **Creativity:** 4-7 (1d4+3)
