---
"sohl": patch
---

_Extract `BasePackCompiler` from the pack compilers (#1509)._

The walk → filter by package and type → expand tables → convert wikilinks →
build the entry → write JSON → count errors loop was written out once per pack
pass — five times by the time this landed. It now lives once, in
`utils/packs/base-compiler.mjs`, and the items, journals, actors, macros and
scenes passes subclass it.

**What a pass now states.** `selects(fm)` (which notes it claims) and
`buildEntry(fm, markdown)` (one note → one document) are required; `prepare`,
`skipNote`, `compileNote`, `onCompiled`, `finish` and the two report hooks cover
the rest. Two static switches complete it: `requiresId` (a claimed note with no
`id` is fatal, or merely skipped) and `convertsWikilinks` (whether the body
reaching `buildEntry` is converted or exactly as authored — the macros pass
needs the latter, because its `command` is executable source).

**Why it matters.** A consumer needing a Foundry document type this toolchain
does not ship now writes a subclass and registers it, rather than copying a pass
and editing it. `utils/packs/map-notes.mjs` is deliberately not a subclass: it
never walks the tree, and staying a pure translator is what keeps it
unit-testable.

Compiled pack output is byte-identical.
