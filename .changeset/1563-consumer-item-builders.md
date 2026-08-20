---
"sohl": patch
---

**A consumer's `itemBuilders` table is now the table the Item compiler
dispatches through** (#1563).

`defineConfig` accepts an `itemBuilders` registry and derives the accepted item
types from its keys, but `sohl/items.mjs` called `itemBuilder(type)` against the
**module-level** table in `sohl/item-builders.mjs`. A consuming repository
therefore received the type whitelist it configured and the builders it did not:
its notes passed the type gate and then compiled with SoHL's builders, or failed
outright for a type SoHL has none for. The configuration was accepted,
validated, and half-honoured.

**The fix.** `engine/item-registry.mjs` resolves both halves from the one frozen
configuration — `ITEM_TYPES` (the key set, re-exported by `item-docs.mjs` as
before) and `itemBuilder(type)` — and the Item compiler reads both from there.
The whitelist and the builder table are the same object, which is #1504's
guarantee stated where it can no longer be bypassed. `sohl/item-builders.mjs`
keeps only `ITEM_BUILDERS`, the data this repository hands to configuration; its
shadow `itemBuilder` lookup is gone, so there is one dispatch path.

The registry stays a **leaf**: the config file imports it, so reading the
resolved configuration from there would close a cycle around the config's own
evaluation. The table travels into configuration, and only modules no config
file imports read it back out.

_No output change._ SoHL configures exactly the table the package ships, so the
compiled packs are byte-identical to the #1501 baseline — this is the seam a
second consumer needs, latent for this repository.
