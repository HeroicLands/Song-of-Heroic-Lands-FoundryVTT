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
 * World-load data checks and the version-keyed migration runner, run on `ready`
 * for the GM.
 *
 * @remarks Foundry-boundary code (touches `game`, documents) — kept out of the
 * logic layer. The migration *decision* logic (version comparison, step
 * planning, per-source folding) lives in the Foundry-free `sohl.entity.migration`
 * module ({@link sohl.entity.migration.planMigrations},
 * {@link sohl.entity.migration.migrateDocumentSource}); this file is the thin
 * orchestrator that reads/writes the `systemMigrationVersion` setting through the
 * `fvtt*` shims and walks the world's documents applying the plan.
 */

import {
    fvttGetSetting,
    fvttSetSetting,
    fvttSystemVersion,
    fvttIsCurrentUserGM,
    fvttIsActiveGM,
} from "@src/core/FoundryHelpers";
import {
    planMigrations,
    migrateDocumentSource,
    resolveFromVersion,
    SOHL_MIGRATIONS,
    type MigrationStep,
    type MigrationDocKind,
    type MigrationSource,
} from "@src/entity/migration";

/** The system namespace the migration setting is registered under. */
const SETTINGS_NAMESPACE = "sohl";
/** The world setting that stores a world's last-run migration version. */
const MIGRATION_VERSION_KEY = "systemMigrationVersion";

/**
 * Build the "unrecognized retired type" error message for a single document, or
 * `null` when the document is not a legacy `trait` (#651). Pure and Foundry-free
 * so it can be unit-tested.
 *
 * The `trait` item type was retired and is deliberately **not** auto-converted:
 * a surviving `trait` document is flagged as unrecognized so the GM resolves it
 * by hand (delete it, or recreate the data as a `trauma`/`attribute`), never
 * silently transformed or deleted by the system.
 *
 * A legacy trait is detected by its stored type on **either** `type` (Foundry
 * keeps the type) or `_source.type` (Foundry fell the document back to `base`
 * but preserved the original type in its source) — so the check fires whichever
 * way the client loads an unregistered-type document.
 *
 * @param item - The document to check (its stored `type` / `_source.type`, plus
 *   `name` / `id` for the message).
 * @returns The error message, or `null` when `item` is not a retired trait.
 */
export function legacyTraitError(
    item:
        | {
              type?: string;
              name?: string;
              id?: string;
              _source?: { type?: string };
          }
        | null
        | undefined,
): string | null {
    if (item == null) return null;
    if (item.type !== "trait" && item._source?.type !== "trait") return null;
    const label =
        item.name ? `"${item.name}"`
        : item.id ? `[${item.id}]`
        : "(unknown)";
    return (
        `Unrecognized item type "trait": ${label}. The trait item type was retired ` +
        `(#651) and is not migrated automatically — delete this item or recreate its ` +
        `data as a trauma/attribute by hand.`
    );
}

/**
 * Report every surviving legacy `trait` document as an unrecognized retired type
 * — the type was removed in #651 and is **not** auto-converted — without ever
 * modifying or deleting it. Runs on every GM load so the error persists until the
 * documents are resolved by hand.
 *
 * @param game - The Foundry `game` object.
 */
function reportRetiredTypes(game: any): void {
    const errors: string[] = [];
    const check = (item: any): void => {
        const err = legacyTraitError(item);
        if (err) {
            console.error(`SoHL | ${err}`);
            errors.push(err);
        }
    };
    for (const item of game.items ?? []) check(item);
    for (const actor of game.actors ?? []) {
        for (const item of actor.items ?? []) check(item);
    }

    if (errors.length) {
        (globalThis as any).ui?.notifications?.error(
            `SoHL: found ${errors.length} unrecognized legacy "trait" item(s) — ` +
                `the trait type was retired (#651). See the console; remove or ` +
                `recreate each one by hand.`,
            { permanent: true },
        );
    }
}

/** Outcome of a migration run, returned for logging and tests. */
export interface MigrationSummary {
    /** The version migrations were planned from. */
    from: string;
    /** The target (running system) version. */
    to: string;
    /** The number of migration steps in the plan. */
    planned: number;
    /** The number of documents actually updated. */
    applied: number;
    /** The number of documents whose update threw and was skipped. */
    errors: number;
    /** Whether the stored migration version was advanced. */
    stamped: boolean;
}

/**
 * The plain serialized source of a live document, for a migrator.
 * @param doc - The live document.
 * @returns The document's serialized source (`toObject()` / `_source`).
 */
function snapshot(doc: any): MigrationSource {
    return (doc?.toObject?.() ?? doc?._source ?? doc ?? {}) as MigrationSource;
}

/**
 * Whether the world holds any migratable content.
 * @param game - The Foundry `game` object.
 * @returns `true` when any actor, item, or scene exists.
 */
function worldHasContent(game: any): boolean {
    const size = (c: any): number =>
        c?.size ?? (Array.isArray(c) ? c.length : 0);
    return (
        size(game?.actors) > 0 ||
        size(game?.items) > 0 ||
        size(game?.scenes) > 0
    );
}

/**
 * The write terms every migration update is applied on, top-level and embedded
 * alike.
 *
 * `diff: false` because a migration payload routinely restates data the document
 * already holds — that is how a removed field is stripped, since Foundry prunes
 * an undeclared key out of the change set and it cannot be deleted by key — and
 * a diffed update would drop such a payload as a no-op, leaving the stored record
 * untouched. `recursive: false` makes each root-level key a replacement of that
 * whole object, which is the semantics {@link DocMigrator} is written against.
 */
const MIGRATION_UPDATE_OPTIONS = Object.freeze({
    diff: false,
    recursive: false,
});

/**
 * Fold one live document's source through the plan and, when it changes, write
 * the update. Errors are caught and counted so one bad document never aborts the
 * world-load migration.
 *
 * @param doc - The live document to migrate.
 * @param kind - The document's class name (dispatch key).
 * @param plan - The migration steps to apply.
 * @param stats - The running summary to update in place.
 */
async function applyToDocument(
    doc: any,
    kind: MigrationDocKind,
    plan: readonly MigrationStep[],
    stats: MigrationSummary,
): Promise<void> {
    const update = migrateDocumentSource(snapshot(doc), kind, plan);
    if (Object.keys(update).length === 0) return;
    try {
        await doc.update(update, { ...MIGRATION_UPDATE_OPTIONS });
        stats.applied += 1;
    } catch (err) {
        stats.errors += 1;
        console.error(
            `SoHL | migration failed for ${kind} ${doc?.name ?? doc?.id ?? "(unknown)"}:`,
            err,
        );
    }
}

/**
 * Fold a parent's embedded documents through the plan and write the changed ones
 * back as a single `updateEmbeddedDocuments` batch. A batch failure is caught and
 * counted.
 *
 * @param parent - The document that owns the embedded collection.
 * @param embeddedName - The embedded document's class name (dispatch key).
 * @param docs - The embedded documents to migrate.
 * @param plan - The migration steps to apply.
 * @param stats - The running summary to update in place.
 */
async function applyToEmbedded(
    parent: any,
    embeddedName: MigrationDocKind,
    docs: Iterable<any> | undefined,
    plan: readonly MigrationStep[],
    stats: MigrationSummary,
): Promise<void> {
    const updates: Record<string, unknown>[] = [];
    for (const doc of docs ?? []) {
        const update = migrateDocumentSource(snapshot(doc), embeddedName, plan);
        if (Object.keys(update).length > 0) {
            updates.push({ _id: doc.id ?? doc._id, ...update });
        }
    }
    if (updates.length === 0) return;
    try {
        await parent.updateEmbeddedDocuments(embeddedName, updates, {
            ...MIGRATION_UPDATE_OPTIONS,
        });
        stats.applied += updates.length;
    } catch (err) {
        stats.errors += 1;
        console.error(
            `SoHL | migration failed for ${updates.length} embedded ${embeddedName}(s) ` +
                `on ${parent?.name ?? parent?.id ?? "(unknown)"}:`,
            err,
        );
    }
}

/**
 * Walk every in-scope document in the world and apply the migration plan:
 * world Actors (and their embedded Items and ActiveEffects, plus each item's own
 * ActiveEffects), world Items (and their ActiveEffects), and Scenes (and each
 * scene region's `trigger` RegionBehaviors).
 *
 * @param game - The Foundry `game` object.
 * @param plan - The migration steps to apply.
 * @param stats - The running summary to update in place.
 */
async function applyMigrationPlan(
    game: any,
    plan: readonly MigrationStep[],
    stats: MigrationSummary,
): Promise<void> {
    for (const actor of game.actors ?? []) {
        await applyToDocument(actor, "Actor", plan, stats);
        await applyToEmbedded(actor, "Item", actor.items, plan, stats);
        await applyToEmbedded(
            actor,
            "ActiveEffect",
            actor.effects,
            plan,
            stats,
        );
        for (const item of actor.items ?? []) {
            await applyToEmbedded(
                item,
                "ActiveEffect",
                item.effects,
                plan,
                stats,
            );
        }
    }
    for (const item of game.items ?? []) {
        await applyToDocument(item, "Item", plan, stats);
        await applyToEmbedded(item, "ActiveEffect", item.effects, plan, stats);
    }
    for (const scene of game.scenes ?? []) {
        await applyToDocument(scene, "Scene", plan, stats);
        for (const region of scene.regions ?? []) {
            await applyToEmbedded(
                region,
                "RegionBehavior",
                region.behaviors,
                plan,
                stats,
            );
        }
    }
}

/**
 * Run the version-keyed world migration and advance the stored version.
 *
 * Reads the world's `systemMigrationVersion`, resolves the effective "from"
 * version (fresh vs. legacy — see {@link resolveFromVersion}), plans the
 * applicable steps against the running system version, applies them across the
 * in-scope document types, and stamps the version forward. Returns a summary for
 * logging and tests. Purely orchestration — the caller gates on the active GM.
 *
 * @param game - The Foundry `game` object.
 * @param steps - The migration registry (defaults to {@link SOHL_MIGRATIONS};
 *   overridable in tests).
 * @returns A summary of what was planned, applied, and stamped.
 */
export async function runWorldMigrations(
    game: any,
    steps: readonly MigrationStep[] = SOHL_MIGRATIONS,
): Promise<MigrationSummary> {
    const to = fvttSystemVersion();
    const stored = String(
        fvttGetSetting(SETTINGS_NAMESPACE, MIGRATION_VERSION_KEY) ?? "",
    );
    const stats: MigrationSummary = {
        from: stored,
        to,
        planned: 0,
        applied: 0,
        errors: 0,
        stamped: false,
    };

    // Without a target version we cannot decide anything — leave the store as-is.
    if (!to) return stats;

    const from = resolveFromVersion(stored, to, worldHasContent(game));
    stats.from = from;
    const plan = planMigrations(from, to, steps);
    stats.planned = plan.length;

    if (plan.length > 0) {
        await applyMigrationPlan(game, plan, stats);
    }

    // Advance the stored version whenever it differs from the current one — this
    // also stamps a brand-new world (empty plan) forward to the current version.
    if (stored !== to) {
        await fvttSetSetting(SETTINGS_NAMESPACE, MIGRATION_VERSION_KEY, to);
        stats.stamped = true;
        console.log(
            `SoHL | migration version set to ${to}` +
                (plan.length ?
                    ` (${stats.applied} document(s) migrated across ${plan.length} step(s)` +
                    (stats.errors ? `, ${stats.errors} error(s)` : "") +
                    ")"
                :   " (no migrations to run)"),
        );
    }

    return stats;
}

/**
 * Run world-load checks and migrations (GM-only). First reports any surviving
 * legacy `trait` documents (retired in #651, never auto-converted), then — on the
 * active GM only, to avoid multiple GMs racing to write — runs the version-keyed
 * migration and advances the stored `systemMigrationVersion`.
 */
export async function migrateWorld(): Promise<void> {
    const game = (globalThis as any).game;
    if (!fvttIsCurrentUserGM()) return;

    reportRetiredTypes(game);

    // Only the single authoritative GM writes migrations, so concurrent GM
    // clients don't double-run them.
    if (fvttIsActiveGM()) {
        await runWorldMigrations(game);
    }
}
