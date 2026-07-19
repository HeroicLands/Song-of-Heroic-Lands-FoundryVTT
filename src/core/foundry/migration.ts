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
 * World data migrations, run once on `ready` for the GM. Each migration is
 * gated on the world's stored `systemMigrationVersion`; the whole pass is a
 * no-op when the world is already current.
 *
 * @remarks Foundry-boundary code (touches `game`, documents) — kept out of the
 * logic layer.
 */

/**
 * The current data schema version. Bump when adding a migration below; the world
 * migrates from its stored version up to this.
 */
export const CURRENT_MIGRATION_VERSION = "0.7.2";

/**
 * Compute the update payload that migrates a single trait's **raw source**
 * `system` off the removed `isNumeric` boolean and onto the `measured` subtype
 * (#532). Pure and Foundry-free so it can be unit-tested. Reads `_source`
 * (never the prepared data model, which no longer exposes `isNumeric`).
 *
 * - `isNumeric === true` → `subType: "measured"` (its `score` / `valueDesc` are
 *   already stored, so nothing else moves) and the `isNumeric` key is dropped.
 * - `isNumeric === false` → the stale key is dropped; the descriptive subtype
 *   (physique / personality) is unchanged.
 * - No `isNumeric` key (already migrated) → `null` (nothing to do).
 *
 * @param sourceSystem - The trait item's raw `_source.system`.
 * @returns A Foundry `update()` payload, or `null` when no change is needed.
 */
export function traitMeasuredUpdate(
    sourceSystem: Record<string, unknown> | undefined | null,
): Record<string, unknown> | null {
    if (!sourceSystem || !("isNumeric" in sourceSystem)) return null;
    const update: Record<string, unknown> = { "system.-=isNumeric": null };
    if (sourceSystem.isNumeric === true) {
        update["system.subType"] = "measured";
    }
    return update;
}

/**
 * Run world migrations to {@link CURRENT_MIGRATION_VERSION}. GM-only and
 * idempotent: applies each migration newer than the world's stored
 * `systemMigrationVersion`, then stamps the current version.
 */
export async function migrateWorld(): Promise<void> {
    const game = (globalThis as any).game;
    if (!game?.user?.isGM) return;
    const stored: string =
        game.settings.get("sohl", "systemMigrationVersion") || "";
    if (stored === CURRENT_MIGRATION_VERSION) return;

    // 0.7.2 — trait `isNumeric` boolean → `measured` subtype (#532). Idempotent
    // (already-migrated traits carry no `isNumeric` source key, so are skipped),
    // so it is safe to run whenever the world is not already current.
    const migrateTrait = async (item: any): Promise<void> => {
        if (item?.type !== "trait") return;
        const update = traitMeasuredUpdate(item._source?.system);
        if (update) await item.update(update);
    };
    for (const item of game.items ?? []) await migrateTrait(item);
    for (const actor of game.actors ?? []) {
        for (const item of actor.items ?? []) await migrateTrait(item);
    }

    await game.settings.set(
        "sohl",
        "systemMigrationVersion",
        CURRENT_MIGRATION_VERSION,
    );
}
