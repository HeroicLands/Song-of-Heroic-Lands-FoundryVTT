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
import { defineConfig } from "@heroiclands/content-build";

export default defineConfig({
  // The value each content note carries in its `package:` frontmatter.
  contentPackage: "thalorna",
  // The Foundry package id, as it appears in system.json / module.json.
  foundryPackage: "sohl-thalorna",
  // Where Foundry installs it: "systems" or "modules".
  packageKind: "modules",
  packs: [
    { name: "items", type: "Item", label: "Items" },
    { name: "journals", type: "JournalEntry", label: "Journals" },
  ],
  assets: [{ from: "assets/icons", to: "assets/icons" }],
  // Three independent switches — every combination is real.
  publish: {
    site: true,
    manifests: { publish: true, consume: true },
  },
});
```

`defineConfig` validates the object, fills the optional halves with their
defaults (`assets: []`, every publishing switch off), and returns a deeply
frozen copy. A malformed configuration throws a `TypeError` naming the
offending field, so it fails at load rather than as an empty pack much later.

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

## License

GPL-3.0-or-later — see the
[SoHL repository](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT).
