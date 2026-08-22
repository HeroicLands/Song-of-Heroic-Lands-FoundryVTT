/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
// Build-time helper (plain ESM, no Foundry). Imported by relative path
// because the build scripts live outside the `@src` alias tree.
import { injectAdaptiveFill } from "../../utils/svg-theme.mjs";

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#000" d="M1 2 3 4Z"/></svg>`;

describe("injectAdaptiveFill (dark-mode adaptive icon SVGs, #893)", () => {
    it("injects a prefers-color-scheme fill swap right after the <svg> tag", () => {
        const out = injectAdaptiveFill(SVG);
        expect(out).toContain("<style>");
        expect(out).toContain("@media(prefers-color-scheme:dark)");
        // Ink in light, cream in dark — matching the Manuscript tokens.
        expect(out).toContain("#211d16");
        expect(out).toContain("#ece3cf");
        // The <style> is inserted immediately after the opening <svg …> tag.
        expect(out).toMatch(/<svg\b[^>]*><style>/);
    });

    it("targets explicitly-black and default-black shapes", () => {
        const out = injectAdaptiveFill(SVG);
        expect(out).toContain('[fill="#000"]');
        expect(out).toContain("path:not([fill])");
    });

    it("preserves the original SVG content", () => {
        const out = injectAdaptiveFill(SVG);
        expect(out).toContain('<path fill="#000" d="M1 2 3 4Z"/>');
        expect(out).toContain("</svg>");
    });

    it("is idempotent — a second pass does not double-inject", () => {
        const once = injectAdaptiveFill(SVG);
        const twice = injectAdaptiveFill(once);
        expect(twice).toBe(once);
    });

    it("returns the input unchanged when there is no <svg> tag", () => {
        expect(injectAdaptiveFill("not an svg")).toBe("not an svg");
    });

    it("leaves a file that already sets an inline fill style untouched (can't override inline)", () => {
        const inline = `<svg viewBox="0 0 8 8"><path style="fill:#000" d="M0 0Z"/></svg>`;
        expect(injectAdaptiveFill(inline)).toBe(inline);
    });

    it("still skips a fill declaration that is not the first in its style", () => {
        const inline = `<svg viewBox="0 0 8 8"><path style="stroke: none; fill: rgb(0,0,0); opacity: 1;" d="M0 0Z"/></svg>`;
        expect(injectAdaptiveFill(inline)).toBe(inline);
    });

    it("skips on a single-quoted style attribute too", () => {
        const inline = `<svg viewBox="0 0 8 8"><path style='fill: black' d="M0 0Z"/></svg>`;
        expect(injectAdaptiveFill(inline)).toBe(inline);
    });

    it("keys the guard on the `fill` property, not the substring (#1677)", () => {
        // `fill-rule`, `fill-opacity` and `paint-order: fill` are not fills.
        // A shape whose colour comes from a `fill` **attribute** is themeable,
        // and must not be skipped just because its style names one of those.
        const svg = `<svg viewBox="0 0 8 8"><path style="fill-rule: nonzero; fill-opacity: 1; paint-order: fill;" fill="#000" d="M0 0Z"/></svg>`;
        expect(injectAdaptiveFill(svg)).toContain("<style>");
    });

    it("does not mistake a `fill` inside a <style> block for an inline style", () => {
        // A CSS rule loses to our injected rule on specificity, so a file that
        // classes its shapes is themeable; only a style *attribute* wins.
        const svg = `<svg viewBox="0 0 8 8"><style>.fil0 {fill:black}</style><path class="fil0" d="M0 0Z"/></svg>`;
        expect(injectAdaptiveFill(svg)).toContain(
            "@media(prefers-color-scheme:dark)",
        );
    });
});
