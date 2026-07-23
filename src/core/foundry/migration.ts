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
export const CURRENT_MIGRATION_VERSION = "0.7.3";

/**
 * The plan for retiring a single legacy `trait` item (#651): either delete it
 * outright, or replace it with an equivalent `trauma` item.
 */
export type TraitMigrationPlan =
    | { action: "delete" }
    | { action: "replace"; create: Record<string, unknown> };

/**
 * Map a legacy trait `intensity` onto the target trauma subtype's category enum.
 * Descriptive personality traits become `psycond`
 * conditions (quirk / impulse / disorder); physique traits become `physcond`
 * conditions (trait / impediment / debility). Mirrors the #648 content move.
 *
 * @param subType - The target trauma subtype (`"psycond"` or `"physcond"`).
 * @param intensity - The legacy trait intensity (`trait` / `benign` / `impulse`
 *   / `disorder`), possibly absent.
 * @returns The trauma category value for that subtype.
 */
function traitIntensityToTraumaCategory(
    subType: "psycond" | "physcond",
    intensity: unknown,
): string {
    if (subType === "psycond") {
        switch (intensity) {
            case "impulse":
                return "impulse";
            case "disorder":
                return "disorder";
            default:
                return "quirk";
        }
    }
    switch (intensity) {
        case "impulse":
            return "impediment";
        case "disorder":
            return "debility";
        default:
            return "trait";
    }
}

/**
 * Compute the migration plan that retires a single legacy `trait` item (#651).
 * Pure and Foundry-free so it can be unit-tested; reads the item's raw `_source`.
 *
 * - **Measured** traits (`subType: "measured"`, or the pre-#532 `isNumeric: true`
 *   flag) are **deleted** — Body Weight, Carrying Capacity, Move, and Size are
 *   already first-class fields on the Being/actor data model after the
 *   Corpus→Being dissolution, so the item is redundant.
 * - **Descriptive** traits are **replaced** with a `trauma` item — `personality`
 *   → `psycond`, everything else (`physique`) → `physcond` — preserving name,
 *   image, folder, flags, notes, and description, and mapping `intensity` to the
 *   target subtype's category. Foundry cannot change a document's `type` in
 *   place, so the boundary loop creates the replacement and deletes the original.
 *
 * @param source - The trait item's raw `_source` (`type` / `name` / `img` /
 *   `folder` / `flags` / `system`).
 * @returns The migration plan, or `null` when `source` is not a trait.
 */
export function planTraitMigration(source: any): TraitMigrationPlan | null {
    if (source?.type !== "trait") return null;
    const system = source.system ?? {};
    if (system.subType === "measured" || system.isNumeric === true) {
        return { action: "delete" };
    }
    const subType = system.subType === "personality" ? "psycond" : "physcond";
    const traumaSystem: Record<string, unknown> = {
        subType,
        category: traitIntensityToTraumaCategory(subType, system.intensity),
    };
    if (system.notes != null) traumaSystem.notes = system.notes;
    if (system.docHtml != null) traumaSystem.docHtml = system.docHtml;
    const create: Record<string, unknown> = {
        name: source.name,
        type: "trauma",
        img: source.img,
        system: traumaSystem,
    };
    if (source.folder != null) create.folder = source.folder;
    if (source.flags != null) create.flags = source.flags;
    return { action: "replace", create };
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

    // 0.7.3 — retire the `trait` item type (#651). Measured traits are dropped
    // (now modeled on the Being); descriptive traits are re-created as `trauma`
    // items (Foundry cannot change a document's type in place). Idempotent: a
    // world with no `trait` items is a no-op.
    const ItemClass = (globalThis as any).Item;
    const migrateTraitItem = async (item: any, parent: any): Promise<void> => {
        const plan = planTraitMigration(item._source);
        if (!plan) return;
        if (plan.action === "replace") {
            if (parent) {
                await parent.createEmbeddedDocuments("Item", [plan.create]);
            } else {
                await ItemClass?.create(plan.create);
            }
        } else {
            console.warn(
                `SoHL migration: removing measured trait "${item.name}" — now modeled on the Being.`,
            );
        }
        await item.delete();
    };

    // Snapshot first: the loop deletes (and creates) documents in the same
    // collection it iterates.
    const worldTraits = [...(game.items ?? [])].filter(
        (i: any) => i?.type === "trait",
    );
    for (const item of worldTraits) await migrateTraitItem(item, null);
    for (const actor of game.actors ?? []) {
        const embedded = [...(actor.items ?? [])].filter(
            (i: any) => i?.type === "trait",
        );
        for (const item of embedded) await migrateTraitItem(item, actor);
    }

    await game.settings.set(
        "sohl",
        "systemMigrationVersion",
        CURRENT_MIGRATION_VERSION,
    );
}
