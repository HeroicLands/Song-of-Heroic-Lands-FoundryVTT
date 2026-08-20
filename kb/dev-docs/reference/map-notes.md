# Map Notes

See also: [Type Catalog](type-catalog.md), [Scene, Token, and Combatant Systems](scene-token-combatant.md), [Event Queue](event-queue.md)

A **map note** is a markdown note in `assets/content/` that compiles to a Foundry
`Scene`. It is the scene counterpart of an item or actor note: the same
frontmatter envelope, the same `sohl:` block, the same folder mechanism, and the
same rule that the note carries an *essence* rather than a mirror of the Foundry
data model.

Three note types compile through one compiler, differing only in derived
defaults:

| `type:`        | Scale         | `grid.type` | `grid.distance` | `grid.units` | `tokenVision` | `fog.mode`   | `padding` |
| -------------- | ------------- | ----------- | --------------- | ------------ | ------------- | ------------ | --------- |
| `battlemap`    | tactical      | square      | 5               | `ft`         | `true`        | `INDIVIDUAL` | 0.25      |
| `localmap`     | ~1 km         | square      | 10              | `m`          | `false`       | `DISABLED`   | 0.1       |
| `regionalmap`  | large         | gridless    | 5               | `km`         | `false`       | `DISABLED`   | 0         |

These are emitted **explicitly** on every scene. `grid.type`, `grid.distance`
and `grid.units` declare `initial: () => game.system.grid.*`, and there is no
`game` at build time, so leaving them to their initial is not an option. An
unrecognised `type:` fails the build.

The translation lives in `packages/content-build/engine/map-notes.mjs` (framework-free and
unit-tested); the pass that walks the tree, resolves cross-references and writes
the pack JSON is `packages/content-build/engine/scenes.mjs`.

## Two units, told apart by the key

- **Geometry is pixels** — walls, doors, lights, tiles, sounds and region
  shapes. Pixels are Foundry's native storage, so the conversion is lossless by
  construction, and a traced battlemap's walls do not lie on grid intersections
  anyway (measured on a real map: 97.8% do not).
- **Map pins are grid squares** — `locations:` only, commonly half-integers,
  because a pin centres in its square and that is how a human reads a position
  off the map.

The key says which: **`position:` and every segment/shape coordinate list are
pixels; `at:` is grid squares.**

Mixing them fails silently in Foundry — a grid-valued wall lands in a tiny clump
at the top-left, and a pixel-valued pin lands off the map — so the build lints
both directions against the note's own `dimensions` and `pxPerGrid`. Geometry
whose every coordinate is smaller than one grid square, on a map several squares
across, is rejected; so is a location outside the map's grid extent.

## Frontmatter

```yaml
name:
  full: Wayfarer's Rest, Ground Floor
description: "The common room of a roadside shelter."
id: Xwo4dsmey2A3Rvrn          # pinned, as with items and actors
shortcode: wayrestground
type: battlemap
package: sohl
sohl:
  folder: Pw3nJvVsGuMdRb1K    # a folder id from scene-folders.yaml
  place: wayfarersrest        # optional; groups scenes into one Adventure
  placeName: Wayfarer's Rest  # optional; the Adventure's name
  image: systems/sohl/assets/ui/parchment.jpg
  overlay: …                  # optional foreground layer
  levelName: Ground           # optional; names the synthesised Level
  backgroundColor: "#999999"  # optional
  dimensions: [512, 512]      # PIXELS — the map's own size
  pxPerGrid: 64               # the one number that must match the art

  locations:                  # GRID squares; keys name body headings
    common-room: { at: [4, 4] }

  walls:                      # PIXELS, keyed by feature
    shell:
      blocks: [movement, sight, light, sound]
      segments:
        - [64, 64, 448, 64]
    stair-rail:
      blocks: [movement]
      limits: [sight]
      segments: [[352, 352, 448, 352]]

  doors:
    front:
      kind: door              # door | secret
      state: closed           # closed | open | locked
      blocks: [movement, sight, light]
      segment: [288, 448, 224, 448]

  lights:
    hearth:
      position: [112, 112]    # PIXELS
      dim: 30                 # DISTANCE UNITS, like Foundry's own field
      bright: 10
      color: "#ff9329"

  tiles:
    strongbox:
      position: [352, 96]
      size: [64, 64]
      image: systems/sohl/assets/icons/other/chest.svg

  sounds:
    eaves:
      position: [256, 64]
      radius: 20              # DISTANCE UNITS
      path: systems/sohl/assets/audio/swoosh1.ogg
      volume: 0.3

  regions:
    smoke-bay:
      name: Smoke Bay
      shapes:
        - rect: [96, 96, 128, 128]
      restrict: light         # light | darkness | sight | sound | move
      behaviors:
        gloom:
          adjustDarknessLevel: { mode: darken, modifier: 0.25 }
```

Everything else about the Scene is derived. The note never carries `levels`,
`initialLevel`, a region's `color` or `levels`, `_shapeConstraints`, `hidden`,
`locked`, `highlightMode`, `displayMeasurements`, `ownership`, `sort`, or
`gridBased`.

## Walls: `blocks:` and `limits:`, not Foundry's vocabulary

`WALL_MOVEMENT_TYPES.NONE` means movement does **not** collide — i.e. passable —
so `movement: none` reads as the exact opposite of what it does. A map note says
what a wall stops instead:

- `blocks: [...]` — the wall stops it (`EDGE_SENSE_TYPES.NORMAL`).
- `limits: [...]` — the wall attenuates it (`EDGE_SENSE_TYPES.LIMITED`).
- anything unnamed is passable.

The four names are `movement`, `sight`, `light`, `sound`. `movement` may not
appear in `limits:` — movement is binary, and Foundry has no LIMITED value for
it. (`EDGE_SENSE_TYPES` is the current constant; `WALL_SENSE_TYPES` is
deprecated in v14.)

Walls are keyed by **feature**, not by restriction signature, so a diff reads
"the hayloft walls changed" rather than "line 143 changed".

## The Level is synthesised, never authored

Foundry v14 moved the background image off `Scene` onto an embedded `Level`.
Exactly one is synthesised per map from `image:` / `overlay:`, given Foundry's
own `Scene.metadata.defaultLevelId` (`defaultLevel0000`), emitted **inline** in
the scene source and named by `initialLevel`.

This is not optional. The client-side `_preCreate` net that would create a
default Level does not run for offline pack compilation, so a scene without one
ships with no map at all.

**It also depends on the pack `_stats.coreVersion` stamp.** Foundry's
server-side `migrateLevels` shim runs on any Scene record stamped older than
**14.353** and **replaces `levels` outright** with a single default level
synthesised from the pre-v14 flat fields — it never checks whether the record
already has one. Packs used to stamp `coreVersion: "14"`, which sorts *below*
every v14 build, so a compiled scene loaded from its pack with the authored Level
gone, replaced by an empty one named after the scene, and no image. Nothing in
the build could see it (#1533).

Every compiled document now stamps the manifest's own `compatibility.minimum`
— `supportedCoreVersion` in
[`packages/content-build/engine/helpers.mjs`](../../../packages/content-build/engine/helpers.mjs) — which the
manifest itself enforces, so no supported client can legitimately need those
shims. Map notes
carry no special case for it — but `map-notes.cy.js` asserts the Level's *name*
as well as its background, because that is the only place the failure is visible.

Multi-level scenes are out of scope for v1: one scene per floor, with stair
regions teleporting between them.

## Regions

```yaml
regions:
  <key>:
    name: The Crypt                # display name; defaults to the key
    shapes:                        # PIXELS; at least one
      - polygon: [400, 400, 1200, 400, 1200, 1100]
      - rect: [1400, 1800, 300, 200]
      - circle: [1500, 600, 250]
      - ellipse: [1500, 1400, 300, 200, 30]   # rotation optional
      - polygon: [...]
        hole: true
    elevation: [0, null]           # [bottom, top]; null = infinite
    visibility: gamemaster         # layer | gamemaster | always | observer | layerUnlocked
    restrict: move                 # optional
    behaviors:
      <key>: { <behaviourType>: { … } }
```

Four shape forms only — `rectangle` (`rect`), `circle`, `ellipse`, `polygon`.
The other six Foundry shapes are template and token-attached forms with no place
in an authored map, and `gridBased` is deliberately not exposed: it reinterprets
a shape metrically, and one unit convention per note is the point.

Two derived fields matter:

- **`color` is hashed from the region key.** Foundry's default is
  `Color.fromHSV([Math.random(), …])`, a different value on every create, which
  would make each build differ from the last for no visible reason.
- **`levels` is not emitted** — the empty set means "all levels", which is
  correct under the one-scene-per-floor rule. The exception is `restrict:`,
  which requires exactly one level (`_computeShapeConstraints` bails otherwise),
  so a restricted region gets `levels: [defaultLevel0000]`.

## Region behaviours

Allowed in v1: `trigger` (the SoHL bridge, see
[Event Queue](event-queue.md)), `adjustDarknessLevel`, `applyActiveEffect`,
`changeLevel`, `defineSurface`, `displayScrollingText`, `modifyMovementCost`,
`pauseGame`, `suppressWeather`, `teleportToken`, `toggleBehavior`.

Each behaviour's fields are an **allow-list**: an unlisted field fails the build
rather than being dropped in silence, and an unlisted *type* fails here rather
than surfacing from Foundry as `Cannot read properties of undefined (reading
'regions')`.

**`executeScript` is banned.** Its `source` is a `JavaScriptField`, so a note
carrying one would compile data into code — the system's top security constraint
(see [Security Model & Guardrails](../concepts/security-model.md)). It is not
representable in the schema and there is no escape hatch. `executeMacro` is
merely deferred, until Adventure-bundled macros land.

### The SoHL trigger

```yaml
behaviors:
  arrival:
    trigger:
      events: [tokenEnter, tokenExit]
      action: reactionTest      # omit = forward-only, no offer
```

`events:` is validated against the curated set SoHL forwards — `tokenEnter`,
`tokenExit`, `tokenTurnStart`, `tokenTurnEnd`, `tokenRoundStart`,
`tokenRoundEnd`. An excluded name (most plausibly `tokenMoveWithin`) is stored
verbatim by Foundry and then dropped by the bridge: no error, no log, no
automation. The build rejects it and names the excluded set in the message. The
list is shared with the runtime from
`@heroiclands/content-build/engine/region-events`, so
the two cannot drift.

An `action:` naming no known SoHL action is a **warning**, not an error: the
known-name set is deliberately a superset gathered from localization keys and
action definitions, and a false alarm on a real action would be worse than a
missed typo.

### Cross-references are addresses, never UUIDs

```yaml
behaviors:
  up:
    teleportToken:
      to: { map: wayrestloft, region: stair-head }
  latch:
    toggleBehavior:
      events: [tokenEnter]
      enable: [{ map: wayrestloft, region: stair-head, behavior: down }]
```

The target is the other map's **shortcode** plus the region (and behaviour) key
— the same vocabulary the link manifest uses. The builder resolves it to
`Scene.<id>.Region.<id>`, which it can do before either scene is compiled
because every embedded id is derived from the scene id and the authored key. An
authored `_id` always wins, so the converter can pin ids on write-back exactly
as it does for items.

`applyActiveEffect` addresses an effect the same way:
`effects: [{ item: "affliction-plague", effect: "Plague Fever" }]`.

## Pins, prose, and packaging

A map note's body compiles to a JournalEntry, one page per `#` heading, exactly
as an item note's prose does. A `locations:` key names one of those headings —
by its `{#anchor}` slug or by the slug of its text — and compiles to a Foundry
`Note` pointing at that page. A key matching no heading fails the build.

Which pack a map lands in follows from what it references:

- **`scenes`** holds every map's Scene. It is what a `[[battlemap-<shortcode>]]`
  wikilink addresses, and what a GM browses.
- **`adventures`** holds one `Adventure` per *place* — the notes sharing a
  `place:`, defaulting to the note's own shortcode — bundling those scenes with
  their JournalEntries. A map with `locations:` **must** be imported this way:
  `Adventure#importContent` creates with `keepId: true`, and `Note.entryId` /
  `pageId`, a `teleportToken` destination and a `toggleBehavior` target are all
  id-based. Dragged out of the bare `scenes` pack, a pinned scene lands with
  pins addressing ids no document in the world carries.

Re-importing an Adventure **updates** the documents already present rather than
duplicating them (`prepareImport` partitions on `collection.has(d._id)`), so a
corrected map reaches a GM's world — and overwrites their local edits to those
documents.

`Scene.journal` is a plain `ForeignDocumentField`, which
`ForeignDocumentField#initialize` unconditionally nulls inside a compendium. The
source id survives and resolves after an Adventure import (which reads source
data), but a bare `scenes` pack needs a pointer that is not a document
reference, so every scene also carries `flags.sohl.docUuid` with its journal's
full `@UUID`.

## What the build refuses

Foundry accepts each of these without complaint and produces a document that
simply never does anything:

| Authored mistake                        | What Foundry does                  |
| --------------------------------------- | ---------------------------------- |
| A region event outside the curated set   | stores it verbatim; nothing fires  |
| Grid units where pixels belong           | a tiny feature in the top-left     |
| Pixels where grid squares belong         | a pin off the edge of the map      |
| A region with no shapes                  | a valid region that never triggers |
| A two-point "polygon"                    | passes the schema's floor of 4     |
| `restrict:` with no level                | the restriction never computes     |
| A field the behaviour does not have      | silently dropped                   |

Each is an error at build time, named by its authored key.

## Embedded documents and `_key`

Every embedded document — Level, wall, light, tile, sound, note, region and
region behaviour — carries its own `_key`. `compileClassicLevel` writes each one
straight to its sublevel by that key, and a missing one fails the compile with
`Key cannot be null or undefined`. The keys are:

```
!scenes!<sceneId>
!scenes.levels!<sceneId>.<levelId>
!scenes.regions!<sceneId>.<regionId>
!scenes.regions.behaviors!<sceneId>.<regionId>.<behaviorId>
!scenes.walls!<sceneId>.<wallId>          (and .lights, .notes, .sounds, .tiles)
!adventures!<adventureId>
```

An Adventure's members are inline source data in a `SetField`, not sublevel
documents, so they carry **no** `_key`.

Requires `@foundryvtt/foundryvtt-cli` ≥ 3.0.4: 3.0.3 added `levels` to the
compendium hierarchy, which is what lets a Level be authored inline and survive
an `extractPack` round-trip. (The CLI still injects a spurious `templates: []`
onto every scene — harmless, but worth knowing when diffing a built pack.)
