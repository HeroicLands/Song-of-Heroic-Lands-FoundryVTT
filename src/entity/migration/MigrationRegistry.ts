/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * The Foundry-free heart of the world-migration runner: the migration step
 * shape, the ordered registry, and the pure functions that plan which steps to
 * run and fold a single document's source through them.
 *
 * The Foundry-boundary orchestrator that walks the world's documents and applies
 * the resulting updates lives in `src/core/foundry/migration.ts`; everything here
 * is pure and unit-tested so the *decision* logic never depends on a running
 * Foundry. See the migration reference at
 * https://kb.heroiclands.org/dev/reference/runtime-contracts/ for the update
 * contract.
 *
 * @module
 */

import { compareVersions, isNewerVersion } from "./version";

/**
 * The document classes a migration can target. These are Foundry document-class
 * names (not SoHL subtypes) used as the dispatch key for a step's per-type
 * migrators. The SoHL in-scope types map onto them as: Actors
 * (`being`/`cohort`/`structure`/`vehicle`) → `Actor`; the 13 item subtypes →
 * `Item`; the `sohleffectdata` effect → `ActiveEffect`; the `trigger` region
 * behavior → `RegionBehavior`. `Scene` is included so a future migration can
 * touch scene-level flags even though Scenes carry no SoHL system data.
 */
export type MigrationDocKind =
    | "Actor"
    | "Item"
    | "ActiveEffect"
    | "RegionBehavior"
    | "Scene";

/**
 * A plain, serialized document source handed to a migrator. This is the shape of
 * `document.toObject()` — never a live document — so migrators stay pure and the
 * folder can run in Node without Foundry.
 */
export interface MigrationSource {
    /** The document subtype (e.g. `"skill"`, `"being"`). */
    type?: string;
    /** The document id, when present. */
    _id?: string;
    /** The document name, for diagnostics. */
    name?: string;
    /** The system (schema) data. */
    system?: Record<string, unknown>;
    /** The document flags. */
    flags?: Record<string, unknown>;
    [key: string]: unknown;
}

/**
 * A per-document-kind migrator. Receives the document's serialized source and
 * returns a **flattened update payload** (Foundry dot-path keys, e.g.
 * `{ "system.foo": 1 }`) to write, or `undefined` / an empty object for a no-op.
 *
 * The payload is a Foundry `document.update()` argument, so express nested
 * changes as dot paths and write a **whole array** back rather than an element by
 * index (see the array-field contract in the runtime-contracts reference). A
 * migrator must not mutate `source`.
 */
export type DocMigrator = (
    source: MigrationSource,
) => Record<string, unknown> | undefined;

/**
 * A single, version-stamped migration. `version` is the system version at which
 * the migration is introduced; the runner applies every step whose version is
 * newer than the world's stored migration version and no newer than the running
 * system version. `migrators` holds one function per in-scope document kind the
 * step needs to touch — omit a kind the step does not change.
 */
export interface MigrationStep {
    /** The system version this migration was introduced at (e.g. `"0.8.0"`). */
    version: string;
    /** A short human-readable description of what the step changes. */
    description: string;
    /** Per-document-kind migrators. Omit a kind the step does not touch. */
    migrators?: Partial<Record<MigrationDocKind, DocMigrator>>;
}

/**
 * Migrate one affliction's source for the intrinsic-actions rework (#1183).
 *
 * Three persisted things move:
 *
 * - the recurring course cycle's schedule key, `healingCheck` → `courseCheck`
 *   (the action was renamed to match the test it now offers), so existing
 *   afflictions stay armed rather than silently going dormant;
 * - the matching `lastRun` record, so "when did this last happen?" survives;
 * - the retired `diagnosisBonusBase` field, deleted via Foundry's `-=` syntax.
 *
 * The whole `scheduledActions` array is rewritten, never an element by index —
 * an indexed update rebuilds the array from a sparse map and truncates it.
 *
 * @param source - The affliction's serialized source.
 * @returns The update payload, or `undefined` when nothing needs changing.
 */
function migrateAfflictionActions(
    source: MigrationSource,
): Record<string, unknown> | undefined {
    if (source.type !== "affliction") return undefined;
    const system = (source.system ?? {}) as Record<string, unknown>;
    const update: Record<string, unknown> = {};

    const scheduled = system.scheduledActions;
    if (
        Array.isArray(scheduled) &&
        scheduled.some((e) => (e as any)?.actionName === "healingCheck")
    ) {
        update["system.scheduledActions"] = scheduled.map((e) =>
            (e as any)?.actionName === "healingCheck" ?
                { ...(e as object), actionName: "courseCheck" }
            :   e,
        );
    }

    const lastRun = system.lastRun as Record<string, unknown> | undefined;
    if (lastRun && Object.hasOwn(lastRun, "healingCheck")) {
        const { healingCheck, ...rest } = lastRun;
        update["system.lastRun"] = { ...rest, courseCheck: healingCheck };
    }

    if (Object.hasOwn(system, "diagnosisBonusBase")) {
        update["system.-=diagnosisBonusBase"] = null;
    }

    return Object.keys(update).length ? update : undefined;
}

/**
 * The ordered list of world migrations.
 *
 * Append in version order — the planner sorts defensively regardless.
 */
export const SOHL_MIGRATIONS: readonly MigrationStep[] = Object.freeze([
    Object.freeze({
        version: "0.8.0",
        description:
            "Affliction intrinsic actions (#1183): rename the healingCheck schedule to courseCheck and drop diagnosisBonusBase.",
        migrators: Object.freeze({ Item: migrateAfflictionActions }),
    }),
] as MigrationStep[]);

/**
 * Select the migration steps to run for a world, in ascending version order.
 *
 * A step runs when `from < step.version <= to` — the lower bound is exclusive
 * (the world already has `from`) and the upper bound inclusive (migrate up to and
 * including the running system version). An empty `from` behaves as `0.0.0`
 * (runs everything up to `to`); an empty `to` yields no steps (the target version
 * is unknown).
 *
 * @param from - The world's stored migration version.
 * @param to - The target (running system) version.
 * @param steps - The registry to draw from (defaults to {@link SOHL_MIGRATIONS}).
 * @returns The applicable steps, sorted oldest-first.
 */
export function planMigrations(
    from: string,
    to: string,
    steps: readonly MigrationStep[] = SOHL_MIGRATIONS,
): MigrationStep[] {
    if (!to) return [];
    return steps
        .filter(
            (s) =>
                isNewerVersion(s.version, from) &&
                !isNewerVersion(s.version, to),
        )
        .sort((a, b) => compareVersions(a.version, b.version));
}

/**
 * Fold a single document's source through a plan, producing one merged update.
 *
 * Each step's migrator for `kind` is applied in plan order; every non-empty
 * result is merged into the accumulating update, so later steps win on colliding
 * keys. Returns an empty object when nothing changed — the caller skips the
 * `document.update()` entirely in that case.
 *
 * @param source - The document's serialized source (`document.toObject()`).
 * @param kind - The document's class name (dispatch key).
 * @param plan - The steps to apply (already selected by {@link planMigrations}).
 * @returns A flattened update payload; `{}` when the plan changes nothing.
 */
export function migrateDocumentSource(
    source: MigrationSource,
    kind: MigrationDocKind,
    plan: readonly MigrationStep[],
): Record<string, unknown> {
    const update: Record<string, unknown> = {};
    for (const step of plan) {
        const migrator = step.migrators?.[kind];
        if (!migrator) continue;
        const result = migrator(source);
        if (result && Object.keys(result).length > 0) {
            Object.assign(update, result);
        }
    }
    return update;
}

/**
 * Resolve the effective "from" version for a world, distinguishing a brand-new
 * world from a pre-tracking legacy one.
 *
 * The `systemMigrationVersion` setting defaults to `""` for both a freshly
 * created world (nothing to migrate) and a world created before migration
 * tracking existed (everything to migrate). They are told apart by whether the
 * world holds any content:
 *
 * - stored version present → use it verbatim.
 * - empty + world unpopulated → **fresh**: return `current`, so the plan is empty
 *   and the runner simply stamps the version forward.
 * - empty + world populated → **legacy**: return `"0.0.0"`, so every registered
 *   migration runs.
 *
 * @param stored - The stored `systemMigrationVersion` (may be empty).
 * @param current - The running system version.
 * @param worldHasContent - Whether the world holds any migratable documents.
 * @returns The version to plan migrations from.
 */
export function resolveFromVersion(
    stored: string,
    current: string,
    worldHasContent: boolean,
): string {
    if (stored) return stored;
    return worldHasContent ? "0.0.0" : current;
}
