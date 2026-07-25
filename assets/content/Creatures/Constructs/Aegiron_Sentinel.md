---
aliases:
  - Aegiron Sentinel
tags:
  - construct
name:
  full: Aegiron Sentinel
  aliases: []
id: 5fO4kS9RtiZH9L5p
slug: aegiron-sentinel
img: images/aegiron-sentinel-headshot.webp
portrait: images/aegiron-sentinel.webp
type: creature
package: thalorna
sohl:
  attributes:
    str: 31
    agl: 6
    per: 19
  attrRollFormula:
    str: 1d6+27
    agl: 1d4+3
    per: 1d6+15
  body:
    structure:
      parts: []
      adjacent: []
    weight:
      base: 1000
      calc: 1000
    reachBase: 0
    bodyScaleBase: 1.0
    personalFatigue: enc + 5
  currentMoveMedium: terrestrial
  movementProfiles:
    - medium: terrestrial
      feetPerRound: 30
      leaguesPerWatch: 3
      encumbrance: floor(wt/4)
      strMod: -5 * floor((str - 10) / 2)
      factors: []
      disabled: false
  defaultCombatGroup: null
  items: []
---
# Appearance {#appearance}

The presence hits like a physical force: an eight-foot colossus of interlocking iron plates etched with ancient runes that glow with faint, eerie light. The metallic frame gleams with cold precision, and every movement speaks of immense power held in careful check. The eyes are dark voids illuminated from within by shifting, otherworldly light that conveys watchful awareness and absolute purpose. There is no doubt whatsoever that you are facing something created for a singular purpose: to guard, to protect, and to destroy anything that threatens what it watches.

# Dossier {#dossier}
Aegiron Sentinels are ultimate guardians forged through magical engineering and arcane might, standing 8 feet tall and composed of interlocking iron plates. These constructs are stationed to protect sacred sites, treasures, and important individuals. Adventurers encounter them only when approaching guarded locations or attempting breach of protected areas.

## Presentation
The Aegiron Sentinel is towering, composed entirely of interlocking iron plates forming a humanoid shape. Ancient runes are etched across its frame, glowing faintly with magical power. The eyes are dark voids with shifting light within suggesting consciousness and awareness.

## Key Behaviors
Aegiron Sentinels follow programming absolutely, neither tiring nor deviating from their duty. They are relentless and unflinching in defense of their assigned post or charge.

## Combat Strategy
The sentinel attacks with devastating strength, crushing opponents through overwhelming force and magical attacks.

## Attack Methods

### Crushing Blow
The sentinel's strike uses immense strength to crush targets.

### Light Beam
The sentinel projects destructive light from its eyes.

## Special Abilities

### Iron Durability
Nearly immune to slashing and piercing attacks.

### Magical Regeneration
Absorbs ambient magical energy to heal damage.

### Arcane Attacks
Projects destructive light beams from its eyes.

### Additional Information
Electrical energy disrupts the sentinel's circuits, causing malfunction. Rust-based attacks compromise structural integrity. The sentinel cannot be reasoned with or bribed.

## Attributes
- **Strength:** 28-33 (1d6+27)

- **Agility:** 4-7 (1d4+3)

- **Perception:** 16-21 (1d6+15)
