---
"sohl": patch
---

**Namespace barrels + drift-check lint (#402)**

Adds a hand-written `index.ts` barrel to every `src/` folder that is a namespace,
forming the `sohl.*` namespace tree (`sohl.document.effect.foundry.SohlActiveEffect`,
…). Each barrel re-exports its sibling modules via `export *` and its subfolder
namespaces via `export * as`, with a description on each `export * as` line that
becomes that namespace's documentation-page prose.

A drift-check lint (`npm run lint:ns-barrels`, part of `npm run lint`) fails the
build if a namespace folder lacks a barrel, a module or subfolder is not
re-exported, or a namespace has no description — keeping the barrels in sync with
`src/`.

This is inert groundwork for the namespace-tree epic: nothing imports the barrels
yet and the docs still build from the flat barrel, so the shipped bundle is
byte-identical and the API docs are unchanged. Side-effect-only modules (`sohl.ts`,
`automated-combat.ts`) are intentionally excluded from the tree.
