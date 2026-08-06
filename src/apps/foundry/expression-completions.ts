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
import type { ExpressionScope } from "@src/entity/expr/ExpressionScopeRegistry";

/**
 * Build the SafeExpression editor's autocomplete source: every registered helper
 * function (inserted with its call parentheses) plus the identifiers the edited
 * field's {@link ExpressionScope} declares, each carrying its description.
 *
 * The scope is what makes the offered identifiers *right* rather than merely
 * plausible: it is the same declaration the runtime validates against, so
 * autocomplete cannot suggest a name that construction would reject (issue
 * #1142 — the editor used to be fed a hand-typed list from a template
 * attribute, with nothing tying it to the evaluating call site).
 *
 * This is deliberately CodeMirror-runtime-free — it imports only the
 * `CompletionContext`/`CompletionResult` **types** — so it can be unit-tested in
 * Node without a browser. The editor module wires the returned source into
 * `autocompletion()`.
 *
 * @param scope - The edited field's declared scope, or `undefined` when the
 *   field declares none (only helpers are offered).
 * @returns A CodeMirror completion source.
 */
export function makeExpressionCompletionSource(
    scope?: ExpressionScope,
): (context: CompletionContext) => CompletionResult | null {
    return (context: CompletionContext): CompletionResult | null => {
        const word = context.matchBefore(/[A-Za-z_]\w*/);
        if (!word || (word.from === word.to && !context.explicit)) return null;
        const helperOptions = expressionHelpers.names().map((name) => ({
            label: name,
            type: "function",
            apply: `${name}()`,
        }));
        const contextOptions = (scope?.names ?? []).map((name) => ({
            label: name,
            type: "variable",
            detail: scope?.describe(name),
        }));
        return {
            from: word.from,
            options: [...helperOptions, ...contextOptions],
            validFor: /^[A-Za-z_]\w*$/,
        };
    };
}
