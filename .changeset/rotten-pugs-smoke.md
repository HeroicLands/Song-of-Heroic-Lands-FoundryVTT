---
"sohl": patch
---

Fix `npm run build:sohl-types`, and gate it so it cannot break unnoticed again ([#1613](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1613)).

**The build failure**

`tsconfig.sohl-types.json` set `stripInternal`, which deletes every
`@internal`-marked declaration from the emitted `.d.ts` but keeps the
`import type { … }` statements the _retained_ public declarations make of them.
`rollup-plugin-dts` then died on the first dangling reference. The flag was also
wrong for this package on its own terms: `@internal` marks the Foundry document
layer as absent from the API _docs_, but `SohlActor`, `SohlItem`, `SohlScene`,
`SohlTokenDocument`, and `SohlActiveEffect` are genuinely part of the published
type surface — `logic.document` is one of them, and the `sohl` global's namespace
tree exposes them outright. Curating the surface is the generation entry file's
job, not that flag's. Removed it.

Four Foundry config applications then emitted `typeof X.__#N@#onSubmit` — the
synthesized name TypeScript falls back to when an inferred type references a
`#private` member, which no downstream `.d.ts` consumer can parse. Their
`DEFAULT_OPTIONS.form.handler` is now annotated so nothing has to spell it.

**The published package**

`index.d.ts` imported `@codemirror/autocomplete` without the package declaring
it, so it resolved only from inside this repository. It is now a declared peer
dependency, and the rollup `external` set is derived from `peerDependencies` so
the two cannot drift.

**The gate**

`build:noci` now runs `check:sohl-types`, which regenerates the bundle,
type-checks it as a consumer would, and runs a new `utils/check-sohl-types.mjs`
validating that every bare import is a declared peer, that no unparseable private
name survives, and that every re-exported name is actually declared. The release
workflow's publish step stays `continue-on-error` — Foundry installs from the
Release's `system.zip` — but it is no longer the only thing that would notice.

Also removed the release workflow's `@heroiclands/content-build` publish step: the
package moved to its own repository, so the step `cd`-ed into a directory that no
longer exists and `continue-on-error` swallowed it — the same invisible-failure
shape.
