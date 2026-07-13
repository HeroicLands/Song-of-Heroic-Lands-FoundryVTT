---
"sohl": patch
---

**Docs: keep the Foundry document layer out of the published API (#414)**

The published API now presents a single, consistent surface: the logic layer plus
`entity` / `utils` / `apps` and the `SohlSystem` entry points. Author-facing code
reaches actors, items, effects, scenes, and tokens through the logic layer
(`sohl.actorLogics` / `sohl.itemLogics`, `actor.logic`), never through the Foundry
document classes — so those classes are now uniformly internal.

**Marked `@internal`** the five document classes that were still published —
`SohlActor`, `SohlItem`, `SohlActiveEffect`, `SohlScene`, `SohlTokenDocument` —
matching the already-internal `SohlCombat` / `SohlCombatant` / `SohlSceneConfig`
and every `*DataModel` / `*Sheet`. `{@link}` references to these symbols across
doc-comments and the Markdown docs become backticked prose or path-only file
links, per the `system-development.md` convention, so `npm run docs` stays clean
under `treatWarningsAsErrors`.

**Re-rooted the logic contracts** out of the Foundry namespace. `SohlActorLogic` /
`SohlActorData` / `SohlActorBaseLogic` (and their `SohlItem*` counterparts) are
defined in the logic layer but were re-exported through the Foundry document
modules, so TypeDoc filed them under `sohl.document.*.foundry.*`. Removing those
re-exports gives each contract a single canonical home under
`sohl.document.*.logic.*`; internal importers now take the contract from the
`logic/` path (the Foundry document class stays imported from its own module).
