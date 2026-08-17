---
aliases:
    - Temple Monkey
    - Macaque
    - creature-macaque
tags:
    - animal
    - image-needed
name:
    full: Macaque
    aliases: []
description: "A stocky, intelligent medium-sized monkey of Vedyara thriving everywhere from temples to cities by stealing and extorting food from humans."
id: Wd9cQgzgGxgMomn7
img: icons/game-icons/lorc/monkey.svg
portrait: images/being/macaque-portrait.webp
shortcode: macaque
type: creature
package: sohl
sohl:
    kbcat: animal
    archetype: 0
    attributes:
        str: 8
        end: 9
        dex: 15
        agl: 15
        per: 14
        aur: 8
        wil: 10
        rea: 11
        cre: 9
    attrRollFormula:
        str: 1d4+5
        end: 1d4+6
        dex: 1d6+11
        agl: 1d6+11
        per: 1d6+10
        aur: 1d4+5
        wil: 1d4+7
        rea: 1d6+7
        cre: 1d4+6
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 1
                - name: Arms
                  shortcode: armszone
                  probWeight: 1
                - name: Torso
                  shortcode: torsozone
                  probWeight: 2
                - name: Legs
                  shortcode: legszone
                  probWeight: 2
            parts:
                - name: Head
                  shortcode: headpart
                  bodyZoneCode: headzone
                  roles:
                      - vital
                      - manipulator
                  canHoldItem: false
                  probWeight: 1
                - name: Right Arm
                  shortcode: rarmpart
                  bodyZoneCode: armszone
                  roles:
                      - manipulator
                  canHoldItem: true
                  probWeight: 2
                - name: Left Arm
                  shortcode: larmpart
                  bodyZoneCode: armszone
                  roles:
                      - manipulator
                  canHoldItem: true
                  probWeight: 2
                - name: Torso
                  shortcode: torsopart
                  bodyZoneCode: torsozone
                  roles:
                      - core
                  canHoldItem: false
                  probWeight: 4
                - name: Right Leg
                  shortcode: rlegpart
                  bodyZoneCode: legszone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 3
                - name: Left Leg
                  shortcode: llegpart
                  bodyZoneCode: legszone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 3
            locations:
                - name: Skull
                  shortcode: skullloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: low
                  amputability: none
                  shockValue: 5
                  probWeight: 500
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Left Eye
                  shortcode: leyeloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 15
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Right Eye
                  shortcode: reyeloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 15
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Nose
                  shortcode: noseloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 30
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Left Cheek
                  shortcode: lcheekloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 60
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Right Cheek
                  shortcode: rcheekloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 60
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Left Ear
                  shortcode: learloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 15
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Right Ear
                  shortcode: rearloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 15
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Mouth
                  shortcode: mouthloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 30
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Jaw
                  shortcode: jawloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 60
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 200
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Right Shoulder
                  shortcode: rshldloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 3
                  probWeight: 30
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Right Upper Arm
                  shortcode: rupaloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 30
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Right Elbow
                  shortcode: relbloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Right Forearm
                  shortcode: rfraloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 20
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Right Hand
                  shortcode: rhandloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Left Shoulder
                  shortcode: lshldloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 3
                  probWeight: 30
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Left Upper Arm
                  shortcode: lupaloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 30
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Left Elbow
                  shortcode: lelbloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Left Forearm
                  shortcode: lfraloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 20
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Left Hand
                  shortcode: lhandloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Thorax
                  shortcode: thrxloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 40
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Abdomen
                  shortcode: abdmnloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 40
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Pelvis
                  shortcode: plvisloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 20
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Right Thigh
                  shortcode: rthghloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: medium
                  amputability: medium
                  shockValue: 3
                  probWeight: 40
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Right Knee
                  shortcode: rkneeloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 15
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Right Calf
                  shortcode: rcalfloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 30
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Right Foot
                  shortcode: rfootloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 2
                  probWeight: 15
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Left Thigh
                  shortcode: lthghloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: medium
                  amputability: medium
                  shockValue: 3
                  probWeight: 40
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Left Knee
                  shortcode: lkneeloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 15
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Left Calf
                  shortcode: lcalfloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 30
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Left Foot
                  shortcode: lfootloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 2
                  probWeight: 15
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
        weight:
            base: 25
            calc: "25"
        reachBase: 0
        bodyScaleBase: 0.81
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 40
          leaguesPerWatch: 3
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors:
              - scope: surface_cover
                key: mixed_forest
                mode: add
                textValue: "0"
              - scope: surface_cover
                key: needleleaf_forest
                mode: add
                textValue: "0"
              - scope: surface_cover
                key: woodland
                mode: add
                textValue: "0"
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
              masteryLevelBase: 56
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 23
        - name: Canine Bite
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
                  name: Canine Bite
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 1
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: -1
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

The temple courtyard seems peaceful until you set down your pack. The first one appears on the wall above you — a stocky, gray-brown shape the size of a large cat, with a pink face, prominent brow ridges, and an expression of calculating assessment that you would normally associate with a merchant evaluating the contents of your wallet. It sits. It watches. You look away for three seconds, and when you look back there are six of them. One is already on your pack. Another is investigating the buckles of your saddlebag with fingers — actual fingers, with nails and knuckles and a thumb — that work the leather straps with a dexterity that suggests it has opened buckles before and expects to again. You shout. It looks at you. It does not run. It looks at you the way you would look at an unreasonable innkeeper — with irritation, not fear — and then it returns to the buckle. Behind you, the sound of your ration bag being opened confirms that the distraction has worked perfectly.

# Dossier {#dossier}

The Macaque is the common monkey of [[doc-vedyarargn|Vedyara Region]] — a stocky, medium-sized primate found in forests, temple complexes, cities, agricultural areas, and virtually every other habitat where food can be obtained, stolen, or extorted from humans. An adult macaque stands about twenty inches tall on all fours and weighs ten to twenty-five pounds, with males substantially larger than females. They are social, intelligent, aggressive, adaptable, and found in numbers that range from "several" to "infestation" depending on the local food supply and the tolerance of the human population.

Macaques are the monkeys of Vedyaran daily life — the ones that sit on temple walls, steal food from market stalls, raid granaries, snatch items from the hands of pilgrims, and infest the rooftops of every major city in the subcontinent. They are not the graceful, contemplative langurs of the forest canopy; they are the stocky, aggressive, street-smart primates that have discovered that human civilization is the richest ecological niche available and have exploited it with an enthusiasm that borders on the sociopathic. A troop of macaques in a Vedyaran city is simultaneously a tourist attraction, a public menace, a religious obligation, and an unsolvable problem.

Their relationship with Vedyaran culture is complicated. Monkeys in general hold sacred status in Vedyaran religion, and macaques in particular benefit from this protection at temple complexes where they are fed by priests and pilgrims. This protection has produced populations of temple macaques that are fearless, aggressive, and absolutely certain that every human they encounter exists primarily as a food delivery system. The religious prohibition against harming them means that even macaques that have become genuinely dangerous — large males that attack children, troops that destroy crops, individuals that have learned to bite humans who resist theft — cannot be killed or removed without navigating a thicket of religious, social, and legal complications.

Adventurers encounter macaques everywhere in Vedyara. They sit on walls and watch you. They follow you. They steal anything they can carry and some things they cannot. They are the background noise of Vedyaran settlement life, and underestimating them is the most common mistake newcomers make.

## Presentation

A compact, muscular primate built for climbing, fighting, and surviving in close proximity to things that want to hurt it. The body is stocky and robust, heavier-boned than a langur and more muscular than a comparable-sized dog. The coat is coarse and dense, typically gray-brown to olive-brown on the back and flanks, paler on the belly, with coloring that varies between populations and individuals. The face is hairless, pinkish to reddish-brown, with prominent brow ridges, deep-set eyes, and a short, slightly upturned muzzle that gives the animal a pugnacious, vaguely human expression. The cheek pouches — expandable skin sacs inside the cheeks — can hold a surprising volume of stolen food, allowing the macaque to grab and stuff rapidly before retreating to a safe location to eat at leisure.

The hands are the most unsettling feature. They are hands — not paws, not claws, but genuine primate hands with four fingers and an opposable thumb, complete with nails and fingerprints. They are dexterous enough to untie knots, open latches, unbuckle straps, unscrew caps, and pick pockets. The feet are equally dexterous, essentially serving as a second pair of hands, which gives the macaque a four-limbed manipulation capability that allows it to climb, hold, and manipulate objects simultaneously. The tail is medium-length and is used for balance rather than gripping.

The teeth are the feature that demands respect. The canine teeth of an adult male are long, sharp, and prominently displayed in the threat yawn — a wide-mouthed display of the open jaws that communicates aggressive intent. The canines are capable of inflicting deep puncture wounds, and a male macaque in full aggressive display, lips drawn back, canines bared, brow ridges lowered, is a genuinely intimidating sight that experienced Vedyarans treat with appropriate caution.

## Key Behaviors

Macaques live in troops of twenty to a hundred or more individuals, organized around a strict matrilineal dominance hierarchy — a female's rank is determined by her mother's rank, and this hierarchy is maintained through alliances, grooming relationships, and periodic violent enforcement. Males disperse from their birth troop at maturity and must fight their way into new troops, where they occupy a separate, more fluid male hierarchy. Dominant males have priority access to food and mates; subordinate males survive through alliances, opportunism, and knowing when to get out of the way.

Troop life is dominated by social politics — alliances formed and broken, favors traded, grudges maintained, and status constantly tested and negotiated. Macaques remember individual relationships across years, recognize faces (including human faces), and adjust their behavior based on their assessment of the individual they are dealing with. A macaque that has successfully stolen from you will remember you and try again. A macaque that you have chased away will remember you and avoid you — or, if you are alone and it has allies nearby, retaliate.

In urban and temple environments, macaques have developed a sophisticated understanding of human behavior. They know which humans feed them and which chase them. They know which market stalls are attended and which are momentarily unguarded. They know that humans are slower than macaques, cannot climb as well, and will usually give up pursuit after a short distance. They know that human food is better than wild food, that human containers can be opened, and that human attention can be misdirected. Some populations have developed what can only be described as a theft-and-ransom economy: they steal items (hats, spectacles, food, offerings) and wait until the owner produces a food bribe before dropping the stolen item. This behavior has been observed consistently enough to qualify as cultural learning rather than individual innovation.

Macaques are omnivorous and will eat virtually anything: fruit, grain, insects, small reptiles, bird eggs, shellfish (they crack them on rocks), human food of every description, and, given the opportunity, the leather from your belt, the wax from your candles, and the paper from your documents. Their dietary adaptability is one of the primary reasons they have been so successful in exploiting human environments.

## Combat Strategy

A single macaque confronted by a human will generally retreat — not out of fear but out of pragmatic assessment. A troop of macaques confronted by a single human will not retreat. Macaque aggression follows the mathematics of numbers: a macaque that is outnumbered is submissive; a macaque with allies is bold; a macaque in a large troop on home territory is capable of genuine violence.

Aggressive encounters with humans follow a predictable escalation. The macaque begins with a threat display: staring, brow-lowering, ground-slapping, and the open-mouthed yawn that shows the canines. If the human does not back down, the macaque may charge — a short, explosive rush accompanied by screaming that is designed to panic rather than injure. If the human still does not retreat, the macaque (especially if supported by troop-mates) will attack with genuine intent: lunging, biting, and scratching with a frenetic speed that makes defense difficult.

Macaque attacks on humans are rarely life-threatening but are always unpleasant. The bites are deep puncture wounds from the canines, the scratches are long and ragged from the nails, and both are prone to infection. A troop of macaques mobbing a single human — biting, scratching, pulling hair, screaming — is a psychologically overwhelming experience even if the physical injuries are individually minor. The cumulative effect of a dozen simultaneous attacks from creatures that can climb onto your back, shoulders, and head is panic, which is exactly the macaques' intent.

## Attack Methods

### Canine Bite

The macaque lunges and bites with its prominent canines, targeting hands, forearms, faces, and any exposed skin. The canines are sharp enough to puncture through to the bone in thin-fleshed areas like the hand, and the bite is delivered with a snapping speed that makes it difficult to block. Male macaques in particular can inflict wounds that require medical attention.

### Mob Attack

Multiple macaques attack simultaneously from different positions — ground level, walls, tree branches, rooftops — leaping onto the target, biting, scratching, and pulling. The combined weight of several macaques hanging from a human's body is substantial, and the disorientation of being attacked from multiple angles by shrieking primates with human-like hands is profoundly unsettling. The goal is to overwhelm through numbers and psychological shock rather than through individual damage.

### Theft-and-Flee

Not technically a combat attack, but the macaque's most practiced skill. The monkey darts in, seizes an item — from a hand, a belt, a pocket, a table — and bolts, accelerating to full speed instantly and heading for the nearest vertical surface where it knows humans cannot follow. The theft is executed with a dexterity and timing that professional pickpockets would envy.

## Special Abilities

### Urban Intelligence

Macaques are among the most intelligent animals in Vedyara, capable of observational learning, tool use, problem-solving, and social manipulation. They learn the routines of human settlements, they remember productive theft locations across seasons, and they teach their offspring through demonstration. A troop of macaques that has lived near humans for several generations has accumulated a body of cultural knowledge about human behavior, human containers, human food storage, and human vulnerabilities that makes them extraordinarily effective exploiters of the human environment.

### Four-Limbed Climbing

Macaques are supreme climbers, capable of ascending walls, trees, buildings, and any surface that offers holds for their grasping hands and feet. They move through urban environments three-dimensionally — running along walls, leaping between rooftops, ascending and descending vertical surfaces — at speeds that ground-bound humans cannot match. This climbing ability gives them access to escape routes, attack positions, and theft opportunities that are inaccessible to their human targets.

### Troop Memory

A macaque troop maintains a collective memory of individual humans. A person who feeds the troop will be recognized, approached, and solicited — potentially forever. A person who has attacked a troop member will be recognized, avoided, and potentially targeted for group aggression. This facial recognition extends to people wearing different clothes, carrying different equipment, or approaching from different directions. The troop knows who you are, and it remembers what you did.

### Sacred Nuisance

Like the peacock, macaques benefit from religious protection in Vedyaran settlements. Harming a temple monkey carries social and legal consequences, and communities that have lived with macaque troops for generations have developed elaborate accommodations — designated feeding areas, monkey-proofed storage, accepted loss ratios for market goods — that reflect the reality that the monkeys are simultaneously sacred, protected, and a constant, inescapable headache. For adventurers unfamiliar with Vedyaran customs, the discovery that the monkey that just stole their coin purse cannot be legally retaliated against is a formative cultural experience.

## Attributes

- **Strength:** 6-9 (1d4+5)

- **Endurance:** 7-10 (1d4+6)

- **Dexterity:** 12-17 (1d6+11)

- **Agility:** 12-17 (1d6+11)

- **Perception:** 11-16 (1d6+10)

- **Aura:** 6-9 (1d4+5)

- **Will:** 8-11 (1d4+7)

- **Reasoning:** 8-13 (1d6+7)

- **Creativity:** 7-10 (1d4+6)
