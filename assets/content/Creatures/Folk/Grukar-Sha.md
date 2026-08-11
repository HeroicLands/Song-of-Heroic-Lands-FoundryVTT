---
aliases:
    - Grukar-Sha
tags:
    - folk
name:
    full: Grukar-Sha
    aliases: []
id: FBrFf3Qr1QfvV4QY
img: icons/game-icons/delapouite/orc-head.svg
portrait: ""
shortcode: grkrsh
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 9
        end: 7
        dex: 13
        agl: 13
        per: 16
        aur: 13
        wil: 13
        rea: 17
        cre: 17
    attrRollFormula:
        str: 1d4+7
        end: 1d4+4
        dex: 1d4+10
        agl: 1d4+10
        per: 1d4+13
        aur: 1d4+10
        wil: 1d4+10
        rea: 1d4+14
        cre: 1d4+14
    body:
        structure:
            zones:
                - name: Head and Arms
                  shortcode: headzone
                  probWeight: 2
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
                  canHoldItem: false
                  probWeight: 6
                - name: Right Arm
                  shortcode: rarmpart
                  bodyZoneCode: headzone
                  roles:
                      - manipulator
                  canHoldItem: true
                  probWeight: 7
                - name: Left Arm
                  shortcode: larmpart
                  bodyZoneCode: headzone
                  roles:
                      - manipulator
                  canHoldItem: true
                  probWeight: 7
                - name: Torso
                  shortcode: torsopart
                  bodyZoneCode: torsozone
                  roles:
                      - core
                  canHoldItem: false
                  probWeight: 10
                - name: Right Leg
                  shortcode: rlegpart
                  bodyZoneCode: legszone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 5
                - name: Left Leg
                  shortcode: llegpart
                  bodyZoneCode: legszone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 5
            locations:
                - name: Head
                  shortcode: headloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 2
                  protectionBase:
                      blunt: 2
                      edged: 3
                      piercing: 1
                      fire: 3
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 1
                  protectionBase:
                      blunt: 2
                      edged: 2
                      piercing: 1
                      fire: 2
                - name: Right Upper Arm
                  shortcode: rupaloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: medium
                  amputability: medium
                  shockValue: 3
                  probWeight: 4
                  protectionBase:
                      blunt: 4
                      edged: 5
                      piercing: 2
                      fire: 5
                - name: Right Lower Arm
                  shortcode: rfraloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 2
                  protectionBase:
                      blunt: 2
                      edged: 2
                      piercing: 1
                      fire: 2
                - name: Right Hand
                  shortcode: rhandloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 2
                  probWeight: 1
                  protectionBase:
                      blunt: 2
                      edged: 2
                      piercing: 1
                      fire: 2
                - name: Left Upper Arm
                  shortcode: lupaloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: medium
                  amputability: medium
                  shockValue: 3
                  probWeight: 4
                  protectionBase:
                      blunt: 4
                      edged: 5
                      piercing: 2
                      fire: 5
                - name: Left Lower Arm
                  shortcode: lfraloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 2
                  protectionBase:
                      blunt: 2
                      edged: 2
                      piercing: 1
                      fire: 2
                - name: Left Hand
                  shortcode: lhandloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 2
                  probWeight: 1
                  protectionBase:
                      blunt: 2
                      edged: 2
                      piercing: 1
                      fire: 2
                - name: Thorax
                  shortcode: thrxloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 4
                  protectionBase:
                      blunt: 4
                      edged: 6
                      piercing: 2
                      fire: 6
                - name: Abdomen
                  shortcode: abdmnloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 3
                  protectionBase:
                      blunt: 2
                      edged: 4
                      piercing: 1
                      fire: 4
                - name: Pelvis
                  shortcode: plvisloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 3
                  protectionBase:
                      blunt: 2
                      edged: 4
                      piercing: 1
                      fire: 4
                - name: Right Upper Leg
                  shortcode: rthghloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: medium
                  amputability: low
                  shockValue: 3
                  probWeight: 5
                  protectionBase:
                      blunt: 4
                      edged: 5
                      piercing: 2
                      fire: 5
                - name: Right Lower Leg
                  shortcode: rcalfloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 3
                  protectionBase:
                      blunt: 2
                      edged: 3
                      piercing: 1
                      fire: 3
                - name: Right Foot
                  shortcode: rfootloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 2
                  probWeight: 2
                  protectionBase:
                      blunt: 2
                      edged: 3
                      piercing: 1
                      fire: 3
                - name: Left Upper Leg
                  shortcode: lthghloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: medium
                  amputability: low
                  shockValue: 3
                  probWeight: 5
                  protectionBase:
                      blunt: 4
                      edged: 5
                      piercing: 2
                      fire: 5
                - name: Left Lower Leg
                  shortcode: lcalfloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 3
                  protectionBase:
                      blunt: 2
                      edged: 3
                      piercing: 1
                      fire: 3
                - name: Left Foot
                  shortcode: lfootloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 2
                  probWeight: 2
                  protectionBase:
                      blunt: 2
                      edged: 3
                      piercing: 1
                      fire: 3
        weight:
            base: 172
            calc: (9 * str) + 50
        reachBase: 0
        bodyScaleBase: 0.88
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
              masteryLevelBase: 75
        - shortcode: stlth
          type: skill
          system:
              masteryLevelBase: 65
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 39
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 60
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 56
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 20
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

You almost missed it. Standing at the edge of the firelight, half-turned as though already leaving, is a figure that barely registers as a Grukar at all. It is thin — disturbingly thin, all sinew and angular bone beneath gray-green skin drawn tight as parchment. Perhaps four and a half feet tall, only slightly more than the common Uk, but where the Uk are squat and solid, this creature is narrow and sharp, built like a blade stood on its edge. Its eyes are what hold you: large for a Grukar, pale and quick, darting across the room with an intelligence that sits alien and unsettling in that tusked face. It carries no weapon you can see, though its long fingers move with a restless, deliberate precision that suggests it has several hidden about its person. When it speaks — and it is the only Grukar that speaks anything you can recognize as words — its voice arrives wrong. The mouth shapes the human syllables, but the resonance comes from somewhere deeper in the chest, a layer of tone the lips and jaw never produce in your own speech, and the result is a low pressure against your ribs that you feel before you fully understand the words. The massive Grukar-Hai warlord beside it actually listens. You do too. You wish you did not.

# Dossier {#dossier}

The Grukar-Sha are the brains of Grukar society, and they survive by making certain that no one ever thinks of them as a threat. Comprising roughly ten percent of the Grukar population, they are by far the weakest of the three subspecies in physical terms — thin, frail by Grukar standards, and utterly outmatched in any fair fight. But the Grukar-Sha have never fought a fair fight in their lives, and they have no intention of starting. Their gift is intelligence: a sharp, calculating cunning that sets them apart from every other Grukar as surely as the Hai's brute strength sets them apart. The Sha survive through two complementary strategies: making themselves indispensable to the powerful, and keeping everyone else too busy fighting each other to notice them. A Grukar-Sha whispering in the ear of a Grukar-Hai warlord is the true power behind many a tribal throne. They serve as scouts, spies, counselors, and poisoners — whatever role keeps them alive and in a position of quiet influence. They are the ones who stoke rivalries between competing Hai, who spread rumors among the Uk to prevent any dangerous solidarity, and who ensure that the tribal power structure always needs a clever advisor more than it needs another pair of fists.

## Presentation

Grukar-Sha stand roughly four and a half to five feet tall — only marginally taller than the common Grukar-Uk, but built along entirely different lines. Where the Uk are stocky and broad, the Sha are lean to the point of gauntness, with narrow shoulders, long limbs, and fingers that seem too dextrous for Grukar hands. Their skin is the same gray-green as their kin but tends toward paler, more mottled shades, often marked with subtle tattoos or paint that serves as camouflage. Their features are sharper and more angular than other Grukar, with high cheekbones, pointed ears, and unusually large, pale eyes that miss nothing. They dress practically in dark, unassuming garments — nothing that draws attention — and carry small, easily concealed weapons: daggers, bone needles, vials of poison. They move with an economy of motion that can seem almost nervous, always positioning themselves near an exit, near a shadow, near a protector.

## Key Behaviors

A Grukar-Sha's first and most important skill is reading the room. They are constantly assessing who holds power, who wants power, who can be manipulated, and who is about to become dangerous. Their survival depends on staying one step ahead of the volatile politics of Grukar society, and they approach every interaction — even with allies — as a calculation. Among the Grukar-Hai, a Sha positions itself as an invaluable counselor: the voice of strategy that the Hai's own brutal temperament cannot provide. Among the Uk, a Sha plays the role of overseer, interpreter of the warlord's will, or simply the creature that knows things others do not. Their deepest art is the manipulation of conflict itself — seeding discord between potential rivals, redirecting aggression away from themselves and toward convenient targets, ensuring that the tribal balance of power always requires a Sha to maintain. They are not cowards, precisely, but they are ruthlessly practical: if a situation turns violent, a Sha's first instinct is to ensure someone else does the fighting. When cornered, they are surprisingly dangerous — not through strength, but through preparation, dirty tricks, and an intimate knowledge of exactly where to stick a knife.

## Combat Strategy

A Grukar-Sha rarely engages in open combat if avoidable. Instead, they strike from darkness, from unexpected angles, from positions of advantage. They attack isolated targets and attempt to divide enemy forces. They use poison extensively and focus on achieving objectives rather than killing everything. When forced into direct combat, they rely on speed, agility, and precision to overwhelm opponents through strikes at vital points. A single Grukar-Sha is dangerous; multiple Grukar-Sha are a coordinated assassination unit. They communicate through subtle signals and can coordinate complex multi-target strikes with minimal visible coordination.

## Attack Methods

### Dagger Strike

A quick, precise strike with a poisoned dagger aimed at vital areas. The Grukar-Sha flows away after striking, making retaliation difficult. The poison on the blade causes pain, paralysis, or sickness depending on what toxin is applied.

### Short Sword

A slashing or thrusting attack with a short sword used with economy of motion. The strikes are designed to disable and weaken rather than immediately kill, allowing multiple strikes to accumulate damage.

### Poison Projectile

The Grukar-Sha fires small darts, shuriken, or poisoned needles from concealment. The projectiles are accurate and coated with toxins that cause various effects.

### Ambush Attack

From hiding, the Grukar-Sha strikes a single target with full force focused on a vital point. These attacks are devastat when they land.

### Coordinated Assault

When multiple Grukar-Sha fight together, they coordinate strikes against isolated targets, overwhelming them through simultaneous attacks from multiple angles.

## Special Abilities

### Shadow Mastery

In dim light or darkness, the Grukar-Sha becomes nearly invisible. They can move through shadows and concealment with ease and speed that seems supernatural.

### Silent Movement

The Grukar-Sha can move without making sound, even on surfaces that should be noisy. This ability allows them to approach without warning.

### Precision Strike

Attacks by the Grukar-Sha are calculated for maximum effect on vital areas. Critical strikes, poisoning, and target prioritization are instinctive.

### Poison Knowledge

The Grukar-Sha understands poisons and toxins extensively. Weapons are usually coated with carefully chosen poisons for specific effects.

### Escape Artist

The Grukar-Sha is skilled at exiting situations—climbing, swimming, jumping from heights that would kill others, running across precarious terrain. Escape is always possible if the Grukar-Sha decides to flee.

### Hybrid Speech

Alone among Grukar, the Grukar-Sha can produce human-language speech. The sounds emerge from a partial use of the mouth combined with the chest- and throat-resonating structures common to all Grukar — never wholly mouth-shaped as a human's voice is, never wholly internal-resonance as another Grukar's signals are, but a blend of the two that arrives slightly out of phase with what the lips appear to be doing. The result is recognizable, grammatically functional human speech that feels physically wrong to a human listener: low chest-pressure carries through every sentence, and consonants resonate from places the speaker's mouth could not have produced them. Most humans describe sustained conversation with a Grukar-Sha as draining and unsettling in a way they cannot quite name. This is the primary capability that lets the Grukar-Sha serve as inter-tribal envoy and as the only Grukar a humanoid party can negotiate with at all.

## Additional Information

A Grukar-Sha encountered alone is almost certainly on a mission — scouting, spying, or carrying a message — and is the most negotiable of all Grukar subspecies. They are pragmatists to their marrow, and if offered something that serves their interests better than their current orders, they will consider it carefully. They can be bribed, bargained with, or even temporarily allied with, though trusting a Sha is a fool's game; they will honor an agreement exactly as long as it benefits them. They are the most likely Grukar to speak other languages, to understand the customs of civilized folk, and to pass through settlements without immediately resorting to violence. This makes them invaluable as emissaries and go-betweens, and deeply dangerous as infiltrators. The greatest threat a Grukar-Sha poses is not in combat but in the chaos they leave behind: a well-placed rumor, a poisoned well, a forged letter that turns allies against one another. When dealing with a Grukar tribe, eliminating or turning the Sha advisors can collapse the entire power structure — but finding them is the hard part, because they are very good at not being found until they want to be.

## Attributes

- **Strength:** 8-11 (1d4+7)

- **Endurance:** 5-8 (1d4+4)

- **Dexterity:** 11-14 (1d4+10)

- **Agility:** 11-14 (1d4+10)

- **Perception:** 14-17 (1d4+13)

- **Aura:** 11-14 (1d4+10)

- **Will:** 11-14 (1d4+10)

- **Reasoning:** 15-18 (1d4+14)

- **Creativity:** 15-18 (1d4+14)
