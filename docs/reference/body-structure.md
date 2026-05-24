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

Every creature (a Being actor) takes its anatomy from a **Lineage** item attached to it. The lineage's body structure determines where blows land, how armor protects, which skills and attributes are impaired by injury, and whether a hit makes the target fumble a weapon or stumble.

A body structure has three parts: a list of **body parts**, the **body locations** nested within each part, and an **adjacency graph** describing which parts are next to which. A cross-cutting tag set of **body roles** ties parts to the skills and attributes they affect.

## Where the data lives

The schema is defined on the Lineage item, not on the Being actor. See [src/document/item/foundry/LineageDataModel.ts](../../src/document/item/foundry/LineageDataModel.ts):

```
system.bodyStructure
  ├── parts: BodyPart.Data[]   // each with its locations[]
  └── adjacent: string[][]      // pairs of part shortcodes
```

At runtime, the data is rebuilt into domain objects in [src/domain/body/](../../src/domain/body/):

- `BodyStructure` — the root object; provides hit-location resolution and adjacency queries
- `BodyPart` — one anatomical division
- `BodyLocation` — one hit location within a part

Domain objects are reconstructed on every preparation cycle. Active effects may mutate them in-flight (e.g., adding protection modifiers), but only changes written through `document.update()` survive. To persist, use the `*Update()` helpers on `BodyStructure` (`addPartUpdate`, `removePartUpdate`, `addEdgeUpdate`, `removeEdgeUpdate`).

## Body parts

A body part is a primary anatomical division — Head, Torso, an arm, a leg, a wing. Persisted fields, per [LineageDataModel.ts:44-153](../../src/document/item/foundry/LineageDataModel.ts#L44-L153):

| Field | Type | Purpose |
|---|---|---|
| `shortcode` | string | Stable identifier (e.g., `headpart`). Used in adjacency lookups and update paths. |
| `name` | string | Display name (e.g., `"Head"`). Stored literally; not a localization key. |
| `roles` | `BodyRole[]` | Functional tags the part fulfills — see [Body Roles](#body-roles). |
| `combatArea` | number | Targetable surface area in square feet. Doubles as the weight for unaimed-attack random selection. |
| `canHoldItem` | boolean | Whether this part can grip an item. Arms typically `true`; others `false`. |
| `heldItemId` | string \| null | The ID of the item currently held, if any. |
| `favoredFlag` | boolean | Marks the part as favored (off-hand vs. main-hand semantics). |
| `locations` | `BodyLocation.Data[]` | The hit locations nested within this part. |

A convenience getter `BodyPart.affectsMobility` is `true` when the part has any of the `vital`, `core`, or `locomotor` roles ([src/domain/body/BodyPart.ts:54-61](../../src/domain/body/BodyPart.ts#L54-L61)).

## Body locations

A body location is a specific hit point within a part — Skull, Thorax, Right Elbow. Persisted fields, per [LineageDataModel.ts:88-150](../../src/document/item/foundry/LineageDataModel.ts#L88-L150):

| Field | Type | Purpose |
|---|---|---|
| `shortcode` | string | Stable identifier (e.g., `skullloc`, `relbloc`). |
| `name` | string | Display name (e.g., `"Skull"`). Stored literally. |
| `probWeight` | integer | Relative weight for random hit selection within the parent part. |
| `shockValue` | integer | Inherent shock inflicted by an injury at this location, regardless of severity. |
| `bleedingSusceptibility` | tier | `none` / `low` / `medium` / `high`. Combined with injury severity and weapon aspect by `BleedingDefaults` to decide whether a wound bleeds. |
| `amputability` | tier | `none` / `low` / `medium` / `high`. Drives the Strength-test modifier when a G5 Edge injury would amputate; see `AmputationDefaults`. `none` means amputation is disallowed at this location. |
| `protectionBase` | `{blunt, edged, piercing, fire}` | Natural armor values per [`ImpactAspect`](../../src/utils/constants.ts). |

Both tiers map to the rulebook's shaded markers (none/white/grey/black for bleeding; same for amputability).

## Body roles

A cross-cutting tag set. The four values, defined in [src/utils/constants.ts](../../src/utils/constants.ts) under `BODY_ROLE`:

| Role | Anatomical examples |
|---|---|
| `vital` | Brain, sensory organs, vital nerve clusters. Head for vertebrates; cephalothorax for arachnids; ganglia for invertebrates. |
| `core` | Power and balance. Torso for humans; abdomen for insects; mantle for cephalopods; body segments for snakes. |
| `manipulator` | Fine work and intentional force. Arms, paws, tentacles, trunks; jaws used as bite-weapons. |
| `locomotor` | Movement. Legs, wings, fins; tentacles used for swimming. |

A part may carry multiple roles. A wolf's foreleg might be `[locomotor, manipulator]`; its head `[vital, manipulator]` (bite attacks).

**What roles drive:**

1. **Skill / attribute impairment.** Skills and attributes carry an `impairedByRoles: BodyRole[]` field. When a body part takes an injury, every skill and attribute whose `impairedByRoles` intersects the part's `roles` is impaired. Mental attributes leave the list empty; physical ones list the relevant roles. See [src/document/item/foundry/SkillDataModel.ts](../../src/document/item/foundry/SkillDataModel.ts) and [AttributeDataModel.ts](../../src/document/item/foundry/AttributeDataModel.ts).
2. **Mobility impairment.** `BodyPart.affectsMobility` returns `true` when the part has any of `vital`, `core`, or `locomotor`.
3. **Mishap checks** (fumble / stumble) on injury severity:
    - `vital` Serious → fumble + stumble check; Grievous → both auto
    - `core` Serious → fumble + stumble check; Grievous → both auto
    - `manipulator` Serious → fumble check; Grievous → auto fumble
    - `locomotor` Serious → stumble check; Grievous → auto stumble

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

Each pair is bidirectional. The adjacency graph drives the **aimed-strike drift algorithm** ([BodyStructure.getRandomPart](../../src/domain/body/BodyStructure.ts#L97-L136)):

1. Roll `1..accuracy`.
2. If the roll ≤ the current target part's `probWeight`, that part is hit.
3. Otherwise, reduce remaining accuracy by `probWeight` and drift to a random adjacent part. Repeat.
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

When authoring a new lineage, set the literal `name` field and add the corresponding localization key for the bare shortcode.

## Reference: Human lineage

The only lineage shipped today is **Human** ([assets/packs/items/_source/Human_R0F5737O8cfOraMc.json](../../assets/packs/items/_source/Human_R0F5737O8cfOraMc.json)). Its body structure:

| Part shortcode | Name | Roles | `combatArea` | Can hold |
|---|---|---|---:|---|
| `headpart` | Head | `vital` | 1 | no |
| `torsopart` | Torso | `core` | 4 | no |
| `larmpart` | Left Arm | `manipulator` | 2 | yes |
| `rarmpart` | Right Arm | `manipulator` | 2 | yes |
| `llegpart` | Left Leg | `locomotor` | 3 | no |
| `rlegpart` | Right Leg | `locomotor` | 3 | no |

Locations:

| Part | Location shortcodes |
|---|---|
| `headpart` | `skullloc`, `leyeloc`, `reyeloc`, `noseloc`, `lcheekloc`, `rcheekloc`, `learloc`, `rearloc`, `mouthloc`, `jawloc`, `neckloc` |
| `torsopart` | `thrxloc`, `abdmnloc`, `plvisloc` |
| `larmpart` | `lshldloc`, `lupaloc`, `lelbloc`, `lfraloc`, `lhandloc` |
| `rarmpart` | `rshldloc`, `rupaloc`, `relbloc`, `rfraloc`, `rhandloc` |
| `llegpart` | `lthghloc`, `lkneeloc`, `lcalfloc`, `lfootloc` |
| `rlegpart` | `rthghloc`, `rkneeloc`, `rcalfloc`, `rfootloc` |

Adjacency: torso is the hub — head, both arms, and both legs all connect to it; head also connects directly to both arms.

## Suggested shortcode conventions for new lineages

Suffix every part shortcode with `part` and every location shortcode with `loc`. Use `l*` / `r*` prefixes for left/right pairs. Beyond that, the suggestions below are conventions, not shipped data — only Human is in the compendium today.

### Quadruped (horse, wolf, bear)

`headpart`, `neckpart`, `forequarterspart`, `barrelpart`, `hindquarterspart`, `lforelegpart`, `rforelegpart`, `lhindlegpart`, `rhindlegpart`, `tailpart`.

### Avian (eagle, griffin)

`headpart`, `bodypart`, `lwingpart`, `rwingpart`, `llegpart`, `rlegpart`, `tailpart`.

### Serpentine (snake, wyrm, dragon)

`headpart`, `neckpart`, `forebodypart`, `midbodypart`, `hindbodypart`, `tailpart`; dragons add `lwingpart` / `rwingpart` and four legs.

### Multi-limbed (spider, insect)

`cephalothoraxpart`, `abdomenpart`; legs numbered for clarity when more than two pairs.

## Adding a body part to a lineage

Use `BodyStructure.addPartUpdate(partData)` to build the update payload:

```typescript
const update = bodyStructure.addPartUpdate({
    shortcode: "tailpart",
    name: "Tail",
    roles: ["locomotor"],
    favoredFlag: false,
    canHoldItem: false,
    heldItemId: null,
    combatArea: 1,
    locations: [/* BodyLocation.Data entries */],
});
await lineageItem.update(update);
```

To wire it into adjacency: `bodyStructure.addEdgeUpdate("tailpart", "hindquarterspart")` returns the update payload to add the edge.

Localization keys for the bare shortcode (`SOHL.BodyPart.tail`, `SOHL.BodyLocation.<each location>`) belong in [lang/en.json](../../lang/en.json).

## See Also

- [Type Catalog](./type-catalog.md)
- [Combat Resolution Pipeline](./combat-resolution-pipeline.md)
- [Injuries and Healing](./injuries-healing.md)
