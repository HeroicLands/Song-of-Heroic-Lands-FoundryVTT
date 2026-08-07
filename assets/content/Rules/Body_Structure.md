---
aliases:
    - Body Structure
    - Body Parts
    - Body Locations
    - Body Zones
    - Body Roles
    - Body Part Roles
    - Hit Location
    - Zone Number
    - Zone Die
    - Shock Value
    - Anatomy
id: hhyXrIkdfDLedy10
type: doc
package: sohl
category: rules
name:
    full: Body Structure
    aliases: []
slug: sohl-body-structure
folder: RqKUTBUBN2Y3MHYB
---

Every creature in the game is defined by a **body structure** — a hierarchical anatomy that determines where blows land, how armor protects, how badly a wound hampers you, and how close it drives you to collapse. The structure has three tiers: **body zones**, the **body parts** within each zone, and the **body locations** within each part.

A fourth idea cuts across the three tiers: **body roles**. A part is tagged with the roles it fulfills, and skills and attributes name the roles that impair them. Roles are the wiring that carries an injury from the place it landed to the things it should degrade.

The worked examples throughout this page use a **human** body structure. Every value shown — zone weights, part weights, location weights, Shock Values, bleeding and amputation tiers — is a property of that particular anatomy, not a universal constant. **Other body structures carry different values**, and a creature may have more zones, fewer parts, or locations a human does not possess at all. A serpent has no legs to stumble on; a dragon has wings and a tail; a spirit has no body structure at all and cannot be struck.

## Body Zones

A **body zone** is the broadest anatomical division — the region a blow lands in before any finer detail is settled. A human has four zones: Head, Arms, Torso, and Legs. A quadruped might instead have Head, Forelegs, Torso, Hind Legs, and Tail.

Each zone carries a **weight** — how much of the creature's targetable bulk it represents. Zones are dealt a contiguous run of **zone numbers** in the order they are defined, sized by that weight. The human zone weights are 1 / 4 / 4 / 6, so the zone numbers run:

| Zone  | Weight | Zone Numbers |
| ----- | ------ | ------------ |
| Head  | 1      | 1            |
| Arms  | 4      | 2–5          |
| Torso | 4      | 6–9          |
| Legs  | 6      | 10–15        |

The **highest zone number** on a body — 15 for a human — is the edge of the creature. A blow that resolves past it has gone wide and misses entirely (see [Determining Hit Location](#determining-hit-location)). A zone with weight 0 owns no zone numbers and can never be struck.

Zone numbers are what make an attack _aimable_: attacking high means aiming at a low zone number, attacking low means aiming at a high one, and everything between follows the creature's own anatomy rather than a fixed table.

## Body Parts

A **body part** is the primary anatomical division, and it is the unit at which injury is felt. A human has six parts: Head, Right Arm, Left Arm, Torso, Right Leg, and Left Leg. Other creatures differ — a quadruped might have Head, two Forelegs, Torso, and two Hindlegs; a dragon might add Neck, Wings, and Tail; a serpent might have only Head, Fore Body, Mid Body, and Hind Body.

Each body part carries:

**Zone.** The one zone the part belongs to. Once a blow settles on a zone, the part struck is drawn from that zone's parts.

**Weight.** The part's share of its zone. Once a zone is struck, each part in it is drawn in proportion to this weight — so two equally-weighted arms split their zone evenly, while a heavier part takes more of it.

**Roles.** The functional roles the part fulfills — see [Body Part Roles](#body-part-roles) below. This is how injury to the part reaches the skills and attributes that depend on it.

**Can Hold Item.** Whether the part can grip an object. A human's two arms can; the head, torso, and legs cannot. A part that is holding something and becomes unusable drops what it held.

**Permanent Impairment.** A lasting penalty the part can never be better than — an old maiming that never fully mended.

**Permanently Unusable.** A flag marking the part as gone or dead for good: a withered or fully amputated limb.

Two further properties are **derived from the part's roles rather than set directly**:

- **Whether it affects mobility** — true when the part holds the Vital, Core, or Locomotor role. Injure a leg or a torso and you move worse; injure an arm and you do not.
- **Whether it is critical** — true when the part holds the Vital or Core role. Critical parts drive the far harsher column of the [Health](Health.md) ceiling.

## Body Part Roles

A **body role** is a tag describing what a body part is _for_. There are four:

| Role            | Meaning                                                                        | Human parts      |
| --------------- | ------------------------------------------------------------------------------ | ---------------- |
| **Vital**       | Houses something the creature cannot function without — the brain, the senses. | Head             |
| **Core**        | The structural trunk that everything else hangs from.                          | Torso            |
| **Manipulator** | A limb that grips, wields, and handles.                                        | Right / Left Arm |
| **Locomotor**   | A limb that bears weight and carries the creature about.                       | Right / Left Leg |

A part may hold **more than one** role, and a role may be held by **more than one** part. This is where non-human anatomy diverges most sharply: a centaur's forelegs might be Locomotor while its arms are Manipulator, but a raptor's foot is plausibly _both_ — Locomotor when it walks and Manipulator when it seizes prey. A tentacle is a Manipulator with no Locomotor claim at all. Roles are assigned per creature, and nothing requires them to mirror the human arrangement.

Roles matter because **skills and attributes do not name body parts — they name roles.** Each skill and each attribute carries a list of the roles whose injury impairs it. Climbing might be impaired by both Manipulator and Locomotor injury; Legerdemain by Manipulator alone; Agility by Locomotor; a Lore skill by nothing physical at all.

This indirection is what lets one skill definition work on any creature. A skill that says "Manipulator injury impairs me" is correct for a human with two arms, a serpent with none, and a dragon whose Manipulator role sits on its forelimbs — without the skill knowing anything about the anatomy it will be used on.

Roles also decide **which mishap** a wound to a part threatens: a Manipulator part threatens a **fumble** (dropping what you hold), a Locomotor part threatens a **stumble** (losing your footing), and the Vital and Core parts can threaten either.

## Body Locations

Each body part contains several **body locations** — the specific anatomical areas where a blow actually lands. A human's Right Arm contains five: Right Shoulder, Right Upper Arm, Right Elbow, Right Forearm, and Right Hand. The Head contains eleven, from Skull to Neck.

**Injuries are always recorded against a specific location**, and armor is tracked per location — a mail hauberk covers the thorax and abdomen but not the pelvis; a helm protects the skull but not the neck.

Each location carries:

**Weight.** How likely the location is to be struck once its part is hit, measured against the other locations in the same part. A human's skull vastly outweighs an eye, so a blow to the head overwhelmingly finds skull.

**Shock Value.** How stunning a blow to this location is in itself, before severity is considered — see [Shock](#shock) below. The skull, eyes, nose, and neck are the worst on a human at 5; the forearm and calf the mildest at 1.

**Bleeding Susceptibility.** A tier — **none**, **low**, **medium**, or **high** — governing how readily a wound here becomes a [Bleeder](Bleeding.md). It is not a single threshold but a grid against injury severity and weapon aspect:

| Susceptibility | S3 bleeds on | G4 bleeds on    | G5 bleeds on           |
| -------------- | ------------ | --------------- | ---------------------- |
| **None**       | never        | never           | never                  |
| **Low**        | never        | never           | edged, piercing, blunt |
| **Medium**     | never        | edged, piercing | edged, piercing, blunt |
| **High**       | edged        | edged, piercing | edged, piercing, blunt |

No wound below S3 ever bleeds by the table, whatever the location.

**Amputability.** A tier — **none**, **low**, **medium**, or **high** — governing whether the location can be severed. An amputation check happens only on a **G5 edged** wound to a location whose tier is not _none_. The check is a Strength test modified by the tier: **low +20**, **medium 0**, **high −20** (the harsher the modifier, the likelier the limb comes off).

The outcome turns on that Strength test: a **critical failure** severs the location and it bleeds even where it normally would not; a **failure** severs it and it bleeds only if the location bleeds at all; a **marginal success** keeps it attached but costs **−20 on the resulting Shock roll**; a **critical success** keeps it cleanly. Severing a neck is fatal regardless.

**Fumble and Stumble flags.** Whether a serious wound here can make the creature lose its grip or its footing — see [Mishaps](#mishaps-fumble-and-stumble).

**Natural Protection.** Intrinsic protection against each damage aspect (blunt, edged, piercing, fire) before any worn armor — the toughness of bone, hide, or scale.

## Determining Hit Location

When a blow lands, where it lands is settled by **Zone Number and Zone Die**.

The attacker aims at a **body part**; the part's zone supplies the **target zone number**. The strike mode supplies a **Spread** — how loosely that mode can be placed (see [Strike Modes](Strike_Modes.md)). Spread is rolled as a die, and the result walks the aim _upward_ from the target zone number:

> **Hit Zone Number = (Target Zone Number − 1) + Spread roll**

The zone owning that hit zone number is the zone actually struck. A **weighted draw** among that zone's parts picks the part, and a second **weighted draw** among that part's locations picks the location.

Three things follow from this:

- **Spread 1 is perfectly precise.** The roll can only be 1, so the hit zone number equals the target zone number every time. The blow lands in the zone aimed at.
- **Larger Spread scatters downward.** A Spread of 6 aimed at zone number 1 can land anywhere from 1 to 6 — on a human, that is the head, the arms, or the top of the torso. Because the walk is always upward, **a loose strike drifts low**, never high; aiming high is how you reach the head at all.
- **A blow can scatter clean off the target.** If the hit zone number exceeds the creature's highest zone number, there is nothing there to strike and the blow **misses**. A Spread-6 strike aimed at zone number 12 on a human (highest zone number 15) misses outright on a roll of 4 or better. The same happens if the hit zone number lands in a zone that has no hittable part.

Small creatures are correspondingly harder to place a loose blow on: fewer zone numbers means more of the Spread die falls off the far end and misses.

When a blow is **not aimed** at all, the zone is drawn at random weighted by how many zone numbers each zone owns, then the part and location follow by the same weighted draws.

## From Blow to Injury

Once the location is known, the blow resolves against it:

1. **Subtract protection.** Effective impact is the blow's impact less the location's total protection (natural plus worn armor) for that weapon's aspect, floored at zero.
2. **Read the injury level.** Effective impact is compared against the creature's own injury thresholds. A human's are 1 / 5 / 10 / 15 / 20 — so 1–4 is **M1**, 5–9 is **S2**, 10–14 is **S3**, 15–19 is **G4**, and 20 or more is **G5**. Bigger and tougher creatures carry proportionally scaled thresholds, so the same absolute impact reads differently by size: a blow that grievously wounds a cat may not scratch a bull.
3. **Check for a glancing blow.** An **edged or piercing** strike that would deal only a minor wound (effective impact 1–4) against a location covered by **rigid** armor glances off instead: it inflicts **no injury at all**, but the jolt still counts — it adds a point to the Shock Index and grants **+10 on the resulting Shock roll**.
4. **Evaluate bleeding, amputation, and shock** from the tables above.

See [Injury](Injury.md) for what the resulting wound then does over time.

## Shock

A wound's immediate effect on consciousness is resolved through **shock**. The chain runs **Shock Value → Shock Index → Shock State**.

### How the Shock Index is determined

The **Shock Index** starts as the struck **location's Shock Value plus the wound's Injury Level**, plus one more point if the blow was a glancing one:

> **Shock Index = location Shock Value + Injury Level ( + 1 if glancing )**

A blow to a human's skull (Shock Value 5) that lands a S3 wound (Injury Level 3) opens at index 8; the same wound to the forearm (Shock Value 1) opens at index 4.

That opening index is a **base**, and it decides whether a roll happens at all:

- **4 or less** — too slight to threaten shock. No roll, no shock state.
- **5 through 10** — a **Shock test** is made, and its result adjusts the index.
- **Above 10** — beyond any test. The victim is **dead**.

The Shock test is a test of the victim's **Shock** skill, and its result moves the index:

| Shock test result | Adjustment to the index |
| ----------------- | ----------------------- |
| Critical Failure  | +2                      |
| Marginal Failure  | +1                      |
| Marginal Success  | 0                       |
| Critical Success  | −1                      |

Two modifiers apply to that roll rather than to the index: a **glancing blow** grants **+10**, and an amputation check that ended in a marginal success imposes **−20**. Fatigue penalties apply to the roll; body-part impairment penalties deliberately do **not** — shock is a test of constitution, not of a working limb.

### How the Shock Index maps to a Shock State

The adjusted index reads off a single table:

| Shock Index | Shock State   |
| ----------- | ------------- |
| 6 or less   | None          |
| 7           | Stunned       |
| 8           | Incapacitated |
| 9           | Unconscious   |
| 10 or more  | Dead          |

Continuing the example: the skull wound opened at 8, so a Shock test is made. A marginal success leaves it at 8 — **Incapacitated**. A critical success pulls it to 7 — **Stunned**. A marginal failure pushes it to 9 — **Unconscious**. The forearm wound, opening at 4, never rolls at all.

### What the Shock States mean

| Shock State       | Effect                                                                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **None**          | No shock.                                                                                                                                  |
| **Stunned**       | Reeling and disoriented. Movement is difficult, double Moves are barred, and impaired tests drop a success level. A re-test comes quickly. |
| **Incapacitated** | Awake but down. No actions of your own, and melee attacks against you must be Ignored.                                                     |
| **Unconscious**   | Blacked out, prone, and Helpless — melee attackers score a critical success against you.                                                   |
| **Dead**          | The victim dies on the spot.                                                                                                               |

While in **any** shock state a creature cannot concentrate. Ordinary shock is temporary — a stunned, incapacitated, or unconscious victim shakes it off with a re-test — and only a _failed_ re-test drops the victim into lasting Extended Shock or a Coma.

A resulting shock state is always **offered** to the victim's own player, never imposed, and only ever to _worsen_ the current state. Injury is not the only source of shock: fear, heavy [blood loss](Bleeding.md), and other systemic forces raise it by their own measures. See [Shock](Shock.md) for the states in full, the re-test, Extended Shock, and Coma.

## Impairment and Unusable Parts

An injury sits at a single location, but it is the **whole body part** that suffers. Each part derives its impairment from the injuries across all of its locations:

| Worst injury on the part     | Effect on the part       |
| ---------------------------- | ------------------------ |
| **Grievous** (G4 / G5)       | The part is **unusable** |
| **Serious** (S2 / S3)        | **−10**                  |
| **Minor** (M1), slow to heal | **−5**                   |
| Minor (M1), healing normally | none                     |

A minor wound only impairs while it is **slow to heal** — a Healing Rate of 5 or less. A minor scratch that is knitting cleanly costs nothing.

**Impairment is worst-of, never additive.** Three serious wounds on one arm impair it by −10, not −30. The part takes the single worst penalty among its injuries and its permanent impairment. As wounds heal the part climbs back up the ladder — unusable, then −10, then −5, then whole — and a permanent impairment sets a floor it can never rise above.

Injuries on _different_ parts do not merge either. A wounded arm and a wounded leg are two separately impaired parts, each affecting whatever depends on it.

### What impairment costs

This is where roles do their work. When you make a test, the skill or attribute being tested names the roles that impair it, and the system looks at every part holding one of those roles:

- If any such part is **unusable**, the test **automatically Critically Fails**. You cannot climb with two ruined arms, and no roll is made to pretend otherwise.
- Otherwise, the test takes the **worst penalty** among those parts — −5 or −10.

A test whose skill names no roles, or a creature with no impaired parts, is untouched.

A second, narrower rule applies to weapons: a strike mode that requires particular limbs to wield checks **those specific parts**, not the role at large. An unusable off-hand does not spoil a one-handed strike with the good hand — but an unusable gripping hand fails it automatically.

### Permanent impairment

A wound that was slow to mend can leave a mark that never heals — a withered arm, a stiffened knee. Permanent impairment is scaled by how long the wound took to close, from −5 at twenty days to a floor of −25 at a hundred, and it applies from then on as the part's minimum impairment. Permanent impairment never renders a part _unusable_ on its own; only a grievous wound or an outright severed limb does that. See [Injury → Permanent Impairment](Injury.md#permanent-impairment).

### Impairment and Health

Impaired parts are also the _only_ thing that sets [Health](Health.md). Health is not a pool that a blow subtracts from — it is a ceiling imposed by which parts are impaired and how badly, and whether those parts are **critical** (holding the Vital or Core role) or limbs (Manipulator or Locomotor). A creature with an unusable critical part is at nothing at all; a creature with a single minorly impaired limb is barely off Excellent.

## Mishaps: Fumble and Stumble

A wound serious enough, to a location that invites it, can cost you your grip or your footing. Each location may be flagged for the mishaps it can cause — typically the locations of a **Manipulator** limb are flagged for **fumbles** and those of a **Locomotor** limb for **stumbles** — and the wound's severity decides whether the mishap is in question or certain:

| Injury level at a flagged location | Mishap         |
| ---------------------------------- | -------------- |
| Minor (M1)                         | none           |
| Serious (S2 / S3)                  | a test is made |
| Grievous (G4 / G5)                 | automatic      |

When a test is called for, it is a **keep-control test**:

- A **Stumble Test** — keeping your footing — rolls the **better of your Agility or your Acrobatics skill**. Keep control and you stay upright; fail and you [fall prone](Prone.md), the worse the failure the harder the fall.
- A **Fumble Test** — keeping your grip — rolls the **better of your Dexterity or your Legerdemain skill**. Keep control and the item stays in hand; fail and you drop it, a critical fumble flinging it from your grasp entirely.

You roll whichever of the attribute or skill serves you better, and a character with neither cannot make the test. Like every consequence in the system, a keep-control test is **offered** to the affected character's player, never imposed.

## Compound Injuries

When a new injury lands on a location that already bears wounds, it may compound. Total the injury levels already at that location; if the new injury's level meets or exceeds that total, the worst existing injury worsens by one level. Already-damaged tissue is fragile, and concentrating attacks on one spot is correspondingly deadly.

## Armor and Protection

Armor protects at the **location** level, tracked separately for each damage aspect — blunt, edged, piercing, and fire. A mail shirt gives edged and piercing protection at the thorax and abdomen and nothing at the skull, arms, or legs. Layering (a gambeson under mail) adds the values together at each covered location.

Locations may also carry **natural protection** — the intrinsic toughness of bone, hide, or scale — which is always present and adds to whatever is worn. Whether a location is covered by _rigid_ armor additionally decides whether light edged and piercing blows [glance off](#from-blow-to-injury).

## The Human Body Structure

Reproduced for reference. **These are the values of this one anatomy** — every other body structure defines its own, and non-humanoid creatures differ in the parts and locations they have at all.

### Zones and parts

| Zone (weight) | Zone Numbers | Part (weight) | Roles       | Can hold |
| ------------- | ------------ | ------------- | ----------- | -------- |
| Head (1)      | 1            | Head (1)      | Vital       | no       |
| Arms (4)      | 2–5          | Right Arm (2) | Manipulator | yes      |
|               |              | Left Arm (2)  | Manipulator | yes      |
| Torso (4)     | 6–9          | Torso (4)     | Core        | no       |
| Legs (6)      | 10–15        | Right Leg (3) | Locomotor   | no       |
|               |              | Left Leg (3)  | Locomotor   | no       |

### Locations

Weight is relative _within the part_; Shock is the location's Shock Value.

| Part      | Location    | Weight | Shock | Bleeding | Amputability |
| --------- | ----------- | ------ | ----- | -------- | ------------ |
| Head      | Skull       | 500    | 5     | low      | none         |
| Head      | Left Eye    | 15     | 5     | medium   | none         |
| Head      | Right Eye   | 15     | 5     | medium   | none         |
| Head      | Nose        | 30     | 5     | medium   | none         |
| Head      | Left Cheek  | 60     | 4     | medium   | none         |
| Head      | Right Cheek | 60     | 4     | medium   | none         |
| Head      | Left Ear    | 15     | 4     | medium   | none         |
| Head      | Right Ear   | 15     | 4     | medium   | none         |
| Head      | Mouth       | 30     | 4     | medium   | none         |
| Head      | Jaw         | 60     | 4     | medium   | none         |
| Head      | Neck        | 200    | 5     | high     | low          |
| Right Arm | Shoulder    | 30     | 3     | medium   | none         |
| Right Arm | Upper Arm   | 30     | 1     | low      | medium       |
| Right Arm | Elbow       | 10     | 2     | low      | medium       |
| Right Arm | Forearm     | 20     | 1     | low      | medium       |
| Right Arm | Hand        | 10     | 2     | none     | high         |
| Left Arm  | Shoulder    | 30     | 3     | medium   | none         |
| Left Arm  | Upper Arm   | 30     | 1     | low      | medium       |
| Left Arm  | Elbow       | 10     | 2     | low      | medium       |
| Left Arm  | Forearm     | 20     | 1     | low      | medium       |
| Left Arm  | Hand        | 10     | 2     | none     | high         |
| Torso     | Thorax      | 40     | 4     | medium   | none         |
| Torso     | Abdomen     | 40     | 4     | high     | none         |
| Torso     | Pelvis      | 20     | 4     | medium   | none         |
| Right Leg | Thigh       | 40     | 3     | medium   | low          |
| Right Leg | Knee        | 10     | 2     | low      | medium       |
| Right Leg | Calf        | 30     | 1     | low      | medium       |
| Right Leg | Foot        | 20     | 2     | none     | medium       |
| Left Leg  | Thigh       | 40     | 3     | medium   | low          |
| Left Leg  | Knee        | 10     | 2     | low      | medium       |
| Left Leg  | Calf        | 30     | 1     | low      | medium       |
| Left Leg  | Foot        | 20     | 2     | none     | medium       |

The skull's weight of 500 against the rest of the head is why a blow to the head nearly always finds skull, and the eyes and ears at 15 are the rare, terrible exceptions.

## Anatomy as Actor Data

A creature's body structure is stored **on the actor itself**, not as a collection of items. Anatomy is intrinsic to what a creature _is_, not something it possesses; every actor has exactly one, and it is always present. A creature whose body structure is **empty** has no anatomy at all — it is incorporeal, a spirit, and cannot be struck.

The three tiers are stored as three flat lists — zones, parts, and locations — with each part naming its zone and each location naming its part. The hierarchy is rebuilt from those names whenever the creature is prepared. Storing them flat means adding, removing, or moving any entry rewrites exactly one list, and a part can be moved between zones without disturbing its locations.

Other game elements _reference_ locations rather than containing them: an injury records the location it sits at, and armor records the locations it covers. Those change constantly in play; the anatomy they point at changes almost never.

Creating a new creature type needs no templates or special item types — duplicate an actor with a similar body plan and adjust the anatomy: change the zone weights, re-weight the parts, add or remove locations, retag the roles.

## See also

- [Injury](Injury.md) — injury levels, healing, and impairment over time
- [Shock](Shock.md) — the shock states in full, re-tests, Extended Shock, and Coma
- [Health](Health.md) — how impaired parts set the health ceiling
- [Bleeding](Bleeding.md) — bleeders, blood loss, and stoppage
- [Strike Modes](Strike_Modes.md) — Spread and the other properties of an attack
- [Skills](Skills.md) — how skills declare the roles that impair them
- [Prone](Prone.md) — the consequence of a failed stumble
