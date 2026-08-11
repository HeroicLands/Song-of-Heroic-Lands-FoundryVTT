---
aliases:
    - Grukar-ahk
    - Grukar-Ahk
tags:
    - folk
name:
    full: Grukar-ahk
    aliases: []
id: ZwRLpmQF1zAklkyE
img: icons/game-icons/delapouite/orc-head.svg
portrait: ""
shortcode: grkrahk
type: creature
package: sohl
sohl:
    kbcat: grukar
    archetype: 0
    attributes:
        str: 13
        end: 17
        dex: 11
        agl: 9
        per: 15
        aur: 16
        wil: 17
        rea: 14
        cre: 12
    attrRollFormula:
        str: 1d6+9
        end: 1d6+13
        dex: 1d6+7
        agl: 1d4+6
        per: 1d6+11
        aur: 1d6+12
        wil: 1d6+13
        rea: 1d6+10
        cre: 1d6+8
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
        bodyScaleBase: 1.11
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
    items:
        - shortcode: awar
          type: skill
          system:
              masteryLevelBase: 80
        - shortcode: stlth
          type: skill
          system:
              masteryLevelBase: 65
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 48
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 64
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 48
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 38
        - shortcode: bflkbite
          type: skill
        - shortcode: bflkgrab
          type: skill
        - shortcode: bflkheadbutt
          type: skill
        - shortcode: bflkkick
          type: skill
        - shortcode: limbblock
          type: skill
        - shortcode: press
          type: skill
        - shortcode: bflkpunch
          type: skill
        - shortcode: trip
          type: skill
---

# Appearance {#appearance}

The chamber smells of damp earth, of resin smoke, and of something heavier and stranger beneath both — a sweet-rancid musk that catches at the back of your throat. The figure within is not what the warband outside led you to expect. It is broader through the hips and torso than any Grukar-Hai you have seen, and softer, in a way that has nothing to do with weakness — the build of something that is heavy with internal architecture rather than external muscle. The skin is the universal Grukar gray-green, but smoother, less scarred, marked with a pattern of dark whorls along the belly and inner arms. The face is calm. The eyes are large, dark, and steady, and they regard you with a slow, considering intelligence that has none of the Hai's fury and none of the Sha's sliding cunning. Behind it, in a row of stone-lined depressions in the chamber floor, you see the eggs. Some are the dull gray of unhatched Uk; some are pale and ridged and clearly destined to become Sha; one or two, larger and darker than the rest, are unmistakable in their meaning. The Grukar-ahk lays a hand against the warmth of the floor and nods to your guide. The audience has begun.

# Dossier {#dossier}

The Grukar-ahk is the spawning subspecies of [[Setting/Creatures/Folk/Grukar]] — the hermaphroditic, self-fertilizing matrix on which the entire reproductive cycle of Grukar society depends. Each tribe contains exactly one fertile Grukar-ahk plus three to six infertile reserves; the fertile spawner produces all of the tribe's offspring, and (uniquely among known creatures) it can choose the subspecies of each clutch — laying eggs that will hatch as Grukar-Uk, Grukar-Sha, or Grukar-Hai according to the tribe's changing needs. The infertile Grukar-ahk are physically smaller and structurally simpler than the fertile one; they cannot spawn while the fertile spawner lives, but each carries the latent capacity to become fertile if abducted from the tribe and held at sufficient distance from its mother-spawner. Adventurers encounter Grukar-ahk almost exclusively in the deep interior of an established Grukar tribe, in a heavily defended spawn-chamber accessible only through layers of Hai guardians and Sha-laid traps. A Grukar-ahk encountered outside that protection is almost always either a hostage of inter-tribal politics or a recently abducted infertile being run to a new territory in the founding of a new tribe.

## Presentation

A Grukar-ahk stands roughly five to five and a half feet tall, somewhat shorter than the average Hai but considerably broader through the hips, lower abdomen, and pelvis — an overall silhouette closer to bell-shaped than the wedge of the Hai or the slab of the Uk. Body mass typically runs two hundred and fifty to three hundred and fifty pounds, almost all of which is internal: the spawning structures, an unusually deep abdominal cavity, and a layered system of glands and ducts that no human anatomist has ever dissected. The skin is the standard Grukar gray-green but smoother and less heavily scarred than the warrior castes, marked along the belly, inner arms, and inner thighs with patterns of darker whorls (the meaning of which only Grukar themselves can read). The face is heavier-jawed than a Sha but less brutal than a Hai, with broad nostrils, wide-set dark eyes, and a relatively short tusk profile. Movement is slow and ponderous in the fertile state — the active spawner is heavy with eggs much of the time and rarely chooses to move quickly. Infertile Grukar-ahk are noticeably leaner and more mobile, but still slower and softer-bodied than any of the warrior castes.

## Key Behaviors

The fertile Grukar-ahk almost never leaves the spawn-chamber. Its life is the slow, deliberate management of its tribe's demography — laying clutches, evaluating the ratios of subspecies in the existing population, listening to the reports of Hai warlords and Sha counselors about external pressures, and adjusting the next clutch accordingly. A Grukar-ahk that recognizes a tribe is short on warriors will spawn more Hai; one that recognizes it has too many Hai (and the resulting fratricide problem) will spawn more Sha and Uk. This deliberate demographic engineering is the principal reason Grukar tribes survive their own internal violence: the spawner reads the tribe and corrects the imbalance, generation by generation. The infertile Grukar-ahk serve as personal guardians of the fertile spawner, never far from the spawn-chamber, and as a kind of strategic reserve — if the fertile spawner dies, one of the infertiles will eventually become fertile in turn, but the transition is slow and a tribe is vulnerable during it. Every Grukar-ahk, fertile or otherwise, is intelligent in a way the warrior castes are not: they remember individuals across generations, hold long views about tribal trajectory, and converse with Sha counselors as equals.

## Combat Strategy

The Grukar-ahk is not a combat caste. The fertile spawner fights only as a last resort, when guardians have failed and the spawn-chamber itself is breached; in that situation it fights with desperate strength, drawing on stored reserves and on the calm, pitiless authority that long practice in command grants. Infertile Grukar-ahk are more willing to engage — a tribe expects them to die before the fertile spawner does — and they are taught to fight as a coordinated guard unit, defending the chamber doorway in a tight phalanx. They are not as strong as Hai or as quick as Sha, but they are remarkably resilient, slow to bleed out, and unusually coordinated. A party that has fought through the Hai guards and Sha traps to reach the spawn-chamber will find the infertile Grukar-ahk arrayed in front of the fertile one, and will have to kill all of them to reach their target.

## Attack Methods

### Heavy Mace or Club

Most Grukar-ahk who fight at all use a heavy weighted club or mace — a weapon that depends on mass rather than skill, suited to the spawner's slow but powerful frame. Strikes are deliberate, well-aimed, and meant to disable rather than to display.

### Grapple and Pin

Infertile Grukar-ahk in particular are trained to grapple intruders — to close, hold, and trap an enemy until other defenders can deliver a killing blow. The spawner's broader build and lower center of mass make it a surprisingly effective grappler against humanoid opponents.

## Special Abilities

### Demographic Spawning (fertile only)

The fertile Grukar-ahk can choose, at the moment of laying, which Grukar subspecies a particular egg will hatch as. This is a slow process — clutches are laid over weeks, and the demographic effect of a single clutch only becomes visible months later as the spawn matures — but it is the single most strategically important ability on display in any Grukar tribe. A Grukar-ahk that has been studying its tribe and has decided it needs more Hai will lay Hai; a Grukar-ahk that has lost too many Sha will lay Sha. No human-known creature has anything resembling this capability.

### Latent Fertility (infertile only)

An infertile Grukar-ahk that is removed from its mother-tribe — kidnapped, abducted, exiled, or otherwise carried at sufficient distance from the tribe's existing fertile spawner — undergoes a slow biological activation, becoming fertile over a period of weeks to months. This is the engine of Grukar fission: the founding of a new tribe begins with this transition, and the infertile Grukar-ahk that has just become fertile begins immediately to lay an opening clutch shaped to the new territory.

### Tribal Awareness

A fertile Grukar-ahk is in some manner aware of every Grukar in its tribe — counts, locations, status, deaths. The mechanism is unclear to outside observers (some scholars suggest pheromonal communication through the underground tunnels that connect Grukar settlements; others suggest something stranger), but the practical effect is that the spawner cannot be deceived about the state of its own tribe, and it knows immediately when a member dies or when a new spawn matures.

### Resilient Constitution

Grukar-ahk are slow, but they are also unusually resistant to bleeding, shock, and ordinary damage. The fertile spawner in particular, with its deep internal architecture, can absorb wounds that would drop a Grukar-Hai of equivalent mass. This is biological insurance — a tribe whose spawner dies easily will not last — and it makes assassination of a fertile Grukar-ahk a much harder proposition than its slow movement and rare combat experience would suggest.

## Attributes

- **Strength:** 10-15 (1d6+9)

- **Endurance:** 14-19 (1d6+13)

- **Dexterity:** 8-13 (1d6+7)

- **Agility:** 7-10 (1d4+6)

- **Perception:** 12-17 (1d6+11)

- **Aura:** 13-18 (1d6+12)

- **Will:** 14-19 (1d6+13)

- **Reasoning:** 11-16 (1d6+10)

- **Creativity:** 9-14 (1d6+8)
