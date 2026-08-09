---
aliases:
    - Tiger
tags:
    - animal
    - image-needed
name:
    full: Tiger
    aliases: []
id: j5rGiDYFcb0LAlmN
slug: tiger
img: icons/game-icons/delapouite/tiger.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 20
        end: 16
        dex: 15
        agl: 15
        per: 15
        aur: 14
        wil: 15
        rea: 9
        cre: 8
    attrRollFormula:
        str: 1d6+16
        end: 1d6+12
        dex: 1d6+11
        agl: 1d6+11
        per: 1d6+11
        aur: 1d6+10
        wil: 1d6+11
        rea: 1d4+6
        cre: 1d4+5
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 2
                - name: Forelegs
                  shortcode: forelegszone
                  probWeight: 2
                - name: Torso
                  shortcode: torsozone
                  probWeight: 4
                - name: Hindquarters
                  shortcode: hindqtrzone
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
                - name: Left Foreleg
                  shortcode: lforelegpart
                  bodyZoneCode: forelegszone
                  roles: &a1
                      - locomotor
                      - manipulator
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
            base: 150
            calc: "150"
        reachBase: 0
        bodyScaleBase: 1.82
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 80
          leaguesPerWatch: 4
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
    defaultCombatGroup: null
    items:
        - name: Throat Crush
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
                  name: Throat Crush
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 2
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 5
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
        - name: Forepaw Strike
          type: skill
          system:
              shortcode: claw
              subType: combattechnique
              masteryLevelBase: 70
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: claw
                  name: Forepaw Strike
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 4
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 8
                      modifier: 4
                      aspect: edged
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

The jungle goes silent. Not quiet — silent. The birds stop. The insects stop. The monkeys that have been screaming in the canopy for the last hour go mute as though someone has cut their throats. The silence is so sudden and so total that it has a physical quality, a pressure against the eardrums, and in that silence you understand with the ancient, wordless part of your brain that something is here that was not here a moment ago. You scan the undergrowth — the dappled light, the interlocking layers of green and gold, the vertical bars of bamboo and shadow — and you see nothing. Then you see it, and you realize you have been looking at it the entire time. The stripes. The impossible, vertical stripes that break the animal's outline into fragments of light and dark that the eye refuses to assemble into a single shape. It is enormous — longer than a man is tall, heavier than a horse, a block of muscle wrapped in orange and black that lies in the undergrowth ten paces away with the absolute stillness of something that has already decided. The eyes find you. They are amber, steady, and they hold none of the things you would prefer to see — no hesitation, no curiosity, no uncertainty. There is only the flat, calm assessment of a predator that has never in its life encountered anything it needed to fear.

# Dossier {#dossier}

The Tiger is the supreme predator of [[Vedyara_Region]] — the largest cat in the world, a solitary ambush hunter of jungle, tall grass, river margin, and mountain forest that sits at the absolute apex of every food chain it inhabits. An adult male stands three to three and a half feet at the shoulder, measures nine to twelve feet from nose to tail tip, and weighs four hundred to six hundred and sixty pounds, with exceptional specimens exceeding this range. Females are smaller but still substantially larger than a male lion. The tiger is heavier, stronger, and more powerfully built than any other cat, combining the leopard's ambush tactics with the lion's killing power, amplified to a scale that makes it the single most dangerous terrestrial predator adventurers can encounter.

In Vedyaran culture, the tiger is woven into the fabric of existence. It is sacred to [[Varnaka|Rásikara]] — the destroyer and transformer — and its image adorns temple walls, warrior shields, and the thrones of kings. The tiger represents divine wrath, the untameable wildness at the heart of nature, and the inescapable consequence of transgression. To kill a tiger is either a supreme act of heroism or a terrible sacrilege, depending on the circumstances and the priesthood consulted. To be killed by a tiger is, in certain theological traditions, a form of divine selection. None of this theology provides much comfort when you hear the silence descend on the forest around you.

Tigers are simultaneously revered and feared in every Vedyaran settlement that borders their territory. Villages at the jungle's edge live with the constant awareness that the greatest predator in the world is hunting within earshot. Livestock losses are expected and endured. Human kills — and tigers do kill and eat humans — are met with a complicated mixture of grief, terror, and religious resignation. The rare tiger that develops a preference for human prey becomes a man-eater, and a man-eater is the most feared phenomenon in Vedyaran life: a creature of supernatural intelligence and boldness that takes people from their homes, their fields, and their paths with an efficiency that borders on the purposeful.

Adventurers encounter tigers in the forests, grasslands, and river margins of Vedyara — or rather, tigers encounter them. You do not find a tiger in the jungle. The tiger finds you, decides whether you are prey, threat, or irrelevance, and acts accordingly. If you see a tiger, it has decided to let you see it. If you do not see a tiger, that does not mean one is not there.

## Presentation

The tiger is immediately recognizable and utterly unlike any other animal. The body is massive — long, deep-chested, and carried on proportionally shorter, thicker legs than a lion's, giving the tiger a lower, heavier silhouette that suggests irresistible forward momentum. The forelimbs are enormously powerful, with broad paws the size of dinner plates armed with retractable claws that are thick, curved, and capable of hooking and holding prey while the jaws do their work. The head is broad and round, wider than a lion's, with powerful jaw muscles that give the skull a heavy, square appearance. The canine teeth are the longest of any living cat — three to four inches in length — and the jaw force behind them can crush the vertebrae of animals twice the tiger's own weight.

The coat is the tiger's signature: a base of rich orange-gold to tawny, overlaid with vertical black stripes that vary in width, spacing, and pattern — no two tigers share identical striping, and experienced Vedyaran trackers identify individuals by their markings. The belly and inner legs are white or cream, and the face carries a complex pattern of stripes, white patches, and black accents around the eyes, cheeks, and muzzle that creates a mask of extraordinary expressiveness. The ears are rounded, black-backed with a conspicuous white spot — a "false eye" that may deter attacks from behind. The tail is long, thick, and ringed with dark bands.

The striping serves as camouflage of devastating effectiveness. In the dappled light of the forest — where sun and shadow create vertical bars through bamboo, grass, and tree trunks — the tiger's stripes dissolve the animal's outline into incoherent fragments. A six-hundred-pound predator can be invisible at twenty feet. This camouflage is not merely effective; it is psychologically disturbing. The human eye recognizes movement and shape, and the tiger's stripes defeat both — the animal can lie in plain sight, and the eye slides over it without assembling the fragments into the shape of the thing that is about to kill you.

The overall impression — when you finally see it — is of weight, power, and a coiled, compressed energy that is not potential but imminent. A lion looks regal. A leopard looks dangerous. A tiger looks inevitable.

## Key Behaviors

Tigers are strictly solitary, the most asocial of all great cats. An adult male maintains a territory of twenty to forty square miles of prime habitat — a territory he defends against rival males with vocal displays, scent marking, and, when necessary, combat that can be lethal to both participants. Female territories are smaller and overlap with the resident male's range. Tigers are primarily crepuscular and nocturnal, most active at dawn, dusk, and through the night, resting during the heat of the day in dense cover near water. They are powerful swimmers and actively seek water — for cooling, for hunting, and apparently for pleasure. A tiger will wade, swim, and lie submerged in rivers, pools, and marshes with a frequency and enthusiasm that distinguishes it from all other cats.

The hunting method is ambush — patient, precise, and devastating. A tiger locates prey through hearing and scent (its vision in darkness is excellent but it hunts more by ear than eye in dense cover), then begins a stalk that may last an hour or more, closing the distance through cover until it reaches within thirty to fifty feet. The final charge is an explosive, short-range rush — a burst of speed over ten to twenty yards that brings the tiger crashing into the prey before it can react. The kill is achieved through a throat bite that suffocates, or a spine bite to the back of the neck that severs the central nervous system. Against large prey — deer, gaur, wild boar — the tiger uses its forepaw to hook and pull the animal down before delivering the killing bite. Against very large prey — young elephants, rhinoceros calves — the tiger targets the hindquarters, hamstringing the animal with its claws before closing for the kill.

Tigers eat prodigiously after a kill — sixty to eighty pounds of meat in a sitting — and will remain near a large carcass for several days, returning to feed until it is consumed. They drag kills to secluded locations, and a tiger's ability to move carcasses exceeding a thousand pounds — dragging a dead gaur or buffalo through dense jungle — is a testament to the raw physical power the animal possesses.

A tiger that has begun hunting humans represents a qualitative shift in threat. Man-eaters are typically tigers that have been injured (a broken canine, a porcupine quill infection, a bullet wound) and can no longer take their natural prey, or old tigers that have discovered that humans are easier to kill than deer. A man-eater learns human patterns — when villagers go to the well, which paths farmers take to the fields, when children play unsupervised — and exploits them with an intelligence and patience that is genuinely terrifying. Man-eaters have been documented taking victims from inside huts, from boats on rivers, and from groups of armed hunters sent to kill them.

## Combat Strategy

A tiger does not engage in combat — it conducts executions. The entire architecture of the tiger's predatory strategy is designed to end the encounter in the first three seconds: an explosive ambush from concealment, the impact of several hundred pounds of muscle driving the prey to the ground, and the killing bite to the throat or spine. If this sequence succeeds — and against unprepared targets, it almost always does — the fight is over before it begins.

Against a target that detects the ambush and faces the tiger, the calculus changes. Tigers are not cowards, but they are pragmatists: a frontal approach against an alert, armed opponent risks injury, and an injured tiger may be unable to hunt, which means death. A tiger that has been detected will often break off the attack, circling to attempt another ambush from a different angle. This is not retreat — it is repositioning. The tiger will try again, and the second attempt benefits from everything it learned during the first.

If forced into direct combat — cornered, wounded, defending cubs, or in the frenzy of a charge that cannot be stopped — the tiger is the most physically dangerous animal an adventurer can face short of an elephant or dragon. It strikes with both forepaws, the claws fully extended, delivering sweeping blows that can decapitate a human, disembowel a horse, or shatter a shield. It bites with a jaw force that can crush a skull through a helmet. It uses its body weight to overbear opponents, pinning them beneath its mass while the claws and teeth do their work. A tiger in close combat generates injuries so rapidly and so catastrophically that most engagements are decided within seconds.

Against groups, a tiger's instinct is to avoid engagement unless the group is in its territory and threatening cubs. A tiger that does attack a group will focus on a single target — typically the rearmost, most isolated individual — taking that target down with an ambush strike and dragging it away before the group can organize a response. This is not foolhardy bravery but cold tactical sense: eliminate one target quickly, withdraw with the kill, and the threat is reduced by one while the tiger loses nothing.

## Attack Methods

### Ambush Strike

The defining tiger attack. From concealment — tall grass, undergrowth, shadow — the tiger launches a short, explosive charge that covers the final distance in a single bound, crashing into the target with the full force of its body. The impact alone is sufficient to knock most targets to the ground, and the forepaws — claws fully deployed — hook into the shoulders, back, or neck to anchor the tiger to its prey. The throat bite follows within a heartbeat.

### Throat Crush

Once the prey is down, the tiger seizes the throat in its jaws and closes with a sustained, crushing bite that collapses the windpipe and severs the blood supply to the brain. Against large prey, the tiger holds this bite for minutes, applying constant pressure until the struggling stops. Against armored targets, the tiger may shift to the back of the neck, attempting to drive the long canines between the cervical vertebrae to sever the spinal cord.

### Forepaw Strike

In direct combat, the tiger delivers devastating blows with its forepaws — sweeping, hooking strikes powered by the massive shoulder and forelimb musculature. The claws are thick, curved, and three to four inches long, capable of tearing through leather, mail, and flesh with equal facility. A single forepaw strike carries enough force to break a human arm, shatter ribs, or open wounds that are immediately life-threatening. The tiger alternates forepaw strikes rapidly, each paw targeting from a different angle, creating a barrage of incoming damage that overwhelms any single-weapon defense.

### Raking Disembowelment

A tiger that has seized a target with its forepaws and teeth will bring the hind legs forward and rake with the rear claws — long, thick, and driven by the most powerful muscles in the animal's body. This instinctive raking motion targets the belly and groin, opening catastrophic abdominal wounds. Against a target the tiger has pinned beneath its body, the raking continues until the struggling stops.

## Special Abilities

### Jungle Ghost

The tiger's striped camouflage, combined with its ability to move through dense vegetation in near-total silence, makes it effectively invisible in its preferred habitat. A tiger stalking through bamboo, tall grass, or forest undergrowth displaces almost no vegetation, makes almost no sound, and presents a visual profile that the human eye cannot assemble into a recognizable shape until it is far too late. Experienced Vedyaran hunters state that the only reliable way to detect a stalking tiger is to listen for the silence — when the jungle stops making noise, the tiger is close.

### Apex Predator

The tiger sits at the absolute top of the Vedyaran food chain. There is nothing in the jungle, the grassland, or the river margin that hunts tigers. This ecological dominance shapes every aspect of the tiger's behavior: it moves through its territory with a confidence that borders on contempt, it does not flee from threats but instead assesses and responds, and it treats everything it encounters as either prey, rival, or irrelevance. Adventurers accustomed to animals that flee from humans must recalibrate their expectations immediately — a tiger will not run from a party of armed humans unless it has specific reason to associate humans with danger.

### Water Hunter

Unlike most cats, the tiger is a powerful and willing swimmer, capable of crossing rivers, hunting in marshland, and pursuing prey into water. Tigers have been documented swimming miles across open water and taking prey — deer, boar, even humans in boats — from the water's edge. In the river margins and floodplains of Vedyara, a tiger's hunting territory extends seamlessly from land to water, and the assumption that a river provides safety from pursuit is dangerously incorrect.

### Man-Eater Potential

A tiger that has killed and eaten a human may develop a preference for human prey — the beginning of a man-eating career that can claim dozens of victims before it ends. Man-eaters are not aberrant or insane; they are tigers that have made a rational assessment that humans are abundant, predictable, and easy to kill compared to their natural prey. A man-eater learns human patterns and exploits them with a patience and intelligence that makes it the most dangerous animal phenomenon in the Vedyaran world. Communities afflicted by a man-eater live in a state of siege, and the hunter or adventurer who kills a confirmed man-eater earns a reputation that lasts a lifetime.

## Attributes

- **Strength:** 17-22 (1d6+16)

- **Endurance:** 13-18 (1d6+12)

- **Dexterity:** 12-17 (1d6+11)

- **Agility:** 12-17 (1d6+11)

- **Perception:** 12-17 (1d6+11)

- **Aura:** 11-16 (1d6+10)

- **Will:** 12-17 (1d6+11)

- **Reasoning:** 7-10 (1d4+6)

- **Creativity:** 6-9 (1d4+5)
