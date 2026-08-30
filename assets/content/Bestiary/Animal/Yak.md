---
aliases:
  - Yak
tags:
  - animal
  - image-needed
name:
  full: Yak
  aliases: []
description: "A massive, cold-adapted highland bovine providing milk, transport, and survival to mountain peoples amid the harsh peaks of Tānvür."
id: XoxshfojIWfr4kTc
img: icons/game-icons/delapouite/bison.svg
portrait: images/being/yak-portrait.webp
shortcode: yak
type: being
sohl:
  kbcat: animal
  archetype: 0
  attributes:
    str: 15
    end: 17
    dex: 9
    agl: 10
    per: 13
    aur: 8
    wil: 15
    rea: 7
    cre: 6
  attrRollFormula:
    str: 1d6+11
    end: 1d6+13
    dex: 1d4+6
    agl: 1d4+7
    per: 1d6+9
    aur: 1d4+5
    wil: 1d6+11
    rea: 1d4+4
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
            blunt: 4
            edged: 3
            piercing: 2
            fire: 4
        - name: Neck
          shortcode: neckloc
          bodyPartCode: headpart
          bleedingSusceptibility: high
          amputability: low
          shockValue: 5
          probWeight: 6
          protectionBase:
            blunt: 4
            edged: 3
            piercing: 2
            fire: 4
        - name: Left Foreleg
          shortcode: lforelegloc
          bodyPartCode: lforelegpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 2
          probWeight: 10
          protectionBase:
            blunt: 4
            edged: 3
            piercing: 2
            fire: 4
        - name: Right Foreleg
          shortcode: rforelegloc
          bodyPartCode: rforelegpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 2
          probWeight: 10
          protectionBase:
            blunt: 4
            edged: 3
            piercing: 2
            fire: 4
        - name: Flank
          shortcode: flkloc
          bodyPartCode: torsopart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 4
          probWeight: 6
          protectionBase:
            blunt: 4
            edged: 3
            piercing: 2
            fire: 4
        - name: Abdomen
          shortcode: abdloc
          bodyPartCode: torsopart
          bleedingSusceptibility: high
          amputability: none
          shockValue: 4
          probWeight: 4
          protectionBase:
            blunt: 4
            edged: 3
            piercing: 2
            fire: 4
        - name: Left Quarter
          shortcode: lqtrloc
          bodyPartCode: lhindlegpart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 3
          probWeight: 5
          protectionBase:
            blunt: 4
            edged: 3
            piercing: 2
            fire: 4
        - name: Left Hind Leg
          shortcode: lhindlegloc
          bodyPartCode: lhindlegpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 2
          probWeight: 4
          protectionBase:
            blunt: 4
            edged: 3
            piercing: 2
            fire: 4
        - name: Right Quarter
          shortcode: rqtrloc
          bodyPartCode: rhindlegpart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 3
          probWeight: 5
          protectionBase:
            blunt: 4
            edged: 3
            piercing: 2
            fire: 4
        - name: Right Hind Leg
          shortcode: rhindlegloc
          bodyPartCode: rhindlegpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 2
          probWeight: 4
          protectionBase:
            blunt: 4
            edged: 3
            piercing: 2
            fire: 4
        - name: Tail
          shortcode: tailloc
          bodyPartCode: tailpart
          bleedingSusceptibility: none
          amputability: high
          shockValue: 1
          probWeight: 10
          protectionBase:
            blunt: 4
            edged: 3
            piercing: 2
            fire: 4
    weight:
      base: 1500
      calc: "1500"
    reachBase: 0
    bodyScaleBase: 1.22
    personalFatigue: enc + 5
  currentMoveMedium: terrestrial
  movementProfiles:
    - medium: terrestrial
      feetPerRound: 60
      leaguesPerWatch: 4
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
        masteryLevelBase: 60
    - shortcode: sprt
      type: mysticalability
      system:
        masteryLevelBase: 33
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
        masteryLevelBase: 40
    - name: Horn Gore
      type: skill
      system:
        shortcode: gore
        subType: combattechnique
        masteryLevelBase: 57
        combatCategory: melee
        impairedByRoles:
          - manipulator
        strikeMode:
          type: melee
          shortcode: gore
          name: Horn Gore
          minParts: 1
          assocSkillCode: null
          attack:
            disabled: false
            spread: 4
            modifier: 0
          impactBase:
            numDice: 1
            die: 6
            modifier: 3
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
    - name: Trampling Charge
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
          name: Trampling Charge
          minParts: 1
          assocSkillCode: null
          attack:
            disabled: false
            spread: 8
            modifier: 0
          impactBase:
            numDice: 1
            die: 6
            modifier: 2
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

The trail narrows to nothing against the cliff face, and you are considering retreat when a dark shape rounds the switchback above you — a massive, shaggy creature moving with calm, flat-footed certainty along a ledge that would give a mountain goat pause. The animal is built like a fortress wrapped in hair. A skirt of coarse, dark brown fur hangs from its flanks almost to the ground, swaying with each step, while the humped shoulders rise above your head even as the beast picks its way along the precipice. The horns sweep outward and upward in smooth, dark curves, polished to a shine at the tips. Frost clings to the long hair around its muzzle and the vapor of its breathing forms thick clouds in the thin air. It regards you with the unshakeable patience of something that has lived its entire life at altitudes where you can barely draw breath, and it waits for you to move aside with the quiet assurance that it was here first and will be here long after you have gone.

# Dossier {#dossier}

The Yak is the essential mountain animal of the [[doc-empiretnvr|Tānvür]] highlands — a massive, cold-adapted bovine that serves the mountain peoples as the reindeer serves the Normen and the camel serves the Dunhari. Wild yaks can weigh over a thousand pounds, standing five to six feet at the shoulder with enormous curved horns. Domesticated yaks are somewhat smaller but no less critical: they provide milk, butter, cheese, wool, leather, dung for fuel, and draft power for plowing and transport at altitudes where no horse or ox can function. Yak caravans are the primary means of moving goods through the mountain passes that connect Tānvür's highland provinces, and the yak-herding peoples of the high plateau are among the most independent and ungovernable subjects of the empire. Wild yaks still roam the highest and most remote plateaus in herds that have never known human contact — these animals are larger, more aggressive, and significantly more dangerous than their domesticated cousins. Adventurers in highland Tānvür encounter yaks constantly: as pack animals on mountain roads, as wild herds on the high plateau, and as the economic foundation of every settlement above the tree line.

## Presentation

The yak is unmistakable — a massive bovine draped in a skirt of long, coarse hair that hangs from the belly and flanks nearly to the ground, giving the animal the appearance of a walking tent. The body beneath is heavily muscled, with a pronounced shoulder hump that stores fat reserves for lean seasons and gives the yak its characteristic front-heavy silhouette. The coat is dense and layered: a fine, soft undercoat of extraordinary insulating quality beneath the long, coarse outer guard hairs. Wild yaks are uniformly dark brown to black; domesticated animals have been bred in a range of colors including brown, red, piebald, and occasionally white. The horns are smooth and dark, curving outward and upward from the skull, and they are formidable weapons — a wild bull's horns can span three feet. The head is broad with a wide muzzle adapted for grazing on sparse highland vegetation. The hooves are broad and splayed, with a hard outer rim and softer center that provides grip on rock and ice. The tail is long and bushy, more like a horse's tail than a typical bovine's, and yak tail hair is a trade commodity in its own right — used for fly whisks, ceremonial standards, and decorative tassels throughout Tānvür.

## Key Behaviors

Yaks are herd animals that organize into groups ranging from small family bands to herds of several hundred on the open plateau. Wild herds are led by dominant bulls during the rut and by experienced cows during migration. They are grazers that feed on highland grasses, sedges, mosses, and lichens, and their digestive systems are adapted for the sparse, low-nutrient forage available above the tree line. Yaks are remarkably cold-hardy — they begin to show heat stress at temperatures that most animals consider mild, and they actively seek higher, colder ground during warm periods. They are sure-footed on terrain that would defeat any horse, picking their way along narrow mountain trails and across glacial moraines with calm competence. Wild bulls are aggressive and territorial during the rut, and cows defending calves will charge without hesitation. Domesticated yaks are generally placid but stubborn — they will refuse dangerous trails and cannot be forced along routes they consider unsafe, a trait their handlers have learned to respect as a reliable indicator of avalanche or rockfall danger.

## Combat Strategy

A wild yak's primary defense is the charge — a full-speed rush with lowered horns that delivers tremendous impact. The shoulder hump and heavy skull make the yak a natural battering ram, and the horns can gore deeply. Wild bulls are aggressive enough to charge predators, including snow leopards and wolves, and will stand ground rather than flee. A yak defending calves attacks with horns and hooves, stamping and goring with furious determination. Domesticated yaks are less aggressive but can still be dangerous when panicked or cornered — a loaded yak that bolts on a narrow mountain trail is a hazard to everything in its path.

## Attack Methods

### Horn Gore

The yak lowers its massive head and drives forward, using the curved horns to hook and penetrate. The charge is backed by the full mass of the animal and the power of the shoulder hump. A wild bull's charge can kill a wolf outright and can seriously injure or kill an armored human.

### Trampling Charge

At full charge, the yak simply runs through obstacles, using its mass and broad hooves to trample anything that doesn't move. The heavy body and sure-footed stride mean the yak rarely stumbles during a charge, even on uneven ground.

### Defensive Stamp

When cornered or defending calves, the yak rears slightly and stamps with its forelimbs, driving the broad hooves down with bone-cracking force. This is used at close range against opponents too near for a charging attack.

## Special Abilities

### Altitude Mastery

The yak thrives at elevations that render horses useless and leave humans gasping. Its blood carries oxygen more efficiently than any lowland bovine, its lungs are proportionally larger, and its thick coat and metabolic adaptations allow it to function normally in conditions of extreme cold and thin air. A yak at high altitude is as comfortable and capable as a horse on a lowland road.

### Mountain Sure-footedness

Yaks navigate narrow ledge trails, loose scree, and glacial ice with a calm confidence that borders on the supernatural. Their broad, split hooves grip surfaces that defeat most other animals of their size, and their low center of gravity prevents the stumbles that make horses dangerous on mountain trails.

### Cold Weather Fuel

In the treeless highlands, dried yak dung is the primary fuel for cooking and heating — a practical reality that makes yak herds essential for human survival above the tree line. A settlement without yaks has no fire, and a caravan without yaks has no warmth.

## Attributes

- **Strength:** 12-17 (1d6+11) — Powerful draft animal; wild bulls are formidable in combat
- **Endurance:** 14-19 (1d6+13) — Supreme altitude and cold tolerance; tireless caravan animal
- **Dexterity:** 7-10 (1d4+6) — Adequate; not built for fine movement
- **Agility:** 8-11 (1d4+7) — Sure-footed on mountain terrain despite bulk
- **Perception:** 10-15 (1d6+9) — Good senses; handlers trust their danger assessment
- **Aura:** 6-9 (1d4+5) — Respected as essential, but not spiritually elevated
- **Will:** 12-17 (1d6+11) — Stubborn and determined; will not be forced into danger
- **Reasoning:** 5-8 (1d4+4) — Intelligent enough to assess trail safety; learns handlers and routes
- **Creativity:** 4-7 (1d4+3) — Limited
