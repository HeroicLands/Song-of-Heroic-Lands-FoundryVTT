/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";

import { slugifyShortcode } from "@src/utils/helpers";
import {
    reduceToTarget,
    SHORTCODE_PATTERN,
    SHORTCODE_TARGET_LENGTH,
    toAsciiLetters,
} from "@src/utils/shortcode-format.mjs";

describe("toAsciiLetters", () => {
    // Dropping instead of spelling out is what lost a name's first letter.
    it("spells out a letter that is its own character", () => {
        expect(toAsciiLetters("Æthelred")).toBe("AEthelred");
        expect(toAsciiLetters("Þorn")).toBe("THorn");
        expect(toAsciiLetters("Straße")).toBe("Strasse");
        expect(toAsciiLetters("Œuvre")).toBe("OEuvre");
        expect(toAsciiLetters("Ŋara")).toBe("NGara");
    });

    it("strips a combining mark from a decorated letter", () => {
        expect(toAsciiLetters("Kûrbúl")).toBe("Kurbul");
        expect(toAsciiLetters("Nüsvōrroth")).toBe("Nusvorroth");
        expect(toAsciiLetters("Dvořák")).toBe("Dvorak");
        expect(toAsciiLetters("Łódź")).toBe("Lodz");
    });

    it("leaves ASCII alone", () => {
        expect(toAsciiLetters("Broadsword")).toBe("Broadsword");
    });

    it("survives an absent name", () => {
        expect(toAsciiLetters(undefined)).toBe("");
        expect(toAsciiLetters(null)).toBe("");
    });
});

describe("reduceToTarget", () => {
    it("leaves a name that already fits", () => {
        expect(reduceToTarget(["mail", "byrnie"])).toBe("mailbyrnie");
        expect(reduceToTarget([])).toBe("");
    });

    // One vowel per pass, re-measuring after each: eleven characters costs one
    // vowel, not every vowel. Removing them all at once gave `rndshld`.
    it("removes only as many vowels as it needs", () => {
        expect(reduceToTarget(["round", "shield"])).toBe("roundshild");
    });

    it("removes from the end", () => {
        // `broadhead` loses its last eligible vowel first, so the opening
        // survives longest.
        expect(reduceToTarget(["arrow", "broadhead"])).toBe("arrowbrdhd");
    });

    // A reader recovers a name from the sound it starts with.
    it("never removes the vowels a word opens with", () => {
        expect(reduceToTarget(["aeldred", "of", "ammar"])).toContain("ae");
        expect(reduceToTarget(["aeldred"], 3)).toBe("aeldrd");
    });

    // Per word, so each part of a compound name keeps its own opening.
    it("protects each word's opening, not just the first", () => {
        expect(reduceToTarget(["ironoak", "ambergate"], 4)).toBe("irnkambrgt");
    });

    // The target is a guideline; nothing is truncated to reach it.
    it("stops when no eligible vowel is left", () => {
        expect(reduceToTarget(["strngth", "wrdsmth"], 4)).toBe("strngthwrdsmth");
    });
});

describe("slugifyShortcode", () => {
    it("keeps a short name as it reads", () => {
        expect(slugifyShortcode("Broadsword")).toBe("broadsword");
        expect(slugifyShortcode("Mail Byrnie")).toBe("mailbyrnie");
    });

    // The bug this replaces: non-ASCII letters were deleted, so a name could
    // lose its first letter entirely.
    it("transliterates rather than dropping", () => {
        expect(slugifyShortcode("Æthelred")).toBe("aethelred");
        expect(slugifyShortcode("Þorn Hall")).toBe("thornhall");
        expect(slugifyShortcode("Straße")).toBe("strasse");
        expect(slugifyShortcode("Café")).toBe("cafe");
    });

    it("abbreviates whole words", () => {
        expect(slugifyShortcode("Kurbul Helm")).toBe("kblhelm");
        expect(slugifyShortcode("Kûrbúl Helm")).toBe("kblhelm");
        expect(slugifyShortcode("Mountain Fort")).toBe("mtft");
    });

    // Ten is a guideline: a name that fits is left as it reads.
    it("reduces only when the result is longer than the guideline", () => {
        const short = slugifyShortcode("Mail Byrnie");
        expect(short.length).toBeLessThanOrEqual(SHORTCODE_TARGET_LENGTH);
        expect(short).toBe("mailbyrnie");

        // 18 characters before reduction, so the vowels go.
        expect(slugifyShortcode("Armorer's Toolkit")).toBe("armrrstlkt");
    });

    it("keeps a leading vowel when it reduces", () => {
        // `aeldred` → `aeldrd` and `ammar` → `ammr`; `of` opens with a vowel
        // and has no interior one, so it survives whole.
        expect(slugifyShortcode("Aeldred of Ammar")).toBe("aeldrdofammr");
    });

    // Nothing is truncated — the guideline is not a limit.
    it("leaves a long name long rather than cutting it", () => {
        const out = slugifyShortcode("Grand Processional of the Silent Mountain");
        expect(out.length).toBeGreaterThan(SHORTCODE_TARGET_LENGTH);
        expect(out).not.toContain("-");
    });

    it("yields a valid shortcode, or nothing at all", () => {
        for (const name of [
            "Broadsword",
            "Kûrbúl Helm",
            "Æthelred",
            "Armorer's Toolkit",
            "Aeldred of Ammar",
        ]) {
            expect(SHORTCODE_PATTERN.test(slugifyShortcode(name))).toBe(true);
        }
        // A name with no alphanumerics yields "": the caller supplies a fallback.
        expect(slugifyShortcode("!!!")).toBe("");
        expect(slugifyShortcode("")).toBe("");
    });

    // A shortcode joins with nothing: the `type-shortcode` address parse needs
    // the separating hyphen to be the only hyphen in the string.
    it("never emits a separator", () => {
        expect(slugifyShortcode("Shire-Reeve of the North")).not.toContain("-");
    });
});
