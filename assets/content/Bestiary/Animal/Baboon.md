---
aliases:
  - Baboon
  - creature-baboon
tags:
  - animal
  - image-needed
name:
  full: Baboon
  aliases: []
description: "A powerfully built, highly social monkey of the Kheperi lowlands, dwelling in rocky escarpments and river margins near human settlements."
id: XVM9UHpPPciqBXFy
img: icons/game-icons/lorc/monkey.svg
portrait: images/being/baboon-portrait.webp
shortcode: baboon
type: creature
package: sohl
sohl:
  kbcat: animal
  archetype: 0
  attributes:
    str: 12
    end: 11
    dex: 14
    agl: 14
    per: 15
    aur: 9
    wil: 12
    rea: 11
    cre: 10
  attrRollFormula:
    str: 1d6+8
    end: 1d6+7
    dex: 1d6+10
    agl: 1d6+10
    per: 1d6+11
    aur: 1d4+6
    wil: 1d6+8
    rea: 1d6+7
    cre: 1d6+6
  body:
    structure:
      zones:
        - name: Head
          shortcode: headzone
          probWeight: 1
        - name: Arms
          shortcode: armszone
          probWeight: 4
        - name: Torso
          shortcode: torsozone
          probWeight: 4
        - name: Legs
          shortcode: legszone
          probWeight: 6
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
            blunt: 3
            edged: 2
            piercing: 1
            fire: 3
        - name: Left Eye
          shortcode: leyeloc
          bodyPartCode: headpart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 5
          probWeight: 15
          protectionBase:
            blunt: 3
            edged: 2
            piercing: 1
            fire: 3
        - name: Right Eye
          shortcode: reyeloc
          bodyPartCode: headpart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 5
          probWeight: 15
          protectionBase:
            blunt: 3
            edged: 2
            piercing: 1
            fire: 3
        - name: Nose
          shortcode: noseloc
          bodyPartCode: headpart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 5
          probWeight: 30
          protectionBase:
            blunt: 3
            edged: 2
            piercing: 1
            fire: 3
        - name: Left Cheek
          shortcode: lcheekloc
          bodyPartCode: headpart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 4
          probWeight: 60
          protectionBase:
            blunt: 3
            edged: 2
            piercing: 1
            fire: 3
        - name: Right Cheek
          shortcode: rcheekloc
          bodyPartCode: headpart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 4
          probWeight: 60
          protectionBase:
            blunt: 3
            edged: 2
            piercing: 1
            fire: 3
        - name: Left Ear
          shortcode: learloc
          bodyPartCode: headpart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 4
          probWeight: 15
          protectionBase:
            blunt: 3
            edged: 2
            piercing: 1
            fire: 3
        - name: Right Ear
          shortcode: rearloc
          bodyPartCode: headpart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 4
          probWeight: 15
          protectionBase:
            blunt: 3
            edged: 2
            piercing: 1
            fire: 3
        - name: Mouth
          shortcode: mouthloc
          bodyPartCode: headpart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 4
          probWeight: 30
          protectionBase:
            blunt: 3
            edged: 2
            piercing: 1
            fire: 3
        - name: Jaw
          shortcode: jawloc
          bodyPartCode: headpart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 4
          probWeight: 60
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
          probWeight: 200
          protectionBase:
            blunt: 3
            edged: 2
            piercing: 1
            fire: 3
        - name: Right Shoulder
          shortcode: rshldloc
          bodyPartCode: rarmpart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 3
          probWeight: 30
          protectionBase:
            blunt: 3
            edged: 2
            piercing: 1
            fire: 3
        - name: Right Upper Arm
          shortcode: rupaloc
          bodyPartCode: rarmpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 1
          probWeight: 30
          protectionBase:
            blunt: 3
            edged: 2
            piercing: 1
            fire: 3
        - name: Right Elbow
          shortcode: relbloc
          bodyPartCode: rarmpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 2
          probWeight: 10
          protectionBase:
            blunt: 3
            edged: 2
            piercing: 1
            fire: 3
        - name: Right Forearm
          shortcode: rfraloc
          bodyPartCode: rarmpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 1
          probWeight: 20
          protectionBase:
            blunt: 3
            edged: 2
            piercing: 1
            fire: 3
        - name: Right Hand
          shortcode: rhandloc
          bodyPartCode: rarmpart
          bleedingSusceptibility: none
          amputability: high
          shockValue: 2
          probWeight: 10
          protectionBase:
            blunt: 3
            edged: 2
            piercing: 1
            fire: 3
        - name: Left Shoulder
          shortcode: lshldloc
          bodyPartCode: larmpart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 3
          probWeight: 30
          protectionBase:
            blunt: 3
            edged: 2
            piercing: 1
            fire: 3
        - name: Left Upper Arm
          shortcode: lupaloc
          bodyPartCode: larmpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 1
          probWeight: 30
          protectionBase:
            blunt: 3
            edged: 2
            piercing: 1
            fire: 3
        - name: Left Elbow
          shortcode: lelbloc
          bodyPartCode: larmpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 2
          probWeight: 10
          protectionBase:
            blunt: 3
            edged: 2
            piercing: 1
            fire: 3
        - name: Left Forearm
          shortcode: lfraloc
          bodyPartCode: larmpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 1
          probWeight: 20
          protectionBase:
            blunt: 3
            edged: 2
            piercing: 1
            fire: 3
        - name: Left Hand
          shortcode: lhandloc
          bodyPartCode: larmpart
          bleedingSusceptibility: none
          amputability: high
          shockValue: 2
          probWeight: 10
          protectionBase:
            blunt: 3
            edged: 2
            piercing: 1
            fire: 3
        - name: Thorax
          shortcode: thrxloc
          bodyPartCode: torsopart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 4
          probWeight: 40
          protectionBase:
            blunt: 3
            edged: 2
            piercing: 1
            fire: 3
        - name: Abdomen
          shortcode: abdmnloc
          bodyPartCode: torsopart
          bleedingSusceptibility: high
          amputability: none
          shockValue: 4
          probWeight: 40
          protectionBase:
            blunt: 3
            edged: 2
            piercing: 1
            fire: 3
        - name: Pelvis
          shortcode: plvisloc
          bodyPartCode: torsopart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 4
          probWeight: 20
          protectionBase:
            blunt: 3
            edged: 2
            piercing: 1
            fire: 3
        - name: Right Thigh
          shortcode: rthghloc
          bodyPartCode: rlegpart
          bleedingSusceptibility: medium
          amputability: medium
          shockValue: 3
          probWeight: 40
          protectionBase:
            blunt: 3
            edged: 2
            piercing: 1
            fire: 3
        - name: Right Knee
          shortcode: rkneeloc
          bodyPartCode: rlegpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 2
          probWeight: 15
          protectionBase:
            blunt: 3
            edged: 2
            piercing: 1
            fire: 3
        - name: Right Calf
          shortcode: rcalfloc
          bodyPartCode: rlegpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 1
          probWeight: 30
          protectionBase:
            blunt: 3
            edged: 2
            piercing: 1
            fire: 3
        - name: Right Foot
          shortcode: rfootloc
          bodyPartCode: rlegpart
          bleedingSusceptibility: none
          amputability: high
          shockValue: 2
          probWeight: 15
          protectionBase:
            blunt: 3
            edged: 2
            piercing: 1
            fire: 3
        - name: Left Thigh
          shortcode: lthghloc
          bodyPartCode: llegpart
          bleedingSusceptibility: medium
          amputability: medium
          shockValue: 3
          probWeight: 40
          protectionBase:
            blunt: 3
            edged: 2
            piercing: 1
            fire: 3
        - name: Left Knee
          shortcode: lkneeloc
          bodyPartCode: llegpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 2
          probWeight: 15
          protectionBase:
            blunt: 3
            edged: 2
            piercing: 1
            fire: 3
        - name: Left Calf
          shortcode: lcalfloc
          bodyPartCode: llegpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 1
          probWeight: 30
          protectionBase:
            blunt: 3
            edged: 2
            piercing: 1
            fire: 3
        - name: Left Foot
          shortcode: lfootloc
          bodyPartCode: llegpart
          bleedingSusceptibility: none
          amputability: high
          shockValue: 2
          probWeight: 15
          protectionBase:
            blunt: 3
            edged: 2
            piercing: 1
            fire: 3
    weight:
      base: 120
      calc: "120"
    reachBase: 0
    bodyScaleBase: 1.06
    personalFatigue: enc + 5
  currentMoveMedium: terrestrial
  movementProfiles:
    - medium: terrestrial
      feetPerRound: 35
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
        masteryLevelBase: 70
    - shortcode: stlth
      type: skill
      system:
        masteryLevelBase: 65
    - shortcode: sprt
      type: mysticalability
      system:
        masteryLevelBase: 30
    - shortcode: init
      type: skill
      system:
        masteryLevelBase: 48
    - shortcode: dge
      type: skill
      system:
        masteryLevelBase: 56
    - shortcode: shok
      type: skill
      system:
        masteryLevelBase: 30
    - name: Canine Bite
      type: skill
      system:
        shortcode: bite
        subType: combattechnique
        masteryLevelBase: 68
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
            spread: 3
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
    - name: Mauling
      type: skill
      system:
        shortcode: punch
        subType: combattechnique
        masteryLevelBase: 68
        combatCategory: melee
        impairedByRoles:
          - manipulator
        strikeMode:
          type: melee
          shortcode: punch
          name: Mauling
          minParts: 1
          assocSkillCode: null
          attack:
            disabled: false
            spread: 3
            modifier: 0
          impactBase:
            numDice: 1
            die: 6
            modifier: 0
            aspect: blunt
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

The noise reaches you before the sight — a cacophony of barking screams that echoes off the sandstone cliff face like the sounds of a small war. Then you see them: dozens of gray-brown shapes moving across the rocks with an unsettling combination of animal speed and almost-human deliberation. The nearest one turns to face you and the resemblance to something familiar and something alien collides in your gut. The face is long and doglike, framed by a heavy mane of coarse fur, but the eyes — small, deep-set, and amber — hold an intelligence that no dog ever possessed. It pulls its lips back from canine teeth as long as your thumb, the pink gums bright against the dark face, and produces a sound that is half bark and half scream. The others take up the call. There are very many of them, and they are watching you with an attention that feels disturbingly like assessment.

# Dossier {#dossier}

The Baboon is the largest and most dangerous primate of the Kheperi lowlands — a powerfully built, highly social monkey found in rocky escarpments, river margins, and increasingly around the edges of human settlements along the Tameresh. An adult male stands two to three feet at the shoulder when on all fours and weighs fifty to a hundred pounds, with the largest dominant males occasionally exceeding this range. They live in troops of twenty to over a hundred individuals organized around a strict dominance hierarchy, and it is the troop — not the individual — that makes baboons genuinely dangerous. A lone baboon is a nuisance; a troop of angry baboons is a disaster. Baboons are sacred to Thōth in Kheperi religion, associated with wisdom, writing, and the judgment of souls, and troops that inhabit temple complexes are fed and protected by priests. This sacred status creates constant tension with farmers, whose crops and granaries suffer devastating raids from troops that have learned human agriculture represents an easy food source. Adventurers encounter baboons along cliff faces and rocky outcrops near rivers, in temple complexes where they are semi-domesticated, raiding agricultural areas, and occasionally in wilderness areas where troops have established territories across mountain passes or canyon systems.

## Presentation

A heavy-bodied primate with a distinctly doglike face — a long, projecting muzzle ending in a broad nose, deep-set amber eyes beneath heavy brow ridges, and powerful jaws equipped with canine teeth that rival those of a leopard in length. Males are substantially larger than females and carry a thick mane of coarse gray-brown fur across the shoulders and upper back, giving them a hulking, almost leonine silhouette. The body is muscular and compact, built for climbing and fighting rather than the graceful arboreal movement of smaller monkeys. The hands are large with strong, dexterous fingers capable of gripping, manipulating objects, and delivering surprisingly powerful strikes. The hindquarters feature distinctive bare callosities — patches of hardened, often brightly colored skin — that serve as social signals. The tail is medium-length and carried in a characteristic arch. The overall impression is of a creature that occupies an uncomfortable middle ground between animal and something more: too intelligent to dismiss, too aggressive to ignore, and too numerous to fight.

## Key Behaviors

Baboons are intensely social animals organized into troops governed by complex dominance hierarchies. Males compete for rank through displays, alliances, and violent confrontation, while females maintain their own parallel hierarchy that passes from mother to daughter. The dominant male controls access to food and mates but must constantly defend his position against younger challengers. Troops forage together, moving across their territory in organized groups with sentries posted on high ground to watch for predators. They are omnivorous and opportunistic — eating fruit, seeds, roots, insects, small mammals, birds and eggs, and anything they can steal from human settlements. Baboons are destructive raiders of crops and granaries, working cooperatively to distract guards while others steal food. They are capable of opening latches, pulling apart thatched roofing, and solving simple mechanical problems to access stored food. In temple complexes, baboons that have been fed by priests for generations become semi-tame but never truly domesticated — they tolerate human presence but remain capable of sudden, unpredictable aggression, particularly during mating season or when young are present. Baboons are vocal and expressive, communicating through a complex repertoire of barks, screams, grunts, and lip-smacking displays that convey aggression, submission, alarm, and social bonding.

## Combat Strategy

A baboon troop's response to threat follows a predictable escalation. Sentries give alarm calls; the troop gathers and faces the threat; dominant males move to the front and begin aggressive displays — jaw-gaping to show canines, barking, ground-slapping, and mock charges. If the threat does not retreat, multiple males will charge simultaneously, attempting to overwhelm through numbers and ferocity. Individual baboons fight with a combination of biting and grappling, using their powerful hands to seize and their long canines to deliver deep puncture wounds. Against predators, the troop acts as a coordinated defense — females and young retreat to high ground while males form a aggressive screen. Against humans, baboons that have learned to associate people with food may bypass threat displays entirely and simply mob individuals carrying food or guarding granaries. A baboon troop that has been attacked will remember the aggressor and respond to similar-looking humans with immediate, preemptive aggression — they do not forget, and they do not forgive easily.

## Attack Methods

### Canine Bite

The baboon's primary weapon. The canines of an adult male are two to three inches long — longer than those of most dogs — and are driven by powerful jaw muscles. The bite targets hands, arms, faces, and throats, and the puncture wounds are deep, ragged, and extremely prone to infection. A baboon in full aggressive mode will bite repeatedly, shaking its head to maximize tissue damage.

### Grappling and Mauling

Using its powerful hands and arms, the baboon seizes its target and pulls it close to deliver repeated bites. The grip strength is remarkable — a baboon that has seized a human arm or leg is extraordinarily difficult to dislodge. Against smaller opponents, a baboon may simply overpower and pin them, biting at the face and throat.

### Troop Swarm

The baboon's most dangerous tactic. Multiple individuals attack simultaneously from different directions, overwhelming the target's ability to defend. While individually a baboon can be driven off, facing five or ten simultaneously is a genuinely life-threatening situation. The psychological effect of being swarmed by screaming, biting primates with almost-human faces is devastating to morale.

## Special Abilities

### Primate Intelligence

Baboons are among the most intelligent non-human animals in the world. They use tools — rocks to crack nuts, sticks to extract insects from crevices — and they learn from observation. A baboon that watches another baboon solve a problem will attempt the same solution. They plan ambushes, coordinate raids, and remember individual humans who have threatened or fed them. This intelligence makes them unpredictable and adaptable opponents that cannot be dealt with using simple animal-management techniques.

### Cliff Dwellers

Baboons are superb climbers, using their powerful hands and feet to ascend sheer rock faces that would challenge experienced human climbers. They sleep on cliff ledges and in rock crevices inaccessible to most predators, and they use high ground as both refuge and vantage point. In rocky terrain, a baboon troop has an enormous tactical advantage, raining rocks and debris on threats below while remaining out of reach.

### Social Cohesion

The troop functions as a military unit in defense. Alarm calls are specific — different calls for aerial predators, ground predators, and snakes — and the troop responds to each with practiced coordination. Males will sacrifice themselves to defend females and young, charging leopards and even lions to buy time for the troop to reach safety. This cohesion makes a baboon troop far more dangerous than the sum of its individual members.

### Sacred Status

In Kheperi lands, baboons benefit from religious protection as creatures of Thōth. Temple troops are fed, sheltered, and defended by priests, and harming baboons near temple complexes can bring severe legal and social consequences. This protection has made temple baboons unusually bold around humans, and troops that have outgrown their temple territory often expand into surrounding agricultural land with an arrogance born of generations of immunity from human retaliation.

## Attributes

- **Strength:** 9-14 (1d6+8)

- **Endurance:** 8-13 (1d6+7)

- **Dexterity:** 11-16 (1d6+10)

- **Agility:** 11-16 (1d6+10)

- **Perception:** 12-17 (1d6+11)

- **Aura:** 7-10 (1d4+6)

- **Will:** 9-14 (1d6+8)

- **Reasoning:** 8-13 (1d6+7)

- **Creativity:** 7-12 (1d6+6)
