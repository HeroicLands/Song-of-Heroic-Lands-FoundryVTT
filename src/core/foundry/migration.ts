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
export const CURRENT_MIGRATION_VERSION = "0.7.1";

/**
 * Run world migrations to {@link CURRENT_MIGRATION_VERSION}. GM-only and
 * idempotent: it reads the world's `systemMigrationVersion` and applies only the
 * migrations newer than it, then stamps the current version.
 *
 * **There are currently no migrations** — this is the scaffold. When a schema
 * change needs one, add a version-gated block below that transforms `game.items`
 * and every actor's embedded items (recreating documents with `keepId: true`
 * where a `type` change is required, since Foundry forbids changing `type` in
 * place), then bump {@link CURRENT_MIGRATION_VERSION}.
 */
export async function migrateWorld(): Promise<void> {
    const game = (globalThis as any).game;
    if (!game?.user?.isGM) return;
    const stored: string =
        game.settings.get("sohl", "systemMigrationVersion") || "";
    if (stored === CURRENT_MIGRATION_VERSION) return;

    // No migrations defined yet — stamp the world at the current version so the
    // gate above short-circuits on subsequent loads. Add migration blocks here.

    await game.settings.set(
        "sohl",
        "systemMigrationVersion",
        CURRENT_MIGRATION_VERSION,
    );
}
