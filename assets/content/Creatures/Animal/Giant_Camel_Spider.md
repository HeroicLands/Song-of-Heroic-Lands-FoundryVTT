---
aliases:
    - Giant Camel Spider
tags:
    - animal
    - image-needed
name:
    full: Giant Camel Spider
    aliases: []
id: k5mpq1z2caMC2nJ0
slug: giant-camel-spider
img: icons/game-icons/carl-olsen/spider-alt.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 9
        end: 8
        dex: 16
        agl: 17
        per: 14
        aur: 6
        wil: 10
        rea: 6
        cre: 5
    attrRollFormula:
        str: 1d4+6
        end: 1d4+5
        dex: 1d6+12
        agl: 1d6+13
        per: 1d6+10
        aur: 1d4+3
        wil: 1d4+7
        rea: 1d4+3
        cre: 1d4+2
    body:
        structure:
            zones:
                - name: Cephalothorax
                  shortcode: cephzone
                  probWeight: 1
                - name: Abdomen
                  shortcode: abdomenzone
                  probWeight: 1
                - name: Legs
                  shortcode: legszone
                  probWeight: 1
            parts:
                - name: Cephalothorax
                  shortcode: cephpart
                  bodyZoneCode: cephzone
                  roles:
                      - vital
                      - manipulator
                  canHoldItem: false
                  probWeight: 10
                - name: Abdomen
                  shortcode: abdomenpart
                  bodyZoneCode: abdomenzone
                  roles:
                      - core
                  canHoldItem: false
                  probWeight: 10
                - name: Left Legs
                  shortcode: llegspart
                  bodyZoneCode: legszone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 5
                - name: Right Legs
                  shortcode: rlegspart
                  bodyZoneCode: legszone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 5
            locations:
                - name: Cephalothorax
                  shortcode: cephloc
                  bodyPartCode: cephpart
                  bleedingSusceptibility: low
                  amputability: none
                  shockValue: 4
                  probWeight: 7
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Fangs
                  shortcode: fangloc
                  bodyPartCode: cephpart
                  bleedingSusceptibility: low
                  amputability: high
                  shockValue: 2
                  probWeight: 3
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: abdomenpart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 10
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Left Legs
                  shortcode: llegsloc
                  bodyPartCode: llegspart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Right Legs
                  shortcode: rlegsloc
                  bodyPartCode: rlegspart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
        weight:
            base: 1
            calc: "1"
        reachBase: 0
        bodyScaleBase: 0.82
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 40
          leaguesPerWatch: 2
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
              masteryLevelBase: 65
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 24
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 32
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 60
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 23
        - name: Shearing Jaws
          type: skill
          system:
              shortcode: mandible
              subType: combattechnique
              masteryLevelBase: 66
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: mandible
                  name: Shearing Jaws
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 1
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 0
                      aspect: edged
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
        - name: Grasping Rush
          type: skill
          system:
              shortcode: grab
              subType: combattechnique
              masteryLevelBase: 71
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: grab
                  name: Grasping Rush
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 2
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 9
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

You hear it before you see it — a wet, rhythmic wheezing, like bellows worked too fast, coming from somewhere beyond the firelight. Then a dry rattling, the sound of bone scraped against bone, rising in pitch until it buzzes like a cicada made of knives. Then it is in the light and every rational thought in your head is replaced by a single, shrieking impulse to get away from it. It is the size of a fox, pale as old parchment, and it is running at you. Not scuttling. Running — low and flat and horrifyingly fast, its legs a blur of jointed motion, its body close enough to the ground that it seems to flow across the sand like something poured. Two pale limbs are held up off the ground ahead of it, not running but reaching, groping the air with a blind, questing urgency that makes the approach look less like a charge and more like something desperately trying to touch you. The front of it is all jaw — a pair of vertical shears the color of dark amber, each as long as a man's finger, snapping open and shut with an audible clack-clack-clack that continues even as it moves. In the firelight you can see through the joints of its legs, the chitin going thin and amber-translucent, and something dark pulses inside. The arrangement of its eye cluster and those working, gaping chelicerae form something your brain insists is a face — a small, stupid, hungry face wearing an expression of frantic, mindless want. It does not slow down.

# Dossier {#dossier}

The Giant Camel Spider is a monstrous desert arachnid of the order Solifugae — not a true spider but something older and in many ways worse. Enlarged to the size of a fox or small dog, with a body length of sixteen to twenty-two inches and a leg span of three to four feet, it weighs five to eight kilograms of pale chitin, bristle, and jaw muscle. It lacks the venom of a spider and the silk of a web-spinner, compensating with raw speed, crushing mandibles, and an aggressive temperament that borders on the deranged. Giant camel spiders are solitary, territorial predators and scavengers found in the arid wastes of [[Dunhara_Region]] and the [[Khazryn_Desert_Region]] — in rocky badlands, beneath sand-scoured ruins, in the shade of desert escarpments, and, inevitably, at the margins of human camps where warmth, shade, and food scraps draw them like a curse. They are the most feared small predator of the deep desert — not because they are the most lethal (a cobra will kill you faster) but because they are the most _present_, the most aggressive, and the most viscerally horrifying thing that will ever sprint at you out of the darkness.

Every Dunharan nomad knows the giant camel spider. They check their boots before dawn. They shake out blankets before unrolling them. They know the sound of the chelicerae rattling in threat display, and they know that a campsite with exposed food scraps will draw them from the surrounding dark like flies to carrion. Caravan guards swap stories about them the way soldiers swap stories about bad officers — with a mixture of contempt, resignation, and genuine unease. The creatures are too common to be legendary and too horrible to be mundane.

## Presentation

The body is low, flat, and segmented into a bulbous opisthosoma (abdomen) and a compact prosoma (head-thorax), connected by a narrow waist. The entire animal is covered in pale, coarse bristles — stiff and almost quill-like, ranging from sandy tan to dusty cream, serving as sensory organs that detect vibration and air movement across the body's surface. In bright light, the bristles give the creature a fuzzy, almost soft appearance that is immediately dispelled by any closer inspection. The chitin beneath is pale yellowish to bone-white, and at the leg joints and thinner body sections it becomes translucent — in firelight or strong sun, you can see the dark hemolymph pulsing through the limbs, giving the legs an unsettling amber, backlit quality.

The creature has ten limbs. Eight are walking legs — long, angular, and twitchingly precise, each ending in a small claw that provides purchase on rock and sand. The first pair of "legs," however, are not used for walking at all. These are the pedipalps — held up off the ground and extended ahead of the body like a blind man's hands, waving and groping the air constantly, sensing vibration, air chemistry, and the body heat of nearby creatures. At rest, the pedipalps fold back; in motion, they reach forward with a questing urgency that makes the creature look like it is trying to grab whatever it is running toward. This detail, more than any other, is what makes people scream.

The head is dominated by the chelicerae — a pair of massive, vertically oriented jaw structures that together account for nearly a quarter of the creature's total body length. Each chelicera is a two-part pincer that works like a pair of shears or wire cutters, opening and closing with a snapping, scissoring motion. They move independently of each other — one gripping while the other saws, one holding while the other tears — which looks deeply, fundamentally wrong, as though two separate animals are fighting over the same piece of food. The chelicerae are dark amber to brown, harder and darker than the body chitin, and at this size they can crush small bones, shear through leather, and sever a human finger. They click and clack constantly, even at rest, working against each other with a fidgeting restlessness that never quite stops.

The eyes are small — two primary eyes set on a raised tubercle at the front of the prosoma, with additional lateral eye clusters that detect light and shadow but provide little detail. Despite this near-blindness, the creature navigates and hunts with disturbing effectiveness through its other senses. The arrangement of the eye tubercle above the gaping, working chelicerae creates an unavoidable pareidolia — the thing has a face. A small, pale, stupid face with brow-like eyes and a gaping, grinding mouth, wearing an expression of vacant, insatiable hunger. At dog-size, this almost-face is impossible to ignore and deeply, irrationally unsettling.

The creature breathes through spiracles — small openings along the abdomen connected to an internal tracheal system. At this size, the breathing is audible: a wet, rasping wheeze that accelerates with exertion. After a sprint, the abdomen pumps visibly, the segments expanding and contracting as the respiratory system struggles to cool the overheated body, and the wheezing becomes frantic, almost asthmatic. This sound — heard from the darkness beyond a campfire — is one of the signature nightmares of desert travel.

## Key Behaviors

Giant camel spiders are solitary, territorial, and intensely food-driven. They are most active in the cooler hours — late evening, night, and early morning — retreating to shade, burrows, or rock crevices during the worst of the midday heat. They do not spin webs or construct elaborate lairs, instead sheltering beneath rocks, in abandoned animal burrows, in the gaps beneath fallen masonry, and — to the eternal misery of desert travelers — inside boots, packs, bedrolls, and any other dark, enclosed space that offers protection from the sun.

They hunt by speed and aggression rather than ambush. A giant camel spider detects prey primarily through ground vibration (sensed through the leg bristles and pedipalps) and air movement, supplemented by its rudimentary vision. Once prey is detected, the spider launches into a flat-out sprint, closing distance with an acceleration that seems impossible for something so low and awkward-looking. The kill is achieved through the chelicerae — the spider seizes the prey, braces with its pedipalps, and begins shearing and crushing with the jaws in a rapid, mechanical sawing motion. The sound of a giant camel spider feeding — an audible crunching and tearing — carries further than anyone would prefer.

They are omnivorous opportunists: rodents, lizards, birds, large insects, scorpions, snakes, carrion, and food scraps stolen from camps. They are bold scavengers, approaching larger creatures and human camps with a confidence that is less bravery than apparent inability to assess risk. A giant camel spider will investigate anything that smells like food, including occupied tents, active cooking fires, and sleeping humans. This boldness is compounded by the shade-seeking behavior that defines the species — in the heat of day, they sprint toward the nearest shadow, and in the open desert, the nearest shadow is often a human being.

They are also capable of stridulation — rubbing the chelicerae together to produce a dry, buzzing rattle that serves as a territorial warning and threat display. At this size, the sound is loud enough to hear across a campsite: a harsh, rasping buzz that rises in pitch and intensity as the creature becomes more agitated. Experienced desert travelers recognize this sound instantly and react accordingly, because a stridulating giant camel spider is one that has decided it is not leaving.

## Combat Strategy

A giant camel spider does not think in terms of combat — it operates on a simple continuum between "food" and "too dangerous." Against prey-sized targets (rodents, lizards, small birds), it simply runs them down and begins eating. Against larger animals or humans, its behavior depends on context. A hungry spider encountering a sleeping or wounded human will approach with increasing boldness, testing with the pedipalps before committing the chelicerae. A startled spider that feels cornered will stridulate, display the open chelicerae, and then charge directly if the threat does not retreat.

The attack itself is a violent rush — the spider closes distance in a flat sprint, the pedipalps seizing and bracing against the target while the chelicerae go to work on whatever flesh is accessible. It does not deliver a single decisive strike; instead, it inflicts a rapid series of savage bites, each one a shearing, sawing motion that tears away tissue and deepens the wound. The spider targets extremities — feet, ankles, hands, and the faces of prone targets — and once it has secured a grip with its pedipalps, it is surprisingly difficult to dislodge.

A giant camel spider's greatest liability in combat is its endurance. The tracheal respiratory system that powers its explosive speed also limits its staying power — after a sprint or sustained exertion, the creature overheats rapidly and must pause, abdomen pumping, wheezing audibly, until its body temperature drops. A fight that lasts more than thirty seconds will see the spider slowing, its attacks becoming less coordinated, its movements increasingly sluggish. Driving it off during this exhaustion window is far easier than facing the initial rush. However, a wounded or cornered spider becomes more frenzied, not less, and may fight to the death rather than disengage — the survival instinct that should tell it to flee seems to malfunction under extreme stress, replaced by a mindless, escalating aggression.

## Attack Methods

### Shearing Jaws

The giant camel spider's primary weapon. The chelicerae close on exposed flesh with a scissoring motion that crushes, tears, and saws simultaneously. The jaws are not venomous, but the physical damage is severe — ragged, bleeding wounds with torn tissue and, in the worst cases, severed digits or sheared muscle. The spider does not bite once and release; it worries the wound with repeated shearing motions, each one deepening and widening the damage. The chelicerae work independently, one gripping while the other saws, producing a mechanical efficiency that is as effective as it is revolting to watch.

### Grasping Rush

The spider's attack begins with a flat-out sprint that closes distance before the target can properly react. At contact, the pedipalps — those two reaching, groping forelimbs — seize the target and brace, locking the spider against the victim's body with a grip that is surprisingly strong for the creature's size. This is less a refined grapple than a violent collision followed by frantic but effective restraint, holding position long enough for the chelicerae to find exposed flesh and begin their work.

## Special Abilities

### Blinding Speed

The giant camel spider is among the fastest terrestrial arthropods in the world. From a standing start, it accelerates to a flat sprint that covers open ground faster than a running human, maintaining this speed in short bursts of fifteen to twenty yards. The acceleration is what makes it truly dangerous — targets that hesitate for even a moment find the creature on them almost instantly. The speed is fueled by the same tracheal system that limits endurance: the spider burns hot and fast, trading staying power for an explosive first rush that overwhelms prey before it can react.

### Shade-Seeker

The creature instinctively darts toward shadow and cooler ground. In practice, this often means it runs directly toward larger creatures, wagons, tents, or walls. Observers frequently mistake this for deliberate pursuit, and in many cases the distinction is academically interesting and tactically useless.

### Wound Fouling

The chelicerae of a giant camel spider harbor bacteria from carrion feeding, and the ragged, torn nature of the wounds they inflict creates ideal conditions for infection. Bite wounds that are not cleaned and treated promptly will fester within a day — the flesh around the wound reddens, swells, and begins to suppurate, and without intervention from a physician or healer, even a minor bite can develop into a spreading infection that threatens the limb. In the desert, where clean water is scarce and medical supplies are limited, this secondary danger is arguably more lethal than the initial wound.

### Tremorsense

The giant camel spider perceives its environment primarily through vibration. The bristles covering its body and the sensitive pedipalps detect the footsteps of approaching creatures through the ground, the movement of air from breathing or motion, and the faint thermal signatures of warm-blooded animals at close range. This combination of senses makes the spider effective in total darkness and extremely difficult to approach without detection. It cannot be fooled by visual camouflage — it finds you by the vibrations you make simply by existing.

### Stridulation

When threatened or defending territory, the spider rubs its chelicerae together to produce a harsh, buzzing rattle — a sound that rises in pitch and volume as agitation increases. At the size of a giant camel spider, this stridulation is clearly audible at twenty or thirty paces: a dry, angry buzz that sounds like a large insect amplified to nightmare proportions. The display is accompanied by the spider rearing slightly, spreading its pedipalps wide, and gaping the chelicerae to their full extension — a threat posture that communicates both willingness and capability to cause harm. Experienced desert travelers know that a stridulating spider is one that has committed to confrontation and should be dealt with immediately, before the charge follows the warning.

## Attributes

- **Strength:** 7-10 (1d4+6)

- **Endurance:** 6-9 (1d4+5)

- **Dexterity:** 13-18 (1d6+12)

- **Agility:** 14-19 (1d6+13)

- **Perception:** 11-16 (1d6+10)

- **Aura:** 4-7 (1d4+3)

- **Will:** 8-11 (1d4+7)

- **Reasoning:** 4-7 (1d4+3)

- **Creativity:** 3-6 (1d4+2)

## Variant: Deep Desert Patriarch

Dunharan caravan guards speak of something worse in the deep desert — in the cave systems beneath the great mesas, in the ruins of buried cities, in the dark places where no sunlight reaches and the temperature stays cool enough for an arachnid to grow far beyond the limits the surface heat imposes. They call them _shab-gozar_, "night-crossers," and the stories describe camel spiders the size of large dogs or small ponies — fifteen to twenty-five kilograms of chitinous horror that have fed for years on bats, cave rodents, and whatever wanders into their territory. The oldest specimens are said to be pale to the point of translucency, their chitin thinned by decades of growth in total darkness, the internal organs visible as dark shapes shifting beneath the surface.

Whether these accounts are exaggeration, fever-dream, or sober truth, a deep desert patriarch would represent a creature of significantly greater physical capability: Strength 1d6+9, Endurance 1d6+8, with Dexterity and Agility comparable to the surface variant but supplemented by a Perception boosted to 1d6+12 as the creature's tremorsense refines across years of hunting in lightless caves. The chelicerae of such a specimen could crush a human forearm, and the grasping power of the enlarged pedipalps would make escape from its grip a matter of genuine difficulty. Intact chelicerae from a confirmed patriarch are prized by Dunharan armorers, who mount and reinforce them into shearing weapons and grisly trophy-tools, and by alchemists who grind the mandible material for use in compounds associated with heat, desiccation, and endurance.

No sensible person goes looking for one. The few who claim to have killed a patriarch display the chelicerae with the quiet pride of people who know exactly how close they came to not coming back.
