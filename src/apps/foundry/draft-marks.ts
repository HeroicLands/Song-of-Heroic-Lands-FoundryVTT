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
 * The **draft mark** — the outline a document carries wherever it is listed when
 * `system.isDraft` is set.
 *
 * One class does all of it. A sheet header's template writes
 * {@link DRAFT_MARK_CLASS} onto its image directly; the directories are
 * Foundry's own applications, so their rows are marked after render by the hook
 * registered here. Both land on the document's image, and one stylesheet rule
 * (`scss/components/_draft-mark.scss`) draws the outline, so the three places
 * cannot drift apart.
 *
 * @module draft-marks
 */

/**
 * The class carrying the draft outline. Written into sheet header templates and
 * onto directory rows alike; the stylesheet rule keys off nothing else.
 */
export const DRAFT_MARK_CLASS = "sohl-draft";

/** The document types whose directories and packs carry the mark. */
const MARKED_DOCUMENT_TYPES = ["Actor", "Item"] as const;

/** The index field a compendium pack must carry for its entries to be marked. */
const DRAFT_INDEX_FIELD = "system.isDraft";

/**
 * Read the draft flag off whichever shape is to hand — a Document, or a
 * compendium **index entry**, which carries only the fields the pack was indexed
 * for. Both spell it `system.isDraft`, so one reader serves both.
 *
 * Anything without the flag is settled: `false` and "absent" are the same
 * condition on this field, and no reader distinguishes them.
 *
 * @param source - A document, an index entry, or nothing.
 * @returns Whether the source records itself as a draft.
 */
export function isDraftSource(source: unknown): boolean {
    return !!(source as { system?: { isDraft?: unknown } } | null | undefined)?.system?.isDraft;
}

/**
 * Toggle the draft mark on every directory row under `root`.
 *
 * Rows are Foundry's `li.directory-item[data-entry-id]`, each holding the
 * document's image. The class is **toggled** rather than added, because a
 * directory re-renders its rows in place: a document whose flag was cleared has
 * to lose the outline in the same pass that gives one to a document that gained
 * it.
 *
 * A row with no image is skipped — a directory renders a type icon instead when
 * a document has no art, and there is nothing to outline.
 *
 * Foundry-free by construction (an element and a predicate), so it is exercised
 * in Node rather than only in the browser.
 *
 * @param root - The rendered directory element.
 * @param isDraft - Answers whether the entry with this id is a draft.
 */
export function markDraftDirectoryEntries(
    root: HTMLElement,
    isDraft: (entryId: string) => boolean,
): void {
    const rows = root.querySelectorAll<HTMLElement>("li.directory-item[data-entry-id]");
    for (const row of Array.from(rows)) {
        const img = row.querySelector("img");
        if (!img) continue;
        const entryId = row.dataset.entryId;
        img.classList.toggle(DRAFT_MARK_CLASS, !!entryId && isDraft(entryId));
    }
}

/**
 * Register the draft mark on Foundry's document directories.
 *
 * Two pieces, both of them Foundry's terms rather than the system's:
 *
 * - **`system.isDraft` joins the compendium index.** A pack index carries only
 *   `_id`, `name`, `img`, `type`, `sort` and `folder` unless a system asks for
 *   more, and the compendium browser lists index entries rather than documents.
 *   Adding the field to `CONFIG.Actor`/`CONFIG.Item` `compendiumIndexFields` is
 *   what lets a pack's rows be marked without loading every document in it.
 * - **One hook covers all three directories.** ApplicationV2 fires its render
 *   hook for each class in the application's inheritance chain, and
 *   `ActorDirectory`, `ItemDirectory` and the compendium browser (`Compendium`)
 *   all extend `DocumentDirectory` — so `renderDocumentDirectory` reaches the
 *   sidebar and the pack browser alike.
 *
 * The flag is read from the application's own collection: a world directory's
 * collection holds Documents, a pack browser's holds its index, and both answer
 * to the same field path.
 */
export function registerDraftMarkHooks(): void {
    for (const documentType of MARKED_DOCUMENT_TYPES) {
        const config = (CONFIG as unknown as Record<string, { compendiumIndexFields?: string[] }>)[
            documentType
        ];
        const fields = (config.compendiumIndexFields ??= []);
        if (!fields.includes(DRAFT_INDEX_FIELD)) fields.push(DRAFT_INDEX_FIELD);
    }

    (Hooks as any).on("renderDocumentDirectory", (app: any, element: HTMLElement) => {
        const collection = app?.collection;
        if (!collection) return;
        // A pack browser lists its index; a world directory lists documents.
        const index = collection.index;
        const lookup =
            index ?
                (id: string) => isDraftSource(index.get(id))
            :   (id: string) => isDraftSource(collection.get?.(id));
        markDraftDirectoryEntries(element, lookup);
    });
}
