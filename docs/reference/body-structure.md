---
aliases:
    - Body Structure
    - Body Parts
    - Body Locations
    - Hit Location
    - Anatomy
    - Strike Spread
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

A body structure has three parts: a list of **body parts**, the **body locations** nested within each part, and an **adjacency graph** describing which parts are next to which. A cross-cutting tag set of **body roles** ties parts to the skills and attributes they affect.

## Where the data lives

The schema is the `body` `SchemaField` on the Being actor's DataModel. See [src/document/actor/foundry/BeingDataModel.ts](../../src/document/actor/foundry/BeingDataModel.ts):

```
system.body.structure
  ├── parts: BodyPart.Data[]   // each with its locations[]
  └── adjacent: string[][]      // pairs of part shortcodes
```

At runtime, the data is rebuilt into domain objects in `src/entity/body/`:

- `BodyStructure` — the root object; provides hit-location resolution and adjacency queries
- `BodyPart` — one anatomical division
- `BodyLocation` — one hit location within a part

The `BodyStructure` and its parts/locations are parented to the being's {@link sohl.document.actor.logic.BodyLogic} (owned by {@link sohl.document.actor.logic.BeingLogic}); their persisted paths are `system.body.structure.parts` / `system.body.structure.adjacent`. Domain objects are reconstructed on every preparation cycle. Active effects may mutate them in-flight (e.g., adding protection modifiers), but only changes written through `document.update()` survive. To persist, use the `*Update()` helpers on `BodyStructure` (`addPartUpdate`, `removePartUpdate`, `addEdgeUpdate`, `removeEdgeUpdate`).

## Body parts

A body part is a primary anatomical division — Head, Torso, an arm, a leg, a wing. Persisted fields, from the `defineSchema()` of [BeingDataModel.ts](../../src/document/actor/foundry/BeingDataModel.ts):

| Field                 | Type                  | Purpose                                                                                                              |
| --------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `shortcode`           | string                | Stable identifier (e.g., `headpart`). Used in adjacency lookups and update paths.                                    |
| `name`                | string                | Display name (e.g., `"Head"`). Stored literally; not a localization key.                                             |
| `roles`               | `BodyRole[]`          | Functional tags the part fulfills — see [Body Roles](#body-roles).                                                   |
| `combatArea`          | number                | Targetable surface area in square feet. Doubles as the weight for unaimed-attack random selection.                   |
| `canHoldItem`         | boolean               | Whether this part can grip an item. Arms typically `true`; others `false`.                                           |
| `heldItemId`          | string \| null        | The ID of the item currently held, if any.                                                                           |
| `favoredFlag`         | boolean               | Marks the part as favored (off-hand vs. main-hand semantics).                                                        |
| `permanentImpairment` | integer ≤ 0           | Manually-set permanent impairment for the part (`0` = none). See [Body-part impairment](#body-part-impairment).      |
| `permanentlyUnusable` | boolean               | Manually-set flag marking the part permanently unusable (withered / fully amputated), regardless of impairment tier. |
| `locations`           | `BodyLocation.Data[]` | The hit locations nested within this part.                                                                           |

A convenience getter {@link sohl.entity.body.BodyPart.affectsMobility} is `true` when the part has any of the `vital`, `core`, or `locomotor` roles.

## Body locations

A body location is a specific hit point within a part — Skull, Thorax, Right Elbow. Persisted fields, also from the `defineSchema()` of [BeingDataModel.ts](../../src/document/actor/foundry/BeingDataModel.ts):

| Field                    | Type                             | Purpose                                                                                                                                                                                       |
| ------------------------ | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `shortcode`              | string                           | Stable identifier (e.g., `skullloc`, `relbloc`).                                                                                                                                              |
| `name`                   | string                           | Display name (e.g., `"Skull"`). Stored literally.                                                                                                                                             |
| `probWeight`             | integer                          | Relative weight for random hit selection within the parent part.                                                                                                                              |
| `shockValue`             | integer                          | Inherent shock inflicted by an injury at this location, regardless of severity.                                                                                                               |
| `bleedingSusceptibility` | tier                             | `none` / `low` / `medium` / `high`. Combined with injury severity and weapon aspect by `BleedingDefaults` to decide whether a wound bleeds.                                                   |
| `amputability`           | tier                             | `none` / `low` / `medium` / `high`. Drives the Strength-test modifier when a G5 Edge injury would amputate; see `AmputationDefaults`. `none` means amputation is disallowed at this location. |
| `protectionBase`         | `{blunt, edged, piercing, fire}` | Natural armor values per [`ImpactAspect`](../../src/utils/constants.ts).                                                                                                                      |

Both tiers map to the rulebook's shaded markers (none/white/grey/black for bleeding; same for amputability).

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
`impairedByRoles` or an actor with no impaired parts. Weapon strike modes name
required limbs by _count_ (`minParts`), not by role, so this role-based gating does
not yet reach them — that variant is a follow-up.

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
larger = bigger/tougher body), exposed as the floored `bodyScale` `ValueModifier`
on {@link sohl.document.actor.logic.BodyLogic} (`being.body.bodyScale`). Seed it
from `(typical species STR) / 11` (11 is the human strength the master table is
calibrated for).

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

## Adjacency

The adjacency graph defines which parts are next to which, as an array of unordered pairs of part shortcodes:

```json
"adjacent": [
    ["headpart", "torsopart"],
    ["headpart", "rarmpart"],
    ["torsopart", "rarmpart"],
    ["torsopart", "rlegpart"]
]
```

Each pair is bidirectional. The adjacency graph drives the **aimed-strike drift algorithm** ({@link sohl.entity.body.BodyStructure.getRandomPart}):

1. Roll `1..spread`.
2. If the roll ≤ the current target part's `probWeight`, that part is hit.
3. Otherwise, reduce remaining spread by `probWeight` and drift to a random adjacent part. Repeat.
4. If the drift reaches a part with no unvisited neighbors, hit that part.

For unaimed attacks (`getRandomPart()` with no target), pure weighted random selection is used, with each part's `combatArea` as its weight.

## Hit-location pipeline

`BodyStructure.getRandomLocation(target?)` is the canonical entry point during attack resolution:

1. `getRandomPart(target?)` selects a part (aimed drift, or pure weighted random).
2. The selected part's `getRandomLocation()` picks a location within it, weighted by each location's `probWeight`.

For the broader resolution flow (rolls → wound calculation → effects), see [Combat Resolution Pipeline](./combat-resolution-pipeline.md).

## Localization

Two parallel mechanisms exist:

- **Literal `name` fields** on each part and location, baked into the compendium JSON in the active language (`"name": "Skull"`). This is what the system reads at runtime.
- **`SOHL.BodyPart.<bare-shortcode>` and `SOHL.BodyLocation.<bare-shortcode>` keys** in [lang/en.json](../../lang/en.json). Keys use bare names (`SOHL.BodyPart.head`, `SOHL.BodyLocation.skull`) without the `*part` / `*loc` suffix. These keys are used by UI affordances that need to render a label from a shortcode alone; the literal `name` field on the compendium item is preferred when the item is in hand.

When authoring a new body structure, set the literal `name` field and add the corresponding localization key for the bare shortcode.

## Reference: Human body

The Human body structure is the reference anatomy shipped today — carried on the "Basic Folk" being's `system.body.structure` (authored in [assets/content/Corpora/Human_Folk.md](../../assets/content/Corpora/Human_Folk.md)). Its structure:

| Part shortcode | Name      | Roles         | `combatArea` | Can hold |
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

Adjacency: torso is the hub — head, both arms, and both legs all connect to it; head also connects directly to both arms.

## Suggested shortcode conventions for new body structures

Suffix every part shortcode with `part` and every location shortcode with `loc`. Use `l*` / `r*` prefixes for left/right pairs. Beyond that, the suggestions below are conventions, not shipped data — only the Human body structure is authored today.

### Quadruped (horse, wolf, bear)

`headpart`, `neckpart`, `forequarterspart`, `barrelpart`, `hindquarterspart`, `lforelegpart`, `rforelegpart`, `lhindlegpart`, `rhindlegpart`, `tailpart`.

### Avian (eagle, griffin)

`headpart`, `bodypart`, `lwingpart`, `rwingpart`, `llegpart`, `rlegpart`, `tailpart`.

### Serpentine (snake, wyrm, dragon)

`headpart`, `neckpart`, `forebodypart`, `midbodypart`, `hindbodypart`, `tailpart`; dragons add `lwingpart` / `rwingpart` and four legs.

### Multi-limbed (spider, insect)

`cephalothoraxpart`, `abdomenpart`; legs numbered for clarity when more than two pairs.

## Adding a body part to a being

Use `BodyStructure.addPartUpdate(partData)` to build the update payload:

```typescript
const update = structure.addPartUpdate({
    shortcode: "tailpart",
    name: "Tail",
    roles: ["locomotor"],
    favoredFlag: false,
    canHoldItem: false,
    heldItemId: null,
    combatArea: 1,
    locations: [
        /* BodyLocation.Data entries */
    ],
});
await beingActor.update(update);
```

To wire it into adjacency: `structure.addEdgeUpdate("tailpart", "hindquarterspart")` returns the update payload to add the edge.

Localization keys for the bare shortcode (`SOHL.BodyPart.tail`, `SOHL.BodyLocation.<each location>`) belong in [lang/en.json](../../lang/en.json).

## See Also

- [Type Catalog](./type-catalog.md)
- [Combat Resolution Pipeline](./combat-resolution-pipeline.md)
