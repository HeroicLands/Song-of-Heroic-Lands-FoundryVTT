---
aliases:
    - Grukar-Uk
tags:
    - folk
name:
    full: Grukar-Uk
    aliases: []
id: VBfGJvhWaj4uisjN
slug: grukar-uk
img: icons/game-icons/delapouite/orc-head.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 12
        end: 12
        dex: 8
        agl: 7
        per: 7
        aur: 5
        wil: 6
        rea: 5
        cre: 6
    attrRollFormula:
        str: 1d4+9
        end: 1d4+9
        dex: 1d4+5
        agl: 1d4+4
        per: 1d4+4
        aur: 1d4+2
        wil: 1d4+3
        rea: 1d4+2
        cre: 1d4+3
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
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Left Eye
                  shortcode: leyeloc
                  bodyPartCode: headpart
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
                  bodyPartCode: headpart
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
                  bodyPartCode: headpart
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
                  bodyPartCode: headpart
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
                  bodyPartCode: headpart
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
                  bodyPartCode: headpart
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
                  bodyPartCode: headpart
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
                  bodyPartCode: headpart
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
                  bodyPartCode: headpart
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
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 200
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Right Shoulder
                  shortcode: rshldloc
                  bodyPartCode: rarmpart
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
                  bodyPartCode: rarmpart
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
                  bodyPartCode: rarmpart
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
                  bodyPartCode: rarmpart
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
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Left Shoulder
                  shortcode: lshldloc
                  bodyPartCode: larmpart
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
                  bodyPartCode: larmpart
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
                  bodyPartCode: larmpart
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
                  bodyPartCode: larmpart
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
                  bodyPartCode: larmpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Thorax
                  shortcode: thrxloc
                  bodyPartCode: torsopart
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
                  bodyPartCode: torsopart
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
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 20
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Right Thigh
                  shortcode: rthghloc
                  bodyPartCode: rlegpart
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
                  bodyPartCode: rlegpart
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
                  bodyPartCode: rlegpart
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
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: none
                  amputability: medium
                  shockValue: 2
                  probWeight: 20
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Left Thigh
                  shortcode: lthghloc
                  bodyPartCode: llegpart
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
                  bodyPartCode: llegpart
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
                  bodyPartCode: llegpart
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
                  bodyPartCode: llegpart
                  bleedingSusceptibility: none
                  amputability: medium
                  shockValue: 2
                  probWeight: 20
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
        weight:
            base: 172
            calc: (9 * str) + 50
        reachBase: 0
        bodyScaleBase: 1.0
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 50
          leaguesPerWatch: 5
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          disabled: false
    defaultCombatGroup: null
    items: []
---

# Appearance {#appearance}

There are a lot of them. That is the first thing you notice — not any single Grukar-Uk, but the sheer, grubby mass of them, squatting around smoky fires, bickering over scraps of meat, scratching themselves with thick, blunt fingers. Individually, a Grukar-Uk is unimpressive: about four and a half feet tall, squat and bandy-legged, with a barrel chest and arms corded with a wiry, stubborn muscle that seems almost wasted on the creature's slouching posture. Its skin is a muddy gray-green, bristling with coarse dark hair across the shoulders and back. Its face is flat and heavy, dominated by a jutting lower jaw and a pair of small, yellowed tusks. Its eyes are dull and sullen, watching the world with a kind of resentful apathy — the look of a creature that would rather be doing nothing, and usually is. But there are so very many of them. And each one is carrying something sharp.

# Dossier {#dossier}

The Grukar-Uk are the teeming masses of Grukar civilization, comprising roughly eighty-five percent of any tribe's population. They are, by any measure, the least remarkable of the three subspecies: small, stupid, and overwhelmingly lazy. Left to their own devices, a group of Grukar-Uk will eat, sleep, squabble over trivialities, and do as little productive work as possible. They possess none of the Hai's terrifying martial prowess nor the Sha's sharp intelligence. What they do possess is numbers, a stubborn muscular strength that belies their small stature, and a crude capacity for simple crafts — forging rough weapons, curing leather, gathering and preparing food, building basic fortifications. They are the laborers, the foot soldiers, and the expendable fodder of Grukar society. Individually, a Grukar-Uk is a nuisance. In a mob of fifty, driven forward by the bellowing fury of a Grukar-Hai warlord and the whispered manipulations of a Grukar-Sha counselor, they are a genuine and terrifying threat. Their laziness is their greatest weakness: without a strong hand forcing them into action, they will simply not bother. But their fear of the Grukar-Hai is profound and all-consuming, and a sufficiently terrifying overlord can whip them into a frenzy of violent, desperate energy.

## Presentation

Grukar-Uk stand roughly four and a half feet tall — the shortest of the three subspecies — but are stocky and powerfully built for their size, with broad shoulders, thick necks, and arms that hang slightly too long for their bodies. Their skin is a dull gray-green, rougher and more heavily furred than the other subspecies, with coarse dark bristles across the back, shoulders, and forearms. Their faces are broad and flat, with heavy brows, small piggish eyes, and jutting lower jaws from which stubby tusks protrude. They wear whatever they can scrounge: ill-fitting leather, scraps of stolen armor, crude iron helms. Their weapons are rough but functional — hand-axes, clubs studded with nails, spears with fire-hardened tips, the occasional salvaged sword worn like a trophy. Everything about them speaks of crude, practical brutality without finesse or artistry.

## Key Behaviors

The defining characteristics of the Grukar-Uk are laziness and fear. They are bone-idle by nature, driven to action only by hunger, greed, or — most effectively — by the terror of what the Grukar-Hai will do to them if they disobey. They are not cunning enough to scheme and not brave enough to rebel, which makes them the perfect subjects for a society built on intimidation. Among themselves, they are quarrelsome and petty, constantly bickering over food, sleeping spots, and minor status — but these squabbles rarely escalate to real violence, because even Grukar-Uk dimly understand that killing your neighbor attracts attention from above. They obey the Grukar-Hai out of abject terror. They obey the Grukar-Sha because the Sha are clever enough to make obedience seem like the Uk's own idea. A Grukar-Uk encountered alone is a pitiable, cringing thing — more likely to flee or grovel than fight, unless it is cornered or sees an easy mark. In groups, they gain a dim collective courage, egging each other on into violence they would never attempt alone.

## Combat Strategy

Grukar-Uk fight as soldiers—they take orders, they form formations, they coordinate with other Grukar-Uk. They are competent but not exceptional in one-on-one combat. They are dangerous in groups due to coordination and numerical superiority. They are intelligent enough to disengage from losing fights and will flee if leadership falls. They use straightforward tactics: charges supported by ranged attacks, flanking maneuvers, and shield walls. They are less aggressive than Grukar-Hai but more disciplined and coordinated than many human soldiers.

## Attack Methods

### Spear Thrust

A solid thrust with a spear held in one hand or both, depending on the situation. The attack is straightforward and designed to keep enemies at distance.

### Axe or Club Strike

A swing with a hand-axe or club that combines decent strength with reasonable technique. Multiple strikes are common as the Grukar-Uk wears down opponents.

### Bow Attack

A ranged attack using a bow or crossbow, usually delivered from a position of support rather than front-line combat.

### Coordinated Attack

When fighting as part of a unit, Grukar-Uk attack simultaneously against single targets, overwhelming them through numerical superiority and coordinated strikes.

### Charge

Multiple Grukar-Uk charging together create tremendous impact. This tactic is used to break enemy formations or to sweep away lighter troops.

## Special Abilities

### Group Discipline

When fighting as part of a unit under clear command, Grukar-Uk gain coordination and effectiveness beyond what individual warriors possess. A well-led Grukar-Uk unit is a serious threat.

### Practical Toughness

Grukar-Uk are accustomed to hardship and danger. They can continue fighting through wounds and exhaustion longer than most species.

### Weapon Competence

Grukar-Uk are trained in weapon use from early age and handle axes, spears, and bows with solid competence. They are not masters, but they are competent professionals.

### Herd Mentality

A Grukar-Uk in a group fights better than alone. Multiple Grukar-Uk gain confidence and effectiveness from each other's presence.

## Additional Information

The Grukar-Uk are, paradoxically, both the least and most dangerous of the three subspecies. Individually, they are cowardly, dim, and easily cowed — a lone Uk can be bribed with food, frightened off with a show of force, or even captured and pressed into reluctant service. But the Uk should never be judged individually, because they are almost never encountered that way. In a warband, driven by fear of their Hai overlord and organized by a Sha counselor, the Uk become a swarming, relentless tide of crude weapons and desperate violence. Their strength — genuine, physical strength, muscle and bone and stubborn endurance — makes even a single blow from a Uk dangerous, and they fight in numbers that can overwhelm trained soldiers through sheer attrition. The key to defeating a Grukar-Uk horde is always the same: remove the leadership. Kill or rout the Grukar-Hai, and the Uk will break and scatter within minutes. Without fear to drive them, their natural laziness and cowardice reasserts itself almost instantly. They will not fight to the death for any cause, any loyalty, or any principle — they will fight to the death only when they believe that fleeing is more dangerous than staying, which is to say, only when a Grukar-Hai is standing behind them.

## Attributes

- **Strength:** 10-13 (1d4+9)

- **Endurance:** 10-13 (1d4+9)

- **Dexterity:** 6-9 (1d4+5)

- **Agility:** 5-8 (1d4+4)

- **Perception:** 5-8 (1d4+4)

- **Aura:** 3-6 (1d4+2)

- **Will:** 4-7 (1d4+3)

- **Reasoning:** 3-6 (1d4+2)

- **Creativity:** 4-7 (1d4+3)
