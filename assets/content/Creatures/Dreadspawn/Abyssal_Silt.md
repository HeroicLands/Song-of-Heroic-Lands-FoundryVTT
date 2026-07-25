---
aliases:
  - Abyssal Silt
tags:
  - dreadspawn
name:
  full: Abyssal Silt
  aliases: []
id: GCS6qKbHuZdHpbcY
slug: abyssal-silt
img: images/abyssal-silt-headshot.webp
portrait: images/abyssal-silt.webp
type: creature
package: thalorna
sohl:
  attributes:
    str: 14
    end: 20
    dex: 16
    agl: 16
    per: 14
    aur: 12
    wil: 18
    rea: 12
    cre: 12
  attrRollFormula:
    str: 1d6+10
    end: 1d6+16
    dex: 1d4+13
    agl: 1d4+13
    per: 1d6+10
    aur: 1d4+9
    wil: 1d6+14
    rea: 1d4+9
    cre: 1d4+9
  body:
    structure:
      parts: []
      adjacent: []
    weight:
      base: 200
      calc: 200
    reachBase: 0
    bodyScaleBase: 1.0
    personalFatigue: enc + 5
  currentMoveMedium: terrestrial
  movementProfiles:
    - medium: terrestrial
      feetPerRound: 20
      leaguesPerWatch: 1
      encumbrance: floor(wt/4)
      strMod: -5 * floor((str - 10) / 2)
      factors: []
      disabled: false
  defaultCombatGroup: null
  items: []
---

# Appearance {#appearance}

The air above the ground reeks of char and copper—a caustic stench that makes your eyes water. Something writhes in the darkness, a throbbing mass of midnight blue that catches light as if the depths of the world have pooled here. Fine, thread-like appendages quiver from its surface, tasting the air, sensing. Where it rests, stone itself glistens wet and pitted, the stone dissolving as you watch.

# Dossier {#dossier}
The Abyssal Silt is a predatory ooze born from deep caverns and toxic marshlands, a creature fundamentally wrong—a thing that hungers and calculates. It dwells in darkness, camouflaged by its murky coloration, waiting with patient malice for prey to draw near. Adventurers encounter it lurking in caves, abandoned ruins, or stagnant pools where nothing else dares venture.

## Presentation
The creature appears as a viscous, dark-blue-to-black sludge, roughly six to eight feet in diameter when spread thin across stone. Its surface roils and shifts, covered in constantly shifting ripples. Thin, translucent tendrils protrude from its mass, each capable of extending ten feet or more. The silt emits a faint, unsettling luminescence in darkness—a ghostly phosphorescent pulse. Where it moves, it leaves a trail of caustic residue; stone pits and organic matter begins to break down. It makes no audible sound except the wet, sucking noise of its movement.

## Key Behaviors
The Abyssal Silt is an apex ambush predator of underground ecosystems. It dwells in stagnant water, beneath loose sediment, or plastered against cave ceilings—anywhere it can remain unseen until prey enters its hunting ground. The creature hunts by sensing vibration and chemical traces in the water or soil, feeding on whatever flesh it can dissolve: fish, cave-dwelling creatures, unfortunate adventurers. It exhibits no social behavior; multiple silts in the same region tolerate one another only through spatial separation. When well-fed, it remains dormant for weeks; when hungry, it roams and actively hunts.

## Combat Strategy
The Abyssal Silt relies on ambush and surprise. It attempts to grapple and immobilize prey with its tendrils before enveloping targets partially or wholly. When threatened by overwhelming force, it fragments itself into smaller entities and flees through tight spaces—a retreat strategy as much as a defensive tactic. It shows no interest in prolonged tactical maneuvers; the silt fights to feed, not to conquer.

## Attack Methods

### Corrosive Envelopment
The creature contracts its mass around a target, attempting to dissolve them with secreted enzymes. Any flesh or organic armor touching the silt takes corrosive damage each round of contact; the creature may maintain this hold for multiple rounds.

### Lashing Tendrils
Long, elastic appendages whip out to grapple and drag targets closer. Each tendril strike aims to entangle limbs or drag the target toward the silt's central mass for envelopment.

### Fission
When severely damaged, the silt can deliberately split into smaller autonomous entities. Each fragment retains a portion of the original creature's abilities and hungers independently; this increases the number of threats but divides the original creature's total health pool.

## Special Abilities

### Corrosive Secretion
The silt's touch dissolves organic matter with unnatural speed. Wooden shields, leather armor, bone, and flesh all break down when the creature engages in sustained contact.

### Sensory Perception Through Fluid
The silt perceives prey through vibration and chemical detection, sensing anything moving in water or touching damp stone within a moderate range. It requires no light and cannot be surprised by visual concealment in its native environment.

### Regeneration
Exposed to moisture and darkness, the silt regenerates slowly over days and weeks. Lesser wounds heal within hours if undisturbed; more severe damage requires extended rest in its native environment.

## Attributes
- **Strength:** 11-16 (1d6+10)

- **Endurance:** 17-22 (1d6+16)

- **Dexterity:** 14-17 (1d4+13)

- **Agility:** 14-17 (1d4+13)

- **Perception:** 11-16 (1d6+10)

- **Aura:** 10-13 (1d4+9)

- **Will:** 15-20 (1d6+14)

- **Reasoning:** 10-13 (1d4+9)

- **Creativity:** 10-13 (1d4+9)
