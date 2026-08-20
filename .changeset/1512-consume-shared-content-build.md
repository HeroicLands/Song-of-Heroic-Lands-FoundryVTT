---
"sohl": patch
---

**The pack pipeline now lives in `@heroiclands/content-build`, and this
repository consumes it by workspace path.** `utils/packs/` is gone (#1512).

The extraction the epic set up (#1506–#1511) had produced a package with real
barrels, a real configuration contract and the whole pack test suite — but the
implementation was still the repository's own `utils/packs/` tree, which is the
copy every downstream module was vendoring in the first place. There is now one
copy.

**What moved where.** The package's two halves are the split #1501 specified:

| Half      | Holds                                                                                                                                                                                                                                                        |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `engine/` | The content walk, frontmatter, tables, code fences, wikilinks, ids, folders, the link manifest and the web-address rule, `BasePackCompiler`, the generic Foundry document compilers (journals, macros, scenes), the pack generator, and compile/unpack/clean |
| `sohl/`   | The item-type registry and its builders, the items and actors compilers, the default-art map, and the affiliation standings                                                                                                                                  |

`@heroiclands/content-build/engine` exports nothing from `sohl/`, so an
adventure module that compiles journals, macros and scenes never receives
`buildWeaponGear`. Each module is also its own entry point
(`.../engine/journals`, `.../sohl/items`), so a build that needs one thing does
not load the pipeline.

**One doc-carrying-type set, still.** `DOC_ENTRY_TYPES` — every type whose prose
compiles into a JournalEntry of its own — is the set the journals compiler and
the link-manifest emitter both read, and holding two of them is how a manifest
comes to assert documentation nothing compiled. The _concept_ is now the
engine's; the _membership_ is the consumer's, supplied as `itemBuilders` in
`content-build.config.mjs` and composed exactly once inside `defineConfig`.
Every reader takes it from there.

**Configuration is located by walking up from the toolchain, not from the
working directory.** `engine/pack-config.mjs` finds the consuming repository's
`content-build.config.mjs` by climbing out of its own directory, which lands on
the repository root from `packages/` and from `node_modules/` alike and does not
depend on where the build was launched. A config file therefore imports
`defineConfig` from `@heroiclands/content-build/config` — the leaf contract
module — never from the package root barrel, which would close a cycle around
its own evaluation.

**Unchanged on purpose.** The Scene/Level integrity guard still reads each
compiled pack back **off disk** after `compilePack` — it defends the write path,
which is where `foundryvtt-cli` has lost Levels before (#1530/#1538), and a
source-side schema check would look tidier while protecting nothing.
`generatePacksJson` still runs the package-id guard first and folds the
empty-pass guard in last.

Emitted pack output is byte-identical to the pre-extraction build: all 2828
files under `build/packs-json/` hash-match the #1501 baseline.
