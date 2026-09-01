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
import { expressionScopes } from "@src/entity/expr/ExpressionScopeRegistry";

/** A minimal CompletionContext stub — the source only uses these two members. */
function ctx(text: string, explicit = false): any {
    return {
        explicit,
        matchBefore: (_re: RegExp) => (text ? { from: 0, to: text.length, text } : null),
    };
}

describe("makeExpressionCompletionSource", () => {
    it("offers registered helper functions, inserted with call parens", () => {
        const result = makeExpressionCompletionSource()(ctx("skill"));
        expect(result).not.toBeNull();
        const sb = result!.options.find((o) => o.label === "sb");
        expect(sb).toBeDefined();
        expect(sb!.type).toBe("function");
        expect((sb as any).apply).toBe("sb()");
    });

    it("offers the scope's declared identifiers as variables", () => {
        const scope = expressionScopes.require("action.visible");
        const result = makeExpressionCompletionSource(scope)(ctx("a"));
        const itemLogic = result!.options.find((o) => o.label === "itemLogic");
        expect(itemLogic).toBeDefined();
        expect(itemLogic!.type).toBe("variable");
        // Every declared identifier is offered — and only those.
        for (const name of scope.names) {
            expect(result!.options.find((o) => o.label === name)).toBeDefined();
        }
        expect(result!.options.find((o) => o.label === "attr")).toBeUndefined();
    });

    it("carries each identifier's description as completion detail", () => {
        const scope = expressionScopes.require("skill.base");
        const result = makeExpressionCompletionSource(scope)(ctx("a"));
        const attr = result!.options.find((o) => o.label === "attr");
        expect((attr as any).detail).toBe(scope.describe("attr"));
    });

    it("offers helpers only when the field declares no scope", () => {
        const result = makeExpressionCompletionSource()(ctx("a"));
        expect(result!.options.every((o) => o.type === "function")).toBe(true);
    });

    it("anchors completions at the start of the typed word", () => {
        const result = makeExpressionCompletionSource()(ctx("sb"));
        expect(result!.from).toBe(0);
    });

    it("returns null on an empty non-explicit context (no word to complete)", () => {
        expect(makeExpressionCompletionSource()(ctx(""))).toBeNull();
    });
});
