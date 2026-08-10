---
aliases:
    - Nightwights
tags:
    - helspawn
name:
    full: Nightwights
    aliases: []
id: Kpo7Htb3b9uJEh6x
slug: nightwight
img: icons/game-icons/delapouite/person.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 16
        end: 16
        dex: 16
        agl: 16
        per: 16
        pal: 16
        wil: 18
        rea: 15
        cre: 16
    attrRollFormula:
        str: 1d4+13
        end: 1d4+13
        dex: 1d4+13
        agl: 1d4+13
        per: 1d4+13
        pal: 1d4+13
        wil: 1d6+14
        rea: 1d8+10
        cre: 1d4+13
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
        bodyScaleBase: 1.28
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

As night falls, the temperature drops and the darkness becomes attentive. A figure emerges from shadow—beautiful and terrible in equal measure, perfect in form and proportion like a god’s statue brought to life, yet utterly wrong. It is a human shape, but humanity has been refined away, leaving only an ideal that no living person could match. Its skin is pale but luminous, and its eyes burn with dark light. Where it stands, shadows deepen and cold settles. Looking upon it for too long fills you with an aching despair, as though witnessing something you were never meant to see.

# Dossier {#dossier}

**Nightwights** are the intelligent undead. They are powerful individuals who have undergone deliberate, prepared rituals to persist past death — vampires, undying lords, dread-priests, sorcerer-emperors who rule from beyond the grave, and similar figures.

## The Creation Process

Becoming a Nightwight requires _preparation during life_. The candidate undergoes rituals — a process that may take months or years — that align their soul, body, and circumstances for the transition. The rituals are part of a framework specifically designed for this purpose, typically held by particular dark traditions. They are not casual to perform; they require deep practitioner skill, expensive materials, specific timing, and other elaborate conditions.

The rituals inevitably end in the candidate's death. This is the critical point: the rituals do not merely prepare the candidate for some later transformation. They kill them. The candidate dies, and dies as a result of the ritual, and is dead afterwards in a meaningful sense.

After death — and this is the second critical point — the candidate is _not_ immediately reanimated by an attending agent. The arising happens later. Sometimes immediately, sometimes hours, sometimes days, sometimes weeks or months. The timing depends on the specific ritual, the candidate's nature, and the conditions. The arising does not require the original ritual-performer to be present. A vampire who bites and kills a victim does not need to stick around for the victim's eventual rising; the ritual was completed at the moment of biting and the framework continues to operate independently.

The newly arisen Nightwight is back in the world — animated, moving, conscious, often confused or grieving or exhilarated depending on the circumstances. The person who arose is not exactly the person who died, but the continuity is much higher than for any Helthraal. The soul is more or less intact; the personality is more or less preserved; the memories are more or less retained.

## Consent and Quality

The candidate's psychological state during the ritual matters enormously. Three patterns are common.

**Consenting and well-prepared.** A candidate who wants the transformation, who has worked through the rituals deliberately, who has prepared themselves spiritually for the death and the arising, produces a strong Nightwight. Their soul has a high liklihood of making the transition with maximum coherence preserved. The resulting Nightwight may be powerful, retains maximum identity and capacities at near-full or possibly beyond-full strength, and degrades slowly over time. This is the ideal Nightwight from the candidate's own perspective.

**Non-consenting and fighting.** A candidate who fights the process — actively resists the transformation as it happens, struggles against the ritual's effects, tries to refuse the death — damages their soul during the transition. The result varies depending on how much damage is done.

If the damage is moderate, the candidate may emerge as a weak Nightwight — lacking many of the capacities that fuller Nightwights have, perhaps fragmenting psychologically over time at a faster rate than usual. They are Nightwights only marginally. The worst part of this is the self-horror and self-loathing that comes along with this knowledge of what they have become, and the horror that awaits them.

If the damage is severe, the candidate emerges as a Helthraal instead — a [[Helthrall|Failed-Ritual Helthraal]]. The Nightwight transformation has failed, but the body still rises, animated by the partial soul that remains.

If the damage is catastrophic, the candidate may not arise at all. The body remains dead. The soul, fragmented and damaged, dissolves and disperses in the spirit realm, gone and irredemably unrecoverable.

## Power and Capacities

A successful Nightwight retains much of what they were in life, and often more. Capacities they had may be enhanced — a warrior's strength becomes supernatural, a sorcerer's framework-magic becomes more potent (drawing on the increased Aura that the transformation has unlocked), a charismatic leader's presence becomes overwhelming. The specific enhancements vary by tradition and by individual; not all Nightwights have the same gifts.

Common capacities across most Nightwights include:

- **Greatly extended lifespan** — Nightwights persist for centuries if not interrupted.

- **Enhanced physical strength** in many traditions, though not all.

- **Heightened senses or unusual perceptual abilities.**

- **Immunity to many of the limitations that constrain the living** — they do not tire as readily, do not need to eat ordinary food, do not age in the standard biological way (though see degradation, below).

- **Resistance to harm** — Nightwights can absorb injuries that would kill the living, and may regenerate damage that would be permanent on a mortal.

Specific Nightwight traditions have specific capacities. Vampire-tradition Nightwights commonly have abilities relating to blood, transformation, and influence over the living. Sorcerer-tradition Nightwights may retain and amplify their magical capacities. Priestly Nightwights of dark traditions may continue to perform their religion's thaumaturgy, often with greater power than they had in life. The variation is broad, and specific Nightwight types are best treated in their own bestiary entries.

Appearance varies. Some Nightwights look nearly normal — pale, slightly cold, perhaps a faint wrongness perceptible to those who linger. Some look unnaturally beautiful, in ways the living find both attractive and disquieting. Some look obviously inhuman — withered, monstrous, or marked by their dark transformation. The appearance often reflects the Nightwight's specific tradition and the conditions of their creation.

## Degradation

Nightwights, like Helthraals, eventually degrade. The process occurs over a period of weeks, with the Nightwight originally appearing quite like a normal person, but over time becoming pallid and grey, smelling of decay, and unable to tolerate daylight. If left unchecked, the Nightwight will eventually degrade to the level of a Helthraal, and ultimately rot away completely.

## Rebirth

Nightwights have 13 lives. When a Nightwight is finally destroyed, either through total destruction of the body or through complete decay, the animating force of the Nightwight dissolves for a time before reassembling itself. This process takes anywhere from 1-12 months. When the time period has expired, the Nightwight is restored to life in a new body in their hallowed ground, identical to their prior body except physically somewhat degraded. The new body can never attain the level of physical capacity as their prior body, although their mental capabilities and aura are more pronounced. A body a few generations old may faintly smell, or look perpetually pallid, but can otherwise pass as normal folk. A body many generations old will be difficult to pass as normal folk to close scrutiny even in the dimmest light.

After the 13th life is complete, the Nightwight is completely destroyed, the soul dissolved, and irredemably gone. This is the ultimate fate that awaits all Nightwights.

## Hallowed Ground

All Nightwights have a "base", or Hallowed Ground, where they will eventually return if catastrophe strikes and their body is destroyed. The Nightwight takes care to choose this location with prudence, to ensure it is safe and hidden. The Nightwight may change the location at will, but only one location may be chosen at any time, and the Nightwight must be physically present to designate a spot as their Hallowed Ground.

## Regeneration

To halt or reverse the degradation, Nightwights must _regenerate_ — and regeneration is universally predatory. Different traditions of Nightwight regenerate by different mechanisms, but all involve harm to the living. Specifics include:

- **Drinking the blood of the living** — the most familiar mechanism, characteristic of the vampire traditions. The Nightwight feeds on living blood, drawing into themselves the vitality that the blood carries. Regular feeding sustains them; long abstinence accelerates degradation; gluttonous feeding may produce stronger or more rapid restoration.

- **Feeding on the flesh of the living** - Some Nightwights sustain themselves with the flesh of living victims rather than simply the blood. This is functionally similar to drinking blood.

- **Consuming Aura directly** — some Nightwights draw the soul-substance out of living victims, leaving the body intact but the person diminished. Victims may survive but with reduced Aura, often permanently. This is less common than blood-feeding but produces a Nightwight whose presence is detectable in different ways and whose victims show different signs.

- **Feeding on emotions or specific kinds of mental experience** — fear, despair, ecstasy. Some Nightwight traditions cultivate this and require victims who can produce the specific emotion in sufficient quantity. These Nightwights are often skilled manipulators, since they need to engineer the emotional state of their prey.

All regeneration mechanisms involve harm. There is no benign Nightwight feeding pattern. The cosmology does not provide for an ethical undead.

Regeneration only occurs after feeding and spending time in their Hallowed Ground.

## GM Notes: Running Helspawn

Several practical implications follow from the cosmology established here.

**Helthraals are tragic.** A Helthraal that retains fragments of identity is genuinely tragic. The being that remains is a damaged person, not a monster — at least at first. Encounters with Recently Returned Helthraals should be played for the emotional weight they deserve. The grieving necromancer who has pulled their lost child back, only to watch the child slowly deteriorate over weeks, is a story Thalorna's cosmology supports and rewards developing. Players who are made to feel the loss are players who understand why necromancy is treated as it is.

**Nightwights are people with terrible appetites.** A Nightwight is not a moustache-twirling villain in undead form. They are persons — frequently quite sophisticated persons, often educated, often with long memory and developed aesthetics — whose existence requires harming the living. The horror of a Nightwight is partly their power and partly the disconnect between their continued personhood and their predatory necessity. The vampire lord who hosts elegant gatherings, conducts intellectually engaging conversations, and quietly drains a servant in the cellars before retiring is a more disturbing figure than a snarling beast. The cosmology supports the former; the GM should lean into it.

**Nightwight politics are real and developable.** The control relationships, the lineage structures, the conflict between creators and creations — these can be developed into substantial campaign material. A campaign that involves the players' characters opposing a vampire court is also a campaign about the court's internal politics, which include real factions, real grievances, and real power dynamics. Some Nightwights may even be allies of convenience for the players, against rivals among their own kind.

**Failed-Ritual Helthraals raise the stakes for Nightwight encounters.** When a Nightwight ritual fails badly, the result is not "nothing happens." It is a Failed-Ritual Helthraal, possibly intelligent enough at first to be confused for a Nightwight. This means encounters with the aftermath of a failed ritual can be ambiguous — is this person a damaged Nightwight, a Failed-Ritual Helthraal, or something else? — and the answer takes time to become clear. Used sparingly, this is a useful narrative tool.

**The dark theology of the cosmology applies.** Helspawn exist because mortal souls have been removed from their proper post-mortem trajectory. Every Helthraal is a soul that should have transitioned; every Nightwight is a soul that arranged to refuse the proper passage. The cosmological-religious frameworks of most Thalornan cultures treat this as a profound disorder — not just because Helspawn are dangerous to the living, but because they are _out of place_ in the order of things. Adherents of religions that take post-mortem destinations seriously will treat Helspawn with particular horror.

**The Quaesitorium's hunting of necromancers includes Helspawn.** The Ordo's enforcement arm pursues necromancers because they are unsanctioned framework-mages doing soul-work the Ordo does not approve. The Quaesitorium also pursues Helspawn — particularly Nightwights — wherever they can be found. The hunt is dangerous (Nightwights are often more powerful than the Quaesitorium's investigators), and the Ordo accepts losses among its hunters as a cost of the work. Some Quaesitorium specialists have spent careers chasing specific Nightwight figures across decades; their motivations may be religious, political, personal, or some combination.

**Helspawn-hunters as a profession.** Across Thalorna, several professional traditions exist for hunting Helspawn — typically employing some combination of framework-magic (priestly or arcane), specialised weapons, ritual knowledge, and mundane investigation. The Quaesitorium maintains formal hunters within the Ordo's structure. Independent hunters operate in regions where the Ordo has limited reach. Folk traditions in some areas raise particular families or lineages as Helspawn-hunters. Campaigns can centre on such hunters — their methods, their training, their losses, their occasional triumphs.

**Specific Helspawn types belong in the bestiary.** This document covers the cosmological foundation. Specific named undead — particular vampire courts, particular Nightwight lineages, particular Helthraal variants associated with certain regions or traditions — belong in their own bestiary entries, with statistics, lore, and adventure hooks. The cosmology established here applies to all of them; the specifics are individual.

### Daylight Penalties

- Suffer -4 to all physical attributes, and -2 to all mental attributes

## Attributes

- **Strength:** 14-17 (1d4+13)

- **Endurance:** 14-17 (1d4+13)

- **Dexterity:** 14-17 (1d4+13)

- **Agility:** 14-17 (1d4+13)

- **Perception:** 14-17 (1d4+13)

- **Shadow:** 14-17 (1d4+13)

- **Will:** 15-20 (1d6+14)

- **Reasoning:** 11-18 (1d8+10)

- **Creativity:** 14-17 (1d4+13)

## See Also

- [[Souls_and_Spirits]] — The underlying cosmology of souls, the spirit realm, death and transit, and related material

- [[Magic_Truth]] — The metaphysics of magic, Aura, frameworks, and thin places

- [[Gods_and_Religion]] — Priestly thaumaturgy, including the framework-magic effective against Helspawn

- [[Divine_Action]] — Divine agents, including those that may be involved in Nightwight creation in some traditions
-
-
