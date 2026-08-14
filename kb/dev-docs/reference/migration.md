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

Every data migration is one frozen `MigrationStep` in `SOHL_MIGRATIONS`, listed
in version order. To add one:

1. Append a frozen `MigrationStep` to `SOHL_MIGRATIONS`, stamped with the system
   `version` it is introduced at.
2. Give it a `migrators` entry per document kind it changes. Each migrator
   receives the document's serialized source (`document.toObject()`) and returns a
   **flattened update payload** (Foundry dot-path keys), or `undefined` for a
   no-op. Later steps win on colliding keys.
3. **Write the whole array back** when changing an array field — never an element
   by index (see [Runtime Contracts](./runtime-contracts.md)).
4. Add unit tests under `tests/domain/migration/` for the pure step and, where the
   walk matters, an e2e assertion that the stored version advanced.

The registry's first step is the shape to copy — a new `required` field with no
`initial` needs stamping onto documents that predate it, or Foundry drops the
invalid (absent) value and the document falls back to unset:

```ts
{
    version: "0.9.0",
    description:
        "Stamp the new required subType on existing affiliation items (#1405)",
    migrators: {
        Item: (source) => {
            if (source.type !== ITEM_KIND.AFFILIATION) return undefined;
            if (isAffiliationSubType(source.system?.subType)) return undefined;
            return { "system.subType": AFFILIATION_SUBTYPE.SOCIAL };
        },
    },
}
```

Note it re-stamps an *unrecognized* value as well as an absent one: a value
outside the field's `choices` fails validation and is dropped silently, which
would leave the field unset on a document the migration had already visited.

## Resilience

Each document update is wrapped: a single failing document is logged and counted,
never allowed to abort the rest of the world-load migration. The run returns a
`MigrationSummary` (`{ from, to, planned, applied, errors, stamped }`) for logging
and tests.
