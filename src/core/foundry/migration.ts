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
 * World-load data checks, run on `ready` for the GM.
 *
 * @remarks Foundry-boundary code (touches `game`, documents) — kept out of the
 * logic layer.
 */

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
 * Run world-load checks (GM-only). Flags every surviving legacy `trait` document
 * as an unrecognized retired type — the type was removed in #651 and is **not**
 * auto-converted — without ever modifying or deleting it. Runs on every GM load
 * so the error persists until the documents are resolved by hand.
 */
export function migrateWorld(): void {
    const game = (globalThis as any).game;
    if (!game?.user?.isGM) return;

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
