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

import type { SafeExpression } from "@src/entity/expr/SafeExpression";
import {
    expressionScopes,
    type ExpressionScope,
} from "@src/entity/expr/ExpressionScopeRegistry";

/**
 * A {@link foundry.data.fields.StringField} whose value is a
 * {@link SafeExpression} source string — a formula/predicate a GM authors (a
 * Skill's `skillBaseFormula`, an affliction's duration formula, and so on).
 *
 * It is a plain `StringField` on the wire — the value is still just the source
 * text. What it adds is a **semantic marker**: declaring a field as a
 * `SafeExpressionField` is how a sheet knows the field holds an expression and
 * warrants the SafeExpression **code editor** (an edit button that opens
 * `openExpressionEditorDialog`) rather than a bare text input.
 *
 * **It deliberately does _not_ reject an invalid expression at the schema
 * boundary.** By design a malformed formula is *stored* and *surfaced as a
 * warning* by the consuming logic (e.g. `SkillLogic.computeSkillBase` renders a
 * ✕ and an "Invalid expression" hint), so authors can save work-in-progress and
 * fix it later — hard schema rejection would discard it and break that flow. The
 * authoritative validity check ({@link SafeExpression.validateSource}) runs
 * **live in the editor**, where Save stays disabled until the expression is
 * valid.
 *
 * Defaults follow the null-at-the-edges convention for an optional "unset when
 * blank" string: `nullable`, non-`blank`, `initial: null` — a cleared editor or
 * form input cleans to `null`. Callers may override per field.
 *
 * ## Declaring the scope
 *
 * Pass the id of the {@link sohl.entity.expr.ExpressionScope} the field's value
 * is evaluated against:
 *
 * ```ts
 * skillBaseFormula: new SafeExpressionField({ scope: "skill.base" })
 * ```
 *
 * That is what lets the *schema* tell the sheet which identifiers this formula
 * may use, so the editor's autocomplete and live validation match the call site
 * that actually evaluates it. Before scopes, the sheet template carried a
 * hand-typed `data-context="attr"` string with nothing tying it to the
 * evaluating code (issue #1142). The id is resolved through the registry, so a
 * typo or a renamed scope fails loudly at schema construction.
 */
export class SafeExpressionField extends foundry.data.fields.StringField {
    /**
     * Id of the {@link ExpressionScope} this field's expression is evaluated
     * against, or `undefined` when the field declares none.
     */
    readonly scope: string | undefined;

    /**
     * Construct the field, resolving any declared expression scope eagerly.
     *
     * @param options - `StringField` options, plus `scope`: the id of the
     *   expression scope this field's value is evaluated against.
     * @param context - Standard Foundry `DataField` context.
     * @throws {Error} If `scope` names a scope that is not declared in the
     *   expression-scope catalog.
     */
    constructor(
        options: SafeExpressionField.Options = {},
        context: object = {},
    ) {
        super(options as never, context as never);
        // Resolved eagerly so an unknown id is a startup error rather than a
        // field that silently validates nothing.
        if (options.scope !== undefined) {
            expressionScopes.require(options.scope);
        }
        this.scope = options.scope;
    }

    /** Optional, non-blank, nullable, unset-as-`null`, trimmed. */
    protected static override get _defaults(): foundry.data.fields.StringField.Options<unknown> {
        return foundry.utils.mergeObject(super._defaults, {
            nullable: true,
            blank: false,
            trim: true,
            initial: null,
        });
    }

    /**
     * The resolved {@link ExpressionScope} this field declares, if any. The
     * sheet hands it to the expression editor.
     */
    get expressionScope(): ExpressionScope | undefined {
        return expressionScopes.get(this.scope);
    }
}

export namespace SafeExpressionField {
    /**
     * Construction options — every `StringField` option, plus the expression
     * scope this field's value is evaluated against.
     */
    export type Options = ConstructorParameters<
        typeof foundry.data.fields.StringField
    >[0] & {
        /**
         * Id of the {@link sohl.entity.expr.ExpressionScope} declaring which
         * identifiers this field's expression may use (e.g. `"skill.base"`).
         * Resolved at construction, so an unknown id throws immediately.
         */
        scope?: string;
    };
}
