---
"sohl": patch
---

**The pack build now fails if a shipped Scene has lost its embedded `Level`.**
A v14 Scene keeps its map image on a `Level`, and a compiled pack stores the two
under separate LevelDB keys — the Scene holding `levels` as an array of ids, each
`Level` in the `scenes.levels` sublevel. Nothing in Foundry ties them together on
read: a missing `Level` record only warns, the collection then reads as empty,
and the next world launch persists `levels: []` and leaves `initialLevel`
dangling. The map image is gone for good, and the only symptom is a blank
battlemap.

`build:compiledb` now reads each pack back off disk after writing it and refuses
to ship one that violates the invariant, naming the scene. It checks the compiled
bytes rather than the JSON they came from, because the gap it closes is the
_write_ path — the emitter is already unit-tested, whereas the compendium CLI has
previously mishandled Scene Levels. An `Adventure` carries its scenes inline,
levels and all, so that second shape is checked too.

**On the original report.** #1538 was filed as a Foundry 14.361+ migration
defect that emptied shipped Scenes. It is not one: a well-formed pack survives a
14.367 world launch and a full 135-spec suite with every `Level` and
`background.src` intact, and the server-side Scene/Level migration code is
byte-identical between 14.364 (which has a green suite on record) and 14.367.
The reported state — `levels: []`, no sublevel records, `initialLevel` dangling —
reproduces exactly, warning wording and all, when the `scenes.levels` records are
already absent before Foundry reads them, and it reproduces on **14.359** as
readily as on 14.367. So the core version was never the variable; the missing
records were, and nothing anywhere asserted they were present. Now the build
does.

(Closes #1538.)
