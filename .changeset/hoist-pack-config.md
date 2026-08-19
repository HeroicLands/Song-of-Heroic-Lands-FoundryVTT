---
"sohl": patch
---

Hoist the pack pipeline's hardcoded constants and paths into configuration (#1508)

Everything the compendium build knew about _this_ repository's layout is now
declared in one file at the repository root, `content-build.config.mjs`,
validated by `defineConfig` from the shared `@heroiclands/content-build` package.
Nothing under `utils/packs/` spells a path, a package name, or a pack list of its
own.

**What became configuration**

| Was                                                                                                       | Now                                                                                                         |
| --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `SOURCE_PACKS` and `PACK_CONFIGS` — two lists that had to agree                                           | one `packs` list; the compile order is derived from it as `packDirectories`                                 |
| six working-directory-relative paths across three modules                                                 | `paths`, each resolved against an absolute `rootDir`                                                        |
| `path.resolve(dest, "..", "items")` — an unwritten sibling-directory contract                             | the actors compiler is handed `itemsSourceDir`, named from the configured Item pack                         |
| `systems/sohl/assets/…` inside `resolveImg`                                                               | a derived `assetRoot` of `<packageKind>/<foundryPackage>/assets`, so a module emits `modules/<id>/assets/…` |
| `systemId` / `lastModifiedBy` written into `buildStats`, and `"0.6.0"` passed by four separate call sites | one `stats` block                                                                                           |
| a directory named `Templates` skipped inside the generic tree walker                                      | `skipDirectories`, an Obsidian convention a consumer declares                                               |

**Two blockers to extraction, closed**

_The manifest is located once._ `supportedCoreVersion` resolved
`system.template.json` by a path relative to its own module — correct while the
toolchain is vendored, and pointing inside `node_modules/` the moment it is
installed. It and the package-id guard added in #1503 now resolve the same
configured directory through one function, which also accepts a module
repository's `module.template.json`. The read still throws rather than falling
back: a wrong `coreVersion` stamped into every shipped pack is worse than a
failed build.

_The core version stays derived._ Configuration supplies **where the manifest
is**, never the version itself. `compatibility.minimum` moves with test
evidence, and a captured copy would silently stop following it — the shape of
defect #1533 was. Moving the floor in the manifest still moves the stamp in
every compiled pack with no config change.

`compilePacks` / `unpackPacks` / `cleanPacks` and `generatePacksJson` also take
an optional `config`, defaulting to this repository's, so a caller can compile
another package's tree without the working directory deciding anything. #1547's
guard-order test is re-expressed against that seam: it induces package-id drift
by handing the library a config rooted at its sandbox, because a drifted
manifest merely sitting in the working directory is now — correctly — ignored.
Its assertions are unchanged, and it was re-confirmed to fail on the
"nothing was written" check when the guard is moved to the end.

Pack output is byte-identical to the pre-change build. `_stats.systemVersion`
keeps its stale `0.6.0` on purpose; correcting it rewrites every document and is
tracked separately in #1548.
