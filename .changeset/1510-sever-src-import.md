---
"sohl": patch
---

**The pack pipeline no longer reaches into `src/`.** Three plain-ESM modules
were shared between the build scripts and the runtime by a relative path that
climbed out of `utils/` — an arrangement that resolves to garbage the moment the
pipeline is installed as `@heroiclands/content-build` and runs from
`node_modules`. They now live inside that package, and the runtime imports them
back out of it.

- `src/utils/default-item-art.mjs` →
  `@heroiclands/content-build/sohl/default-item-art`. Read by the items compiler
  and by `SohlItem.getDefaultArtwork`.
- `src/entity/event/region-events.mjs` →
  `@heroiclands/content-build/engine/region-events`. Read by the map-note
  compiler and by `region-triggers.ts`. Engine-side rather than SoHL-side,
  because any content module that authors a scene region needs the vocabulary.
- The affiliation standings the pack build validated an authored `relation` map
  against were **restated by hand** in `utils/packs/frontmatter.mjs`; they are
  now read from `@heroiclands/content-build/sohl/affiliation-standings`, held
  identical to the runtime's `AFFILIATION_STANDING` by a test.

_Moving these, rather than injecting them through configuration, is the point._
A one-line injection would have severed the import just as well and re-opened
#932 — the drift where the builder had a default and the runtime did not. Each
module is deliberately plain ESM so the bare-`node` build scripts and the
bundled TypeScript runtime can read the **same** file; keeping one copy is the
whole guarantee. Each is reachable as its own package entry point rather than
through a barrel, so the client bundle never pulls a filesystem-reading compiler
in to reach a frozen map.

The package's `exports` grew the three leaf entry points, plus
`@heroiclands/content-build/config` so a consumer can name the configuration
contract's types from JSDoc.

A new test fails the build if any module under `utils/packs/` imports out of
`src/` again.

(Closes #1510.)
