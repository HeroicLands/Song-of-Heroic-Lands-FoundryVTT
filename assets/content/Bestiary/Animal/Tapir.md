---
aliases:
    - Tapir
    - creature-tapir
tags:
    - animal
    - image-needed
name:
    full: Tapir
    aliases: []
description: "A shy, barrel-bodied jungle herbivore with a trunk-like nose, foraging riverbanks by night and swimming to escape confrontation."
id: uL25TIgj48GJ02pY
img: icons/game-icons/lorc/paw-print.svg
portrait: images/being/tapir-portrait.webp
shortcode: tapir
type: creature
package: sohl
sohl:
    kbcat: animal
    archetype: 0
    attributes:
        str: 14
        end: 13
        dex: 9
        agl: 10
        per: 14
        aur: 8
        wil: 10
        rea: 7
        cre: 6
    attrRollFormula:
        str: 1d6+10
        end: 1d6+9
        dex: 1d4+6
        agl: 1d4+7
        per: 1d6+10
        aur: 1d4+5
        wil: 1d4+7
        rea: 1d4+4
        cre: 1d4+3
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 3
                - name: Forelegs
                  shortcode: forelegszone
                  probWeight: 2
                - name: Torso
                  shortcode: torsozone
                  probWeight: 7
                - name: Hindquarters
                  shortcode: hindqtrzone
                  probWeight: 4
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
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 6
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Left Foreleg
                  shortcode: lforelegloc
                  bodyPartCode: lforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Right Foreleg
                  shortcode: rforelegloc
                  bodyPartCode: rforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Flank
                  shortcode: flkloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 6
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 4
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Left Quarter
                  shortcode: lqtrloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 3
                  probWeight: 5
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Left Hind Leg
                  shortcode: lhindlegloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 4
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Right Quarter
                  shortcode: rqtrloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 3
                  probWeight: 5
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Right Hind Leg
                  shortcode: rhindlegloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 4
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Tail
                  shortcode: tailloc
                  bodyPartCode: tailpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 1
                  probWeight: 10
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
        weight:
            base: 600
            calc: "600"
        reachBase: 0
        bodyScaleBase: 1.17
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 50
          leaguesPerWatch: 3
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
    defaultCombatGroup: null
    items:
        - shortcode: awar
          type: skill
          system:
              masteryLevelBase: 60
        - shortcode: stlth
          type: skill
          system:
              masteryLevelBase: 50
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 27
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 36
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 48
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 35
        - name: Battering Charge
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
                  name: Battering Charge
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 6
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 1
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
        - name: Bite
          type: skill
          system:
              shortcode: bite
              subType: combattechnique
              masteryLevelBase: 60
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
                      spread: 3
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 2
                      aspect: piercing
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

The undergrowth parts and something walks out of the jungle that your brain takes several seconds to classify. It is the size of a small pony, heavy-bodied and slung low to the ground, covered in short, dense fur of dark brown that is almost black. The head is the strangest part — elongated and oddly shaped, tapering to a short, flexible trunk or proboscis that writhes and probes the air like a fat, curious finger. The ears are round and edged with white, the eyes small and set deep in the skull, and the overall effect is of something assembled from parts that don't quite belong together — a pig's body, a horse's legs, an elephant's nose in miniature, and an expression of such mild, bewildered gentleness that you cannot help but feel sympathy for a creature so large and so obviously defenseless in a jungle full of jaguars. Then it turns and you see the hindquarters: solid, powerful, built with the same blunt engineering as a battering ram. The Ki'ichek say the tapir was the first animal the gods made, before they learned to make predators, and that it remembers the time when the forest was safe. Watching it shuffle into the undergrowth with patient, unhurried steps, trunk probing ahead for the path of least resistance, you can almost believe it.

# Dossier {#dossier}

The Tapir is the largest native land mammal in [[doc-kchchkcntnnt|K'ich'chik Continent]]'s lowland forests — a barrel-bodied, trunk-nosed herbivore weighing four hundred to seven hundred pounds that inhabits the jungle floor, river margins, and forest wetlands. Despite its bulk, the tapir is a shy, retiring creature that is primarily nocturnal and avoids confrontation whenever possible. It is an excellent swimmer and spends much of its time in or near water, using rivers and pools as refuge from predators, as feeding grounds for aquatic vegetation, and as trails through otherwise impenetrable jungle. In Ki'ichek culture, the tapir is associated with water, the forest floor, and the lower world — a creature of the deep places, the quiet paths, the hidden waterways. It is not sacred in the way the jaguar and quetzal are, but it is respected as the oldest animal, the forest's first inhabitant, and harming one needlessly is considered ill-mannered rather than criminal. The tapir is also an important prey animal for jaguars and human hunters alike, and tapir meat is a staple protein source for forest-dwelling communities. Adventurers encounter tapirs on jungle trails (especially near water), at river crossings, and occasionally in the cleared areas around settlements where they emerge at night to feed on cultivated crops — a behavior that makes them a persistent agricultural nuisance.

## Presentation

The tapir presents one of the most unusual silhouettes in the animal kingdom — a heavily built quadruped with an oval, barrel-shaped body, short but sturdy legs, and a head that tapers to a short, prehensile proboscis formed from the upper lip and nose. The proboscis is in constant motion, probing, sniffing, and manipulating vegetation with surprising dexterity. The eyes are small and deep-set, positioned laterally on the head, and often partially hidden behind folds of skin — they provide limited vision, which the tapir compensates for with acute hearing and an exceptional sense of smell. The ears are round, prominent, and often edged with white — the most visually distinctive feature of the head. The coat is short and dense, typically uniform dark brown to reddish-brown in adults, though juveniles display a striking pattern of white spots and stripes on a dark background — camouflage for the dappled light of the forest floor that fades as the animal matures. The body is rounded and solidly muscled, with a vestigial tail and hindquarters that are disproportionately powerful — the tapir's primary means of forcing its way through dense undergrowth. The feet are splayed and partially webbed, with three toes on the hind feet and four on the front, adapted for walking on soft, muddy ground and swimming.

## Key Behaviors

Tapirs are solitary, nocturnal herbivores that maintain loosely defined home ranges centered around water sources. They feed on leaves, fruits, branches, and aquatic vegetation, using their prehensile proboscis to reach foliage and strip leaves from branches. They follow established trails through the forest — tapir paths are well-worn, predictable routes that connect feeding areas, water sources, and resting sites. These trails are so consistent that hunters and other forest travelers use them as navigation aids. Tapirs are excellent and enthusiastic swimmers, entering water readily to feed, cool down, escape predators, and travel. They can walk along river bottoms, fully submerged, using their proboscis as a snorkel. They are shy around humans and will flee from any disturbance, crashing through the undergrowth with surprising speed and force — a fleeing tapir runs with its head lowered, using its solid body as a battering ram through vegetation that would stop lighter animals. Despite their timid nature, tapirs can be dangerous when cornered or wounded: they bite with strong jaws and can trample with their considerable weight.

## Combat Strategy

The tapir's combat strategy is simple: flee. It runs with its head down, crashing through undergrowth with enough mass to clear a path, and makes for the nearest water where it can swim to safety. If cornered, a tapir becomes surprisingly aggressive — it bites with powerful jaws designed for processing tough vegetation, and it uses its body mass to slam and trample opponents. A wounded or cornered tapir will charge directly at a threat, head lowered, using its dense skull and heavy forequarters as a battering ram. These charges are not sophisticated but they are powerful, and a seven-hundred-pound animal moving at speed through close quarters is genuinely dangerous.

## Attack Methods

### Battering Charge

The tapir lowers its head and charges directly at a threat, using its dense skull and heavy forequarters as a ram. The charge is straight-line and unsophisticated but delivers tremendous impact, capable of knocking humanoids off their feet and trampling them.

### Crushing Bite

The tapir's jaws, designed for processing tough vegetation, can deliver a powerful bite when defending itself. The teeth are blunt but the jaw pressure is significant — capable of crushing bone and inflicting serious wounds.

### Water Escape

Not an attack but the tapir's primary survival strategy — plunging into the nearest water source where it can swim, dive, and walk along the bottom until the threat passes. A tapir in water is effectively untouchable by land-based predators.

## Special Abilities

### Aquatic Refuge

The tapir is an accomplished swimmer and diver that uses water as its primary escape route and sanctuary. It can swim strongly, dive to the bottom of rivers and pools, and walk along the river bed using its proboscis as a snorkel. In water, the tapir is faster, more agile, and more confident than on land, and it will always prefer aquatic escape to terrestrial flight.

### Jungle Ram

The tapir's heavy, low-slung body and dense skull allow it to charge through undergrowth that would stop lighter animals. A fleeing tapir creates a temporary trail through even dense vegetation, and this crashing flight can itself be a navigational cue for hunters and forest travelers.

### Trail Memory

Tapirs follow the same paths through the forest for years, creating well-worn trails that connect feeding areas, water sources, and resting sites. These trails are so consistent and well-maintained that they function as a secondary trail network through otherwise trackless jungle — used by hunters, other animals, and adventurers who learn to recognize them.

## Attributes

- **Strength:** 11-16 (1d6+10) — Heavy and powerful; the battering charge is genuinely dangerous
- **Endurance:** 10-15 (1d6+9) — Solid; good swimming stamina but not a long-distance runner
- **Dexterity:** 7-10 (1d4+6) — Adequate; proboscis provides some manipulation ability
- **Agility:** 8-11 (1d4+7) — Decent in water; ungainly on land but surprisingly quick in a straight line
- **Perception:** 11-16 (1d6+10) — Excellent hearing and smell compensate for poor eyesight
- **Aura:** 6-9 (1d4+5) — Respected as the forest's oldest inhabitant; not sacred
- **Will:** 8-11 (1d4+7) — Shy and retiring; prefers flight; will fight when cornered
- **Reasoning:** 5-8 (1d4+4) — Adequate; remembers trails and water sources
- **Creativity:** 4-7 (1d4+3) — Limited
