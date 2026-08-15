---
aliases:
    - Migration Runner
    - World Migration
    - systemMigrationVersion
    - sohl.entity.migration
name:
    full: World Migration Runner
    aliases: []
id: mZ8qP2rLxK4vN7bd
slug: migration
type: doc
package: sohl
category: dev-docs
folder: null
tags:
    - core-system
    - data-model
    - lifecycle
audience: >-
    Developers who change a persisted schema and need old worlds to upgrade
    seamlessly on load.
---

# World Migration Runner

How a SoHL world upgrades its persisted data when the system version advances —
**without** ever asking a GM to touch the console. When you change a DataModel in
a way that existing worlds cannot round-trip, you add one migration step here and
the runner applies it on the next load.

See also: [Runtime Contracts](./runtime-contracts.md),
[Architecture Overview](../concepts/architecture.md),
[System Development](../contributing/system-development.md).

> **Do not skip this when a schema changes.** Renaming, removing, or restructuring
> a persisted field is a backwards-compatibility break (see the non-negotiable
> rules). A migration step is how that break stays seamless for live campaigns.

## The two halves

The runner is split along the system's Foundry boundary:

| Layer | File | Responsibility |
| --- | --- | --- |
| **Decision (Foundry-free)** | `src/entity/migration/` → `sohl.entity.migration` | Semver comparison, step planning, and folding one document's source into an update. Pure, unit-tested. |
| **Orchestration (Foundry boundary)** | `src/core/foundry/migration.ts` | Reads/writes the `systemMigrationVersion` setting through the `fvtt*` shims and walks the world's live documents applying the plan. |

Because the decision logic is Foundry-free, *which* migrations run for a given
version pair — and *what* each one changes for a given document source — is proven
in Node by `tests/domain/migration/*` and `tests/core/migration.test.ts`; the
thin walk-and-write loop is what a real world exercises.

## When it runs

`migrateWorld()` fires from the `ready` hook (`src/sohl.ts`). It is gated twice:

1. **Any GM** gets the report-only scan for retired `trait` items (#651) — those
   are flagged, never converted.
2. **The active GM only** runs the versioned migration and writes the version
   forward, so several connected GM clients never race to migrate the same world.

## The version key

The world setting `systemMigrationVersion` (world-scope, hidden) stores the
version a world was last migrated **to**. On load the runner resolves an effective
"from" version and plans every step in `(from, current]`:

- **Stored version present** → migrate from it.
- **Empty + world has no content** → *brand-new world*: `from = current`, so the
  plan is empty and the runner simply stamps the version forward.
- **Empty + world has content** → *pre-tracking legacy world*: `from = "0.0.0"`,
  so every registered step runs.

The stored version is advanced whenever it differs from the running version —
including stamping a fresh world forward with nothing to run.

## In-scope document types

A plan is applied across every SoHL-owned document type and its embedded
documents:

- **Actors** (`being` / `cohort` / `structure` / `vehicle`) and their embedded
  **Items** and **ActiveEffects**, plus each item's own **ActiveEffects**.
- **World Items** (the 13 item subtypes) and their **ActiveEffects**.
- **Scenes** and each scene region's `trigger` **RegionBehaviors**.

A step's `migrators` map is keyed by Foundry document-class name
(`Actor` / `Item` / `ActiveEffect` / `RegionBehavior` / `Scene`) — omit a kind the
step does not touch.

## Adding a migration

1. Append a frozen `MigrationStep` to `SOHL_MIGRATIONS`, stamped with the system
   `version` it is introduced at.
2. Give it a `migrators` entry per document kind it changes. Each migrator
   receives the document's serialized source (`document.toObject()`) and returns
   an update payload, or `undefined` for a no-op. Later steps win on colliding
   keys.
3. **Return whole top-level objects, not dot paths into them** — see
   [Payloads replace, they do not merge](#payloads-replace-they-do-not-merge).
4. **Write the whole array back** when changing an array field — never an element
   by index (see [Runtime Contracts](./runtime-contracts.md)).
5. Add unit tests under `tests/domain/migration/` for the pure step and, where the
   walk matters, an e2e assertion that the stored version advanced.

```ts
const example: MigrationStep = {
    version: "0.8.0",
    description: "Rename skill.system.foo → skill.system.bar",
    migrators: {
        Item: (src) => {
            if (src.type !== "skill" || !src.system) return undefined;
            const system = { ...src.system };
            system.bar = system.foo ?? 0;
            delete system.foo;
            return { system };
        },
    },
}
```

### Payloads replace, they do not merge

The runner applies every update — top-level and embedded alike — with
`{ diff: false, recursive: false }`, and a non-recursive Foundry update treats
**every root-level key of the payload as a forced replacement** of that whole
object. Dot-path keys are expanded before that happens, so `{ "system.bar": 1 }`
becomes `{ system: { bar: 1 } }` and then replaces the document's entire `system`,
discarding every field the payload did not restate. On a SoHL item that surfaces
as a validation error on the required `subType` rather than a silent wipe, but
either way the update is wrong. Build the payload by spreading the source object
and editing the copy, as above.

`diff: false` matters just as much: a migration that removes a field writes the
document's current data back (see below), and a diffed update computes an empty
change from that and never writes at all. The two paths must agree — when the
embedded path was left on Foundry's defaults, embedded documents were silently
skipped while the run still counted them as applied (#1402).

### Removing a field

A field that has already left the schema **cannot be deleted by key**. Foundry
prunes any key its schema does not declare — out of a document's source when the
document is constructed, and out of an update's change set when it is cleaned. A
`{ "system.-=docUrl": null }` payload is therefore converted to a forced deletion
and then pruned away before it can delete anything, and the migrator cannot even
see the stale value: `toObject()` no longer reports it.

What still holds the value is the stored record, which is rewritten from the
(pruned) source the next time the document is written at all. So the migration for
a removed field writes the document's own `system` object back with the key
omitted; the write persists the pruned source and the value is gone. Because a
migrator cannot tell which documents still carry the key, the payload is
unconditional and every document of that kind is rewritten once. `0.9.0`
(`system.docUrl`, #1394) is the worked example.

### Adding a required field

The mirror case. A field declared `required` with no `initial` has no value at all
on a document that predates it, so the migration stamps one — and it must stamp an
**unrecognized** value too, not just an absent one: a value outside the field's
`choices` fails validation and is dropped, landing exactly where an absent value
does. Guard on the field's own type guard rather than on presence:

```ts
const stampAffiliationSubType: DocMigrator = (source) => {
    if (source.type !== ITEM_KIND.AFFILIATION) return undefined;
    if (isAffiliationSubType(source.system?.subType)) return undefined;
    return {
        system: { ...source.system, subType: AFFILIATION_SUBTYPE.SOCIAL },
    };
};
```

Unlike a removal, this payload is conditional — a document already carrying a
valid value is left alone and never written. `0.9.0` (affiliation `subType`,
#1405) is the worked example.

## Resilience

Each document update is wrapped: a single failing document is logged and counted,
never allowed to abort the rest of the world-load migration. The run returns a
`MigrationSummary` (`{ from, to, planned, applied, errors, stamped }`) for logging
and tests.
