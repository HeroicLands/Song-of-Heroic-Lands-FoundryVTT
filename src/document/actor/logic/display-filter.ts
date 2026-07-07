/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
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
 * Applies a search filter to a list container, showing/hiding child rows based
 * on their `data-search-name` attribute. Pure and Foundry-free.
 *
 * A row matches when:
 * - `query` is blank → always visible (all rows revealed).
 * - `rgx` is provided → the regexp tests the normalised search-name.
 * - otherwise → the normalised search-name includes the normalised query.
 *
 * Normalisation is done via `sohl.i18n.normalizeText` (case-insensitive, ASCII).
 *
 * @param query - The raw search string from the input element.
 * @param rgx - Optional compiled regexp (from the Foundry SearchFilter).
 * @param content - The container element to search inside; no-op if `null`.
 */
export function applySearchFilter(
    query: string,
    rgx: RegExp | null,
    content: Pick<HTMLElement, "querySelectorAll"> | null,
): void {
    if (!content) return;

    const rows = content.querySelectorAll<HTMLElement>("[data-search-name]");

    if (!query.trim()) {
        rows.forEach((el) => el.classList.remove("hidden"));
        return;
    }

    if (rgx && (rgx as any).global) rgx.lastIndex = 0;

    const q = sohl.i18n.normalizeText(query.trim(), {
        caseInsensitive: true,
        ascii: true,
    });

    rows.forEach((el) => {
        const name = sohl.i18n.normalizeText(
            (el.dataset.searchName ?? "").trim(),
            { caseInsensitive: true, ascii: true },
        );
        const match = rgx ? rgx.test(name) : name.includes(q);
        el.classList.toggle("hidden", !match);
        if (rgx && (rgx as any).global) rgx.lastIndex = 0;
    });
}
