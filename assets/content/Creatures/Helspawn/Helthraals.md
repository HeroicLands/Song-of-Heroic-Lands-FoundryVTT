---
aliases:
    - Helthraals
tags:
    - helspawn
name:
    full: Helthraals
    aliases: []
id: Y8roQ11S5nFysVFW
slug: helthraal
img: icons/game-icons/lorc/werewolf.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 14
        end: 16
        dex: 6
        agl: 6
        per: 6
        pal: 11
    attrRollFormula:
        str: 1d6+10
        end: 1d4+13
        dex: 1d4+3
        agl: 1d4+3
        per: 1d4+3
        pal: 1d6+7
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
            base: 150
            calc: 150
        reachBase: 0
        bodyScaleBase: 1.17
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 30
          leaguesPerWatch: 2
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
    defaultCombatGroup: null
    items:
        - shortcode: bite
          type: skill
        - shortcode: grab
          type: skill
        - shortcode: headbutt
          type: skill
        - shortcode: kick
          type: skill
        - shortcode: limbblock
          type: skill
        - shortcode: press
          type: skill
        - shortcode: punch
          type: skill
        - shortcode: trip
          type: skill
---

# Appearance {#appearance}

What rises before you is the obscenity of a corpse made animate — a body that has been dead long enough to decay, long enough that pieces should be missing, yet here it stands moving with a shambling gait. The smell hits you like a physical force — rot, decay, the stench of death too advanced to sustain life. Where flesh has fallen away, bone is visible beneath. Patches of mold and fungi grow across the surface. Yet the creature moves with terrible purpose, driven by something other than flesh, other than will. Its eyes, if they can be called that, are dark pits filled with necromantic shadow. This was a person once. No longer.

But not all Helthraals have reached this state. Some are far more terrible precisely because they are still recognizable — a returned husband whose eyes are slightly wrong, a daughter brought back from the grave who speaks in broken sentences and flinches from sunlight. These are the recently returned, the ones who still remember, and they are more disturbing than any shambling corpse because they occupy the space between the living and the dead where neither category quite applies.

# Dossier {#dossier}

**Helthraals** are the unintelligent (or limited-intelligence) undead — zombies, mummies, skeletons, ghouls, and similar shambling things. They are produced by necromantic animation of corpses, with the soul (or a fragment of it) bound to drive the body's motion.

## The Spectrum of Degradation

Helthraals exist along a continuous spectrum of degradation. Where on the spectrum any particular Helthraal sits depends on how recently it was created, how skilled the necromancer was, what state the soul was in, and how much time has passed since animation.

### The Recently Returned

A soul pulled back shortly after death by a skilled necromancer may produce a Helthraal almost indistinguishable from the living person at first glance. The body is cold to the touch, the skin slightly grey or pallid, the eyes not quite right — too still, too reflective, or carrying a faint luminescence in low light. But the person speaks. They recognise family. They remember their name, their home, fragments of their life. Some can carry on conversation, follow complex instructions, even display emotion — though whether these emotions are genuine or echoes of habit is a matter of grim theological debate.

These recently returned Helthraals are the most dangerous to encounter emotionally, because they provoke sympathy rather than revulsion. A grieving spouse sees their partner returned, diminished but _present_, and the instinct is to care for them, to hope, to believe that this is still the person they loved. It is not. The soul is damaged, the personality fragmentary, and the hunger is already there — suppressed initially by whatever remains of the person's will, but present and growing. The recently returned may go days or even weeks before the hunger becomes unmanageable. When it does, the results are catastrophic for anyone nearby.

**Attributes:** Recently returned Helthraals retain much of their living capability. Physical attributes may be only slightly diminished (or in some cases enhanced by necromantic energy), and mental attributes can be near-normal initially. They can use weapons with skill, speak clearly, and navigate complex environments. They are the most individually dangerous Helthraals because they combine near-human intelligence with the beginnings of undead resilience.

### The Fading

Within weeks to months of reanimation (the rate varies based on the strength of the original soul, the skill of the necromancer, and the time spent in the spirit realm before retrieval), the degradation becomes unmistakable. Speech becomes slurred, then monosyllabic, then gone. Memory fragments — the Helthraal may recognise a place or a face but cannot say why. Coordination deteriorates: movements become stiff, then jerky, then shambling. The skin greys and begins to show signs of decay that no living body would exhibit. The eyes lose whatever warmth they had, becoming flat and dark.

The hunger, previously suppressed, becomes the dominant drive. A fading Helthraal will attack living creatures to feed, though the feeding provides no benefit — the blood and flesh consumed simply pass through or accumulate uselessly. The compulsion is spiritual, not nutritional, a broken echo of the soul's desperate need for the vitality it lost.

**Attributes:** Physical attributes begin to decline, particularly dexterity and agility. Strength and endurance may remain high due to necromantic sustenance. Mental attributes deteriorate rapidly — reasoning, will, and perception all falling. The Helthraal becomes increasingly reliant on instinct and the commands of its controller.

### The Shambling Dead

This is the state most people associate with the word "Helthraal" — a corpse in advanced decay given animation and terrible purpose. The body is partially decomposed, with patches of missing flesh revealing bone or empty cavities beneath. Clothing hangs in tatters from decaying flesh. The creature moves with jerky, irregular motion, as though the animation magic is pulling at random points rather than controlling the whole smoothly. The eyes are hollow pits of darkness that reflect no light. The smell is overwhelming. No trace of the original person remains.

A Helthraal in this state has no independent behaviours. It exists to follow commands from its controller — typically a Nightwight or priest — or, if no controller is present, to pursue the only drive that remains: hunger. It will march for days without rest. It will attack enemies regardless of odds. It cannot be intimidated or bargained with because there is no person present to bargain with. Multiple shambling Helthraals in an area will ignore each other unless commanded otherwise, standing or moving in mechanical uniformity.

**Attributes:** Physical capability is reduced to brute force — high strength and endurance from necromantic energy, but minimal dexterity, agility, and perception. Mental attributes are effectively zero. These Helthraals are slow, clumsy, and predictable individually, but overwhelming in numbers.

### The Terminal

A Helthraal in its final stage of degradation is barely mobile — a collection of bones and leathery remnants held together by the last guttering sparks of necromantic energy. It moves in lurching, almost random patterns, no longer capable of following commands or even pursuing prey effectively. It may collapse and lie inert for hours before animation flickers back to life and drives it forward again. Eventually, the soul fragments dissipate entirely, the necromantic energy fails, and the body collapses into a heap of bone and decayed matter. What was once a person — what might once have been a loved one, pulled back from the afterlife by a grieving family — is simply gone. No afterlife. No rebirth. No continuation. The soul has been spent.

## Failed-Ritual Helthraals

Not all Helthraals are created by pulling souls back from the spirit realm. Some are the products of failed [[#Nightwights|Nightwight]] creation rituals. When a subject undergoes the deliberate ritual of killing and reanimation that is meant to produce a Nightwight, but the individual proves insufficient — lacking the spiritual strength, the devotion, or simply the raw power necessary to survive the transition with their soul intact — the result is a Helthraal.

These failed-ritual Helthraals are notably more powerful than those produced by spirit-realm retrieval. They begin at a higher point on the spectrum and degrade more slowly. A failed Nightwight who emerges from the ritual as a near-human Helthraal may retain intelligence and capability for months before the slide begins. The end is always the same — eventually they degrade into the Shambling Dead and then the Terminal — but their ascendant phase lasts longer.

This is because the Nightwight ritual _partly succeeded_. The candidate's soul went through significant alignment and reinforcement during the rituals; even when the final transition failed, the soul retains more coherence than a soul crudely yanked from the spirit realm by a necromancer. The result is a damaged Nightwight-aspirant rather than a freshly-crippled fragment.

## The Hunger

All Helthraals, regardless of where they fall on the spectrum, experience an insatiable hunger for the flesh and blood of the living. The hunger is not nutritional — consuming flesh provides no sustenance, no healing, no benefit. It is a spiritual compulsion, the broken soul's desperate and futile attempt to reclaim the vitality it lost. Blood is the strongest draw; a Helthraal will pursue bleeding prey with particular intensity, driven by the warmth and life-force that blood represents. But flesh, breath, warmth of any kind — all provoke the hunger.

The recently returned may suppress this hunger through residual willpower, sometimes for weeks. As degradation progresses, the hunger becomes uncontrollable. In their terminal state, the hunger is all that remains — the last flicker of animation in a body that has lost everything else.

## Presentation

The appearance of a Helthraal depends entirely on its position on the degradation spectrum. The recently returned may look almost normal — pale, cold, slightly stiff in their movements, but clothed and clean and recognisable. A Helthraal several weeks into degradation shows visible signs: greying skin, sunken features, a faint smell of decay, movements becoming increasingly mechanical. A fully degraded Helthraal is the classic horror — rotting flesh, exposed bone, tattered remnants of clothing, hollow eyes, overwhelming stench. The progression is continuous and irreversible.

## Combat Strategy

Helthraals fight according to their position on the spectrum. The recently returned retain combat skills from life and can employ tactics, use weapons with proficiency, and make intelligent decisions in battle. They are dangerous opponents because they combine near-human capability with the beginnings of undead resilience — they feel no pain, do not tire, and can absorb injuries that would incapacitate a living fighter. As degradation progresses, tactics give way to instinct, instinct gives way to simple aggression, and simple aggression gives way to the mindless, relentless advance of the shambling dead. In groups, degraded Helthraals overwhelm through numbers and endurance, pressing attacks from multiple directions without regard for self-preservation.

## Attack Methods

### Weapon Strike

Helthraals that retain skill from life fight with whatever weapons they possessed or were given. The recently returned may fight with genuine proficiency. Degraded Helthraals strike clumsily but with supernatural strength.

### Grapple and Bite

The hunger drives all Helthraals toward close-quarters feeding. Even those retaining weapons will sometimes drop them to grapple and bite, particularly when the hunger is strong. The bite of a Helthraal carries infectious contamination — wounds inflicted by undead teeth often fester and cause sepsis.

### Shambling Charge

Multiple degraded Helthraals charging together create a wave of undead flesh that can overwhelm positions through sheer mass.

### Overwhelming Assault

A group of Helthraals coordinating attacks (whether directed by a controller or simply converging on prey) will press relentless assaults, wearing the target down through repeated strikes from multiple directions.

## Special Abilities

### No Pain or Fatigue

A Helthraal does not tire, does not feel pain, and does not suffer psychological effects.

### No Need for Air or Rest

A Helthraal does not need to breathe. Initially it may mimick this behavior, and it is necessary to breathe to speak, but it cannot be suffocated or drown. A helthraal cannot float or swim, but will drop to the river, lake, or sea floor, where they can walk to eventually make their way out of water.

### No Need for Food

A Helthraal has no need of sustenance. The necromantic energy is what provides them animation, and they will be uninterested in eating or drinking normal food of any sort. If they do so, they will ultimately regurgitate it undigested but putrid, since their digestive system no longer functions but the food decays.

Note this is separate from the Hunger, which is a spiritual compulsion.

### Supernatural Endurance

A Helthraal can survive destruction of internal organs that would kill a living creature. It continues functioning even when missing limbs, as long as the core animation sustains. It fights at full strength until destroyed and will continue moving until grievously damaged. No shock rolls are necessary.

In many cases, severed limbs will continue to animate, fingers draging a severed hand across the ground, a leg continuing to bend and kick to move, a torso with one arm reaching out to grasp a victim.

Only a grevious wound to a body part will disable that body part, and only by disabling all of the body parts can a Helthraal be destroyed. A particularly effective way to defeat them is to use fire to burn the whole body.

### Daylight Effects

Helthraals abilities and resilience is degraded in normal sunlight. Torchlight or other sources of light have no effect, only daylight. The effect of this is that serious wounds are treated as if they are grevious wounds when inflicted in daylight, and the Helthraal decays at a faster rate (3x normal) when exposed to regular sunlight. Even highly functional Helthraals will avoid daylight if at all possible, hiding in a room or other shade to avoid direct sunlight.

Note that the effect of sunlight on a Helthraal is directly proportional to its ability to cast a shadow. On dark, rainy, overcast days, the Helthraal may be unaffected by the dim daylight.

### Hive Coordination

When multiple Helthraals are controlled by the same entity, they move in perfect coordination without visible signals, suggesting they share some form of connection through the controller.

### Flesh Hunger

All Helthraals are drawn to living flesh and blood with compulsive intensity. They always prefer the living blood an flesh of their own kind before all others. Dead flesh and spilled blood has no attraction for them.

## Creators and Control

All Helthraals have creators — either the necromancer who animated them or the priest or other agent who performed the work. The creator typically retains some degree of control over the Helthraal: direct verbal command at close range, or broad instructions to be carried out at greater distances. The strength of control varies with the practitioner's skill and the Helthraal's state of degradation. A skilled necromancer with a recently returned Helthraal exercises something close to full command; a sloppy necromancer with a shambling Helthraal can give it general directions and hope.

Helthraals who are not directly controlled, or whose controller dies or is incapacitated, revert to their natural state. The Helthraal either does what it wants (if it still has the mental capacity for self-determination or self-preservation) or reverts to hunger-driven autonomy.

## Additional Information

A Helthraal cannot be cured. The degradation of the soul is irreversible, and no known magic can restore what has been lost. The kindest thing that can be done for a recently returned Helthraal — one that still remembers, still speaks, still recognizes loved ones — is to destroy it swiftly and perform proper funerary rites over the remains. Whether those rites accomplish anything for the already-damaged soul is a matter of theological debate, but the alternative — allowing the person to slowly degrade into a mindless, flesh-hungry shell while their family watches — is universally acknowledged as worse.

Settlements dealing with Helthraals should focus on finding and eliminating the controller or the source of necromantic power. Large groups of degraded Helthraals can be managed with obstacles and barriers, which they will not intelligently circumvent. The presence of recently returned Helthraals — those that can still speak and reason — should be treated with extreme caution. They are not the people they appear to be. They are the echoes of those people, fading, and they will become dangerous.

## Attributes

The attributes below represent a fully degraded Helthraal — the shambling dead. Recently returned Helthraals may have attributes approaching or matching their living values, declining over weeks and months toward these minimums.

- **Strength:** 11-16 (1d6+10)

- **Endurance:** 14-17 (1d4+13)

- **Dexterity:** 4-7 (1d4+3)

- **Agility:** 4-7 (1d4+3)

- **Perception:** 4-7 (1d4+3)

- **Shadow:** 8-13 (1d6+7)
