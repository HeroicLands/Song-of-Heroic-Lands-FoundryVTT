# @heroiclands/content-build

The shared toolchain that compiles a **HeroicLands content tree** — a folder of
Markdown notes with YAML frontmatter — into **Foundry VTT compendium packs**.

Every HeroicLands content module (`sohl`, `thalorna`, `kethira`, and the
adventure modules) builds its packs from this one implementation, rather than
from a copied `utils/packs/` tree.

## Install

```
npm install -D @heroiclands/content-build
```

## Configure

A consuming repository declares one `content-build.config.mjs` at its root:

```js
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "@heroiclands/content-build";

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
[]`, the conventional `paths`, every publishing switch off), derives `assetRoot`
and `packDirectories`, and returns a deeply frozen copy. A malformed
configuration throws a `TypeError` naming the offending field, so it fails at
load rather than as an empty pack much later.

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

Both namespaces are barrels that fill as the extraction proceeds; the compilers
still live in the SoHL repository's `utils/packs/` today.

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

## License

GPL-3.0-or-later — see the
[SoHL repository](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT).
