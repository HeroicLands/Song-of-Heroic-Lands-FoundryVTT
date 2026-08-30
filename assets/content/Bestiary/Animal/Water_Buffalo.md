---
aliases:
  - Water Buffalo
tags:
  - animal
  - image-needed
name:
  full: Water Buffalo
  aliases: []
description: "A massive semi-aquatic bovine of tropical floodplains, valued as a powerful draft beast yet formidable when running wild in feral herds."
id: QpWdvTgOQceHrZhi
img: icons/game-icons/delapouite/buffalo-head.svg
portrait: images/being/wtrbffl-portrait.webp
shortcode: wtrbffl
type: being
sohl:
  kbcat: animal
  archetype: 0
  attributes:
    str: 18
    end: 17
    dex: 8
    agl: 9
    per: 12
    aur: 8
    wil: 15
    rea: 7
    cre: 6
  attrRollFormula:
    str: 1d6+14
    end: 1d6+13
    dex: 1d4+5
    agl: 1d4+6
    per: 1d6+8
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
    bodyScaleBase: 1.38
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
        masteryLevelBase: 40
    - shortcode: shok
      type: skill
      system:
        masteryLevelBase: 45
    - name: Horn Gore
      type: skill
      system:
        shortcode: gore
        subType: combattechnique
        masteryLevelBase: 55
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
            modifier: 4
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
    - name: Charging Trample
      type: skill
      system:
        shortcode: ram
        subType: combattechnique
        masteryLevelBase: 48
        combatCategory: melee
        impairedByRoles:
          - core
        strikeMode:
          type: melee
          shortcode: ram
          name: Charging Trample
          minParts: 1
          assocSkillCode: null
          attack:
            disabled: false
            spread: 8
            modifier: 0
          impactBase:
            numDice: 1
            die: 6
            modifier: 3
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

The mud stirs, and what you took for a low island of dark earth reveals itself as something alive. It rises from the shallows in stages — first the massive, curved horns, sweeping outward and back in a crescent that spans wider than a man's outstretched arms, tips worn to pale points. Then the head, broad and heavy, plastered with black mud, with dark eyes that regard you with an expression of absolute, bovine indifference that somehow carries more menace than any snarl. The body follows: an enormous barrel of dark gray-black hide, slick with river mud, muscle shifting beneath skin as thick as boiled leather. Water cascades from its flanks as it heaves itself onto the bank, and you realize the animal is far larger than you initially judged — nearly six feet at the shoulder, carrying a weight of muscle and bone that makes the ground tremble with each step. It shakes its head once, slowly, the great horns cutting arcs through the air, and then it resumes chewing, utterly unconcerned with your existence. The unconcern is not reassuring. An animal this large does not need to be concerned about anything.

# Dossier {#dossier}

The Water Buffalo is the great working beast of the Kheperi floodplains — a massive, semi-aquatic bovine found both as a domesticated draft animal and in feral herds along the Tameresh River and its tributaries. A domestic bull stands five to six feet at the shoulder and weighs fifteen hundred to twenty-five hundred pounds; feral bulls can exceed this, reaching twenty-six hundred pounds or more in the rich grazing lands of the river margins. Water buffalo have been domesticated in Kheperi lands for millennia, serving as plow animals, cart haulers, and sources of milk, leather, and horn. They are essential to the agricultural economy of the floodplain — without them, the heavy clay soils of the river margins could not be effectively farmed. However, feral herds represent a genuine danger. Water buffalo that have escaped domestication or descended from escaped stock form herds of twenty to sixty individuals that are fiercely territorial, aggressive, and powerful enough to kill any predator in the region except perhaps an elephant. Adventurers encounter water buffalo constantly in Kheperi farmlands, along river crossings, in marshland passages, and in the wild grasslands of the upper Tameresh where feral herds have established permanent territories.

## Presentation

A massively built bovine with a heavy, rectangular body covered in sparse, coarse black or dark gray hair over thick, dark skin. The most distinctive feature is the horns — enormous, laterally flattened crescents that sweep outward and backward from the top of the broad skull, spanning five to six feet from tip to tip in mature bulls. The horns are ridged and textured, darker at the base and paler at the worn tips, and serve as both weapons and social signals — older, dominant bulls carry the most massive and scarred horns. The head is large with a broad, flat forehead, large dark eyes, and a wide muzzle adapted for grazing on coarse marsh grasses. The ears are relatively small and heavily fringed with hair. The legs are short and powerful, ending in broad, splayed hooves adapted for soft, muddy ground — a water buffalo can move through knee-deep mud that would mire a horse. The tail is long, tufted at the end, and used constantly to flick away the clouds of biting insects that plague river-margin animals. The overall impression is of a creature built entirely for power and endurance rather than speed — slow, patient, and absolutely unshakeable when it decides to stand its ground.

## Key Behaviors

Water buffalo are gregarious, forming herds structured around a core group of related females and their calves, with bulls either solitary or in small bachelor groups outside of mating season. Dominant bulls join female herds during rut and defend access to females through display and combat. They are semi-aquatic by nature, spending much of the day partially submerged in rivers, marshes, or mud wallows to regulate body temperature and escape biting insects. They graze primarily on coarse marsh grasses, reeds, and aquatic vegetation, feeding in the cooler hours of dawn and dusk and resting during midday heat. Domesticated buffalo are generally docile but can be unpredictable — even well-trained working animals retain the capacity for sudden aggression, particularly bulls during rut or cows defending calves. Feral buffalo are a different matter entirely. Freed from human control, they revert to wild behavior within a generation — suspicious, territorial, and willing to attack perceived threats without provocation. Feral bulls that have been wounded by hunters or harassed by predators become solitary and dangerously aggressive, charging anything that enters their territory. These rogue bulls are among the most feared animals in the Kheperi lowlands, considered more dangerous than lions by experienced hunters.

## Combat Strategy

A water buffalo's primary defense is its massive body and horns. When threatened, a herd will typically bunch together with calves in the center and adult animals facing outward, presenting a wall of horns to any predator. If the threat persists, one or more bulls may charge — a straight-line rush of extraordinary momentum, head lowered to bring the horns into play. The charge is not fast by predator standards but the sheer mass behind it makes it devastating. A buffalo that has knocked its target down will gore and trample with focused aggression, returning to a downed enemy repeatedly to ensure the threat is eliminated. Feral buffalo, particularly solitary rogues, are more aggressive and less predictable. A rogue bull may charge without warning from concealment in tall reed beds or marsh grass, using the terrain to close distance before the target can react. In water, buffalo have a significant advantage — they are strong swimmers and can move through marshland that impedes horses and humans, and they will deliberately lead pursuers into deep water or soft mud where the buffalo's superior footing becomes a lethal advantage.

## Attack Methods

### Horn Gore

The primary attack. The buffalo lowers its massive head and drives the curved horns upward into the target, using the full power of its neck and shoulders. The horns are capable of piercing armor, impaling horses, and launching human-sized targets several feet through the air. The upward sweeping motion of the horns means that targets struck in the torso may be hooked and thrown rather than simply pierced, resulting in devastating compound injuries from both the initial gore and the subsequent fall.

### Charging Trample

The buffalo charges with its full body weight — up to a ton of muscle and bone — behind the impact. Even if the horns miss, the collision of the buffalo's massive skull and chest with a human target is sufficient to break bones and cause fatal internal injuries. A target knocked down by the charge is then trampled by the broad hooves, each carrying hundreds of pounds of concentrated force.

### Herd Stampede

When a herd of water buffalo panics — from predator attack, fire, or loud disturbance — the resulting stampede is one of the most destructive natural events in the lowlands. Fifty or more animals, each weighing a ton, running at full speed through whatever is in their path. Fences, camp structures, small buildings, and anything living caught in the path of a stampede is simply destroyed. Stampedes are most dangerous at river crossings, where the churning mass of animals can capsize boats and drown anyone in the water.

## Special Abilities

### Marsh Superiority

Water buffalo are supremely adapted to soft, wet terrain. Their broad, splayed hooves distribute their enormous weight across a wide surface area, allowing them to move through mud and marshland that bogs down horses and humans. In their preferred river-margin habitat, water buffalo can outmaneuver any mounted pursuer and can retreat into water deep enough to protect their flanks while keeping their horns available for defense.

### Massive Resilience

The water buffalo's thick hide and dense muscle mass provide substantial natural armor. Arrows and light spears may fail to penetrate the hide over the shoulders and chest, and even heavier weapons must be well-placed to reach vital organs through the layers of skin, fat, and muscle. A wounded buffalo is not a weakened buffalo — it will continue fighting with full aggression, and a mortally wounded bull may survive long enough to kill the hunter who wounded it.

### Herd Defense

A water buffalo herd responds to threats collectively. When one animal gives an alarm, the herd forms a defensive formation within moments, and adults will actively charge predators to protect calves and injured herd members. Lions, crocodiles, and even hippos typically avoid confrontation with an alert buffalo herd. This collective defense makes hunting feral buffalo extremely dangerous — a hunter who wounds one animal may find themselves facing a counter-charge from the entire herd.

### Stubborn Will

Water buffalo possess a temperamental tenacity that domestication has not fully bred out. A buffalo that has decided to stand its ground will not be moved by pain, noise, or intimidation short of lethal force. This stubbornness makes feral buffalo particularly dangerous — they do not flee from threats that would send most prey animals running, instead choosing to face down and attack whatever has disturbed them. Rogue bulls exemplify this trait to its extreme, treating every encounter as a territorial challenge to be answered with violence.

## Attributes

- **Strength:** 15-20 (1d6+14)

- **Endurance:** 14-19 (1d6+13)

- **Dexterity:** 6-9 (1d4+5)

- **Agility:** 7-10 (1d4+6)

- **Perception:** 9-14 (1d6+8)

- **Aura:** 6-9 (1d4+5)

- **Will:** 12-17 (1d6+11)

- **Reasoning:** 5-8 (1d4+4)

- **Creativity:** 4-7 (1d4+3)
