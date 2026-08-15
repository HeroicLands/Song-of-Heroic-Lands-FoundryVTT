---
aliases:
    - Common Shark
    - creature-cmmnshrk
tags:
    - animal
name:
    full: Common Shark
    aliases: []
id: Dlb33sZtEOy97jZz
img: icons/game-icons/lorc/shark-jaws.svg
portrait: images/cmmnshrk.webp
shortcode: cmmnshrk
type: creature
package: sohl
sohl:
    kbcat: animal
    archetype: 0
    attributes:
        str: 15
        end: 13
        dex: 11
        agl: 14
        per: 15
        aur: 10
        wil: 12
        rea: 6
        cre: 5
    attrRollFormula:
        str: 1d6+11
        end: 1d6+9
        dex: 1d6+7
        agl: 1d6+10
        per: 1d6+11
        aur: 1d4+7
        wil: 1d6+8
        rea: 1d4+3
        cre: 1d4+2
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 3
                - name: Body
                  shortcode: torsozone
                  probWeight: 5
                - name: Tail
                  shortcode: tailzone
                  probWeight: 2
            parts:
                - name: Head
                  shortcode: headpart
                  bodyZoneCode: headzone
                  roles:
                      - vital
                      - manipulator
                  canHoldItem: false
                  probWeight: 10
                - name: Body
                  shortcode: torsopart
                  bodyZoneCode: torsozone
                  roles:
                      - core
                  canHoldItem: false
                  probWeight: 10
                - name: Left Fin
                  shortcode: lfinpart
                  bodyZoneCode: torsozone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 2
                - name: Right Fin
                  shortcode: rfinpart
                  bodyZoneCode: torsozone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 2
                - name: Tail
                  shortcode: tailpart
                  bodyZoneCode: tailzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 10
            locations:
                - name: Head
                  shortcode: headloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 6
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 3
                      fire: 5
                - name: Gills
                  shortcode: gillloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 4
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 3
                      fire: 5
                - name: Body
                  shortcode: bodyloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 6
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 3
                      fire: 5
                - name: Underbelly
                  shortcode: underbellyloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 4
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 3
                      fire: 5
                - name: Left Fin
                  shortcode: lfinloc
                  bodyPartCode: lfinpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 3
                      fire: 5
                - name: Right Fin
                  shortcode: rfinloc
                  bodyPartCode: rfinpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 3
                      fire: 5
                - name: Tail
                  shortcode: tailloc
                  bodyPartCode: tailpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 3
                      fire: 5
        weight:
            base: 400
            calc: "400"
        reachBase: 0
        bodyScaleBase: 1.22
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: aquatic
          feetPerRound: 80
          leaguesPerWatch: 8
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
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
              masteryLevelBase: 65
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
              masteryLevelBase: 56
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 35
        - name: Bite
          type: skill
          system:
              shortcode: bite
              subType: combattechnique
              masteryLevelBase: 63
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
                      spread: 2
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 3
                      aspect: piercing
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
        - name: Tail Strike
          type: skill
          system:
              shortcode: tail
              subType: combattechnique
              masteryLevelBase: 53
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
                      spread: 4
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 0
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
        - name: Ram
          type: skill
          system:
              shortcode: ram
              subType: combattechnique
              masteryLevelBase: 53
              combatCategory: melee
              impairedByRoles:
                  - core
              strikeMode:
                  type: melee
                  shortcode: ram
                  name: Ram
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 4
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 2
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
---

# Appearance {#appearance}

The water becomes heavier somehow, thicker, as if something large moves beneath. You catch sight of it first as a silhouette against lighter water above: a shape that is all muscle and hunger, streamlined for speed and designed for killing. The dorsal fin cuts the surface of the water, a dark wedge that never stops moving, circling, assessing. When it turns toward you, the angle of the sun catches rows of teeth—thousands of them, arranged in wheels of replacement within its jaw—and you see in that moment the absolute indifference of nature's most perfect predator.

# Dossier {#dossier}

The Common Shark is an oceanic predator refined across millennia to be a supremely efficient killing machine. These creatures measure ten to fifteen feet in length and weigh three hundred to five hundred pounds, though size varies by subspecies. They are found in warm and temperate ocean waters worldwide, either in open ocean or cruising coastal waters in search of prey. A shark's hunting strategy is based on sensory precision and explosive speed—they can detect blood in water from miles away, sense electrical impulses from prey nerves, and accelerate to devastating speeds in brief bursts. They are mindless predators in the sense that they possess no capacity for planning or mercy; they hunt by instinct and pure sensory information. A shark encountering a human in water views that human as potential food and acts accordingly, regardless of how dangerous the human might be. Adventurers encounter sharks while swimming, on ships attacked during ocean voyages, or when diving in coastal waters to investigate shipwrecks or retrieve items from the sea floor.

## Presentation

A torpedo-shaped fish engineered for speed and predation. The body is fusiform—tapered at both ends, with maximum diameter roughly in the middle—allowing rapid acceleration and effortless movement through water. The skin is gray or slate-colored on the dorsal surface, transitioning to white or pale gray on the ventral surface. The texture is rough, covered in microscopic ridges that reduce drag during movement. The dorsal fin is prominent and raised, providing stability during turns. The pectoral fins are broad and used for steering and braking. The caudal fin is asymmetrical, with the upper lobe longer than the lower, providing thrust. The gill slits are prominent and functional, allowing water to pass over gills for oxygenation. The mouth is positioned ventrally (on the underside of the head) and can open wide to reveal rows of teeth: multiple rows of replacement teeth are visible, with new teeth migrating forward as anterior teeth wear or break. The eyes are lateral and reasonably large, capable of detecting movement and light-level changes. The entire creature is designed for one purpose: locating, hunting, and consuming prey.

## Key Behaviors

Common Sharks are migratory, moving seasonally between feeding grounds and breeding grounds. They are generally solitary hunters, though large concentrations may occur around food sources (dead whales, fish runs, or congregations of prey species). A shark's sensory hunting uses smell first: they can detect a single drop of blood in an Olympic swimming pool and will follow the concentration gradient upstream to its source. Once the prey is located, vision takes over, and they assess size and threat level. Sharks do not sleep in the conventional sense but instead reduce activity during certain times. They are cannibalistic and will attack and consume other sharks, including members of their own species, if opportunity presents and size disparity is sufficient. They have no memory in a human sense but operate entirely on instinct, with learned behaviors limited to basic responses to repeated stimuli (food, threat, mating opportunity). Interestingly, sharks do feel pain and injury, but pain does not seem to trigger retreat—instead, injured sharks become more aggressive, possibly due to blood scent triggering feeding response.

## Combat Strategy

A shark's hunting strategy in combat situations is surprisingly consistent with predatory instinct. It circles prey while assessing size and threat level, approaches from an angle that minimizes the prey's ability to see it, and attacks with explosive force. The initial attack is typically the most powerful, aimed at disabling the prey—removing limbs, severing arteries, or crushing organs. If the initial attack succeeds and prey is disabled, the shark continues attacking until prey is dead or escapes the water. If prey mounts effective resistance or is too large to quickly disable, the shark may break off and circle again, reassessing. A shark that has taken significant injury may continue attacking (blood scent triggering feeding response) or may retreat if the injury is severe enough. Multiple sharks scavenging a carcass or coordinating on prey (rare, but documented) can overwhelm much larger creatures.

## Attack Methods

### Bite with Multiple Rows of Teeth

The shark accelerates and bites with devastating force, its upper and lower jaws each containing multiple rows of sharp, triangular teeth. The teeth penetrate flesh and bone with ease, and the bite itself is often sufficient to sever limbs or open arteries. Unlike mammalian predators, the shark cannot manipulate prey with its jaws; instead, it shakes violently side to side to tear flesh away. Multiple bites in rapid succession are common, with the shark circling back for successive attacks on fresh wounds.

### Tail Strike

Using its powerful caudal fin as a weapon, the shark can strike prey with tremendous force, potentially breaking bones or stunning the target. This attack is less common than biting but effective against prey that the shark cannot close distance on or prey that is already incapacitated.

### Ram Attack

A shark approaching at high speed will sometimes deliberately ram prey, using the impact of its entire body to stun or knock down the target. This is a preliminary attack meant to disorient prey for a subsequent bite attack.

## Special Abilities

### Sensory Hunting Precision

The shark can detect blood in water from extraordinary distances—the ability to follow a scent trail to its source with precision is unmatched among predators. Additionally, the shark can sense electrical impulses generated by prey's nervous system, allowing it to locate prey even in murky water, darkness, or when direct line of sight is blocked. This sensory package makes escaping a determined shark nearly impossible in water.

### Aquatic Dominance and Speed

In water, the shark is apex predator, capable of accelerating to speeds that exceed human swimming capability by factors of three or more. It maneuvers with precision, banks and turns instantly, and can position itself advantageously regardless of terrain. A human in water is at catastrophic disadvantage against a shark.

### Feeding Frenzy and Escalating Aggression

When a shark detects blood or feeding opportunity, it enters an escalated state sometimes called feeding frenzy. Sensory input becomes increasingly dominant, and the shark's aggression escalates dramatically. An injured shark that tastes blood may become progressively more aggressive rather than retreating. This can result in situations where the shark's own injuries amplify its danger rather than diminishing it.

### Regenerating Tooth Rows

If a shark loses teeth during feeding or hunting, replacement teeth migrate forward automatically to take their place. This replacement cycle is continuous across the shark's lifetime, allowing it to sustain unlimited hunting even if significant portions of its dentition are damaged.

## Attributes

- **Strength:** 12-17 (1d6+11)

- **Endurance:** 10-15 (1d6+9)

- **Dexterity:** 8-13 (1d6+7)

- **Agility:** 11-16 (1d6+10)

- **Perception:** 12-17 (1d6+11)

- **Aura:** 8-11 (1d4+7)

- **Will:** 9-14 (1d6+8)

- **Reasoning:** 4-7 (1d4+3)

- **Creativity:** 3-6 (1d4+2)
