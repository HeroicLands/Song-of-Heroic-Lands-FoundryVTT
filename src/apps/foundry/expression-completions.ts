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

import type {
    CompletionContext,
    CompletionResult,
} from "@codemirror/autocomplete";
import { expressionHelpers } from "@src/entity/expr/ExpressionHelperRegistry";

/**
 * Build the SafeExpression editor's autocomplete source: every registered helper
 * function (inserted with its call parentheses) plus the field's context
 * identifiers.
 *
 * This is deliberately CodeMirror-runtime-free — it imports only the
 * `CompletionContext`/`CompletionResult` **types** — so it can be unit-tested in
 * Node without a browser. The editor module wires the returned source into
 * `autocompletion()`.
 *
 * @param contextNames - Context-identifier names the field's call site binds
 *   (e.g. `attr`, `birthsigns`), offered alongside the helper functions.
 * @returns A CodeMirror completion source.
 */
export function makeExpressionCompletionSource(
    contextNames: string[],
): (context: CompletionContext) => CompletionResult | null {
    return (context: CompletionContext): CompletionResult | null => {
        const word = context.matchBefore(/[A-Za-z_]\w*/);
        if (!word || (word.from === word.to && !context.explicit)) return null;
        const helperOptions = expressionHelpers.names().map((name) => ({
            label: name,
            type: "function",
            apply: `${name}()`,
        }));
        const contextOptions = contextNames.map((name) => ({
            label: name,
            type: "variable",
        }));
        return {
            from: word.from,
            options: [...helperOptions, ...contextOptions],
            validFor: /^[A-Za-z_]\w*$/,
        };
    };
}
