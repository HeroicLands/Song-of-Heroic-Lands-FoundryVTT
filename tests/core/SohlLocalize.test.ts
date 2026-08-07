/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { SohlLocalize } from "@src/core/foundry/SohlLocalize";
import en from "../../lang/en.json";

const i18n = SohlLocalize.getInstance();

/**
 * Resolve keys against the real `lang/en.json` (the shipped strings) while
 * leaving `format`'s own interpolation untouched — `localize` is the single
 * seam `format` reads through, so stubbing it needs no Foundry global.
 */
function useRealStrings(): void {
    const strings = en as Record<string, string>;
    vi.spyOn(i18n, "localize").mockImplementation(
        (key: string, fallback?: string) => strings[key] ?? fallback ?? key,
    );
}

describe("SohlLocalize.format", () => {
    afterEach(() => vi.restoreAllMocks());

    // Regression (#1095): `format` interpolates SINGLE-brace `{key}`
    // placeholders, so a `{{key}}` in en.json matched as `{{key}` — the lookup
    // missed, the delete-confirmation title read "Delete undefined}: Dagger",
    // and the surplus brace survived into the window title.
    it("renders the delete-confirmation title with no undefined or stray brace", () => {
        useRealStrings();
        expect(
            i18n.format("SOHL.SohlLogic.delete.title", {
                docType: "Weapon Gear",
                name: "Dagger",
            }),
        ).toBe("Delete Weapon Gear: Dagger");
    });

    it("substitutes every placeholder in a multi-value string", () => {
        useRealStrings();
        const formatted = i18n.format("SOHL.SohlLogic.delete.title", {
            docType: "Skill",
            name: "Climbing",
        });
        expect(formatted).not.toMatch(/undefined|[{}]/);
    });
});

describe("SohlLocalize.normalizeText", () => {
    // Regression (#312): the ascii branch used a non-negated class
    // (`/[%\x20-\x7E]/`) that matched *printable ASCII* and blanked every letter
    // to a space, so search-name matching (which compares against a regex) never
    // matched — every list-search filter hid all rows.
    it("preserves printable ASCII, lowercased (does not blank it out)", () => {
        expect(
            i18n.normalizeText("Ambidextrous", {
                caseInsensitive: true,
                ascii: true,
            }),
        ).toBe("ambidextrous");
    });

    it("keeps digits and common punctuation as printable ASCII", () => {
        expect(
            i18n.normalizeText("Long Bow +2", {
                caseInsensitive: true,
                ascii: true,
            }),
        ).toBe("long bow +2");
    });

    it("folds combining diacritics to their base ASCII letters", () => {
        expect(
            i18n.normalizeText("Café", { caseInsensitive: true, ascii: true }),
        ).toBe("cafe");
    });

    it("collapses non-ASCII characters to spaces, leaving ASCII intact", () => {
        expect(
            i18n.normalizeText("a•b", {
                caseInsensitive: false,
                ascii: true,
            }),
        ).toBe("a b");
    });

    it("lowercases without ascii folding when only caseInsensitive is set", () => {
        expect(
            i18n.normalizeText("SWORD", {
                caseInsensitive: true,
                ascii: false,
            }),
        ).toBe("sword");
    });

    it("returns empty string for falsy input", () => {
        expect(
            i18n.normalizeText("", { caseInsensitive: true, ascii: true }),
        ).toBe("");
    });
});
