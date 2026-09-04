---
tags:
  - animal
  - image-needed
name:
  full: Orca
  aliases:
    - Killer Whale
description: "A massive, intelligent pack-hunting marine mammal and apex predator of every ocean, the most dangerous animal encounter possible on open water."
id: HUbSiJXZrGu9Uz6t
img: icons/game-icons/delapouite/sperm-whale.svg
portrait: images/being/orca-portrait.webp
shortcode: orca
type: being
sohl:
  kbcat: animal
  archetype: 0
  attrRollFormula:
    str: 1d6+19
    end: 1d6+14
    dex: 1d6+8
    agl: 1d6+10
    per: 1d6+12
    aur: 1d6+8
    wil: 1d6+12
    rea: 1d6+8
    cre: 1d6+7
  body:
    structure:
      zones:
        - name: Head
          shortcode: headzone
          probWeight: 8
        - name: Body
          shortcode: torsozone
          probWeight: 24
        - name: Tail
          shortcode: tailzone
          probWeight: 8
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
            blunt: 8
            edged: 7
            piercing: 5
            fire: 7
        - name: Gills
          shortcode: gillloc
          bodyPartCode: headpart
          bleedingSusceptibility: high
          amputability: low
          shockValue: 5
          probWeight: 4
          protectionBase:
            blunt: 8
            edged: 7
            piercing: 5
            fire: 7
        - name: Body
          shortcode: bodyloc
          bodyPartCode: torsopart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 4
          probWeight: 6
          protectionBase:
            blunt: 8
            edged: 7
            piercing: 5
            fire: 7
        - name: Underbelly
          shortcode: underbellyloc
          bodyPartCode: torsopart
          bleedingSusceptibility: high
          amputability: none
          shockValue: 4
          probWeight: 4
          protectionBase:
            blunt: 8
            edged: 7
            piercing: 5
            fire: 7
        - name: Left Fin
          shortcode: lfinloc
          bodyPartCode: lfinpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 2
          probWeight: 10
          protectionBase:
            blunt: 8
            edged: 7
            piercing: 5
            fire: 7
        - name: Right Fin
          shortcode: rfinloc
          bodyPartCode: rfinpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 2
          probWeight: 10
          protectionBase:
            blunt: 8
            edged: 7
            piercing: 5
            fire: 7
        - name: Tail
          shortcode: tailloc
          bodyPartCode: tailpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 2
          probWeight: 10
          protectionBase:
            blunt: 8
            edged: 7
            piercing: 5
            fire: 7
    weight:
      base: 8000
      calc: "8000"
    reachBase: 0
    bodyScaleBase: 1.62
    personalFatigue: enc + 5
  currentMoveMedium: terrestrial
  movementProfiles:
    - medium: aquatic
      feetPerRound: 120
      leaguesPerWatch: 16
      encumbrance: floor(wt/4)
      strMod: -5 * floor((str - 10) / 2)
      factors: []
      disabled: false
  defaultCombatGroup: null
  items:
    - { shortcode: str, type: attribute, system: { scoreBase: 23 } }
    - { shortcode: end, type: attribute, system: { scoreBase: 18 } }
    - { shortcode: dex, type: attribute, system: { scoreBase: 12 } }
    - { shortcode: agl, type: attribute, system: { scoreBase: 14 } }
    - { shortcode: per, type: attribute, system: { scoreBase: 16 } }
    - { shortcode: aur, type: attribute, system: { scoreBase: 12 } }
    - { shortcode: wil, type: attribute, system: { scoreBase: 16 } }
    - { shortcode: rea, type: attribute, system: { scoreBase: 12 } }
    - { shortcode: cre, type: attribute, system: { scoreBase: 11 } }
    - { shortcode: awar, type: skill, system: { masteryLevelBase: 80 } }
    - { shortcode: stlth, type: skill, system: { masteryLevelBase: 75 } }
    - { shortcode: sprt, type: mysticalability, system: { masteryLevelBase: 42 } }
    - { shortcode: init, type: skill, system: { masteryLevelBase: 56 } }
    - { shortcode: dge, type: skill, system: { masteryLevelBase: 60 } }
    - { shortcode: shok, type: skill, system: { masteryLevelBase: 53 } }
    - name: Ramming Strike
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
          name: Ramming Strike
          minParts: 1
          assocSkillCode: null
          attack:
            disabled: false
            spread: 16
            modifier: 0
          impactBase:
            numDice: 1
            die: 6
            modifier: 6
            aspect: blunt
          lengthBase: 4
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
    - name: Tail Fluke Bludgeon
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
          name: Tail Fluke Bludgeon
          minParts: 1
          assocSkillCode: null
          attack:
            disabled: false
            spread: 16
            modifier: 0
          impactBase:
            numDice: 1
            die: 6
            modifier: 4
            aspect: blunt
          lengthBase: 5
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
    - name: Seize and Drag
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
          name: Seize and Drag
          minParts: 1
          assocSkillCode: null
          attack:
            disabled: false
            spread: 8
            modifier: 0
          impactBase:
            numDice: 1
            die: 6
            modifier: 7
            aspect: piercing
          lengthBase: 4
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

The dorsal fin breaks the surface fifty paces off the starboard bow — black, curved, and taller than a man. The helmsman sees it and his hands go white on the tiller. Then a second fin surfaces to port. A third, behind. The water around the longship turns dark with shapes — enormous shapes, black above and white below, moving with a coordinated precision that is more military formation than animal behavior. They are not circling. They are positioning. The nearest animal rolls slightly, showing you an eye — a small, intelligent eye set in a patch of white above the jaw — and in that eye you see something that the sharks never showed you: comprehension. The shark is a machine. This thing is thinking. It is looking at your ship, at your crew, at the distance to the waterline, and it is making decisions. The pod surfaces together, exhaling in a collective blast of spray that sounds like a war horn, and the longship rocks in the wave they generate. The helmsman begins to pray. He has sailed these waters for twenty years, and he knows what the Normen have always known: the sea has wolves too.

# Dossier {#dossier}

The Orca is the apex predator of every ocean in Thalorna — a massive, intelligent, pack-hunting marine mammal that represents the single most dangerous animal encounter possible on open water. Adult males reach twenty-five to thirty feet in length and weigh eight thousand to twelve thousand pounds. They are the largest members of the dolphin family, though calling them dolphins does nothing to prepare you for the reality: an orca is a wolf the size of a longship, hunting in coordinated packs with a sophistication that rivals or exceeds any land predator. Orca pods in [[doc-kngdmnrdhm|Kingdom of Nordheim]]'s waters are known to individual fishing communities — the Normen track them, name them, and plan their sailing seasons around their movements. Different pods specialize in different prey: some hunt fish, some hunt seals, and some hunt whales. The seal-hunting and whale-hunting pods are the ones that threaten ships, because they have learned techniques for capsizing ice floes, washing prey off rocks, and creating waves that swamp small vessels. An orca pod that has identified a ship as an obstacle between itself and prey — or, worse, has learned that ships carry food — is a genuine maritime crisis. Orcas are intelligent enough to coordinate attacks from multiple directions, to take turns wearing down prey, and to teach these techniques to their young. They are also intelligent enough to leave most ships alone. The encounters that matter are the ones where they don't.

## Presentation

The orca is unmistakable — a massive, streamlined body of stark black and white that seems designed for maximum visual impact. The dorsal surface is jet black, the ventral surface bright white, with a distinctive white eye patch above and behind each eye and a gray "saddle patch" behind the dorsal fin that is unique to each individual — the Normen use these saddle patches to identify known animals. The body is powerfully muscled, tapering from broad, rounded head to a pair of horizontal tail flukes that generate the propulsive force for speeds that can exceed thirty miles per hour in short bursts. The dorsal fin of an adult male is the most striking feature: a tall, straight blade of cartilage up to six feet high that cuts the surface like a black sail. Females and juveniles have shorter, more curved dorsal fins. The mouth contains forty to fifty interlocking conical teeth — not the serrated cutting teeth of a shark but the gripping, holding teeth of a predator that seizes and controls prey rather than slicing it. The pectoral flippers are large, rounded, and paddle-shaped. The blowhole on top of the head produces the distinctive explosive exhalation that announces the animal's presence at the surface.

## Key Behaviors

Orcas live in matrilineal pods — stable family groups of five to thirty individuals led by the oldest female, who carries decades of accumulated knowledge about hunting grounds, migration routes, prey behavior, and seasonal patterns. Pod members communicate through a complex vocabulary of clicks, whistles, and calls that are distinct to each pod — essentially a family dialect. Different pods specialize in different hunting strategies that are taught from mother to calf across generations: fish-herding pods drive schooling fish into tight balls against the surface; seal-hunting pods create coordinated waves to wash seals off ice floes; whale-hunting pods work in relay teams to exhaust prey over hours of pursuit. This cultural transmission of specialized knowledge makes each pod a unique tactical unit. Orcas are also playful, curious, and social — they breach (leap from the water), spy-hop (raise their heads vertically to observe the surface), and engage in what appears to be recreational activity. They are known to investigate ships, swimmers, and unusual objects with an inquisitiveness that can shade into aggression if the pod perceives a threat or competition. The oldest females can live for eighty years or more, accumulating a lifetime of strategic knowledge that makes them irreplaceable to the pod's survival.

## Combat Strategy

An orca pod fights the way a wolf pack fights — with coordination, role specialization, and relentless endurance. Against a ship, the pod's strategy depends on its size and experience. A common approach is the "wave wash": several orcas swim in formation beneath the vessel and surface simultaneously, creating a combined wave that can capsize small boats and swamp larger ones. Against swimmers or people on ice floes, the pod coordinates to create waves that wash the target into the water, where waiting pod members seize it. In direct combat, individual orcas take turns attacking — one engages while others rest, creating a relay system that exhausts prey while conserving the pod's energy. The lead female directs the pod's movements, and experienced pods adjust their tactics in real time based on the prey's responses. Against armored or dangerous targets, orcas use their tail flukes as bludgeoning weapons, delivering strikes powerful enough to shatter bone and timber. They are patient hunters willing to sustain an engagement for hours if necessary, and they virtually never abandon a committed hunt.

## Attack Methods

### Ramming Strike

The orca accelerates to full speed and drives its head into the target — a ship's hull, an ice floe, or a creature in the water. The impact of several tons of muscle moving at speed is devastating, sufficient to hole light hulls, capsize small vessels, and kill or stun marine prey outright.

### Tail Fluke Bludgeon

The horizontal tail flukes are swung laterally or vertically with enormous force, striking targets at or near the surface. A tail strike can shatter a small boat's gunwale, break human limbs, and send spray and debris across a wide area. The strike is fast and can be delivered while the orca is already turning for another pass.

### Seize and Drag

The orca lunges from the water or surges from below to seize a target in its jaws, then dives, dragging the victim beneath the surface. The conical teeth grip rather than cut, making escape from the jaw extremely difficult. Once submerged, the orca holds the target under until drowned, then surfaces to feed.

### Coordinated Wave

Multiple orcas swim in tight formation and surface simultaneously near a target vessel or ice floe, generating a combined wave that can swamp or capsize boats up to longship size. This technique requires pod coordination and is typically directed by the lead female.

## Special Abilities

### Echolocation

Orcas produce focused beams of clicking sounds that bounce off objects and return detailed information about size, shape, distance, and internal structure. An orca can "see" through murky water, detect fish inside a net, identify the shape of a hull from below, and locate prey at distances far beyond visual range. This makes concealment in water effectively impossible against an orca.

### Pod Tactics

An orca pod fights as a coordinated tactical unit, with the lead female directing movements and individual pod members executing specialized roles — drivers, blockers, strikers. The pod communicates throughout the engagement using vocalizations, and experienced pods adapt their strategy in real time. This is not instinct; it is learned, cultural behavior passed down across generations.

### Endurance Relay

The pod hunts in relay — individual orcas take turns leading the pursuit while others rest, creating a system of effectively unlimited stamina. Prey that can outrun one orca cannot outrun the pod, because fresh pursuers constantly replace tired ones. This technique can sustain a pursuit for hours across dozens of miles of open ocean.

### Cultural Intelligence

Each orca pod carries a unique body of learned knowledge — hunting techniques, migration routes, seasonal patterns, and knowledge of specific prey populations — that is transmitted from mother to calf across generations. This means that individual pods have distinct "personalities" and capabilities. A pod that has learned to capsize boats is far more dangerous to ships than one that specializes in fish herding, even if their physical capabilities are identical.

## Attributes

- **Strength:** 20-25 (1d6+19) — Massive physical power; ramming impact can hole hulls
- **Endurance:** 15-20 (1d6+14) — Tireless in water; pod relay system extends effective stamina indefinitely
- **Dexterity:** 9-14 (1d6+8) — Adequate; precise enough for coordinated maneuvers
- **Agility:** 11-16 (1d6+10) — Surprisingly fast and maneuverable for their size; burst speed exceeds 30 mph
- **Perception:** 13-18 (1d6+12) — Echolocation provides detailed underwater awareness; excellent vision above and below surface
- **Aura:** 9-14 (1d6+8) — The Normen regard them as the wolves of the sea; feared and respected
- **Will:** 13-18 (1d6+12) — Relentless pack hunters; will not abandon a committed pursuit
- **Reasoning:** 9-14 (1d6+8) — Among the most intelligent non-humanoid creatures; cultural learning, tactical adaptation
- **Creativity:** 8-13 (1d6+7) — Develop novel hunting techniques; each pod innovates independently
