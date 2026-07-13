---
"sohl": patch
---

**Tooling/docs: generate the `@heroiclands/sohl-types` declarations from source (#407)**

`@heroiclands/sohl-types` now ships type declarations **generated from the SoHL
source** (a `tsc` declaration emit rolled up by `rollup-plugin-dts`), so they can't
drift: a single self-contained `index.d.ts` that types the `sohl` global with the
full namespace tree (`sohl.document.effect.foundry.SohlActiveEffect`, …) and
exports the public Logic/Data and domain class types, with `fvtt-types` kept as a
peer dependency (it supplies Foundry's globals). Build with `npm run build:sohl-types`.

Retires the hand-maintained `types/sohl-public-api.d.ts`, which had drifted (it
still referenced the removed `LineageLogic`) and — being copied with `../src/`
relative imports — never resolved once copied into a consumer module. The docs
(`api-access-map.md`, `module-development.md`) now describe the npm package as the
only consumption path.
