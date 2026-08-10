---
aliases:
    - Body Structure
    - Body Parts
    - Body Locations
    - Hit Location
    - Anatomy
    - Strike Spread
name:
    full: Body Structure
    aliases: []
id: PrmiTB7yTz9BJodj
slug: body-structure
type: doc
package: sohl
category: dev-docs
folder: null
tags:
    - rules
    - core-system
    - combat
    - injury
audience: Developers and content authors defining creature anatomy.
---

# Body Structure

## Overview

Every creature (a Being actor) carries its anatomy on the actor itself, under `system.body`, derived by the Being-owned {@link sohl.document.actor.logic.BodyLogic} (exposed as `being.body`). The being's body structure determines where blows land, how armor protects, which skills and attributes are impaired by injury, and whether a hit makes the target fumble a weapon or stumble. A being with an **empty body structure** (`being.body.structure.parts.length === 0`) is **incorporeal** — a spirit with no anatomy; check `being.body.isIncorporeal`.

A body structure has three tiers: **body zones**, the **body parts** within each zone, and the **body locations** within each part. A cross-cutting tag set of **body roles** ties parts to the skills and attributes they affect.

**Storage is flat; the hierarchy is derived.** The three tiers persist as three sibling arrays, each child naming its parent by shortcode; {@link sohl.entity.body.BodyStructure} assembles them into the tree on every prepare. Flat storage keeps every edit a single whole-array write — a nested tree would force a by-index write into a sub-array, which Foundry rebuilds from a sparse map and corrupts (#247).

## Where the data lives

The schema is the `body` `SchemaField` on the Being actor's DataModel. See [src/document/actor/foundry/BeingDataModel.ts](../../src/document/actor/foundry/BeingDataModel.ts):

```
system.body.structure
  ├── zones:     BodyZone.Data[]      // { shortcode, name, probWeight }
  ├── parts:     BodyPart.Data[]      // each names its zone via bodyZoneCode
  └── locations: BodyLocation.Data[]  // each names its part via bodyPartCode
```

At runtime, the data is rebuilt into domain objects in `src/entity/body/`:

- `BodyStructure` — the root object; assembles the hierarchy and provides hit-location resolution
- `BodyZone` — one anatomical region, owning a run of zone numbers
- `BodyPart` — one anatomical division
- `BodyLocation` — one hit location within a part

**Every entity's `index` is its slot in the flat array**, so `structure.parts[i].index === i` and each `updatePath` is a plain two-segment path (`system.body.structure.parts.4`). A child's *position within its parent* — {@link sohl.entity.body.BodyPart.position} / {@link sohl.entity.body.BodyLocation.position} — is its relative order among the array elements sharing that parent, and is what drag-to-sort addresses.

A child whose parent code matches nothing is preserved in storage but left out of the hierarchy; read them from `structure.orphanedParts` / `structure.orphanedLocations`.

The `BodyStructure` and its zones/parts/locations are parented to the being's {@link sohl.document.actor.logic.BodyLogic} (owned by {@link sohl.document.actor.logic.BeingLogic}); their persisted paths are `system.body.structure.{zones,parts,locations}`. Domain objects are reconstructed on every preparation cycle. Active effects may mutate them in-flight (e.g., adding protection modifiers), but only changes written through `document.update()` survive.

To persist, use the `*Update()` helpers on `BodyStructure`. They are symmetric across the three tiers, and each returns a **complete-array** payload:

| Tier      | Add                 | Remove                                   | Reorder / re-parent  | Field edit                |
| --------- | ------------------- | ---------------------------------------- | -------------------- | ------------------------- |
| Zone      | `addZoneUpdate`     | `removeZoneUpdate` (cascades)            | `moveZoneUpdate`     | `setZoneFieldsUpdate`     |
| Part      | `addPartUpdate`     | `removePartUpdate` (cascades)            | `movePartUpdate`     | `setPartFieldsUpdate`     |
| Location  | `addLocationUpdate` | `removeLocationUpdate`                   | `moveLocationUpdate` | `setLocationFieldsUpdate` |

**Deletes cascade down the tree.** Removing a zone also removes its parts and their locations; removing a part removes its locations. A child is never orphaned by a delete.

**Renames re-point children.** Because a child links to its parent by *shortcode*, changing a zone's or part's shortcode must be paired with `repointPartsUpdate(old, new)` / `repointLocationsUpdate(old, new)`. The two payloads touch different arrays, so they merge by spread — see `BodyZoneConfig` / `BodyPartConfig` for the pattern.

Convenience wrappers stamp the parent code for you: {@link sohl.entity.body.BodyZone.addPartUpdate} and {@link sohl.entity.body.BodyPart.addLocationUpdate}.

## Body parts

A body part is a primary anatomical division — Head, Torso, an arm, a leg, a wing. Persisted fields, from the `defineSchema()` of [BeingDataModel.ts](../../src/document/actor/foundry/BeingDataModel.ts):

| Field                 | Type                  | Purpose                                                                                                              |
| --------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `shortcode`           | string                | Stable identifier (e.g., `headpart`), unique body-wide. Named by its locations' `bodyPartCode`.                      |
| `name`                | string                | Display name (e.g., `"Head"`). Stored literally; not a localization key.                                             |
| `roles`               | `BodyRole[]`          | Functional tags the part fulfills — see [Body Roles](#body-roles).                                                   |
| `probWeight`          | number                | Selection weight **within its zone**: once the zone is rolled, its parts are drawn in proportion to this. Also the area an aimed strike spends its `spread` against. |
| `canHoldItem`         | boolean               | Whether this part can grip an item. Arms typically `true`; others `false`.                                           |
| `heldItemId`          | string \| null        | The ID of the item currently held, if any.                                                                           |
| `favoredFlag`         | boolean               | Marks the part as favored (off-hand vs. main-hand semantics).                                                        |
| `permanentImpairment` | integer ≤ 0           | Manually-set permanent impairment for the part (`0` = none). See [Body-part impairment](#body-part-impairment).      |
| `permanentlyUnusable` | boolean               | Manually-set flag marking the part permanently unusable (withered / fully amputated), regardless of impairment tier. |
| `bodyZoneCode`        | string                | Shortcode of the owning {@link sohl.entity.body.BodyZone}.                                                           |

A convenience getter {@link sohl.entity.body.BodyPart.affectsMobility} is `true` when the part has any of the `vital`, `core`, or `locomotor` roles.

## Body locations

A body location is a specific hit point within a part — Skull, Thorax, Right Elbow. Persisted fields, also from the `defineSchema()` of [BeingDataModel.ts](../../src/document/actor/foundry/BeingDataModel.ts):

| Field                    | Type                             | Purpose                                                                                                                                                                                       |
| ------------------------ | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `shortcode`              | string                           | Stable identifier (e.g., `skullloc`, `relbloc`), unique **body-wide**, not merely within its part.                                                                                            |
| `bodyPartCode`           | string                           | Shortcode of the owning {@link sohl.entity.body.BodyPart}.                                                                                                                                    |
| `name`                   | string                           | Display name (e.g., `"Skull"`). Stored literally.                                                                                                                                             |
| `probWeight`             | integer                          | Relative weight for random hit selection within the parent part.                                                                                                                              |
| `shockValue`             | integer                          | Inherent shock inflicted by an injury at this location, regardless of severity.                                                                                                               |
| `bleedingSusceptibility` | tier                             | `none` / `low` / `medium` / `high`. Combined with injury severity and weapon aspect by `BleedingDefaults` to decide whether a wound bleeds.                                                   |
| `amputability`           | tier                             | `none` / `low` / `medium` / `high`. Drives the Strength-test modifier when a G5 Edge injury would amputate; see `AmputationDefaults`. `none` means amputation is disallowed at this location. |
| `protectionBase`         | `{blunt, edged, piercing, fire}` | Natural armor values per [`ImpactAspect`](../../src/utils/constants.ts). **May be negative** — see below.                                                                                     |

Both tiers map to the rulebook's shaded markers (none/white/grey/black for bleeding; same for amputability).

### Negative natural armor

`protectionBase` is **unbounded below**. A hide softer than bare human skin — a
crow's is `−6` blunt / `−8` piercing, a cat's `−3`/`−5` — carries a negative
value, and `resolveInjury` lets it *raise* the effective impact
(`impact − protection`, so a 3-impact blow lands as 9 on the crow) rather than
clamping it away. Armor reduction still bottoms out at the location's own
floor, `min(armorValue, 0)`: it can strip a hauberk to nothing, but it cannot
make an already-vulnerable hide worse.

This is a separate axis from [body scale](#body-scale-per-creature-injury-scaling),
which rescales the *thresholds* an impact is judged against. Scale answers "how
much damage does this body absorb before a wound is Serious"; negative armor
answers "how little does its hide stop." A small creature typically carries
both.

## Body roles

A cross-cutting tag set. The four values, defined in [src/utils/constants.ts](../../src/utils/constants.ts) under `BODY_ROLE`:

| Role          | Anatomical examples                                                                                                        |
| ------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `vital`       | Brain, sensory organs, vital nerve clusters. Head for vertebrates; cephalothorax for arachnids; ganglia for invertebrates. |
| `core`        | Power and balance. Torso for humans; abdomen for insects; mantle for cephalopods; body segments for snakes.                |
| `manipulator` | Fine work and intentional force. Arms, paws, tentacles, trunks; jaws used as bite-weapons.                                 |
| `locomotor`   | Movement. Legs, wings, fins; tentacles used for swimming.                                                                  |

A part may carry multiple roles. A wolf's foreleg might be `[locomotor, manipulator]`; its head `[vital, manipulator]` (bite attacks).

**What roles drive:**

1. **Skill / attribute impairment.** Skills and attributes carry an `impairedByRoles: BodyRole[]` field. When a body part takes an injury, every skill and attribute whose `impairedByRoles` intersects the part's `roles` is impaired. Mental attributes leave the list empty; physical ones list the relevant roles. See [src/document/item/foundry/SkillDataModel.ts](../../src/document/item/foundry/SkillDataModel.ts) and [AttributeDataModel.ts](../../src/document/item/foundry/AttributeDataModel.ts).
2. **Mobility impairment.** `BodyPart.affectsMobility` returns `true` when the part has any of `vital`, `core`, or `locomotor`.
3. **Mishap checks** (fumble / stumble) on injury severity:
    - `vital` Serious → fumble + stumble check; Grievous → both auto
    - `core` Serious → fumble + stumble check; Grievous → both auto
    - `manipulator` Serious → fumble check; Grievous → auto fumble
    - `locomotor` Serious → stumble check; Grievous → auto stumble

### Resolving a flagged mishap — the keep-control test

A flagged fumble or stumble (whether from the injury-severity checks above or a
combat critical failure — the `mishaps: Set<string>` on an attack/defense result,
see [Combat Resolution Pipeline](./combat-resolution-pipeline.md)) is resolved by a
**keep-control test** on the affected being (#851 / #852):

- **Stumble** — a "keep your footing" test rolling the **better of** the being's
  **Agility** attribute and **Acrobatics** skill. A failure falls prone.
- **Fumble** — a "keep your grip" test rolling the **better of** the being's
  **Dexterity** attribute and **Legerdemain** skill. A failure drops the held item.

Selection is by effective mastery level, with **ties to the trained skill**; either
ability alone is used when the other is absent, and a being with neither warns and
does not roll. Both `BeingLogic.stumbleTest` / `fumbleTest` are **offered, never
auto-performed** — the mishap surfaces on the attack card as a prompt the target's
controlling player accepts. Each is an ordinary `successTest` whose only bespoke
part is a `keepControlTable` result mapping passed in scope — see the
[graded-test-as-data recipe](../how-to/extension-points.md#adding-a-graded--special-result-test--pass-data-dont-subclass)
and `src/document/actor/logic/keep-control.ts`.

## Body-part impairment

Impairment is the penalty to any use of a body part — it grows with wounds and
eases as they heal (`{@link bodyPartImpairment}`, `src/entity/body/impairment.ts`).
Impairment is the **worst (most negative) of** {the part's permanent impairment,
each current injury} — never additive:

| Source                                    | Impairment               |
| ----------------------------------------- | ------------------------ |
| Grievous injury (`G4`/`G5`, level ≥ 4)    | **unusable** (no number) |
| Serious injury (`S2`/`S3`, level 2–3)     | **−10**                  |
| Minor injury (`M1`) with healing rate ≤ 5 | **−5**                   |
| `permanentImpairment` field               | its value (any `≤ 0`)    |
| none / a fast-healing minor injury        | 0                        |

The magnitude tiers the part — **NONE (0) / MINOR (−5) / SERIOUS (−10) / GRIEVOUS
(≤ −11)**. A **grievous injury** adds no number but makes the part **unusable**;
permanent impairment tiers the part (a −20 arm is GRIEVOUS) but never unuses it —
only a grievous injury or the manually-set `permanentlyUnusable` flag (a withered
or fully-amputated limb) does. The derivation is pure and Foundry-free; the
Being-sheet header grid colors each part by status (none = white, MINOR = yellow,
SERIOUS/GRIEVOUS = blue, unusable = black).

**Impairment reaches test resolution through a part's roles (#568).** A skill or
attribute declares the body-part roles it depends on in its `impairedByRoles`, and
the being projects its injured parts onto two role views: `being.unusableRoles()`
(roles of every _unusable_ part) and `being.impairedRolePenalties()` (each
still-usable-but-impaired role → its worst −5/−10 penalty; the two never overlap,
since an unusable part contributes no number). In
{@link sohl.entity.modifier.MasteryLevelModifier.successTest} a test whose
`impairedByRoles` intersects an **unusable** role is forced to a Critical Failure
(the pure {@link testAutoCriticallyFails}); otherwise the worst matching −5/−10
penalty is folded into its effective mastery level (the pure
{@link testImpairmentPenalty}). Both are strict no-ops for a test with no
`impairedByRoles` or an actor with no impaired parts.

**Weapon strike modes gate on the _specific_ held limb, not a role (#628).** A
strike mode names its required limbs by _count_ (`minParts`), so gating on the
being-wide role set would be too coarse — an unusable off-hand you are not gripping
with must not fail the roll. Instead `GearLogic.heldLimbImpairments` resolves the
part(s) actually holding the weapon (via `heldBy`) and scores each through
`being.bodyPartImpairments(parts)` (the per-part twin of the role views). In the
same `successTest` seam, an **unusable** held limb forces a Critical Failure and an
impaired-but-usable one folds its worst −5/−10 into the mastery level — via the pure
{@link requiredPartsAutoCriticallyFail} / {@link requiredPartsImpairmentPenalty},
the per-part counterparts of the role helpers. When a test is gated on both a role
and a held limb, the worst of the two applies, never their sum. Natural-weapon
(combat-technique) modes still gate through their skill's `impairedByRoles`; a
per-part link from a natural weapon to its body part remains a follow-up.

Impairment drives **being health** (`deriveHealth`,
`src/document/actor/logic/health.ts`) — a banded assessment, not a point pool
(SoHL has no hit points). Each impaired part caps overall health by (its state,
whether the part is **critical** — holds a VITAL or CORE role — and how many
parts share that state); the physical health is the **minimum** cap across all
parts, mapped to a band (Excellent … Dead). `health.max` is always 100; a living
being never falls below 1. Stun/fatigue/fear/shock ceilings compose later as
additional minimums.

## Body scale (per-creature injury scaling)

Impact is an **absolute** quantity, but an injury **level** is relative to the
body absorbing it — the same 3-point dagger is trivial to a cow and grievous to a
cat. The being's `body` carries a `bodyScaleBase` factor (`1.0` = a baseline human;
larger = bigger/tougher body), exposed as the clamped `bodyScale` `ValueModifier`
on {@link sohl.document.actor.logic.BodyLogic} (`being.body.bodyScale`). Seed it
from `((typical species STR) / 11) ^ 0.65` — 11 being the human strength the
master table is calibrated for, so Strength 11 maps to exactly 1.0.

The exponent compresses the ends. A linear `STR / 11` spread the bestiary from
0.18 to 5.45 and put most of that range in the tails; at 0.65 it centres on
**1.30** with two standard deviations covering roughly 0.3 to 2.3, and a scale
of 3 sits at about +3 sd — reached by the largest dragon at 3.01 and by nothing
else. The low end barely moves (a wolf goes 0.91 to 0.94); the compression is
felt where it should be, at the top.

A creature may of course be given a scale out of line with its Strength
deliberately — `bodyScaleBase` is authored, not computed — but the curve is what
an ordinary creature is seeded from.

The master thresholds (`BASE_INJURY_THRESHOLDS`, `[1, 5, 10, 15, 20]`) are never
mutated; each creature derives its own `injuryTable = master × bodyScale` in
`BodyLogic`, exposed as `being.body.injuryTable` and on the body structure.
{@link sohl.entity.body.injuryLevelFromImpact} counts how many of that creature's
thresholds an impact reaches, so an impact below the smallest (scaled) threshold
leaves no wound — a 2-impact blow is `S2` on a `bodyScale` 0.27 cat but is ignored
by a `bodyScale` 2.9 cow (which needs ≥ 3 for even `M1`). Everything the level
feeds — Shock Index, bleeding, amputation, stumble/fumble, health — becomes
size-correct at the source, with no changes to those subsystems. An Active Effect
on `system.body.bodyScaleBase` (shrink/enlarge) re-scales the table within the same
prepare cycle.

### The scale is clamped to 0.01 – 3

`bodyScale` is floored at `MIN_BODY_SCALE` (0.01) and capped at `MAX_BODY_SCALE`
(3), including any Active-Effect delta, so an enlarge cannot lift a being past
the ceiling.

The cap exists because impact and the thresholds grow at different rates
(#1242). Impact tracks Strength at about `STR ÷ 2`, while an unbounded scale
grows the top threshold at `20 × STR ÷ 11` — roughly `STR × 1.8`, some 3.6 times
faster. Past a scale of about 3 the thresholds outrun every impact the system can
produce: an Old Dragon at its raw 5.45 would need an effective 109 for a Grievous
injury, where the largest impact in the game is its own 33-point bite, so nothing
— not another dragon, not a trebuchet — could wound it at all.

At the cap a body has thresholds `[3, 15, 30, 45, 60]`, which keeps the top of
the range hard but reachable. **Natural armour, not body scale, is what makes a
dragon proof against swords**: a hand weapon maxes at 15 impact and cannot pass a
dragon's 28-point hide whatever the thresholds say, while a siege engine or a
spell that does get through now wounds in proportion.

Seeding `bodyScaleBase` from Strength above 33 is therefore harmless but
inert — the creature is already at the ceiling.

## Body zones

A body zone is the broadest anatomical division and the **first stage of hit determination**. Persisted fields:

| Field        | Type    | Purpose                                                                                              |
| ------------ | ------- | ---------------------------------------------------------------------------------------------------- |
| `shortcode`  | string  | Stable identifier (e.g., `armszone`), unique body-wide. Named by its parts' `bodyZoneCode`.          |
| `name`       | string  | Display name (e.g., `"Arms"`). Stored literally; not a localization key.                             |
| `probWeight` | integer | How many **zone numbers** this zone claims. `0` makes it unrollable.                                 |

**Zone numbers** are allocated in persisted zone order, each zone taking a contiguous run sized by its weight. A body whose zones weigh 1 / 4 / 3 / 4 hands out `1`, `2–5`, `6–8`, `9–12`.

Across the whole body the numbers are therefore **contiguous, unique, gap-free, and monotonically increasing by 1 from 1** — an invariant the suite asserts directly. A zero-weight zone claims no numbers and does not interrupt the run. Two consequences follow:

- {@link sohl.entity.body.BodyStructure.maxZoneNumber} is the `N` of that `1..N` run (12 in the example above). It is the same number as the sum of every zone's weight, by construction.
- {@link sohl.entity.body.BodyStructure.getZoneByNumber} resolves any integer in `1..N` to exactly one zone, and returns `undefined` for anything else — `0` or below, above `N`, or non-integer. {@link sohl.entity.body.BodyZone.zoneNumbers} exposes a single zone's run.

Zone order therefore **matters**: `moveZoneUpdate` re-allocates every subsequent zone's numbers. `probWeight` is deliberately **not** wrapped in a `ValueModifier` — the runs are positional, so an active effect that moved one zone's weight mid-cycle would desync every zone above it.

## Aimed-strike drift

Zones also supply the neighbourhood the old part-adjacency graph used to provide (#780). {@link sohl.entity.body.BodyStructure.getNeighborParts} returns the nearest ring of candidates:

1. The part's own **zone siblings** (a left arm drifts to the right arm first).
2. Failing that, parts of the nearest zones by index distance, widening one step at a time in both directions at once.

Only the closest non-empty ring is returned, so a strike drifts exactly one step per iteration. This drives {@link sohl.entity.body.BodyStructure.getRandomPart} when a target is supplied:

1. Roll `1..spread`.
2. If the roll ≤ the current target part's `probWeight`, that part is hit.
3. Otherwise, reduce remaining spread by `probWeight` and drift to a random part of the nearest ring. Repeat.
4. If no unvisited neighbour remains, hit the current part.

## Hit-location pipeline

`BodyStructure.getRandomLocation(target?)` is the canonical entry point during attack resolution:

1. `getRandomPart(target?)` selects a part. **Unaimed**, this rolls a zone weighted by its `probWeight` ({@link sohl.entity.body.BodyStructure.getRandomOccupiedZone}), then draws a part inside it weighted by the part's `probWeight`. **Aimed**, it runs the drift algorithm above.
2. The selected part's `getRandomLocation()` picks a location within it, weighted by each location's `probWeight`.

**The same rule applies at all three tiers**: an entry is drawn with probability `probWeight / (sum of its siblings' probWeight)`. So for an unaimed strike,

```
P(location) =   zone.probWeight / sum(all zones' probWeight)
              x part.probWeight / sum(that zone's parts' probWeight)
              x loc.probWeight  / sum(that part's locations' probWeight)
```

A zone that carries weight but holds no parts is **excluded** from the roll rather than falling through to a body-wide draw — otherwise its share would leak out and skew every other zone's true frequency. `getRandomZone` still reports it, since it owns real zone numbers and the displayed table must say so.

Two selectors deliberately sit outside this model: the drift algorithm above (`getRandomPart(target)`, a general aimed-selection utility), and `getRandomPartByRole`, which is a flat weighted draw over every role-matching part body-wide — it answers "any vital part," not "where did the blow land."

## Zone-Die aiming (Resolve Injury)

The **Resolve Injury** action determines its hit location by **Zone-Number aiming with a Zone Die** via {@link sohl.entity.body.BodyStructure.aimZone}, not the drift algorithm:

1. Roll the zone die uniformly in `1..zoneDie`.
2. `Hit ZN = (targetZoneNumber − 1) + result`.
3. Look up the zone owning `Hit ZN` ({@link sohl.entity.body.BodyStructure.getZoneByNumber}). A `Hit ZN` above {@link sohl.entity.body.BodyStructure.maxZoneNumber} (or a zone with no hittable part) is a **miss** — no location.
4. Otherwise draw a weighted part in that zone, then a weighted location within that part.

`aimZone` returns the full trace (`targetZoneNumber`, `zoneDie`, `zoneDieResult`, `hitZoneNumber`, `zone`, `location`, `isMiss`) so the result card can echo how the location was determined. `targetZoneNumber` defaults to 1 and an unaimed strike uses `zoneDie = maxZoneNumber`, which reproduces the whole-body weighted distribution above.

For the broader resolution flow (rolls → wound calculation → effects), see [Combat Resolution Pipeline](./combat-resolution-pipeline.md).

## Localization

Two parallel mechanisms exist:

- **Literal `name` fields** on each part and location, baked into the compendium JSON in the active language (`"name": "Skull"`). This is what the system reads at runtime.
- **`SOHL.BodyPart.<bare-shortcode>` and `SOHL.BodyLocation.<bare-shortcode>` keys** in [lang/en.json](../../lang/en.json). Keys use bare names (`SOHL.BodyPart.head`, `SOHL.BodyLocation.skull`) without the `*part` / `*loc` suffix. These keys are used by UI affordances that need to render a label from a shortcode alone; the literal `name` field on the compendium item is preferred when the item is in hand.

When authoring a new body structure, set the literal `name` field and add the corresponding localization key for the bare shortcode.

## Reference: Human body

The Human body structure is the reference anatomy shipped today — carried on the "Basic Folk" being's `system.body.structure` (authored in [assets/content/Corpora/Human_Folk.md](../../assets/content/Corpora/Human_Folk.md)). Its structure:

| Part shortcode | Name      | Roles         | `probWeight` | Can hold |
| -------------- | --------- | ------------- | -----------: | -------- |
| `headpart`     | Head      | `vital`       |            1 | no       |
| `torsopart`    | Torso     | `core`        |            4 | no       |
| `larmpart`     | Left Arm  | `manipulator` |            2 | yes      |
| `rarmpart`     | Right Arm | `manipulator` |            2 | yes      |
| `llegpart`     | Left Leg  | `locomotor`   |            3 | no       |
| `rlegpart`     | Right Leg | `locomotor`   |            3 | no       |

Locations:

| Part        | Location shortcodes                                                                                                          |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `headpart`  | `skullloc`, `leyeloc`, `reyeloc`, `noseloc`, `lcheekloc`, `rcheekloc`, `learloc`, `rearloc`, `mouthloc`, `jawloc`, `neckloc` |
| `torsopart` | `thrxloc`, `abdmnloc`, `plvisloc`                                                                                            |
| `larmpart`  | `lshldloc`, `lupaloc`, `lelbloc`, `lfraloc`, `lhandloc`                                                                      |
| `rarmpart`  | `rshldloc`, `rupaloc`, `relbloc`, `rfraloc`, `rhandloc`                                                                      |
| `llegpart`  | `lthghloc`, `lkneeloc`, `lcalfloc`, `lfootloc`                                                                               |
| `rlegpart`  | `rthghloc`, `rkneeloc`, `rcalfloc`, `rfootloc`                                                                               |

Zones (in order, with the numbers each claims):

| Zone shortcode | Name  | `probWeight` | Zone numbers | Parts                    |
| -------------- | ----- | -----------: | ------------ | ------------------------ |
| `headzone`     | Head  |            1 | 1            | `headpart`               |
| `armszone`     | Arms  |            4 | 2–5          | `rarmpart`, `larmpart`   |
| `torsozone`    | Torso |            4 | 6–9          | `torsopart`              |
| `legszone`     | Legs  |            6 | 10–15        | `rlegpart`, `llegpart`   |

## Body plans shipped in the animals pack

Suffix every zone shortcode with `zone`, every part shortcode with `part`, and every location shortcode with `loc`. Use `l*` / `r*` prefixes for left/right pairs. Part and location shortcodes must be unique **body-wide**.

Fifteen body plans are authored across the `sohl.actors` pack. Each mirrors the shape of a printed hit-location table where one exists and extrapolates the same construction where none does; zone weights scale with the creature's size band, while part and location weights are the plan's own.

| Plan             | Zones                                            | Example creatures            |
| ---------------- | ------------------------------------------------ | ---------------------------- |
| `ungulate`       | Head · Forelegs · Torso · Hindquarters           | bovine, horse, stag, rhino   |
| `carnivore`      | Head · Forelegs · Torso · Hindquarters           | bear, lion, wolf, crocodile  |
| `smallQuadruped` | Forequarters · Torso · Hindquarters              | cat, dog, badger, lizard     |
| `anthropoid`     | Head · Arms · Torso · Legs                       | ape, monkey (and every Being)|
| `smallAvian`     | Head · Body · Hindquarters                       | crow, raven, bat             |
| `largeAvian`     | Head · Wing · Body · Wing · Hindquarters         | eagle, condor, roc           |
| `biped`          | Head · Body · Hindquarters                       | ostrich, raptor-lizards      |
| `drake`          | Head · Wings · Forelegs · Torso · Hindquarters   | forest and mountain drakes   |
| `serpentine`     | Head · Forebody · Hindbody                       | snake, centipede, wurm       |
| `proboscidean`   | Head · Trunk · Forelegs · Torso · Hindquarters   | elephant                     |
| `arachnid`       | Cephalothorax · Abdomen · Legs                   | spider, scorpion             |
| `insect`         | Head · Thorax · Abdomen                          | ant, wasp, beetle            |
| `aquatic`        | Head · Body · Tail                               | shark, orca, seal            |
| `chelonian`      | Head · Shell · Limbs                             | tortoise, turtle             |
| `cephalopod`     | Mantle · Head · Arms                             | octopus                      |

An **ape or monkey uses the human plan unchanged** — the same six parts and thirty-two hit locations a Being carries — over a zone run scaled to its size, so a monkey's zone numbers run 1–6 where a person's run 1–15.

## Adding a body part to a being

Use `BodyStructure.addPartUpdate(partData)` to build the update payload:

```typescript
const zone = structure.getZoneByCode("tailzone");
// `BodyZone.addPartUpdate` stamps `bodyZoneCode` for you.
await beingActor.update(
    zone.addPartUpdate({
        shortcode: "tailpart",
        name: "Tail",
        bodyZoneCode: "tailzone",
        roles: ["locomotor"],
        favoredFlag: false,
        canHoldItem: false,
        heldItemId: null,
        probWeight: 1,
    }),
);
```

Its hit locations are added separately, against the flat `locations` array — again with the parent code stamped for you:

```typescript
const part = beingActor.logic.body.structure.getPartByCode("tailpart");
await beingActor.update(
    part.addLocationUpdate(blankBodyLocation("Tail Tip", "tailtiploc")),
);
```

Add the zone first if it does not exist (`structure.addZoneUpdate(blankBodyZone("Tail", "tailzone"))`); a part whose `bodyZoneCode` names no zone is stored but stays out of the hierarchy.

Localization keys for the bare shortcode (`SOHL.BodyPart.tail`, `SOHL.BodyLocation.<each location>`) belong in [lang/en.json](../../lang/en.json).

### From the Being sheet

An owner can also author the anatomy directly on the **Combat tab's Body
Structure section** — no macro needed:

- **Add** — the section header carries a **+ Add** control that creates a body
  part; each body-part header carries a **+ Add** that creates a hit location
  under it. Both prompt for a name and a unique shortcode.
- **Edit** — each part header and location row has a **⋮** menu whose **Edit**
  opens the `BodyPartConfig` / `BodyLocationConfig` editor for that entry, which
  auto-saves each field change (roles, protection, bleeding / amputability
  tiers, and so on).
- **Delete** — the same **⋮** menu's **Delete** removes the entry after
  confirmation. Deleting a part is refused while it still owns hit locations —
  remove those first.
- **Reorder** — parts and locations reorder, and locations move between parts,
  by drag-and-drop.

Every one of these writes rebuilds the whole `parts` array through the
`BodyStructure` update builders (`addPartUpdate` / `removePartUpdate` /
`movePartUpdate` / `moveLocationUpdate` / `setPartFieldsUpdate`) — never a
by-index write (see the array-corruption note above). All controls are
owner-gated; a non-owner sees the read-only tree.

## See Also

- [Type Catalog](./type-catalog.md)
- [Combat Resolution Pipeline](./combat-resolution-pipeline.md)
