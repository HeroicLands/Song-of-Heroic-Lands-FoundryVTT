---
aliases:
  - Llama
  - being-llama
tags:
  - animal
  - image-needed
name:
  full: Llama
  aliases: []
description: "A domesticated highland camelid of K'ich'chik serving as pack animal, fiber and meat source, and guardian of smaller livestock in mountain caravans."
id: ZVyZDoJ0iDiQn5J9
img: icons/game-icons/delapouite/camel-head.svg
portrait: images/being/llama-portrait.webp
shortcode: llama
type: being
sohl:
  kbcat: animal
  archetype: 0
  attributes:
    str: 12
    end: 14
    dex: 9
    agl: 10
    per: 13
    aur: 8
    wil: 13
    rea: 8
    cre: 6
  attrRollFormula:
    str: 1d6+8
    end: 1d6+10
    dex: 1d4+6
    agl: 1d4+7
    per: 1d6+9
    aur: 1d4+5
    wil: 1d6+9
    rea: 1d4+5
    cre: 1d4+3
  body:
    structure:
      zones:
        - name: Head
          shortcode: headzone
          probWeight: 4
        - name: Forelegs
          shortcode: forelegszone
          probWeight: 2
        - name: Torso
          shortcode: torsozone
          probWeight: 8
        - name: Hindquarters
          shortcode: hindqtrzone
          probWeight: 6
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
      base: 1100
      calc: "1100"
    reachBase: 0
    bodyScaleBase: 1.06
    personalFatigue: enc + 5
  currentMoveMedium: terrestrial
  movementProfiles:
    - medium: terrestrial
      feetPerRound: 70
      leaguesPerWatch: 8
      encumbrance: floor(wt/4)
      strMod: -5 * floor((str - 10) / 2)
      factors:
        - scope: surface_cover
          key: dunes
          mode: add
          textValue: "0"
        - scope: hydrology
          key: shallow
          mode: add
          textValue: "0"
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
        masteryLevelBase: 44
    - shortcode: dge
      type: skill
      system:
        masteryLevelBase: 44
    - shortcode: shok
      type: skill
      system:
        masteryLevelBase: 33
    - name: Kick
      type: skill
      system:
        shortcode: kick
        subType: combattechnique
        masteryLevelBase: 50
        combatCategory: melee
        impairedByRoles:
          - locomotor
        strikeMode:
          type: melee
          shortcode: kick
          name: Kick
          minParts: 1
          assocSkillCode: null
          attack:
            disabled: false
            spread: 8
            modifier: 0
          impactBase:
            numDice: 1
            die: 6
            modifier: -2
            aspect: blunt
          lengthBase: 3
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
            spread: 4
            modifier: 0
          impactBase:
            numDice: 1
            die: 6
            modifier: 1
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

The caravan rounds the switchback above you, and you hear them before you see them — the soft, rhythmic clatter of small hooves on stone, the creak of pack frames, and a sound you cannot immediately identify: a low, musical humming, almost like distant singing. Then the first animal appears on the ledge and you see a creature of improbable elegance for a beast of burden. It is tall and slender, standing nearly six feet at the head, with a long, curved neck that gives it a haughty, aristocratic bearing. The coat is thick and luxuriant — waves of fine fiber in shades of brown, cream, and russet that ripple in the mountain wind. The face is extraordinary: a narrow, delicate head with enormous dark eyes fringed with lashes so long they seem theatrical, small pointed ears that swivel independently, and an expression of such serene superiority that you feel personally judged. The animal regards you for a long moment, then turns its head with studied indifference and continues along the trail with the calm, flat-footed certainty of something that has walked these mountains since before your civilization existed. Behind it come twenty more, each loaded with bundled goods, each moving with the same unhurried, aristocratic patience, and the humming sound resolves into their collective vocalization — a continuous, musical murmur that the K'ich'chik herders say is the animal talking to itself about the quality of the trail.

# Dossier {#dossier}

The Llama is the essential highland animal of [[doc-kchchkcntnnt|K'ich'chik Continent]] — a domesticated camelid that serves the mountain civilizations as the yak serves Tānvür and the reindeer serves Nordheim. Standing five to six feet at the head and weighing two hundred fifty to four hundred pounds, the llama is a pack animal, a fiber producer, a source of meat, leather, and dung fuel, and a guardian of smaller livestock. Llama caravans are the primary means of moving goods through the mountain passes that connect the highland city-states, and the llama-herding peoples of the high plateau are among the most essential economic classes in Ki'ichek society. The animal has been domesticated for so long that no truly wild populations remain — the llama's identity is inseparable from the civilization that bred it. A smaller, finer-coated relative provides luxury fiber prized by the priest-kings, but the common llama is the workhorse of the highlands: steady, sure-footed, capable of carrying loads at altitudes where horses cannot breathe, and possessed of a personality that ranges from placid cooperation to stubborn refusal to theatrical spite. Adventurers in highland K'ich'chik encounter llamas constantly — as pack animals on every mountain road, as fiber sources in every market, and as the bleating, humming, occasionally spitting backdrop to highland life.

## Presentation

The llama is a tall, slender animal with a body plan that combines the height of a small horse with the delicate build of a deer. The neck is long and curved, held erect in a posture that gives the animal its characteristic haughty appearance. The coat is the llama's most commercially valuable feature — dense, soft fiber that grows in a range of natural colors from white through cream, brown, rust, gray, and black, often in striking patterns. The fiber is finer than sheep's wool and warmer, and it takes dye beautifully. The head is narrow with a slightly convex profile, large expressive eyes with extraordinary lashes, and small, banana-shaped ears that curve inward. The split upper lip is prehensile and mobile, allowing the llama to select individual blades of grass and to manipulate objects with surprising dexterity. The legs are long and slender, ending in padded, two-toed feet that grip mountain terrain with quiet efficiency — unlike hooved animals, the llama's soft pads cause virtually no trail erosion, a fact that has allowed the highland trail network to survive centuries of continuous use. The tail is short and carried low.

## Key Behaviors

Llamas are herd animals with complex social hierarchies maintained through posture, vocalization, and — when necessary — spitting. The spit is the llama's most famous behavior: a precisely aimed projectile of regurgitated stomach contents, delivered with accuracy at ranges up to ten feet, used to establish dominance within the herd and to express displeasure with handlers. Experienced herders can read the warning signs — pinned ears, raised chin, gurgling sounds — and step aside. Llamas communicate constantly through a range of vocalizations: humming (contentment or mild concern), clucking (mother to cria), alarm calls (sharp, repeated braying), and the distinctive orgling sound made by males during mating. They are intelligent and learn quickly, recognizing individual handlers, remembering trail routes, and refusing loads they consider too heavy — a trait that makes them self-regulating pack animals. A llama that lies down and refuses to move is telling you it is overloaded, and no amount of persuasion will change its mind. They are also effective guardian animals, alerting to predators with alarm calls and actively confronting small threats — a behavior that makes them valuable protectors of smaller livestock.

## Combat Strategy

Llamas are not aggressive animals and will flee from serious threats. Their defensive behaviors are primarily deterrent: alarm calling, spitting, and chest-ramming against other llamas or small predators. A llama cornered or defending young will kick with the hind legs and bite, but this is a last resort. Their primary value in a dangerous situation is as an alarm system — the sharp, repeated alarm call carries well and alerts an entire caravan to danger. A panicked llama caravan can be dangerous simply through the chaos of bolting animals and scattered loads on narrow mountain trails.

## Attack Methods

### Defensive Kick

The llama strikes backward with its hind legs — a snap-kick delivered with the padded feet that can bruise but rarely causes serious injury. More startling than damaging.

### Spite Spit

A precisely aimed stream of partially digested stomach contents, delivered at close range. Not physically harmful but deeply unpleasant and surprisingly demoralizing. The smell lingers for hours. Experienced llamas can adjust trajectory for wind.

### Warning Bite

The llama bites when cornered — the teeth are designed for vegetation and do not cause deep wounds, but the bite is painful and delivered with conviction.

## Special Abilities

### Altitude Mastery

Like the yak, the llama thrives at elevations that render horses useless. Its blood carries oxygen efficiently at altitude, its padded feet grip rocky trails, and its efficient digestion extracts nutrition from sparse highland forage. A loaded llama at altitude moves with calm competence while horses gasp and stumble.

### Self-Regulating Load

A llama will refuse to move if overloaded — lying down and declining all persuasion until the load is reduced. This makes them uniquely self-protecting pack animals and prevents the overloading injuries common with horses and donkeys. An experienced herder knows that a llama's refusal is information, not stubbornness.

### Guardian Instinct

Llamas kept with smaller livestock — poultry, young camelids — will actively guard them against small predators, confronting foxes and wild dogs with alarm calls, chest-butts, and kicks. A single llama guardian can protect a flock that would otherwise require a human watchman.

## Attributes

- **Strength:** 9-14 (1d6+8) — Adequate pack animal; not built for heavy labor
- **Endurance:** 11-16 (1d6+10) — Excellent altitude and long-distance stamina
- **Dexterity:** 7-10 (1d4+6) — Adequate; prehensile lip shows surprising manipulation ability
- **Agility:** 8-11 (1d4+7) — Sure-footed on mountain trails; not fast on flat ground
- **Perception:** 10-15 (1d6+9) — Alert; good sentinel animal
- **Aura:** 6-9 (1d4+5) — Essential and valued, but not spiritually elevated
- **Will:** 10-15 (1d6+9) — Stubborn and opinionated; refuses unsafe or excessive tasks
- **Reasoning:** 6-9 (1d4+5) — Intelligent; learns routes, recognizes handlers, assesses loads
- **Creativity:** 4-7 (1d4+3) — Limited
