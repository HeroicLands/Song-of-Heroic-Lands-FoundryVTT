---
aliases:
    - Xerathian Wild Dog
    - Painted Dog
tags:
    - animal
    - image-needed
name:
    full: Painted Dog
    aliases: []
id: 0tPcOrOwOP9EOWuE
slug: painted-dog
img: icons/game-icons/lorc/hound.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 12
        end: 14
        dex: 15
        agl: 15
        per: 15
        aur: 11
        wil: 13
        rea: 9
        cre: 8
    attrRollFormula:
        str: 1d6+8
        end: 1d6+10
        dex: 1d6+11
        agl: 1d6+11
        per: 1d6+11
        aur: 1d6+7
        wil: 1d6+9
        rea: 1d4+6
        cre: 1d4+5
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
                  probWeight: 4
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
                - name: Thorax
                  shortcode: thoraxloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 5
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
                  probWeight: 3
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Pelvis
                  shortcode: plvsloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 2
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
                  probWeight: 10
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
                  probWeight: 10
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
            base: 80
            calc: "80"
        reachBase: 0
        bodyScaleBase: 1.09
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 70
          leaguesPerWatch: 6
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors:
              - scope: surface_cover
                key: mixed_forest
                mode: add
                textValue: "-1"
              - scope: surface_cover
                key: needleleaf_forest
                mode: add
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
              masteryLevelBase: 70
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 36
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
              masteryLevelBase: 33
        - name: Pack Tear-Down
          type: skill
          system:
              shortcode: bite
              subType: combattechnique
              masteryLevelBase: 70
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: bite
                  name: Pack Tear-Down
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
---

# Appearance {#appearance}

You hear the whistling first — a high, birdlike chattering that comes from multiple directions simultaneously, moving through the bush with a coordination that no bird flock could achieve. Then you see them: lean, angular shapes trotting through the grass with a purposeful, ground-covering pace, their oversized ears rotating like signal dishes, their mottled coats making them flicker in and out of visibility against the dappled scrubland. They are dogs — but they are not dogs. They are something older and stranger, something that never learned the deference that domestication teaches, that looks at humans with the same calm, analytical attention it gives to a wildebeest or a warthog. You count five. Then eight. Then fourteen. They are not running yet. They are jogging, spread out in a loose formation, and the whistling calls that pass between them carry information you cannot decode — directions, coordinates, assignments. One of them glances at you, ears forward, and for a moment the mottled face with its dark muzzle and amber eyes holds your gaze with an intelligence that is not mammalian warmth but something colder: the dispassionate focus of a perfectly cooperating machine. Then it looks away and whistles to its packmates, and the formation adjusts, and you realize that you were assessed, categorized, and dismissed in the time it took you to take one breath.

# Dossier {#dossier}

The Painted Dog is the supreme pack predator of the Xerathian savannahs — a lean, endurance-built canid that hunts in coordinated packs of ten to thirty individuals with an efficiency that no other predator on the continent can match. An adult painted dog stands twenty-four to thirty inches at the shoulder and weighs forty to seventy pounds — substantially smaller than a wolf, lighter than a hyena, and individually no match for a lion or leopard. But painted dogs do not operate as individuals. They operate as a unit, and the unit is one of the most effective killing systems in the natural world. Their hunting success rate — the percentage of hunts that end in a kill — approaches eighty percent. A lion pride succeeds roughly one hunt in four. The difference is coordination.

Painted dogs are found across the open savannahs, light woodlands, and scrublands of southern and central [[Xerathia_Continent]], wherever the migratory herds and resident herbivore populations provide sufficient prey. They are not territorial in the way that wolves are — a pack ranges across enormous areas, sometimes hundreds of square miles, following the prey rather than defending a fixed patch of ground. They are nomadic, sleeping in a different location each night, and their appearance in an area is both unpredictable and, for the prey populations that live there, immediately consequential.

In the cultures of southern Xerathia, the painted dog occupies a complex position. The savanna peoples respect its hunting prowess — the pack's cooperative efficiency is held up as an example of how a group that works together can overcome individually stronger opponents. Painted dog imagery appears in the traditions of warrior societies and hunting bands, and the mottled coat pattern has been adopted for war paint and ceremonial decoration. At the same time, the painted dog is feared and resented: a pack that establishes itself near a settlement will rapidly deplete the local game, and painted dogs that learn to take livestock are extremely difficult to deter because the pack's intelligence and coordination defeat most conventional predator-control methods.

Adventurers encounter painted dogs on the open savanna, typically spotting the pack at a distance as it moves in its characteristic loose formation — spread out, trotting steadily, with the oversized ears scanning and the whistling calls passing between individuals. The pack will generally avoid humans unless provoked, cornered, or extremely hungry, but a party that comes between a pack and its kill, or that stumbles into a denning area with pups, may face a level of coordinated canid aggression that is qualitatively different from anything a wolf pack produces.

## Presentation

The painted dog is immediately distinguishable from any other canid by its coat: a patchwork of irregular blotches in black, brown, white, and tawny gold, distributed across the body in a pattern that is unique to each individual and that gives the animal the appearance of having been painted by an abstract artist with a limited palette. No two painted dogs share the same pattern, and pack members recognize each other by these markings. The coat is short and sparse — painted dogs have no undercoat, an adaptation to the warm savanna climate that gives them a lean, almost emaciated appearance.

The body is lean and long-legged, built for endurance running rather than the explosive sprinting of a cheetah or the brute power of a wolf. The chest is deep but narrow, housing oversized lungs and heart. The legs are long and thin, with only four toes on each foot — unlike most canids, which have five — a reduction that makes the foot lighter and more efficient for sustained running. The head is broad and flat, with a short, powerful muzzle and heavy jaw muscles that deliver a crushing bite disproportionate to the animal's body size. The teeth are pre-molar heavy — the carnassials are enlarged and the premolars are robust, designed for shearing flesh and cracking bone with efficiency rather than the delicacy of a fox or the tearing power of a wolf.

The most distinctive feature is the ears: enormous, rounded, bat-like, covered in short dark hair, and mounted high on the skull. They are independently mobile, swiveling to track sound from different directions simultaneously, and they serve both as sensory equipment and as social signals — ear position communicates mood, intent, and attention within the pack. The eyes are dark brown, set wide for peripheral vision, and carry an expression that experienced observers consistently describe as intelligent and unsettlingly focused.

## Key Behaviors

Painted dogs are the most social canids in the world. The pack is not merely a group of individuals that hunt together — it is a cooperative unit that shares food, raises young communally, and cares for injured and elderly members with a selflessness that is rare in the animal kingdom. When a hunt is successful, the kill is shared: hunters that participated in the chase are fed first, but they return to the den and regurgitate meat for pups, nursing mothers, injured pack members, and elderly dogs that could not participate. No pack member is left unfed. A painted dog that is injured and cannot hunt will be fed by the pack for months or years, carried by the group's collective effort. This cooperative behavior extends to pup-rearing: the entire pack participates in guarding, feeding, and educating young, and pup survival rates are higher in painted dog packs than in any other large carnivore.

Communication within the pack is constant and complex. The signature sound is a high-pitched, birdlike whistling — a "hoo" call used to maintain contact, coordinate movement, and signal changes in direction during a hunt. Additional vocalizations include a twittering rally call used before hunts (a group bonding ritual where pack members run between each other, licking faces, vocalizing, and building excitement), alarm barks, and submissive whines. The pack communicates during hunts through a combination of vocal calls and body language — changes in speed, direction, and positioning — that allows the group to execute coordinated maneuvers without a single animal serving as a visible leader.

Pack leadership is subtle. There is a dominant breeding pair — an alpha male and alpha female — but their authority is expressed through influence rather than force. The pack makes decisions collectively: before a hunt, the rally ritual serves as something researchers describe as a "voting" process, where the number of individuals that participate in the rally determines whether the hunt proceeds. This democratic decision-making is unlike the strict dominance hierarchies of wolf packs and gives the painted dog pack a flexibility that allows it to adjust strategy based on the collective assessment of conditions.

## Combat Strategy

The painted dog pack hunts through cooperative endurance pursuit — a strategy that is unique among the large predators and devastating in its effectiveness. The pack selects a target — typically a wildebeest, gazelle, or other medium-sized herbivore — and begins the chase. Unlike a cheetah, which sprints and must catch its prey in seconds, or a lion, which ambushes from close range, the painted dog pack runs its prey to exhaustion over distances of one to three miles. The pace is not a flat-out sprint but a sustained, relentless run at a speed just above what the prey can comfortably maintain. The prey tires; the pack does not, because individual dogs rotate positions — those at the front of the pursuit drop back to rest while fresh dogs take over the lead, maintaining constant pressure without any single animal bearing the full cost of the chase.

Once the prey begins to slow, the pack closes and the kill begins. This is the aspect of painted dog hunting that disturbs observers most: the pack does not deliver a killing bite. Instead, multiple dogs seize the prey simultaneously — flanks, belly, hindquarters, throat — and begin tearing while the animal is still on its feet. The prey is pulled apart rather than killed and then eaten. This method is brutal but efficient: a painted dog pack can reduce a wildebeest from a living animal to a consumed carcass in under fifteen minutes, a speed that minimizes the risk of losing the kill to lions or hyenas that are attracted by the commotion.

Against threats — lions, hyenas, humans — the pack employs the same coordination but in a defensive register. Individual dogs dart in, snap, and retreat, drawing the threat's attention while other dogs approach from the flanks and rear. The pack does not stand and fight; it harasses, circles, and retreats, maintaining a perimeter of darting, snapping attacks that exhausts and confuses the threat. Against a single lion, a large pack can drive it away through this harassment; against a pride, the pack will retreat but maintain contact, waiting for an opportunity to reclaim its kill.

## Attack Methods

### Coordinated Pursuit

The pack's signature hunting method. Multiple dogs pursue the prey at a sustained pace, rotating lead positions to maintain freshness. The pursuit is relentless — the prey cannot rest, cannot slow, cannot stop — and the pack's endurance exceeds that of any individual prey animal. The pursuit ends when the prey stumbles, slows, or is cut off by flanking dogs that have anticipated its direction of flight.

### Pack Tear-Down

Once the prey is slowed, multiple dogs seize it simultaneously. Two or three dogs grab the hindquarters and flanks, pulling the prey off-balance, while others target the belly and throat. The combined pulling force of multiple dogs prevents the prey from escaping, and the tearing begins immediately. Each dog works independently — ripping, pulling, shaking — but the collective effect is coordinated disassembly. The kill is fast precisely because it is multiple attacks happening at once.

### Harassment Swarm

Against larger threats, the pack uses its numbers and agility to harass from all directions. Individual dogs dash in, deliver a snapping bite, and retreat before the target can retaliate. The attacks come from behind, from the sides, and even from the front in rapid succession, with multiple dogs attacking simultaneously from different angles. The goal is not to kill but to exhaust, confuse, and drive away — and against most single opponents, including lions, this strategy is effective.

## Special Abilities

### Pack Endurance

The painted dog pack's cooperative running strategy allows it to sustain pursuit speeds over distances that exhaust any individual prey animal. By rotating lead runners, the pack effectively has unlimited stamina — fresh dogs replace tired ones at the front of the chase while the tired dogs recover at the back, and the cycle repeats until the prey falters. This rotational endurance means that flight — the primary defense of every savanna herbivore — simply does not work against a painted dog pack. You cannot outrun something that never tires.

### Cooperative Intelligence

The pack's hunting success rate of nearly eighty percent — the highest of any large predator — is a product of coordination rather than individual ability. Painted dogs execute flanking maneuvers, cut off escape routes, and anticipate prey movement through a communication system of whistles, body language, and positional awareness that functions faster than conscious decision-making. Individual dogs make tactical choices — accelerating, cutting wide, holding position — that only make sense in the context of what the rest of the pack is doing, suggesting a level of real-time collective decision-making that approaches the coordinated movement of a single organism.

### Democratic Decision-Making

The pack's pre-hunt rally ritual serves as a collective assessment of readiness. Researchers observe that the number of dogs that participate in the rally predicts whether the hunt proceeds — a quorum of enthusiasm is required before the pack commits. This mechanism prevents the pack from hunting when too few members are willing or able, conserving energy and reducing the risk of hunts that would fail. For adventurers, the sight of a painted dog pack rallying — the frantic greeting, the face-licking, the rising chorus of twittering calls — is a reliable indicator that a hunt is about to begin.

### Communal Care

The painted dog pack's investment in its members extends beyond the hunt. Injured dogs that cannot hunt are fed. Elderly dogs that have slowed are carried by the pack's collective effort. Pups are raised by the entire group. This communal ethic makes the pack resilient: the loss of a single member does not cripple the group, and the knowledge and experience of older members is preserved through the pack's collective care rather than lost to individual mortality. A painted dog pack is, in a meaningful sense, more than the sum of its members.

## Attributes

- **Strength:** 9-14 (1d6+8)

- **Endurance:** 11-16 (1d6+10)

- **Dexterity:** 12-17 (1d6+11)

- **Agility:** 12-17 (1d6+11)

- **Perception:** 12-17 (1d6+11)

- **Aura:** 8-13 (1d6+7)

- **Will:** 10-15 (1d6+9)

- **Reasoning:** 7-10 (1d4+6)

- **Creativity:** 6-9 (1d4+5)
