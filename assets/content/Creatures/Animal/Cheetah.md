---
aliases:
    - Cheetah
tags:
    - animal
    - image-needed
name:
    full: Cheetah
    aliases: []
id: mjqQVrKXPAtQyUUN
slug: cheetah
img: icons/game-icons/lorc/lion.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 14
        end: 12
        dex: 17
        agl: 19
        per: 16
        aur: 12
        wil: 12
        rea: 9
        cre: 8
    attrRollFormula:
        str: 1d6+10
        end: 1d6+8
        dex: 1d6+13
        agl: 1d6+15
        per: 1d6+12
        aur: 1d6+8
        wil: 1d6+8
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
            base: 60
            calc: "60"
        reachBase: 0
        bodyScaleBase: 1.27
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 70
          leaguesPerWatch: 4
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
    defaultCombatGroup: null
    items:
        - name: Suffocation Bite
          type: skill
          system:
              shortcode: bite
              subType: combattechnique
              masteryLevelBase: 78
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: bite
                  name: Suffocation Bite
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 1
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 2
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
        - name: Slapping Strike
          type: skill
          system:
              shortcode: claw
              subType: combattechnique
              masteryLevelBase: 78
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: claw
                  name: Slapping Strike
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 2
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 8
                      modifier: 1
                      aspect: edged
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
---

# Appearance {#appearance}

You have never seen anything move like that. The gazelle had three hundred yards of open ground and the confidence of its own speed, and for three heartbeats it looked like enough. Then the spotted shape unfolded from the scrub at a speed that turned distance into a lie — a long, flat blur of gold and black that closed the gap with a mechanical inevitability that made the chase look less like pursuit and more like collision. The final moment was almost gentle: a flick of the forepaw, the gazelle's legs tangling, the tumble, and then the cat was on it, jaws locked on the throat, sides heaving like bellows, the entire muscular frame trembling with the exertion of a sprint that lasted twelve seconds and covered ground faster than a galloping horse. It lies there now in the dust, draped over its kill, too exhausted to eat. The coat is golden and spotted — not rosettes like a leopard but simple solid dots scattered across a frame that is all wrong for a cat. Too long in the leg. Too narrow in the chest. Too small in the head. Built like a running dog wearing a cat's skin, every line designed for a single, absolute purpose: to be the fastest thing alive.

# Dossier {#dossier}

The Cheetah is the supreme sprinting predator of the Khazryn steppe — a large, lightly built cat found in open grasslands, scrubland, and the gravel plains where gazelle herds graze. An adult cheetah stands roughly thirty inches at the shoulder and weighs seventy-five to a hundred and forty-five pounds, comparable in mass to a leopard but built on a completely different architecture. Where the leopard is compact and powerful, the cheetah is elongated and aerodynamic — every element of its anatomy optimized for explosive speed over short distances. The cheetah is the fastest land animal in the world, capable of reaching speeds that no horse, no gazelle, and no other predator can match in a straight sprint. This speed comes at a cost: the cheetah is fragile for a large cat, lacking the muscular power of leopards and lions, and it is easily displaced from kills by stronger predators. In Khazryn culture, the cheetah holds a position of extraordinary prestige as a hunting companion of royalty. Tamed cheetahs — captured young and trained by specialist handlers — are used to course gazelle on the open steppe, a form of hunting practiced exclusively by khans, chieftains, and the wealthiest nomad lords. A trained hunting cheetah is among the most valuable animals in the Khazryn world, worth more than a string of horses, and the handlers who train them are specialists whose skills are passed from parent to child across generations. Adventurers encounter wild cheetahs in open steppe country, typically at a distance, and trained cheetahs in the camps and caravans of Khazryn nobility.

## Presentation

A large cat of unmistakable silhouette — tall, slender, long-legged, and narrow-bodied in a way that distinguishes it instantly from the compact power of a leopard or the heavy mass of a lion. The coat is short and coarse, golden-yellow across the back and flanks, white on the belly, covered in a pattern of small, solid black spots — not the clustered rosettes of a leopard but individual dots evenly distributed across the body. The face is small and flat with high-set eyes, a short muzzle, and distinctive black "tear lines" running from the inner corners of the eyes down alongside the nose to the mouth — markings that reduce sun glare and aid in sighting prey at distance. The eyes are amber, large, and forward-facing, providing the binocular vision essential for tracking prey during high-speed pursuit. The chest is deep but narrow, housing the oversized heart and lungs that power the sprint. The legs are extraordinarily long and lean, with the hind legs proportionally longer than the fore, giving the cheetah its characteristic sloping back. The claws are semi-retractable — unique among cats — providing traction during high-speed turns like the cleats on a runner's shoes. The tail is long, flattened, and serves as a rudder during pursuit, whipping from side to side to counterbalance the violent changes of direction. The overall impression is of a creature that has traded the versatile power of other great cats for a single, transcendent ability — speed so absolute that everything else has been sacrificed to achieve it.

## Key Behaviors

Cheetahs are primarily diurnal, hunting during daylight hours when their exceptional eyesight provides maximum advantage and when the nocturnal competitors — lions, leopards, hyenas — are resting. They are semi-social by cat standards: females are solitary except when raising cubs, but males often form small coalitions of two to four individuals — usually brothers from the same litter — that hunt cooperatively and defend territories together. Male coalitions are significantly more successful hunters than solitary individuals, able to bring down larger prey and defend kills against single hyenas or jackals. Cheetahs hunt by sight rather than scent, scanning the steppe from elevated positions — termite mounds, rock outcrops, even the roofs of abandoned structures — for gazelle herds. Once prey is identified, the cheetah begins a careful stalk, using whatever minimal cover the terrain provides to close the distance to within two to three hundred yards before launching the sprint. The chase itself is brief and decisive — if the cheetah has not caught its prey within thirty seconds, it abandons the pursuit, lacking the endurance to sustain its top speed beyond that threshold. After a successful kill, the cheetah must rest before eating, panting heavily for ten to fifteen minutes while its body temperature drops from the dangerous levels generated by the sprint. During this vulnerable period, the cheetah is at its greatest risk — unable to defend its kill and too exhausted to flee, it often loses its catch to lions, hyenas, or even vultures that have learned to shadow cheetah hunts.

## Combat Strategy

The cheetah is not built for combat and avoids it whenever possible. Against larger predators — lions, leopards, hyenas — a cheetah will abandon its kill and retreat without contest, relying on its speed to escape. Against threats to its cubs, a female cheetah will attempt to lead the predator away through a combination of distraction displays and bursts of speed, but will not engage in direct combat against anything she cannot clearly overpower. Male coalitions are braver and will stand their ground against single hyenas or jackals, hissing, growling, and making short rushes to drive off the intruder. In the rare circumstance where a cheetah must fight — cornered, defending cubs at close range, or in a dispute with another cheetah — it relies on speed of strike rather than power, delivering rapid swipes with its semi-retractable claws and aiming for the face and eyes. The cheetah's bite is proportionally weak for a large cat — its small head and reduced jaw muscles are an aerodynamic tradeoff — and it kills prey through suffocation rather than the crushing bites of stronger cats, maintaining a throat hold for several minutes until the prey stops breathing.

## Attack Methods

### Sprint and Trip

The cheetah's signature hunting technique. After closing to within striking range through the explosive sprint, the cheetah uses a forepaw to hook the prey's hind leg, tripping it at full speed. The resulting tumble is often violent enough to stun the prey momentarily, giving the cheetah time to secure the throat hold. The trip is delivered with precise timing — too early and the prey may recover, too late and the cheetah's energy is spent.

### Suffocation Bite

Once the prey is down, the cheetah seizes the throat with its jaws and maintains a sustained grip that collapses the windpipe and cuts blood flow. Unlike the crushing bite of a leopard or the spine-severing attack of a lion, the cheetah's kill is slow and controlled — it may take several minutes for the prey to die. The cheetah cannot risk a more aggressive approach because its light build makes it vulnerable to injury from a struggling prey animal.

### Slapping Strike

In defensive or intra-species combat, the cheetah delivers rapid, open-pawed strikes aimed at the face and eyes of the opponent. The semi-retractable claws are less sharp than a leopard's fully retractable claws but still capable of cutting flesh, and the speed of delivery makes the strikes difficult to avoid.

## Special Abilities

### Absolute Speed

The cheetah is the fastest land animal in existence. In a sprint, it achieves speeds that no horse, no gazelle, and no other predator can match — covering ground at a rate that makes pursuit by any other means futile over short distances. This speed is the product of every element of the cheetah's anatomy working in concert: the oversized heart and lungs delivering oxygen, the flexible spine extending and compressing with each stride to double the effective leg length, the semi-retractable claws gripping the earth, and the long tail counterbalancing turns. For twelve to thirty seconds, the cheetah is simply uncatchable.

### Pursuit Agility

Raw speed alone would not catch a gazelle — the prey's evasive turns would defeat a predator that could only run in a straight line. The cheetah combines its speed with extraordinary maneuverability, executing high-speed turns and direction changes that generate forces that would incapacitate a less specialized animal. The long tail serves as a counterweight, whipping to the opposite side of each turn, and the semi-retractable claws provide grip through directional changes. A cheetah in pursuit matches its prey's evasive maneuvers stride for stride, turning the gazelle's primary defense into a delaying tactic rather than an escape.

### Elevated Scanning

Cheetahs possess exceptional distance vision adapted for spotting prey on open terrain. They habitually climb to elevated positions — rock outcrops, termite mounds, fallen trees — to scan the surrounding steppe for game. This behavior makes them excellent scouts of the landscape, and experienced Khazryn hunters watch cheetah scanning behavior to locate gazelle herds that are invisible from ground level.

### Noble Companion

The cheetah's unique combination of tractability and hunting prowess makes it the only large cat that has been successfully trained as a hunting companion across multiple cultures and centuries. Unlike the caracal, which cooperates on its own terms, a well-trained cheetah will course and kill gazelle on command, returning to the handler after the kill in exchange for a portion of the meat. This trainability — combined with the cheetah's inability to breed reliably in captivity — means that every hunting cheetah must be captured from the wild and individually trained, making each one irreplaceable and immensely valuable. The bond between a cheetah and its handler is genuine, built on trust and mutual dependence, and the death of a prized hunting cheetah is mourned in Khazryn camps with rituals normally reserved for horses and hounds.

## Attributes

- **Strength:** 11-16 (1d6+10)

- **Endurance:** 9-14 (1d6+8)

- **Dexterity:** 14-19 (1d6+13)

- **Agility:** 16-21 (1d6+15)

- **Perception:** 13-18 (1d6+12)

- **Aura:** 9-14 (1d6+8)

- **Will:** 9-14 (1d6+8)

- **Reasoning:** 7-10 (1d4+6)

- **Creativity:** 6-9 (1d4+5)
