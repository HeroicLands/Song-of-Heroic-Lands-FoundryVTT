# Body Structure Reference

> **Audience:** Developers and content authors defining creature anatomy.

See also: [Type Catalog](./type-catalog.md), [Combat Resolution Pipeline](./combat-resolution-pipeline.md).

## Overview

Every Being actor has a `bodyStructure` defining its anatomy — the body parts, hit locations within each part, and the adjacency relationships between parts. This data drives hit location selection during combat and determines which skills and attributes are affected by injuries to specific parts.

Parts and locations are identified by **shortcodes** (e.g., `head`, `skull`). Display names are localized via `SOHL.BodyPart.<shortcode>` and `SOHL.BodyLocation.<shortcode>` keys in `lang/en.json`.

## Standard body part shortcodes

### Humanoid

| Shortcode | Description |
|-----------|-------------|
| `head` | Head |
| `thorax` | Thorax (chest and upper back) |
| `abdomen` | Abdomen (belly, lower back, groin) |
| `larm` | Left Arm |
| `rarm` | Right Arm |
| `lleg` | Left Leg |
| `rleg` | Right Leg |

### Quadruped (horse, wolf, bear, cattle)

| Shortcode | Description |
|-----------|-------------|
| `head` | Head |
| `neck` | Neck |
| `forequarters` | Forequarters (shoulder/chest) |
| `barrel` | Barrel (torso/ribcage) |
| `hindquarters` | Hindquarters (hip/rump) |
| `lforeleg` | Left Foreleg |
| `rforeleg` | Right Foreleg |
| `lhindleg` | Left Hind Leg |
| `rhindleg` | Right Hind Leg |
| `tail` | Tail |

### Avian (eagle, griffin)

| Shortcode | Description |
|-----------|-------------|
| `head` | Head |
| `body` | Body (torso) |
| `lwing` | Left Wing |
| `rwing` | Right Wing |
| `lleg` | Left Leg |
| `rleg` | Right Leg |
| `tail` | Tail |

### Serpentine (snake, wyrm, dragon)

| Shortcode | Description |
|-----------|-------------|
| `head` | Head |
| `neck` | Neck |
| `forebody` | Forebody (front coils) |
| `midbody` | Midbody |
| `hindbody` | Hindbody (rear coils) |
| `tail` | Tail |
| `lwing` / `rwing` | Wings (dragons) |
| `lforeleg` / `rforeleg` | Forelegs (dragons) |
| `lhindleg` / `rhindleg` | Hind legs (dragons) |

### Multi-limbed (spider, insect)

| Shortcode | Description |
|-----------|-------------|
| `cephalothorax` | Cephalothorax |
| `abdomen` | Abdomen |
| `lleg` / `rleg` | Legs (use numbered variants for 4+ pairs) |

## Standard body location shortcodes

Locations are nested within parts. A single shortcode (e.g., `skull`) may appear in different creature types' anatomy.

### Head / face locations

`skull`, `face`, `temple`, `crown`, `eye`, `ear`, `nose`, `chin`, `jaw`, `beak`, `muzzle`, `snout`, `fang`, `crest`

### Neck / throat

`throat`, `nape`

### Torso locations

`chest`, `breast`, `ribs`, `upperback`, `belly`, `abdomen`, `loin`, `lowerback`, `groin`, `spine`, `flank`, `underbelly`, `withers`, `rump`

### Arm / wing locations

`shoulder`, `upperarm`, `elbow`, `forearm`, `wrist`, `hand`, `wingspar`, `wingmembrane`

### Leg locations

`hip`, `thigh`, `knee`, `shin`, `calf`, `ankle`, `foot`, `paw`, `talon`, `hoof`, `haunch`, `stifle`, `hock`, `fetlock`, `pastern`

### Tail locations

`tailbase`, `tailtip`, `scales`

## Adjacency

The adjacency matrix defines which parts are neighbors. It is stored as an array of pairs:

```json
[["head", "thorax"], ["thorax", "larm"], ["thorax", "rarm"], ["thorax", "abdomen"], ...]
```

Adjacency is bidirectional and drives the aimed strike drift algorithm (see [Combat Basics](../user-guide/combat-basics.md)).

## Adding new shortcodes

1. Add the shortcode to the Being actor's `bodyStructure.parts` or `locations` array data.
2. Add localization keys to `lang/en.json`:
   - Parts: `"SOHL.BodyPart.<shortcode>": "Display Name"`
   - Locations: `"SOHL.BodyLocation.<shortcode>": "Display Name"`
3. Update adjacency as needed.
