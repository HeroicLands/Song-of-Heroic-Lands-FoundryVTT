---
aliases:
    - Body Structure
    - Body Parts
    - Body Locations
    - Hit Location
    - Anatomy
    - Strike Accuracy
tags:
    - rules
    - core-system
    - combat
    - injury
audience: Developers and content authors defining creature anatomy.
---

# Body Structure

## Overview

Every creature (i.e. Being actor) in the game is defined by a body structure — a hierarchical anatomy that determines where blows land, how armor protects, and how injuries impair function. This data drives hit location selection during combat and determines which skills and attributes are affected by injuries to specific parts.

The structure has three parts: a hierarchical set of body parts and body locations, and the adjacency relationships which describe which parts are located next to other parts.

Parts and locations are identified by **shortcodes** (e.g., `head`, `skull`). Display names are localized via `SOHL.BodyPart.<shortcode>` and `SOHL.BodyLocation.<shortcode>` keys in `lang/en.json`.

## Body Parts

A body part is the primary anatomical division. A standard humanoid has six parts: Head, Right Arm, Left Arm, Torso, Right Leg, and Left Leg. Other creature types have different layouts — a quadruped might have Head, Right Foreleg, Left Foreleg, Torso, Right Hindleg, and Left Hindleg; a dragon might add Neck, Wings, and Tail; a serpent might have just Head, Fore Body, Mid Body, and Hind Body.

Each body part has several properties:

**Area.** The body part's targetable surface area, measured in square feet. For a humanoid, the Head is about 1 sq ft, each arm about 2 sq ft, the Torso about 3 sq ft, and each leg about 2 sq ft, for a total body area of roughly 12 sq ft. Larger creatures have proportionally greater area. A bear might total 18 sq ft; a dragon might total 60 or more.

**Adjacency.** Each body part is connected to one or more other parts, forming a graph that represents which parts of the body are near each other. In the humanoid layout, the Torso is the central hub: the Head, both Arms, and both Legs all connect to it. A blow aimed at one part that scatters (see Determining Hit Location) can only reach parts that are adjacent on this graph. The adjacency graph varies by creature type — a serpent's parts form a linear chain, while a dragon's branch out from the torso to neck, limbs, wings, and tail.

**Affected Skills and Attributes.** Each body part identifies which skills and attributes are impaired when it sustains injury. Arm parts affect Melee, Archery, Climbing, Legerdemain, and similar skills, as well as Dexterity and Strength. Leg parts affect Acrobatics, Climbing, Riding, and Agility. The Head and Torso affect broad ranges of physical skills and attributes. These lists may differ for non-humanoid creatures.

**Affects Mobility.** Some body parts, when injured, reduce a character's movement speed. The Head, Torso, and both Leg parts affect mobility; the Arm parts generally do not.

**Can Hold Items.** Whether this part can grip or carry objects. Both arm parts can hold items; the head, torso, and legs cannot. When an injury disables a part that holds an item, the character drops whatever it held.

## Body Locations

Each body part contains several body locations — specific anatomical areas where a blow might land. The Right Arm part, for example, contains five locations: Right Shoulder, Right Upper Arm, Right Elbow, Right Forearm, and Right Hand. The Head part contains locations for the Skull, each Eye, Nose, Cheeks, Ears, Mouth, Jaw, and Neck.

Injuries are always recorded against a specific body location. Armor protection is likewise tracked per location — a mail hauberk covers the thorax and abdomen but not the pelvis, while a helm protects the skull but not the neck. Each body location has several properties that govern how damage is resolved there:

**Probability Weight.** A relative value determining how likely this location is to be struck within its parent body part. Larger or more exposed areas (the skull, the thorax, the thigh) have higher weights than smaller ones (an eye, the elbow, the hand).

**Shock Value.** The inherent shock inflicted when this location is struck, independent of injury severity. The skull and neck carry high shock values (5); the forearm and calf carry low ones (1). Shock contributes to whether the target must make a Shock test to remain conscious and functional.

**Bleeding Severity Threshold.** The minimum injury level at which a wound to this location begins to bleed. Locations with major blood vessels (the neck, threshold 3; the abdomen, threshold 3) bleed from less severe wounds than locations with minimal vasculature (the hand or foot, threshold 0, meaning they rarely bleed dangerously).

**Amputate Modifier.** A penalty applied to any attempt to surgically amputate at this location. Joints and extremities (hand at −30, elbow at −20) are easier to amputate than mid-limb locations (upper arm at −20), while some locations (the skull, the torso) cannot be amputated at all (modifier 0, with amputation disallowed by rule).

**Fumble and Stumble.** Certain locations, when struck, can cause the target to lose control of held items or lose footing. All arm locations are marked as fumble locations — a blow to the shoulder, elbow, or hand may cause the character to drop a weapon or tool. All leg locations are marked as stumble locations — a blow to the thigh, knee, or foot may cause the character to fall or stagger.

## Standard body part shortcodes

### Humanoid

| Shortcode | Description    | Area | Locations                                                                                        |
| --------- | -------------- | ---- | ------------------------------------------------------------------------------------------------ |
| `head`    | Head           | 1    | Skull, Left Eye, Right Eye, Nose, Left Cheek, Right Cheek, Left Ear, Right Ear, Mouth, Jaw, Neck |
| `torso`   | Center of Body | 3    | Thorax, Abdomen, Pelvis                                                                          |
| `larm`    | Left Arm       | 2    | Left Shoulder, Left Upper Arm, Left Elbow, Left Forearm, Left Hand                               |
| `rarm`    | Right Arm      | 2    | Right Shoulder, Right Upper Arm, Right Elbow, Right Forearm, Right Hand                          |
| `lleg`    | Left Leg       | 2    | Left Thigh, Left Knee, Left Calf, Left Foot                                                      |
| `rleg`    | Right Leg      | 2    | Right Thigh, Right Knee, Right Calf, Right Foot                                                  |

### Quadruped (horse, wolf, bear, cattle)

| Shortcode      | Description                   |
| -------------- | ----------------------------- |
| `head`         | Head                          |
| `neck`         | Neck                          |
| `forequarters` | Forequarters (shoulder/chest) |
| `barrel`       | Barrel (torso/ribcage)        |
| `hindquarters` | Hindquarters (hip/rump)       |
| `lforeleg`     | Left Foreleg                  |
| `rforeleg`     | Right Foreleg                 |
| `lhindleg`     | Left Hind Leg                 |
| `rhindleg`     | Right Hind Leg                |
| `tail`         | Tail                          |

### Avian (eagle, griffin)

| Shortcode | Description  |
| --------- | ------------ |
| `head`    | Head         |
| `body`    | Body (torso) |
| `lwing`   | Left Wing    |
| `rwing`   | Right Wing   |
| `lleg`    | Left Leg     |
| `rleg`    | Right Leg    |
| `tail`    | Tail         |

### Serpentine (snake, wyrm, dragon)

| Shortcode               | Description            |
| ----------------------- | ---------------------- |
| `head`                  | Head                   |
| `neck`                  | Neck                   |
| `forebody`              | Forebody (front coils) |
| `midbody`               | Midbody                |
| `hindbody`              | Hindbody (rear coils)  |
| `tail`                  | Tail                   |
| `lwing` / `rwing`       | Wings (dragons)        |
| `lforeleg` / `rforeleg` | Forelegs (dragons)     |
| `lhindleg` / `rhindleg` | Hind legs (dragons)    |

### Multi-limbed (spider, insect)

| Shortcode       | Description                               |
| --------------- | ----------------------------------------- |
| `cephalothorax` | Cephalothorax                             |
| `abdomen`       | Abdomen                                   |
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

The adjacency graph defines which parts are located next to other parts, and is represented by a tuple partA:partB, indicating that partA and partB are next to each other. The relationship is bi-directional, so if partA is next to partB, then partB is also next to partA. These relationships drive the aimed strike drift algorithm (see [Combat Basics](../user-guide/combat-basics.md)).

## Adding new shortcodes

1. Add the shortcode to the Being actor's `bodyStructure.parts` or `locations` array data.
2. Add localization keys to `lang/en.json`:
    - Parts: `"SOHL.BodyPart.<shortcode>": "Display Name"`
    - Locations: `"SOHL.BodyLocation.<shortcode>": "Display Name"`
3. Update adjacency as needed.

# See Also

- [Type Catalog](./type-catalog.md)
- [Combat Resolution Pipeline](./combat-resolution-pipeline.md).
