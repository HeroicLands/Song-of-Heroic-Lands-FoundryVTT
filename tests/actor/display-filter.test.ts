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

import { describe, it, expect } from "vitest";
import { applySearchFilter } from "@src/document/actor/logic/display-filter";

/** Minimal stub for a filterable row element. */
function makeRow(searchName: string): any {
    const classes = new Set<string>();
    return {
        dataset: { searchName },
        classList: {
            remove: (c: string) => classes.delete(c),
            toggle: (c: string, force: boolean) => {
                if (force) classes.add(c);
                else classes.delete(c);
            },
            has: (c: string) => classes.has(c),
        },
    };
}

/** Minimal stub for a content container. */
function makeContent(rows: ReturnType<typeof makeRow>[]): any {
    return {
        querySelectorAll: (sel: string) =>
            sel === "[data-search-name]" ? rows : [],
    };
}

describe("applySearchFilter (#104)", () => {
    it("shows all rows when query is empty", () => {
        const rows = [makeRow("Sword"), makeRow("Shield")];
        // Pre-mark one as hidden.
        rows[0].classList.toggle("hidden", true);
        applySearchFilter("", null, makeContent(rows));
        expect(rows[0].classList.has("hidden")).toBe(false);
        expect(rows[1].classList.has("hidden")).toBe(false);
    });

    it("hides rows whose data-search-name does not match the query", () => {
        const rows = [makeRow("Sword"), makeRow("Shield")];
        applySearchFilter("sword", null, makeContent(rows));
        expect(rows[0].classList.has("hidden")).toBe(false);
        expect(rows[1].classList.has("hidden")).toBe(true);
    });

    it("matches case-insensitively via sohl.i18n.normalizeText", () => {
        const rows = [makeRow("Great Sword"), makeRow("Buckler Shield")];
        applySearchFilter("great", null, makeContent(rows));
        expect(rows[0].classList.has("hidden")).toBe(false);
        expect(rows[1].classList.has("hidden")).toBe(true);
    });

    it("uses the rgx when provided and hides non-matching rows", () => {
        const rows = [makeRow("Short Sword"), makeRow("Long Bow")];
        applySearchFilter("^Long", /^Long/i, makeContent(rows));
        expect(rows[0].classList.has("hidden")).toBe(true);
        expect(rows[1].classList.has("hidden")).toBe(false);
    });

    it("reads data-search-name from effect rows (not data-item-name)", () => {
        // Effect rows have a different DOM attribute (data-effect-name before fix),
        // but after the fix both item and effect rows carry data-search-name.
        const effectRow = makeRow("Bleeding");
        const itemRow = makeRow("Sword");
        applySearchFilter("bleeding", null, makeContent([effectRow, itemRow]));
        expect(effectRow.classList.has("hidden")).toBe(false);
        expect(itemRow.classList.has("hidden")).toBe(true);
    });
});
