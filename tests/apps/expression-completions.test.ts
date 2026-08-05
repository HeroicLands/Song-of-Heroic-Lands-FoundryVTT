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
import { makeExpressionCompletionSource } from "@src/apps/foundry/expression-completions";

/** A minimal CompletionContext stub — the source only uses these two members. */
function ctx(text: string, explicit = false): any {
    return {
        explicit,
        matchBefore: (_re: RegExp) =>
            text ? { from: 0, to: text.length, text } : null,
    };
}

describe("makeExpressionCompletionSource", () => {
    it("offers registered helper functions, inserted with call parens", () => {
        const result = makeExpressionCompletionSource([])(ctx("birth"));
        expect(result).not.toBeNull();
        const sb = result!.options.find((o) => o.label === "sb");
        const astrologySign = result!.options.find(
            (o) => o.label === "astrologySign",
        );
        expect(sb).toBeDefined();
        expect(sb!.type).toBe("function");
        expect((sb as any).apply).toBe("sb()");
        expect(astrologySign).toBeDefined();
    });

    it("offers the field's context identifiers as variables", () => {
        const result = makeExpressionCompletionSource(["attr", "birthsigns"])(
            ctx("a"),
        );
        const attr = result!.options.find((o) => o.label === "attr");
        expect(attr).toBeDefined();
        expect(attr!.type).toBe("variable");
        expect(
            result!.options.find((o) => o.label === "birthsigns"),
        ).toBeDefined();
    });

    it("anchors completions at the start of the typed word", () => {
        const result = makeExpressionCompletionSource([])(ctx("sb"));
        expect(result!.from).toBe(0);
    });

    it("returns null on an empty non-explicit context (no word to complete)", () => {
        expect(makeExpressionCompletionSource([])(ctx(""))).toBeNull();
    });
});
