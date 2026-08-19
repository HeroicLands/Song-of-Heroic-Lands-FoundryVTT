---
"sohl": minor
---

Author Foundry Scenes as markdown map notes (#1525).

Every other shipped document type — Item, Actor, JournalEntry — is authored as a
markdown note in `assets/content/` and compiled to a pack. Scenes were the gap,
and the packages that need them most (an adventure module, `thalorna`) had no way
to ship one. Three new note types close it: `battlemap` (tactical), `localmap`
(~1 km) and `regionalmap` (large scale), compiling through one compiler that
differs only in derived defaults.

**A map note carries an essence, not a data model.** The note states the image,
the size, the pixels per grid square, and the features a human would point at —
`walls.shell`, `lights.hearth`, `regions.smoke-bay`. Everything else about the
Scene is derived: the canvas profile, the embedded `Level`, and every region
field nobody should have to think about.

**The canvas profile is emitted explicitly**, per type, because it has to be:
`grid.type`, `grid.distance` and `grid.units` all declare
`initial: () => game.system.grid.*`, and there is no `game` at build time. An
unrecognised `type:` fails the build rather than quietly taking Foundry's own
defaults.

| `type:`       | grid     | distance | units | vision  | fog          | padding |
| ------------- | -------- | -------- | ----- | ------- | ------------ | ------- |
| `battlemap`   | square   | 5        | `ft`  | `true`  | `INDIVIDUAL` | 0.25    |
| `localmap`    | square   | 10       | `m`   | `false` | `DISABLED`   | 0.1     |
| `regionalmap` | gridless | 5        | `km`  | `false` | `DISABLED`   | 0       |

**Two unit conventions, told apart by the key.** Geometry is **pixels** —
Foundry's native storage, and the only thing that can express a traced map's
walls, 97.8% of which do not sit on grid intersections. Map pins are **grid
squares**, commonly half-integers, because that is how a human reads a position
off a map. `position:` and every coordinate list are pixels; `at:` is grid
squares. Both directions are linted against the note's own `dimensions` and
`pxPerGrid`, because the mistake is invisible in Foundry: a grid-valued wall
lands in a tiny clump at the top-left and a pixel-valued pin lands off the map.

**Walls say what they stop.** `WALL_MOVEMENT_TYPES.NONE` means movement does
_not_ collide — passable — so Foundry's own vocabulary reads backwards. A note
writes `blocks: [movement, sight]` and `limits: [sight]` instead; anything
unnamed is passable, and `movement` in `limits:` is an error, because movement
has no LIMITED value.

**The `Level` is synthesised and inline.** Exactly one per scene, from `image:` /
`overlay:`, under Foundry's own `defaultLevel0000`, compiling to
`!scenes.levels!<sceneId>.<levelId>` and surviving an `extractPack` round-trip
intact. It cannot be left out: the client-side `_preCreate` net that would create
one does not run for offline pack compilation.

Nor can it be stamped like the other packs. Foundry's server-side `migrateLevels`
shim runs on any Scene record older than core **14.353** and replaces `levels`
outright with a default synthesised from the pre-v14 flat fields — it never
checks whether the record already has one. A scene stamped with the packs'
ordinary `coreVersion: "14"` loads with its authored Level gone and its map image
with it, in silence. Scenes therefore declare `"14.353"`: the exact version at
which Levels became the storage, so the claim is true and any later Scene
migration still runs.

**Regions carry their behaviours, including the SoHL `trigger` bridge.** The
curated event list is shared verbatim with the runtime, so an event this build
accepts is exactly one the bridge forwards. `color` is hashed from the region
key rather than left to Foundry's `Color.fromHSV([Math.random(), …])`, which
would make every build differ from the last; `levels` is emitted only for a
restricted region, which needs exactly one or its constraint silently never
computes.

**Cross-references are addresses, never UUIDs.** A stair says
`to: {map: wayrestloft, region: stair-head}` and the builder resolves it —
possible before either scene is compiled because every embedded id derives from
the scene id and the authored key. `applyActiveEffect` addresses an effect the
same way.

**`executeScript` is not representable.** Its `source` is a `JavaScriptField`,
so a note carrying one would compile data into code. There is no escape hatch and
no setting that re-enables it. `executeMacro` is deferred until Adventure-bundled
macros land.

**Two packs, for two jobs.** `scenes` holds every map's Scene — what a wikilink
addresses and what a GM browses. `adventures` holds one `Adventure` per _place_
(the notes sharing a `place:`), bundling those scenes with the journals their
prose compiled into. A map with `locations:` must be imported that way:
`Adventure#importContent` creates with `keepId: true`, and a pin's `entryId` /
`pageId`, a `teleportToken` destination and a `toggleBehavior` target are all
id-based. Re-importing updates the documents already present rather than
duplicating them.

**The build refuses what Foundry accepts silently** — a region event outside the
curated set (naming the excluded ones, since `tokenMoveWithin` is the plausible
mistake), a behaviour type or field off the allow-list, a region with no shapes,
a two-point "polygon" that passes the schema's floor of four numbers, and
`restrict:` without a level. Each error names the authored key.

Ships with a worked fixture — two floors of one shelter, plus a regional map —
and `kb/dev-docs/reference/map-notes.md` documenting the schema. The Cypress
suite now drives a region by **moving a token into it**: containment is geometry,
not rendering, so it resolves with no canvas, and `region-triggers.cy.js` no
longer needs to call `_handleRegionEvent` by hand.
