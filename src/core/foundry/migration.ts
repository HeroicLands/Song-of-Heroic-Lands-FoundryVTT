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

/** Item type of the pre-rename physical-body item (now {@link CORPUS_TYPE}). */
const LINEAGE_TYPE = "lineage";
/** Item type of the physical-body item after #371. */
const CORPUS_TYPE = "corpus";

/**
 * Build the `corpus`-typed source for a former `lineage` item: swap the type and
 * de-prefix the renamed fields (`bodyStructure` → `structure`,
 * `bodyWeight` → `weight`), preserving `_id` and everything else.
 *
 * @param source - The `toObject()` source of a `lineage` item.
 * @returns A create payload for the equivalent `corpus` item.
 */
function corpusSourceFromLineage(source: PlainObject): PlainObject {
    const system = { ...((source.system as PlainObject) ?? {}) };
    if ("bodyStructure" in system) {
        system.structure = system.bodyStructure;
        delete system.bodyStructure;
    }
    if ("bodyWeight" in system) {
        system.weight = system.bodyWeight;
        delete system.bodyWeight;
    }
    return { ...source, type: CORPUS_TYPE, system };
}

/**
 * Convert every `lineage` item in a collection to `corpus`. Foundry forbids
 * changing a document's `type` in place, so each item is recreated (with its
 * original `_id`) and the old one deleted. Failures are logged per item and do
 * not abort the pass.
 *
 * @param parent - The owning actor (for embedded items) or `null` for world items.
 * @param items - The lineage items to convert (already filtered by type).
 */
async function convertLineageItems(
    parent: { createEmbeddedDocuments: Function } | null,
    items: { id: string; toObject(): PlainObject }[],
): Promise<void> {
    for (const item of items) {
        const source = corpusSourceFromLineage(item.toObject());
        try {
            if (parent) {
                await (item as any).delete();
                await parent.createEmbeddedDocuments("Item", [source], {
                    keepId: true,
                });
            } else {
                await (item as any).delete();
                await (globalThis as any).Item.create(source, { keepId: true });
            }
            sohl.log.info(
                `SoHL migration | converted lineage item ${item.id} → corpus`,
            );
        } catch (err) {
            sohl.log.error(
                `SoHL migration | failed to convert lineage item ${item.id} → corpus: ${String(err)}`,
            );
        }
    }
}

/**
 * Run world migrations to {@link CURRENT_MIGRATION_VERSION}. GM-only and
 * idempotent: it reads the world's `systemMigrationVersion` and applies only the
 * migrations newer than it, then stamps the current version.
 *
 * The #371 migration renames the physical-body item type `lineage` → `corpus`
 * and de-prefixes its `bodyStructure`/`bodyWeight` fields to `structure`/`weight`,
 * across world items and every actor's embedded items.
 */
export async function migrateWorld(): Promise<void> {
    const game = (globalThis as any).game;
    if (!game?.user?.isGM) return;
    const stored: string =
        game.settings.get("sohl", "systemMigrationVersion") || "";
    if (stored === CURRENT_MIGRATION_VERSION) return;

    sohl.log.info(
        `SoHL migration | migrating world from "${stored || "(unversioned)"}" to ${CURRENT_MIGRATION_VERSION}`,
    );

    // #371 — rename lineage → corpus everywhere.
    const worldLineages = game.items.filter(
        (i: { type: string }) => i.type === LINEAGE_TYPE,
    );
    await convertLineageItems(null, worldLineages);

    for (const actor of game.actors) {
        const embedded = actor.items.filter(
            (i: { type: string }) => i.type === LINEAGE_TYPE,
        );
        if (embedded.length) await convertLineageItems(actor, embedded);
    }

    await game.settings.set(
        "sohl",
        "systemMigrationVersion",
        CURRENT_MIGRATION_VERSION,
    );
    sohl.log.info(`SoHL migration | complete (${CURRENT_MIGRATION_VERSION})`);
}
