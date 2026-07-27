---
aliases:
    - Baboon
tags:
    - animal
    - image-needed
name:
    full: Baboon
    aliases: []
id: XVM9UHpPPciqBXFy
slug: baboon
img: icons/game-icons/lorc/monkey.svg
portrait: ""
type: creature
package: sohl
sohl:
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
            parts:
                - name: Head
                  shortcode: headpart
                  zones:
                      - vital
                  canHoldItem: false
                  heldItemId: null
                  locations:
                      - name: Skull
                        shortcode: skullloc
                        bleedingSusceptibility: low
                        amputability: none
                        shockValue: 5
                        probWeight: 500
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                      - name: Left Eye
                        shortcode: leyeloc
                        bleedingSusceptibility: medium
                        amputability: none
                        shockValue: 5
                        probWeight: 15
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                      - name: Right Eye
                        shortcode: reyeloc
                        bleedingSusceptibility: medium
                        amputability: none
                        shockValue: 5
                        probWeight: 15
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                      - name: Nose
                        shortcode: noseloc
                        bleedingSusceptibility: medium
                        amputability: none
                        shockValue: 5
                        probWeight: 30
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                      - name: Left Cheek
                        shortcode: lcheekloc
                        bleedingSusceptibility: medium
                        amputability: none
                        shockValue: 4
                        probWeight: 60
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                      - name: Right Cheek
                        shortcode: rcheekloc
                        bleedingSusceptibility: medium
                        amputability: none
                        shockValue: 4
                        probWeight: 60
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                      - name: Left Ear
                        shortcode: learloc
                        bleedingSusceptibility: medium
                        amputability: none
                        shockValue: 4
                        probWeight: 15
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                      - name: Right Ear
                        shortcode: rearloc
                        bleedingSusceptibility: medium
                        amputability: none
                        shockValue: 4
                        probWeight: 15
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                      - name: Mouth
                        shortcode: mouthloc
                        bleedingSusceptibility: medium
                        amputability: none
                        shockValue: 4
                        probWeight: 30
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                      - name: Jaw
                        shortcode: jawloc
                        bleedingSusceptibility: medium
                        amputability: none
                        shockValue: 4
                        probWeight: 60
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                      - name: Neck
                        shortcode: neckloc
                        bleedingSusceptibility: high
                        amputability: low
                        shockValue: 5
                        probWeight: 200
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                - name: Right Arm
                  shortcode: rarmpart
                  zones:
                      - manipulator
                  canHoldItem: true
                  heldItemId: null
                  locations:
                      - name: Right Shoulder
                        shortcode: rshldloc
                        bleedingSusceptibility: medium
                        amputability: none
                        shockValue: 3
                        probWeight: 30
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                      - name: Right Upper Arm
                        shortcode: rupaloc
                        bleedingSusceptibility: low
                        amputability: medium
                        shockValue: 1
                        probWeight: 30
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                      - name: Right Elbow
                        shortcode: relbloc
                        bleedingSusceptibility: low
                        amputability: medium
                        shockValue: 2
                        probWeight: 10
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                      - name: Right Forearm
                        shortcode: rfraloc
                        bleedingSusceptibility: low
                        amputability: medium
                        shockValue: 1
                        probWeight: 20
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                      - name: Right Hand
                        shortcode: rhandloc
                        bleedingSusceptibility: none
                        amputability: high
                        shockValue: 2
                        probWeight: 10
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                - name: Left Arm
                  shortcode: larmpart
                  zones:
                      - manipulator
                  canHoldItem: true
                  heldItemId: null
                  locations:
                      - name: Left Shoulder
                        shortcode: lshldloc
                        bleedingSusceptibility: medium
                        amputability: none
                        shockValue: 3
                        probWeight: 30
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                      - name: Left Upper Arm
                        shortcode: lupaloc
                        bleedingSusceptibility: low
                        amputability: medium
                        shockValue: 1
                        probWeight: 30
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                      - name: Left Elbow
                        shortcode: lelbloc
                        bleedingSusceptibility: low
                        amputability: medium
                        shockValue: 2
                        probWeight: 10
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                      - name: Left Forearm
                        shortcode: lfraloc
                        bleedingSusceptibility: low
                        amputability: medium
                        shockValue: 1
                        probWeight: 20
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                      - name: Left Hand
                        shortcode: lhandloc
                        bleedingSusceptibility: none
                        amputability: high
                        shockValue: 2
                        probWeight: 10
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                - name: Torso
                  shortcode: torsopart
                  zones:
                      - core
                  canHoldItem: false
                  heldItemId: null
                  locations:
                      - name: Thorax
                        shortcode: thrxloc
                        bleedingSusceptibility: medium
                        amputability: none
                        shockValue: 4
                        probWeight: 40
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                      - name: Abdomen
                        shortcode: abdmnloc
                        bleedingSusceptibility: high
                        amputability: none
                        shockValue: 4
                        probWeight: 40
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                      - name: Pelvis
                        shortcode: plvisloc
                        bleedingSusceptibility: medium
                        amputability: none
                        shockValue: 4
                        probWeight: 20
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                - name: Right Leg
                  shortcode: rlegpart
                  zones:
                      - locomotor
                  canHoldItem: false
                  heldItemId: null
                  locations:
                      - name: Right Thigh
                        shortcode: rthghloc
                        bleedingSusceptibility: medium
                        amputability: low
                        shockValue: 3
                        probWeight: 40
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                      - name: Right Knee
                        shortcode: rkneeloc
                        bleedingSusceptibility: low
                        amputability: medium
                        shockValue: 2
                        probWeight: 10
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                      - name: Right Calf
                        shortcode: rcalfloc
                        bleedingSusceptibility: low
                        amputability: medium
                        shockValue: 1
                        probWeight: 30
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                      - name: Right Foot
                        shortcode: rfootloc
                        bleedingSusceptibility: none
                        amputability: medium
                        shockValue: 2
                        probWeight: 20
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                - name: Left Leg
                  shortcode: llegpart
                  zones:
                      - locomotor
                  canHoldItem: false
                  heldItemId: null
                  locations:
                      - name: Left Thigh
                        shortcode: lthghloc
                        bleedingSusceptibility: medium
                        amputability: low
                        shockValue: 3
                        probWeight: 40
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                      - name: Left Knee
                        shortcode: lkneeloc
                        bleedingSusceptibility: low
                        amputability: medium
                        shockValue: 2
                        probWeight: 10
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                      - name: Left Calf
                        shortcode: lcalfloc
                        bleedingSusceptibility: low
                        amputability: medium
                        shockValue: 1
                        probWeight: 30
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                      - name: Left Foot
                        shortcode: lfootloc
                        bleedingSusceptibility: none
                        amputability: medium
                        shockValue: 2
                        probWeight: 20
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
            adjacent: []
        weight:
            base: 120
            calc: 120
        reachBase: 0
        bodyScaleBase: 1.0
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
    items: []
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
