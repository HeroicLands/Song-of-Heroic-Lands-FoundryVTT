# @heroiclands/content-build

The shared toolchain that compiles a **HeroicLands content tree** — a folder of
Markdown notes with YAML frontmatter — into **Foundry VTT compendium packs**.

Every HeroicLands content module (`sohl`, `thalorna`, `kethira`, and the
adventure modules) builds its packs from this one implementation, rather than
from a copied `utils/packs/` tree.

It ships a command line as well as a library:

```
npx content-build package compile [pack]
npx content-build package unpack [pack] [entry]
npx content-build package clean [pack] [entry]
```

## Install

```
npm install -D @heroiclands/content-build
```

## Configure

A consuming repository declares one `content-build.config.mjs` at its root:

```js
import path from "node:path";
import { fileURLToPath } from "node:url";
// The *leaf* contract module, never the package root barrel — see the note
// below.
import { defineConfig } from "@heroiclands/content-build/config";
import { ITEM_BUILDERS } from "@heroiclands/content-build/sohl/item-builders";

export default defineConfig({
  // Anchors every configured path, so the build reads the same files whatever
  // directory it was launched from.
  rootDir: path.dirname(fileURLToPath(import.meta.url)),
  // The value each content note carries in its `package:` frontmatter.
  contentPackage: "thalorna",
  // The Foundry package id, as it appears in system.json / module.json.
  foundryPackage: "sohl-thalorna",
  // Where Foundry installs it: "systems" or "modules". Also decides the served
  // asset root a note's `img:` resolves to — `modules/sohl-thalorna/assets/…`.
  packageKind: "modules",
  // Stamped into every compiled document's `_stats`. `coreVersion` is absent on
  // purpose: it is read from the manifest's `compatibility.minimum`.
  stats: {
    systemId: "sohl",
    systemVersion: "0.1.0",
    lastModifiedBy: "thalornabuild000",
  },
  // Which content types compile into Items, and what builds each one's
  // `system` block. The keys are the accepted item types, so a type cannot be
  // whitelisted without a builder behind it. A module that ships no items
  // declares none.
  itemBuilders: ITEM_BUILDERS,
  // Directory names the content walk ignores wherever they appear.
  skipDirectories: ["Templates"],
  // Optional; each path is relative to `rootDir` and defaults to the
  // conventional layout shown here.
  paths: {
    content: "assets/content",
    packageManifest: "assets/templates",
    manifests: "assets/manifests",
    packJson: "build/packs-json",
    stage: "build/stage/packs",
    unpack: "build/tmp/packs",
  },
  // The one pack list. Order is load-bearing where one pass reads another's
  // output, and `packDirectories` is derived from it.
  packs: [
    {
      name: "items",
      type: "Item",
      label: "Items",
      folders: "item-folders.yaml",
    },
    { name: "journals", type: "JournalEntry", label: "Journals" },
    // A companion is written by its parent's pass rather than one of its own.
    {
      name: "scenes",
      type: "Scene",
      companions: [{ name: "adventures", type: "Adventure" }],
    },
  ],
  assets: [{ from: "assets/icons", to: "assets/icons" }],
  // Three independent switches — every combination is real.
  publish: {
    site: true,
    manifests: { publish: true, consume: true },
  },
});
```

`defineConfig` validates the object, resolves every path against `rootDir`,
fills the optional halves with their defaults (`assets: []`, `skipDirectories:
[]`, the conventional `paths`, every publishing switch off), derives `assetRoot`,
`packDirectories`, `itemTypes` and `docEntryTypes`, and returns a deeply frozen
copy. A malformed configuration throws a `TypeError` naming the offending field,
so it fails at load rather than as an empty pack much later.

**Import `defineConfig` from `@heroiclands/content-build/config`, never from the
package root.** `engine/pack-config.mjs` finds this file by walking up from
itself — so it works from `packages/` and from `node_modules/` alike, and does
not depend on the directory the build was launched from — and then loads it. The
root barrel pulls in the compilers, and the compilers read that resolved
configuration, so a config file that imports the barrel closes a cycle around its
own evaluation. The `/config` entry point imports nothing but `node:path` and the
id helpers, so it cannot. `ITEM_BUILDERS` is imported from its own leaf entry
point for the same reason. Set `CONTENT_BUILD_CONFIG` to point at the file
explicitly if a consumer keeps it somewhere else.

**`itemBuilders` is how the engine learns a consumer's item types without
holding its data model.** `itemTypes` is its key set, and `docEntryTypes` — every
type whose prose compiles into a JournalEntry of its own — is composed from it
exactly once, here, and read from `packConfig` everywhere. There is one resolved
set at runtime; the compilers and the link-manifest emitter cannot come to
disagree about which notes carry documentation.

The Item compiler **dispatches through that same resolved table**, via
`engine/item-registry.mjs` (`ITEM_TYPES` and `itemBuilder(type)`), so the types a
consumer's notes are accepted for and the builders they compile with are one
object. Supplying `itemBuilders` is therefore all a consumer does to define an
item type of its own; a table this package ships is one possible value, not the
one the compiler holds.

**Configuration supplies paths, never captured values.** `paths.packageManifest`
says _where_ the shipped `system.template.json` / `module.template.json` lives;
the package-id drift guard and the compiled packs' `_stats.coreVersion` both read
it from there. The core version itself is deliberately not a config field — it is
the manifest's `compatibility.minimum`, which moves with test evidence, and a
copy would silently stop following it.

## Layout

- **`@heroiclands/content-build/engine`** — package-agnostic machinery: the
  content walk, frontmatter, tables, wikilinks, ids, folders, the link manifest
  and the web-address rule, `BasePackCompiler`, and the generic Foundry document
  compilers.
- **`@heroiclands/content-build/sohl`** — Song of Heroic Lands data-model
  knowledge: item types, builders, the items and actors compilers, and default
  art. Isolated behind its own entry point so an adventure module never receives
  `buildWeaponGear`.

Each module is also reachable as its own entry point —
`@heroiclands/content-build/engine/journals`,
`@heroiclands/content-build/sohl/items` — so a build that needs one thing does
not load the whole pipeline. The barrels re-export each module as a namespace
rather than flattening it, because several modules deliberately re-export a
neighbour's symbol and a flattened star export would drop every such name
silently.

A few plain-ESM leaves are shared **with the Foundry runtime**, not just with the
build: the item default-art map, the curated region-event vocabulary, and the
affiliation standings. Each has its own entry point —
`@heroiclands/content-build/sohl/default-item-art`,
`.../engine/region-events`, `.../sohl/affiliation-standings` — so a client bundle
reaches the constant without importing a barrel that grows to hold compilers
reading the filesystem. Keeping one copy of each is the point: the build-time and
runtime values cannot disagree, which is the drift that produced #932.

`@heroiclands/content-build/config` exposes the configuration contract's own
module, so a consumer can name its types (`ContentBuildConfig`, `PackSpec`) from
JSDoc.

## Tests

The package carries its own suite and its own vitest project, so it is
verifiable without the repository that happens to host it:

```
npm test -w @heroiclands/content-build     # from the SoHL repository root
npm test                                   # from packages/content-build/
```

The SoHL repository's root `npm run test` names the very same project config, so
one command still gates everything CI runs and neither entry point can drift
into a different suite.

The harness is deliberately austere: no global setup, no Foundry stubs, and no
alias onto a consuming repository's source. `tests/suite-is-self-contained.test.ts`
enforces that — a test in this suite that reached for `globalThis.game` or `@src`
would pass in situ and fail the moment the package was installed from npm.

`tests/dependencies-are-declared.test.ts` guards the same failure from the
shipping side. Because this package is a workspace, npm hoists the root
repository's `devDependencies` into the workspace root, so an import this
package never declared still resolves here and fails nowhere but a consumer's
install (#1557). The test walks every module named by the `files` field and
holds each bare specifier to one of three cases — a Node builtin, this package
addressing itself, or a declared `dependency` — and checks the converse: nothing
shipped may import a `devDependency`, and no declared dependency may go
unimported.

## License

GPL-3.0-or-later — see the
[SoHL repository](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT).
