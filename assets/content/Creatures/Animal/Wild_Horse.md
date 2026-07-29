---
aliases:
    - Wild Horse
tags:
    - animal
    - image-needed
name:
    full: Wild Horse
    aliases: []
id: O4pfq2TzV4c9SzsT
slug: wild-horse
img: icons/game-icons/delapouite/horse-head.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 26
        end: 10
        agl: 11
        per: 17
        snt: 4
        aur: 4
        wil: 10
        rea: 4
        cre: 4
    attrRollFormula:
        str: 1d6+23
        end: 1d6+7
        agl: 1d4+9
        per: 1d6+14
        snt: 1d4+2
        aur: 1d4+2
        wil: 1d6+7
        rea: 1d4+2
        cre: 1d4+2
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 4
                - name: Forelegs
                  shortcode: forelegszone
                  probWeight: 4
                - name: Torso
                  shortcode: torsozone
                  probWeight: 7
                - name: Hind Legs
                  shortcode: hindlegszone
                  probWeight: 6
                - name: Tail
                  shortcode: tailzone
                  probWeight: 1
            parts:
                - name: Head
                  shortcode: headpart
                  bodyZoneCode: headzone
                  canHoldItem: false
                  probWeight: 4
                - name: Left Foreleg
                  shortcode: lforelegpart
                  bodyZoneCode: forelegszone
                  canHoldItem: false
                  probWeight: 2
                - name: Right Foreleg
                  shortcode: rforelegpart
                  bodyZoneCode: forelegszone
                  canHoldItem: false
                  probWeight: 2
                - name: Torso
                  shortcode: torsopart
                  bodyZoneCode: torsozone
                  canHoldItem: false
                  probWeight: 7
                - name: Left Rear Leg
                  shortcode: lrearlegpart
                  bodyZoneCode: hindlegszone
                  canHoldItem: false
                  probWeight: 3
                - name: Right Rear Leg
                  shortcode: rrearlegpart
                  bodyZoneCode: hindlegszone
                  canHoldItem: false
                  probWeight: 3
                - name: Tail
                  shortcode: tailpart
                  bodyZoneCode: tailzone
                  canHoldItem: false
                  probWeight: 1
            locations:
                - name: Head
                  shortcode: headloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 4
                  protectionBase:
                      blunt: 5
                      edged: 4
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
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Leg
                  shortcode: lforelegloc
                  bodyPartCode: lforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 1
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Leg
                  shortcode: rforelegloc
                  bodyPartCode: rforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 1
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Flank
                  shortcode: flkloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 4
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 6
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Left Quarter
                  shortcode: lqtrloc
                  bodyPartCode: lrearlegpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 3
                  probWeight: 5
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Left Hind Leg
                  shortcode: lhindlegloc
                  bodyPartCode: lrearlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 4
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Right Quarter
                  shortcode: rqtrloc
                  bodyPartCode: rrearlegpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 3
                  probWeight: 5
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Right Hind Leg
                  shortcode: rhindlegloc
                  bodyPartCode: rrearlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 4
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Tail
                  shortcode: tailloc
                  bodyPartCode: tailpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 1
                  probWeight: 1
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
        weight:
            base: 1000
            calc: 1000
        reachBase: 0
        bodyScaleBase: 1.0
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 140
          leaguesPerWatch: 10
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
              masteryLevelBase: 56
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 21
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 21
---

# Appearance {#appearance}

The herd appears on the ridge at sunset — twenty, thirty dark shapes silhouetted against a sky burning copper and vermillion. They stand motionless, the wind catching their short, bristling manes and tearing them sideways. They are not the sleek, refined creatures of stable and paddock. These are heavier, rougher, built from a different blueprint entirely — barrel-chested, thick-necked, with heads that are blunt and heavy-jawed rather than elegantly tapered. The stallion stands apart, a dun-colored block of muscle with a dark dorsal stripe running from mane to tail, and he watches you with an expression that contains no curiosity, no fear, and absolutely no deference. He has never worn a bridle. His ancestors never wore bridles. The domesticated horses in your camp shift nervously, ears pinned back, recognizing something in those wild cousins that their breeding has spent centuries trying to forget.

# Dossier {#dossier}

The Wild Horse is the untamed ancestor of every domestic horse breed in the Khazryn and surrounding regions — a stocky, powerful equine found in bands across the open steppe, gravel plains, and semi-arid grasslands of central Ankaris. A wild horse stands thirteen to fifteen hands at the shoulder and weighs six hundred to eight hundred pounds, smaller and heavier-boned than most domestic breeds but possessed of an endurance, toughness, and sheer will to survive that no stable-raised animal can match. Wild horses live in bands of five to twenty individuals led by a dominant stallion, ranging across vast territories in pursuit of seasonal grazing and water. For the Khazryn nomads, wild horses are culturally sacred — they represent the spirit of the steppe itself, untamed and unbowed, and the ancestral bloodlines from which the nomads' own legendary mounts descend. Capturing and breaking a wild horse is a traditional test of manhood among some tribes, though the resulting mounts are notoriously willful and unpredictable. Other tribes refuse to capture wild horses at all, considering them sacred beings that embody the freedom the desert people prize above all else. Adventurers encounter wild horse bands on the open steppe, at remote watering holes, and occasionally in explosive confrontations when a wild stallion attempts to steal mares from a camp's horse string.

## Presentation

A compact, heavily built equine that differs markedly from domestic breeds in its rougher proportions and wilder bearing. The body is barrel-shaped with a deep chest and short, powerful back. The legs are shorter and thicker than a domestic horse's, with heavy bone and dense tendons built for endurance over rough terrain rather than speed on groomed ground. The head is large and somewhat coarse, with a convex or straight profile, small ears, and dark eyes that hold a wariness absent from domestic animals. The mane is short, stiff, and upright — bristling along the neck rather than falling in the flowing curtain of a domestic horse. The coat is typically dun, ranging from sandy yellow to dark brown, with characteristic primitive markings: a dark dorsal stripe running from poll to tail, dark lower legs, and occasionally faint leg striping. The tail is shorter and coarser than a domestic horse's. Stallions carry heavier necks and more prominent jaw muscles than mares, the result of a lifetime of fighting for dominance. Scars from biting and kicking are common, particularly on stallions and older mares. The overall impression is of an animal that has never been softened by grain, grooming, or shelter — raw, practical, and utterly self-sufficient.

## Key Behaviors

Wild horses live in bands structured around a dominant stallion and a lead mare. The stallion defends the band against rival males and predators; the lead mare — typically the oldest and most experienced female — makes decisions about where the band grazes, waters, and rests. This dual leadership creates a resilient social structure where the band's movements are guided by the mare's experience and the stallion's aggression. Bands range across territories of fifty to a hundred square miles, following seasonal patterns of grass growth and water availability. They are constantly moving, rarely staying in one location for more than a day or two. Wild horses graze on the tough steppe grasses, scrub, and dried vegetation that sustain little else, and they can survive on forage that domestic horses would reject. They drink once daily when water is available, often traveling miles between grazing grounds and water sources. Stallions fight viciously for control of bands — rearing, biting at necks and legs, and kicking with both hind feet. These battles can last hours and occasionally result in serious injury or death. Bachelor stallions that have not yet won bands form loose groups that shadow established bands, waiting for opportunities to challenge aging stallions or steal unguarded mares. Wild horses are alert and skittish, maintaining distance from unfamiliar humans and fleeing at the first sign of pursuit.

## Combat Strategy

A wild horse's primary defense is flight — bands will run from threats across open ground where their endurance and speed give them a decisive advantage. The lead mare initiates flight while the stallion positions himself between the band and the threat, screening the retreat with aggressive displays. If forced into direct confrontation, a wild horse is a formidable opponent. The stallion fights with a combination of rearing strikes, biting, and powerful kicks that can break bones and crush skulls. Against predators, the band may form a defensive circle with foals in the center, adults facing outward with hindquarters positioned to deliver kicks. Against a lone predator, a stallion will charge directly, attempting to trample and bite the threat. Wild horses that have been cornered or separated from their band fight with a desperate ferocity amplified by panic — a trapped wild horse is one of the most dangerous animals on the steppe, lashing out in all directions with hooves and teeth.

## Attack Methods

### Rearing Strike

The horse rears onto its hind legs and brings the forelegs crashing down on the target. The hard hooves carry the weight of the animal's shoulders and forequarters behind them, and a strike to the head, shoulders, or spine of a human-sized target can be immediately fatal. Stallions use this attack against rival males and against predators, often rearing repeatedly to drive the threat back.

### Kick

The classic equine defense. The horse turns its hindquarters toward the threat and lashes out with one or both hind legs. The kick delivers enormous force — enough to shatter ribs, break arms, and knock a human-sized target several feet through the air. Wild horses are more willing to kick than domestic animals, having relied on this defense against predators throughout their lives.

### Bite

Wild horses bite with far more aggression than domestic animals. The jaws are powerful, the incisors are heavy, and a stallion will seize a predator's neck, shoulder, or leg and shake violently, tearing flesh and crushing tissue. Stallion-on-stallion fights feature sustained biting at the neck and legs, and a wild stallion will readily bite a human who approaches too closely.

## Special Abilities

### Steppe Endurance

Wild horses possess an endurance that exceeds any domestic breed. Generations of survival on the open steppe — where the only response to predators, drought, and seasonal hardship is to keep moving — have bred an animal capable of sustained travel over distances and through conditions that would break domestic horses. A wild horse band can cover thirty to forty miles in a day at a steady pace, day after day, without supplemental feed or rest. Pursuing a wild horse band on domestic mounts is an exercise in futility unless the pursuers can cut off the band's route.

### Unbreakable Will

The wild horse's defining characteristic. These animals have never been selected for docility, and their instinct for independence is so deep that captured wild horses resist breaking with a tenacity that borders on suicidal. A wild stallion will fight a rope until it collapses from exhaustion, and even horses that are nominally broken retain a willfulness and unpredictability that makes them unsuitable for inexperienced riders. Among the Khazryn, the rare warrior who successfully bonds with a wild-caught horse gains a mount of extraordinary toughness and loyalty — but also one that will never fully submit.

### Herd Cohesion

A wild horse band responds to threats as a coordinated unit. The lead mare directs movement while the stallion provides rear-guard defense, and the band executes complex maneuvers — splitting around obstacles, reforming on the far side, changing direction in response to the mare's lead — with practiced efficiency. This coordination makes wild horse bands extremely difficult to corner or separate, and attempts to cut individual animals from the herd are consistently frustrated by the band's collective response.

### Primitive Hardiness

Wild horses thrive in conditions that debilitate domestic breeds. They tolerate extreme heat and cold, subsist on forage that domestic horses cannot digest, and maintain condition through seasonal scarcity that would leave a stable-raised animal starving. Their hooves are naturally harder and more resistant to wear than domestic horses', requiring no shoeing even on rocky ground. Their immune systems are robust, resistant to many of the parasites and diseases that plague domestic herds. This hardiness is the product of millennia of natural selection in one of the harshest environments on Thalorna.

## Attributes

- **Strength:** 10-15 (1d6+9)

- **Endurance:** 12-17 (1d6+11)

- **Dexterity:** 10-15 (1d6+9)

- **Agility:** 11-16 (1d6+10)

- **Perception:** 11-16 (1d6+10)

- **Aura:** 8-13 (1d6+7)

- **Will:** 12-17 (1d6+11)

- **Reasoning:** 6-9 (1d4+5)

- **Creativity:** 5-8 (1d4+4)
